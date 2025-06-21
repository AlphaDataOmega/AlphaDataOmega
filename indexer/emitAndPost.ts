import { emitMerkleDrop } from "./emitDailyMerkle";
import { postMerkleRoot } from "./postMerkleRoot";

async function run() {
  const today = new Date().toISOString().split("T")[0];
  console.log(`🚀 Emitting + Posting Merkle Drop for ${today}...`);

  await emitMerkleDrop();
  await postMerkleRoot(today);

  console.log("✅ Drop complete and published.");
}

run();
