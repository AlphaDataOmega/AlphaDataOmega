import { generateTrendingScores } from "./trendingIndexer";
import { uploadToIPFS } from "./utils/uploadToIPFS";
import { logCID } from "./utils/logCID";
import { writeFileSync } from "fs";
import path from "path";

async function emitTrending() {
  const trending = await generateTrendingScores();

  const filePath = path.join("thisrightnow", "public", "trending.json");
  writeFileSync(filePath, JSON.stringify(trending, null, 2));

  const cid = await uploadToIPFS(trending);
  logCID(cid, "trending", "Top 50 posts with trust-weighted scores");
}

emitTrending().catch(console.error);
