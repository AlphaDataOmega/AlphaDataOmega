export type EngagementMetrics = {
  views: number;
  retrns: number;
  blesses: number;
  burns: number;
  retrnBlessRatio: number;
};

export async function getEngagementMetrics(_postHash: string): Promise<EngagementMetrics> {
  const views = Math.floor(Math.random() * 100);
  const retrns = Math.floor(Math.random() * 10);
  const blesses = Math.floor(Math.random() * 10);
  const burns = Math.floor(Math.random() * 5);
  const retrnBlessRatio = blesses ? retrns / blesses : 0;
  return { views, retrns, blesses, burns, retrnBlessRatio };
}
