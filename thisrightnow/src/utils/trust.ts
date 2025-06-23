import { fetchTrustScore } from "./fetchTrustScore";
import TrustOracleABI from "@/abi/TrustScoreEngine.json";
import { loadContract } from "./contract";

const trustScoreMap: Record<string, number> = {
  "0xtrustedalpha...": 94,
  "0xbotfarm123...": 22,
};

export function getTrustWeight(address: string): number {
  const score = trustScoreMap[address.toLowerCase()] || 50;
  return score >= 90 ? 1.25 : score >= 70 ? 1.1 : 0.9;
}

export async function getTrustScore(address: string): Promise<number> {
  return fetchTrustScore(address);
}

export async function getTrustMap(address: string) {
  const contract = await loadContract("TrustScoreEngine", TrustOracleABI as any);
  const categories: string[] = ["general", "tech", "art", "politics", "finance"];

  const map: Record<string, number> = {};
  for (const cat of categories) {
    const score = await (contract as any)
      .getScore(cat, address)
      .catch(() => 0);
    map[cat] = Number(score);
  }

  return map;
}
