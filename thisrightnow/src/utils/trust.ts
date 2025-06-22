import { fetchTrustScore } from "./fetchTrustScore";

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
