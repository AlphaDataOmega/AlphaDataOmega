import { buildRetrnTree, calcResonanceScore } from "./RetrnScoreEngine";

export type PostCandidate = { hash: string; views: number };

export async function getEntryWeight(postHash: string, viewCount: number) {
  const tree = await buildRetrnTree(postHash);
  const resonance = calcResonanceScore(tree);
  return viewCount * (1 + resonance / 100);
}

export function selectWeightedRandom(
  entries: { hash: string; weight: number }[],
  count: number
): string[] {
  const winners: string[] = [];
  const pool = [...entries];

  while (winners.length < count && pool.length > 0) {
    const total = pool.reduce((sum, e) => sum + e.weight, 0);
    let r = Math.random() * total;
    let chosenIndex = 0;

    for (let i = 0; i < pool.length; i++) {
      r -= pool[i].weight;
      if (r <= 0) {
        chosenIndex = i;
        break;
      }
    }

    winners.push(pool[chosenIndex].hash);
    pool.splice(chosenIndex, 1);
  }

  return winners;
}

export async function selectWinners(
  candidates: PostCandidate[],
  count: number
): Promise<string[]> {
  const weighted: { hash: string; weight: number }[] = [];

  for (const post of candidates) {
    const weight = await getEntryWeight(post.hash, post.views);
    weighted.push({ hash: post.hash, weight });
  }

  return selectWeightedRandom(weighted, count);
}
