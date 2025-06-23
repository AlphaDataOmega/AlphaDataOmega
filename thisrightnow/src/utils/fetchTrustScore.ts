const MOCK_TRUST: Record<string, Record<string, number>> = {
  "0xtrustedalpha...": {
    art: 94,
    politics: 72,
  },
  "0xbotfarm123...": {
    art: 22,
    politics: 30,
  },
};

const CACHE: Record<string, Record<string, number>> = {};

/**
 * Fetches the trust score for an address in a specific category.
 * Results are cached per address for thread performance.
 */
export async function fetchTrustScore(
  address: string,
  category = "general",
): Promise<number> {
  const normalized = address.toLowerCase();

  if (CACHE[normalized] && CACHE[normalized][category] !== undefined) {
    return CACHE[normalized][category];
  }

  try {
    const res = await fetch(`/api/trust/${normalized}`);
    if (res.ok) {
      const data = await res.json();
      CACHE[normalized] = { ...(CACHE[normalized] || {}), ...(data.trust || {}) };
      if (CACHE[normalized][category] !== undefined) {
        return CACHE[normalized][category];
      }
    }
  } catch {
    // ignore network errors and fall back to mock
  }

  const mock = MOCK_TRUST[normalized]?.[category];
  const value = mock ?? Math.floor(Math.random() * 40 + 30);
  CACHE[normalized] = { ...(CACHE[normalized] || {}), [category]: value };
  return value;
}
