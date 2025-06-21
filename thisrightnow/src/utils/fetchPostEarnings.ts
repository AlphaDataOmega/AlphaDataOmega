export async function getPostEarnings(postHash: string): Promise<any> {
  const res = await fetch(`http://localhost:4000/api/earnings/post/${postHash}`);
  return await res.json();
}
