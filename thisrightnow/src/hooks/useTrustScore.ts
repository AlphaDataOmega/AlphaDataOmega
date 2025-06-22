const MOCK_TRUST: Record<string, number> = {
  "0xUserOne": 92,
  "0xBotGuy": 23,
  "0xModLady": 88,
};

export function useTrustScore(addr?: string) {
  const score = addr
    ? MOCK_TRUST[addr] ?? Math.floor(Math.random() * 60) + 20
    : undefined;
  return addr ? { score } : undefined;
}
