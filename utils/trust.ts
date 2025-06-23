import { trustScoreMap } from './trustState';

export function getTrustScore(address: string, category: string): number {
  const userMap = trustScoreMap[address.toLowerCase()] || {};
  return userMap[category.toLowerCase()] ?? 50;
}

export function getTrustWeight(address: string, category: string): number {
  const score = getTrustScore(address, category);
  return score >= 90 ? 1.25 : score >= 70 ? 1.1 : 0.9;
}

export function getTrustMap(address: string): Record<string, number> {
  const map = trustScoreMap[address.toLowerCase()] || {};
  return { ...map, general: map.general ?? 50 };
}

export function setTrustScore(
  address: string,
  category: string,
  score: number,
): void {
  const addr = address.toLowerCase();
  const cat = category.toLowerCase();
  if (!trustScoreMap[addr]) trustScoreMap[addr] = {};
  trustScoreMap[addr][cat] = score;
}

export function updateTrustScore(
  addr: string,
  category: string,
  delta: number,
): void {
  const current = getTrustScore(addr, category);
  const newScore = Math.max(0, Math.min(100, current + delta));
  setTrustScore(addr, category, newScore);
}
