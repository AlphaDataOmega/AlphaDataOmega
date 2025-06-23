// utils/TrustScoreEngine.ts

/**
 * Adapter to retrieve a contributor's trust score for a given category.
 *
 * @param addr Ethereum address of contributor
 * @param category Trust category string (e.g., "engagement.view", "post.tech", etc.)
 * @returns Trust score as integer (0–100)
 */
export async function getTrustScore(addr: string, category: string): Promise<number> {
  // 🔄 TODO: Replace with real trust store (on-chain, DB, IPFS, etc.)

  // Example: local mock trust map
  const mockTrust: Record<string, Record<string, number>> = {
    "0x123...": {
      "engagement.view": 80,
      "post.tech": 95,
    },
    "0x456...": {
      "engagement.view": 30,
    },
  };

  const userTrust = mockTrust[addr.toLowerCase()];
  if (!userTrust) return 50; // default neutral trust

  return userTrust[category] ?? 50;
}
