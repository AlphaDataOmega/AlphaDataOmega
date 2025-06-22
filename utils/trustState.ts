// Per-category trust store. Each user maps to a map of category -> score.
export const trustScoreMap: Record<string, Record<string, number>> = {
  "0xtrustedalpha...": {
    art: 94,
    politics: 72,
  },
  "0xbotfarm123...": {
    art: 22,
    politics: 30,
  },
};
