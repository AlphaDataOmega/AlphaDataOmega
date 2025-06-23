import { getTrustMap } from '../utils/trust';

export async function applyTrustWeighting(earningLogs: any[]) {
  const adjusted: any[] = [];

  for (const log of earningLogs) {
    const trustMap = await getTrustMap(log.contributor);
    const trust = trustMap[log.category ?? 'general'] ?? 0;
    const multiplier = trust / 100;

    adjusted.push({
      ...log,
      originalAmount: log.amount,
      adjustedAmount: Math.floor(log.amount * multiplier),
      trustScore: trust,
    });
  }

  return adjusted;
}
