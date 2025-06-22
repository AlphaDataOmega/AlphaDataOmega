import { writeFileSync } from "fs";
import { loadContract } from "./contract";
import ViewIndexABI from "./abis/ViewIndex.json";
import BlessBurnTrackerABI from "./abis/BlessBurnTracker.json";
import BoostingModuleABI from "./abis/BoostingModule.json";
import RetrnIndexABI from "./abis/RetrnIndex.json";
import { applyTrustWeight } from "../shared/TrustWeightedOracle";

export type TrendingScore = {
  post: string;
  score: number;
  blesses: number;
  retrns: number;
  boostTRN: number;
};

export async function generateTrendingScores(): Promise<TrendingScore[]> {
  const viewIndex = await loadContract("ViewIndex", ViewIndexABI);
  const blessBurn = await loadContract("BlessBurnTracker", BlessBurnTrackerABI);
  const retrnIndex = await loadContract("RetrnIndex", RetrnIndexABI);
  const boosting = await loadContract("BoostingModule", BoostingModuleABI);

  const recentPosts: string[] = await viewIndex.getRecentPosts();

  const scores: TrendingScore[] = [];

  for (const hash of recentPosts) {
    const blessEvents = await blessBurn.queryFilter(
      blessBurn.filters.Blessed(hash)
    );
    const retrnEvents = await retrnIndex.queryFilter(
      retrnIndex.filters.Retrn(hash)
    );
    const boostEvents = await boosting.queryFilter(
      boosting.filters.Boosted(hash)
    );

    let score = 0;
    let blesses = 0;
    let retrns = 0;
    let boostTRN = 0;

    for (const e of blessEvents) {
      const trustTRN = await applyTrustWeight(e.args.user, 1);
      score += trustTRN;
      blesses++;
    }

    for (const e of retrnEvents) {
      const trustTRN = await applyTrustWeight(e.args.user, 2);
      score += trustTRN;
      retrns++;
    }

    for (const e of boostEvents) {
      const baseTRN = parseFloat(e.args.amount.toString());
      const trustTRN = await applyTrustWeight(e.args.user, baseTRN * 3);
      score += trustTRN;
      boostTRN += baseTRN;
    }

    scores.push({ post: hash, score, blesses, retrns, boostTRN });
  }

  scores.sort((a, b) => b.score - a.score);
  writeFileSync("indexer/output/trending.json", JSON.stringify(scores, null, 2));
  console.log("✅ Trending index updated.");
  return scores;
}

if (require.main === module) {
  generateTrendingScores().catch((err) => {
    console.error("❌ Error generating trending scores:", err);
    process.exit(1);
  });
}

