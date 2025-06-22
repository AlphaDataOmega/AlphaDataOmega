const MOCK_TRUST: Record<string, number> = {
  "0xtrustedalpha...": 94,
  "0xbotfarm123...": 22,
};

export async function fetchTrustScore(address: string): Promise<number> {
  const normalized = address.toLowerCase();
  return MOCK_TRUST[normalized] ?? Math.floor(Math.random() * 40 + 30);
}
