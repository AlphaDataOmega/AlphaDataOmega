import { uploadToIPFS } from "./ipfs";
import { loadContract } from "./contract";
import ViewIndexABI from "@/abi/ViewIndex.json";
import TRNUsageOracleABI from "@/abi/TRNUsageOracle.json";
import ModerationLogABI from "@/abi/ModerationLog.json";
import { getCategoryFromAI } from "./categoryAI";

export async function autoTagAndSubmit(content: string) {
  // 1. \uD83D\uDD20 Auto-tag with AI
  const category = await getCategoryFromAI(content);

  // 2. \uD83D\uDCE6 Upload to IPFS with category + metadata
  const metadata = {
    content,
    category,
    timestamp: Date.now(),
  };
  const ipfsHash = await uploadToIPFS(metadata);

  // 3. \uD83D\uDDFE Log category to ModerationLog
  const modLog = await loadContract("ModerationLog", ModerationLogABI as any);
  await (modLog as any).recordAIFlag(ipfsHash, category);

  // 4. \uD83D\uDDFF Register with ViewIndex
  const viewIndex = await loadContract("ViewIndex", ViewIndexABI as any);
  await (viewIndex as any).registerPost(ipfsHash);

  // 5. \uD83D\uDD2E Notify TRNUsageOracle for earnings
  const oracle = await loadContract("TRNUsageOracle", TRNUsageOracleABI as any);
  await (oracle as any).registerUsage(ipfsHash);

  // 6. \u2705 Return everything for UI
  return {
    hash: ipfsHash,
    category,
    earningsProjection: estimateEarnings(),
  };
}

function estimateEarnings(): number {
  const trustScore = 80; // mock
  const base = 0.003;
  const multiplier = 1 + trustScore / 100;
  return +(base * multiplier).toFixed(3);
}
