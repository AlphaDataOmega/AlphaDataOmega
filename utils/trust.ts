import OracleABI from "../thisrightnow/src/abi/TRNUsageOracle.json";
import { loadContract } from "./contract";

export async function getTrustScore(address: string, category = "general"): Promise<number> {
  // TODO: Replace with your deployed TRNUsageOracle contract address
  const TRN_USAGE_ORACLE_ADDRESS = process.env.TRN_USAGE_ORACLE_ADDRESS || "0xYourOracleAddressHere";
  const contract = await loadContract(TRN_USAGE_ORACLE_ADDRESS, OracleABI);
  try {
    const score = await (contract as any).getTrustScore(address, category);
    return Number(score);
  } catch (err) {
    console.error("Failed to fetch trust score from contract", err);
    return 50; // fallback neutral trust
  }
}

export async function getTrustWeight(address: string, category = "general"): Promise<number> {
  const score = await getTrustScore(address, category);
  return score >= 90 ? 1.25 : score >= 70 ? 1.1 : 0.9;
}

export async function getTrustMap(address: string) {
  // TODO: Replace with your deployed TRNUsageOracle contract address
  const TRN_USAGE_ORACLE_ADDRESS = process.env.TRN_USAGE_ORACLE_ADDRESS || "0xYourOracleAddressHere";
  const contract = await loadContract(TRN_USAGE_ORACLE_ADDRESS, OracleABI);
  const categories: string[] = ["general", "tech", "art", "politics", "finance"];

  const map: Record<string, number> = {};
  for (const cat of categories) {
    const score = await (contract as any)
      .getTrustScore(address, cat)
      .catch(() => 50);
    map[cat] = Number(score);
  }

  return map;
}

export function setTrustScore(
  address: string,
  category: string,
  score: number,
): void {
  const addr = address.toLowerCase();
  const cat = category.toLowerCase();
  if (!trustScoreMap[addr]) trustScoreMap[addr] = {};
  trustScoreMap[addr][cat] = score;
}

export function updateTrustScore(
  addr: string,
  category: string,
  delta: number,
): void {
  const current = getTrustScore(addr, category);
  const newScore = Math.max(0, Math.min(100, current + delta));
  setTrustScore(addr, category, newScore);
}
