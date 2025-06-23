import { fetchTrustScore } from "./fetchTrustScore";

export async function fetchPost(cidOrUri: string) {
  const cid = cidOrUri.replace("ipfs://", "");
  const res = await fetch(`http://localhost:8080/ipfs/${cid}`);
  if (!res.ok) throw new Error("Failed to fetch IPFS content");
  const data = await res.json();

  if (data.author && data.category) {
    try {
      data.trustScore = await fetchTrustScore(data.author, data.category);
    } catch {
      // ignore trust fetch errors
    }
  }

  return data;
}
