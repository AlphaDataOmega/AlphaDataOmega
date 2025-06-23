import RetrnIndexABI from "./abis/RetrnIndex.json";
import RetrnWeightOracleABI from "./abis/RetrnWeightOracle.json";
import { loadContract } from "./contract";
import fs from "fs";

export type TrendingPost = {
  hash: string;
  score: number;
};

export async function generateTrendingScores(): Promise<TrendingPost[]> {
  const retrnIndex = await loadContract("RetrnIndex", RetrnIndexABI);
  const weightOracle = await loadContract("RetrnWeightOracle", RetrnWeightOracleABI);

  const rootPosts: string[] = await retrnIndex.getTopLevelPosts();
  const postScores: Record<string, number> = {};

  for (const post of rootPosts) {
    const retrns: string[] = await retrnIndex.getRetrns(post);
    let score = 0;

    for (const r of retrns) {
      const [, adjusted] = await weightOracle.getRetrnScore(r).catch(() => [0, 0]);
      score += Number(adjusted);
    }

    postScores[post] = score;
  }

  const sorted = Object.entries(postScores)
    .sort((a, b) => b[1] - a[1])
    .map(([hash, score]) => ({ hash, score }));

  fs.writeFileSync("indexer/output/trending.json", JSON.stringify(sorted, null, 2));
  console.log("✅ Trending scores updated");
  return sorted;
}

if (require.main === module) {
  generateTrendingScores().catch((err) => {
    console.error("❌ Error updating trending scores:", err);
    process.exit(1);
  });
}
