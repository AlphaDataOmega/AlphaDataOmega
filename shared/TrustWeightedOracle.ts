const trustScoreMap: Record<string, number> = {
  "0xmod123...": 92,
  "0xbot456...": 25,
  "0xalpha...": 88,
};

export async function fetchTrustScore(addr: string): Promise<number> {
  const normalized = addr.toLowerCase();
  return trustScoreMap[normalized] ?? Math.floor(Math.random() * 60) + 30;
}

export function getTrustWeight(address: string): number {
  const score = trustScoreMap[address.toLowerCase()] ?? 50;
  return score >= 90 ? 1.25 : score >= 70 ? 1.1 : 0.9;
}

export async function applyTrustWeight(
  addr: string,
  baseAmount: number,
): Promise<number> {
  const weight = getTrustWeight(addr);
  return baseAmount * weight;
}
