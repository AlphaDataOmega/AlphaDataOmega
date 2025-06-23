import { fetchTrustScore } from "./fetchTrustScore";

// Simplified wrapper that could later be expanded to include category logic
export async function getTrustScore(
  category: string,
  address: string,
): Promise<number> {
  return fetchTrustScore(address, category);
}
