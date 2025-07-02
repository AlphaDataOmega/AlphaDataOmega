import { uploadToIPFS } from "./ipfs";
import { loadContract } from "./contract";
import ViewIndexABI from "@/abi/ViewIndex.json";
import TRNUsageOracleABI from "@/abi/TRNUsageOracle.json";
import ModerationLogABI from "@/abi/ModerationLog.json";
import { getCategoryFromAI } from "./categoryAI";
import axios from "axios";

export async function autoTagAndSubmit(content: string) {
  // Use the new API endpoint
  const res = await axios.post("/api/post/new", { content });
  return res.data;
}

function estimateEarnings(): number {
  const trustScore = 80; // mock
  const base = 0.003;
  const multiplier = 1 + trustScore / 100;
  return +(base * multiplier).toFixed(3);
}
