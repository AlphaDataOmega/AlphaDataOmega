import { getEngagementMetrics } from './metrics';
import { getModerationOutcome } from './moderation';
import { trustScoreMap } from './trustState';
import { getTrustScore } from './trust';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export async function updateTrustScoreFromEngagement(
  author: string,
  post: { category: string },
  postHash: string,
): Promise<void> {
  const trust = getTrustScore(author, post.category);

  const metrics = await getEngagementMetrics(postHash);
  const modResult = await getModerationOutcome(postHash);

  let delta = 0;

  // \uD83D\uDCC8 Engagement-driven score updates
  if (metrics.blesses > metrics.burns * 2) delta += 2;
  if (metrics.retrns > 5) delta += 1;
  if (metrics.views > 50) delta += 0.5;

  // \u26A0\uFE0F Penalties for flags or removals
  if (modResult === 'flagged') delta -= 3;
  if (modResult === 'removed') delta -= 5;

  // \uD83E\uDDEA Experimental bonus: retrn performance
  if (metrics.retrnBlessRatio > 1.5) delta += 1;

  const newScore = clamp(trust + delta, 0, 100);

  if (!trustScoreMap[author.toLowerCase()]) trustScoreMap[author.toLowerCase()] = {};
  trustScoreMap[author.toLowerCase()][post.category] = newScore;

  console.log(`\uD83D\uDD01 Trust updated for ${author}: ${trust} \u2192 ${newScore}`);
}
