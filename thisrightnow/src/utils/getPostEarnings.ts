export async function getPostEarnings(postHash: string, address: string) {
  const res = await fetch(`/api/earnings/user/${address}`);
  if (!res.ok) return null;

  const data = await res.json();
  const match = data.byPost.find((p: any) => p.hash === postHash);

  return match
    ? parseFloat(match.views) +
        parseFloat(match.retrns) +
        parseFloat(match.boosts)
    : 0;
}
