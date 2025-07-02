import type { NextApiRequest, NextApiResponse } from "next";
import { uploadToIPFS } from "@/utils/ipfs";
import { loadContract } from "@/utils/contract";
import ViewIndexABI from "@/abi/ViewIndex.json";
import ModerationLogABI from "@/abi/ModerationLog.json";
import TRNUsageOracleABI from "@/abi/TRNUsageOracle.json";
import { getCategoryFromAI } from "@/utils/categoryAI";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { content, regionCode } = req.body;
  if (!content || typeof content !== "string") return res.status(400).json({ error: "Missing content" });

  try {
    // 1. Auto-tag with AI
    const category = await getCategoryFromAI(content);
    const region = typeof regionCode === "string" ? regionCode : "US";

    // 2. Upload to IPFS
    const metadata = { content, category, regionCode: region, timestamp: Date.now() };
    const ipfsHash = await uploadToIPFS(metadata);

    // 3. Log category to ModerationLog
    const modLog = await loadContract("ModerationLog", ModerationLogABI as any);
    await (modLog as any).recordAIFlag(ipfsHash, category);

    // 4. Register with ViewIndex (new signature)
    const viewIndex = await loadContract("ViewIndex", ViewIndexABI as any);
    await (viewIndex as any).registerPost(ipfsHash, category, region);

    // 5. Notify TRNUsageOracle for earnings
    const oracle = await loadContract("TRNUsageOracle", TRNUsageOracleABI as any);
    await (oracle as any).registerUsage(ipfsHash);

    // 6. Return everything for UI
    res.status(200).json({ hash: ipfsHash, category, regionCode: region, earningsProjection: estimateEarnings() });
  } catch (e) {
    res.status(500).json({ error: "Failed to create post", details: (e as Error).message });
  }
}

function estimateEarnings(): number {
  const trustScore = 80; // mock
  const base = 0.003;
  const multiplier = 1 + trustScore / 100;
  return +(base * multiplier).toFixed(3);
} 