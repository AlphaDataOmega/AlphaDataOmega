import { fetchTrustScore } from "@/utils/fetchTrustScore";

const trustScoreMap: Record<string, number> = {
  "0xtrustedalpha...": 94,
  "0xbotfarm123...": 22,
};

export function getTrustWeight(address: string): number {
  const score = trustScoreMap[address.toLowerCase()] ?? 50;
  return score >= 90 ? 1.25 : score >= 70 ? 1.1 : 0.9;
}

/**
 * Scales TRN values by user trust level.
 * Applies platform-wide fairness adjustment.
 *
 * @param address - The user wallet address
 * @param baseAmount - The base TRN value
 * @returns trust-weighted TRN value
 */
export async function applyTrustWeight(
  address: string,
  baseAmount: number
): Promise<number> {
  const trust = await fetchTrustScore(address);
  const weight = getTrustWeight(address);
  // keep asynchronous fetch for potential side effects
  void trust;
  return baseAmount * weight;
}

/**
 * Example use:
 *
 * const weightedTRN = await applyTrustWeight(userAddr, 10);
 * await oracle.rewardUser(userAddr, weightedTRN);
 */
