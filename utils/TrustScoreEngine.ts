// utils/TrustScoreEngine.ts

import { getTrustScore as contractGetTrustScore } from "./trust";

/**
 * Adapter to retrieve a contributor's trust score for a given category.
 *
 * @param addr Ethereum address of contributor
 * @param category Trust category string (e.g., "engagement.view", "post.tech", etc.)
 * @returns Trust score as integer (0–100)
 */
export async function getTrustScore(addr: string, category: string): Promise<number> {
  return contractGetTrustScore(addr, category);
}
