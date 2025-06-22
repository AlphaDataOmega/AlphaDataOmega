import { generateTrendingScores } from "./trendingIndexer";
import { uploadToIPFS } from "./utils/uploadToIPFS";
import { writeFileSync } from "fs";
import path from "path";

async function emitTrending() {
  const trending = await generateTrendingScores();

  const filePath = path.join("thisrightnow", "public", "trending.json");
  writeFileSync(filePath, JSON.stringify(trending, null, 2));

  const ipfsHash = await uploadToIPFS(trending);
  console.log(`🚀 Trending data pinned to IPFS: ${ipfsHash}`);
}

emitTrending().catch(console.error);
