export async function fetchPost(cidOrUri: string) {
  const cid = cidOrUri.replace("ipfs://", "");
  const res = await fetch(`http://localhost:8080/ipfs/${cid}`);
  if (!res.ok) throw new Error("Failed to fetch IPFS content");
  return await res.json();
}

export async function getCategoryFromPost(postHash: string): Promise<string> {
  const post = await fetchPost(postHash);
  return post.category || "general";
}
