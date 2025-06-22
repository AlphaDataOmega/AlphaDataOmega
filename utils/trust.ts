import { trustScoreMap } from './trustState';

export function getTrustScore(address: string, category: string): number {
  const userMap = trustScoreMap[address.toLowerCase()] || {};
  return userMap[category.toLowerCase()] ?? 50;
}

export function getTrustWeight(address: string, category: string): number {
  const score = getTrustScore(address, category);
  return score >= 90 ? 1.25 : score >= 70 ? 1.1 : 0.9;
}
