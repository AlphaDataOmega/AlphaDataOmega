import InvestorVaultABI from "./abis/MockInvestorVault.json";
import ContributorVaultABI from "./abis/MockContributorVault.json";
import { loadContract } from "./contract";

const INVESTORS = [
  "0xabc123...", // replace with real test addresses
  "0xdef456...",
];

const CONTRIBUTORS = [
  "0x987...",
  "0x654...",
  "0x321...",
];

export async function getVaultEarnings(): Promise<Record<string, number>> {
  const investorVault = await loadContract("MockInvestorVault", InvestorVaultABI);
  const contributorVault = await loadContract("MockContributorVault", ContributorVaultABI);

  const earnings: Record<string, number> = {};

  for (const addr of INVESTORS) {
    try {
      const amount = await investorVault.earned(addr);
      earnings[addr] = Number(amount) / 1e18;
    } catch {
      earnings[addr] = earnings[addr] || 0;
    }
  }

  for (const addr of CONTRIBUTORS) {
    try {
      const amount = await contributorVault.earned(addr);
      earnings[addr] = (earnings[addr] || 0) + Number(amount) / 1e18;
    } catch {
      earnings[addr] = earnings[addr] || 0;
    }
  }

  return earnings;
}
