export async function fetchTrustScore(addr: string): Promise<number> {
  const MOCK_TRUST: Record<string, number> = {
    "0xmod123...": 92,
    "0xbot456...": 25,
    "0xalpha...": 88,
  };
  const normalized = addr.toLowerCase();
  return MOCK_TRUST[normalized] ?? Math.floor(Math.random() * 60) + 30;
}

export async function applyTrustWeight(
  addr: string,
  baseAmount: number,
): Promise<number> {
  const trust = await fetchTrustScore(addr);
  if (trust >= 90) return baseAmount * 1.2;
  if (trust >= 70) return baseAmount * 1.1;
  if (trust >= 50) return baseAmount;
  if (trust >= 30) return baseAmount * 0.7;
  return baseAmount * 0.4;
}
