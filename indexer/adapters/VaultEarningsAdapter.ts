import InvestorVaultABI from '../abis/MockInvestorVault.json';
import ContributorVaultABI from '../abis/MockContributorVault.json';
import PostVaultSplitterABI from '../abis/PostVaultSplitter.json';
import MerkleDropABI from '../abis/MerkleDropDistributor.json';
import OracleABI from '../abis/TRNUsageOracle.json';
import { loadContract } from '../contract';
import { getTrustScore } from '../../utils/trust';
import fs from 'fs';
import path from 'path';

export type VaultBreakdown = {
  contributor: number;
  investor: number;
  post: number;
  merkle: number;
  total: number;
};

async function getInvestorEarnings(addr: string): Promise<number> {
  try {
    const contract = await loadContract('MockInvestorVault', InvestorVaultABI as any);
    const result = await contract.earned(addr);
    return Number(result) / 1e18;
  } catch {
    return 0;
  }
}

async function getContributorEarnings(addr: string): Promise<number> {
  try {
    const contract = await loadContract('MockContributorVault', ContributorVaultABI as any);
    const result = await contract.earned(addr);
    return Number(result) / 1e18;
  } catch {
    return 0;
  }
}

async function getPostEarnings(addr: string): Promise<number> {
  try {
    const contract = await loadContract('PostVaultSplitter', PostVaultSplitterABI as any);
    const filter = contract.filters.PostEarningsSplit(null, null, addr);
    const logs = await contract.queryFilter(filter);
    return logs.reduce((sum: number, l: any) => sum + Number(l.args.totalAmount) / 1e18, 0);
  } catch {
    return 0;
  }
}

function loadLatestMerkle(): any | null {
  const dir = path.join(__dirname, '..', 'output');
  if (!fs.existsSync(dir)) return null;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith('merkle-') && f.endsWith('.json'))
    .sort();
  if (files.length === 0) return null;
  const file = path.join(dir, files[files.length - 1]);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

async function getMerkleEarnings(addr: string): Promise<number> {
  const data = loadLatestMerkle();
  if (data && data.claims) {
    const claim = data.claims[addr.toLowerCase()];
    if (claim) {
      const amount = typeof claim.amount === 'string' ? Number(claim.amount) : claim.amount;
      return amount / 1e18;
    }
  }

  // Fallback to scanning events
  try {
    const contract = await loadContract('MerkleDropDistributor', MerkleDropABI as any);
    const filter = contract.filters.Claimed(null, addr);
    const logs = await contract.queryFilter(filter);
    return logs.reduce((sum: number, l: any) => sum + Number(l.args.amount) / 1e18, 0);
  } catch {
    return 0;
  }
}

async function getOracleFallback(addr: string): Promise<number> {
  try {
    const oracle = await loadContract('TRNUsageOracle', OracleABI as any);
    const earned = await oracle.earnedTRN(addr);
    return Number(earned) / 1e18;
  } catch {
    return 0;
  }
}

export async function getVaultEarnings(addr: string): Promise<VaultBreakdown> {
  const lc = addr.toLowerCase();
  const [investorRaw, contributorRaw, postRaw, merkleRaw] = await Promise.all([
    getInvestorEarnings(lc),
    getContributorEarnings(lc),
    getPostEarnings(lc),
    getMerkleEarnings(lc),
  ]);

  const investor = investorRaw * (getTrustScore(lc, 'investor') / 100);
  const contributor = contributorRaw * (getTrustScore(lc, 'contributor') / 100);
  const post = postRaw * (getTrustScore(lc, 'posts') / 100);
  const merkle = merkleRaw * (getTrustScore(lc, 'merkle') / 100);

  let total = investor + contributor + post + merkle;

  if (total === 0) {
    total = await getOracleFallback(lc);
  }

  return { contributor, investor, post, merkle, total };
}

