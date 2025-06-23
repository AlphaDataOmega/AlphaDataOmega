import { buildMerkleTree } from './buildMerkle';
import { getDailyViews } from './viewIndexer';
import { getVaultEarnings } from './vaultScanner';
import { getLottoWinners } from './fetchLotto';
import { applyTrustWeighting } from './applyTrustWeighting';
import { buildRetrnTree, calcResonanceScore } from './RetrnScoreEngine';
import { getTrustMap } from '../utils/trust';
import fs from 'fs';

interface DailyEarnings {
  [address: string]: {
    total: number;
    breakdown: {
      views: number;
      retrns: number;
      blessings: number;
      vaults: number;
      lotto: number;
    };
    trustMap: {
      [category: string]: number;
    };
    proof?: string[];
  };
}

async function getResonanceBonusForPost(postHash: string) {
  const tree = await buildRetrnTree(postHash);
  const score = calcResonanceScore(tree);
  return Math.floor(score); // 1 TRN per resonance point
}

function initEntry(addr: string, map: DailyEarnings) {
  if (!map[addr]) {
    map[addr] = {
      total: 0,
      breakdown: { views: 0, retrns: 0, blessings: 0, vaults: 0, lotto: 0 },
      trustMap: getTrustMap(addr),
    };
  }
}

async function aggregateEarnings(date: string): Promise<DailyEarnings> {
  const viewData = await getDailyViews(date);
  const vaultData = await getVaultEarnings();
  const lottoData = await getLottoWinners(date);

  const earnings: DailyEarnings = {};

  // --- Views + Resonance ---
  const viewLogs: { viewer: string; amount: number; category: string }[] = [];
  for (const [postHash, { viewers }] of Object.entries(viewData)) {
    const resonanceBonus = await getResonanceBonusForPost(postHash);
    const perViewerBonus = Math.floor(
      resonanceBonus / (Object.keys(viewers).length || 1)
    );

    for (const [viewer, viewCount] of Object.entries(viewers)) {
      const base = viewCount; // 1 TRN per view
      const bonus = perViewerBonus;
      viewLogs.push({ viewer, amount: base + bonus, category: 'general' });
    }
  }

  const adjusted = await applyTrustWeighting(viewLogs);
  for (const entry of adjusted) {
    initEntry(entry.viewer, earnings);
    earnings[entry.viewer].breakdown.views += entry.adjustedAmount;
    earnings[entry.viewer].total += entry.adjustedAmount;
  }

  // --- Lotto ---
  for (const { addr, amount, category } of lottoData) {
    initEntry(addr, earnings);
    earnings[addr].breakdown.lotto += amount;
    earnings[addr].total += amount;
    earnings[addr].trustMap[category] = earnings[addr].trustMap[category] ?? 0;
  }

  // --- Vault payouts ---
  for (const [addr, amount] of Object.entries(vaultData)) {
    initEntry(addr, earnings);
    earnings[addr].breakdown.vaults += amount;
    earnings[addr].total += amount;
  }

  return earnings;
}

export async function emitMerkleDrop(
  date = new Date().toISOString().split('T')[0]
) {
  const earnings = await aggregateEarnings(date);

  const entries = Object.entries(earnings).map(([addr, data]) => ({
    address: addr,
    amount: BigInt(Math.floor(data.total * 1e18)),
  }));

  const merkle = buildMerkleTree(entries);

  for (const [addr, claim] of Object.entries(merkle.claims)) {
    if (earnings[addr]) earnings[addr].proof = claim.proof;
  }

  fs.writeFileSync(
    `./output/merkle-${date}.json`,
    JSON.stringify(merkle, null, 2)
  );
  fs.writeFileSync(
    `./output/daily-${date}.json`,
    JSON.stringify(earnings, null, 2)
  );

  console.log(
    `✅ Daily earnings + Merkle drop created for ${date} with ${entries.length} entries.`
  );
}


