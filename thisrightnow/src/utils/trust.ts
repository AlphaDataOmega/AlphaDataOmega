import { fetchTrustScore } from "./fetchTrustScore";

export async function getTrustScore(address: string): Promise<number> {
  return fetchTrustScore(address);
}
