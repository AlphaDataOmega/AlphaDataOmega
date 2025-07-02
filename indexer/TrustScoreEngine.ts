import { getTrustScore as contractGetTrustScore } from "../utils/trust";

// Placeholder trust score engine
export async function getTrustScore(
  addr: string,
  category?: string,
): Promise<number> {
  return contractGetTrustScore(addr, category || "general");
}
