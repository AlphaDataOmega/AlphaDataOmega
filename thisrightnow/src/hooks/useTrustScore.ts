// A lightweight trust hook for now, wired to mock data
const MOCK_TRUST: Record<string, number> = {
  "0xMOD123...": 92,
  "0xBOT456...": 25,
  "0xALPHA...": 88,
};

export function useTrustScore(address: string) {
  const normalized = address.toLowerCase();
  const score = MOCK_TRUST[normalized] ?? Math.floor(Math.random() * 60) + 30;
  return { score };
}

// Later, replace this with calls to:
// - TrustScoreEngine.ts
// - ModerationLog indexer
// - Vault + AI training signals
