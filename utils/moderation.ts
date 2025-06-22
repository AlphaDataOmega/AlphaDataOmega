export type ModerationOutcome = 'approved' | 'flagged' | 'removed';

export async function getModerationOutcome(_postHash: string): Promise<ModerationOutcome> {
  const r = Math.random();
  if (r < 0.1) return 'removed';
  if (r < 0.3) return 'flagged';
  return 'approved';
}
