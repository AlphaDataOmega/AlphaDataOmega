import { fetchTrustScore } from "./fetchTrustScore";
import OracleABI from "@/abi/TRNUsageOracle.json";
import { loadContract } from "./contract";

export async function getTrustScore(address: string, category = "general"): Promise<number> {
  return fetchTrustScore(address, category);
}

export async function getTrustWeight(address: string, category = "general"): Promise<number> {
  const score = await fetchTrustScore(address, category);
  return score >= 90 ? 1.25 : score >= 70 ? 1.1 : 0.9;
}

export async function getTrustMap(address: string) {
  // TODO: Replace with your deployed TRNUsageOracle contract address
  const TRN_USAGE_ORACLE_ADDRESS = process.env.NEXT_PUBLIC_TRN_USAGE_ORACLE_ADDRESS || "0xYourOracleAddressHere";
  const contract = await loadContract(TRN_USAGE_ORACLE_ADDRESS, OracleABI as any);
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
