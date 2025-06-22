import { fetchTrustScore } from "@/utils/fetchTrustScore";

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

  if (trust >= 90) return baseAmount * 1.25;
  if (trust >= 75) return baseAmount * 1.1;
  if (trust >= 50) return baseAmount;
  if (trust >= 30) return baseAmount * 0.6;
  return baseAmount * 0.3;
}

/**
 * Example use:
 *
 * const weightedTRN = await applyTrustWeight(userAddr, 10);
 * await oracle.rewardUser(userAddr, weightedTRN);
 */
