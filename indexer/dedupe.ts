// indexer/dedupe.ts
type ViewEvent = { postHash: string; viewer: string; timestamp: number };

export function dedupeViews(rawViews: ViewEvent[]): ViewEvent[] {
  const seen = new Set<string>();
  const result: ViewEvent[] = [];

  for (const v of rawViews) {
    const key = `${v.postHash}-${v.viewer}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(v);
    }
  }

  return result;
}
