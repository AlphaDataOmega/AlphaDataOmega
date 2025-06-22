import fs from "fs";
import path from "path";
import { loadContract } from "./contract";
import ViewIndexABI from "./abis/ViewIndex.json";
import RetrnIndexABI from "./abis/RetrnIndex.json";
import BoostingModuleABI from "./abis/BoostingModule.json";
import { fetchPost } from "./utils/fetchPost";
import { getResonanceScore } from "./utils/getResonanceScore";
import { calcTrendingScore } from "./utils/calcTrendingScore";

async function main() {
  const ViewIndex = await loadContract("ViewIndex", ViewIndexABI);
  const RetrnIndex = await loadContract("RetrnIndex", RetrnIndexABI);
  const BoostingModule = await loadContract("BoostingModule", BoostingModuleABI);

  const recentHashes: string[] = await ViewIndex.getRecentPosts();

  const posts = await Promise.all(
    recentHashes.map(async (hash) => {
      const post = await fetchPost(hash);
      const category = Array.isArray((post as any).tags) && (post as any).tags.length > 0
        ? (post as any).tags[0]
        : undefined;
      const retrns: string[] = await RetrnIndex.getRetrns(hash);
      const boostData = await BoostingModule.getBoost(hash);
      const boostTRN = boostData && boostData.amount ? Number(boostData.amount) / 1e18 : 0;
      const resonance = await getResonanceScore(hash);

      const score = calcTrendingScore({
        retrns: retrns.length,
        boostTRN,
        resonance,
        createdAt: post.timestamp,
      });

      return {
        hash,
        content: post.content,
        author: post.author,
        timestamp: post.timestamp,
        retrns: retrns.length,
        boostTRN,
        resonance,
        score,
        category,
      };
    })
  );

  const sorted = posts.sort((a, b) => b.score - a.score);

  const outputPath = path.join(__dirname, "output", "trending.json");
  fs.writeFileSync(outputPath, JSON.stringify(sorted, null, 2));
  console.log(`✅ Trending scores written to ${outputPath}`);
}

main().catch((err) => {
  console.error("❌ Error running trending indexer:", err);
  process.exit(1);
});
