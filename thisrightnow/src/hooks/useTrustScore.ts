const MOCK_TRUST_SCORES: Record<string, number> = {
  "0xUserOne": 91,
  "0xBotGuy": 23,
  "0xModLady": 87,
};

export function useTrustScore(addr?: string) {
  if (!addr) return null;

  // Mock logic: if we have a real address in mock list, use it — otherwise randomize
  const score =
    MOCK_TRUST_SCORES[addr] ?? Math.floor(Math.random() * 60) + 20;

  return { score };
}
