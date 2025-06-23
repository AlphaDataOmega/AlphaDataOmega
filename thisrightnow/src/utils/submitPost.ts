import ViewIndexABI from "@/abi/ViewIndex.json";
import RetrnIndexABI from "@/abi/RetrnIndex.json";
import RetrnWeightOracleABI from "@/abi/RetrnWeightOracle.json";
import { loadContract } from "./contract";
import { uploadToIPFS } from "./uploadToIPFS";
import { getTrustScore } from "./TrustScoreEngine";

export async function submitPost(content: string, tags: string[] = []) {
  const ipfsHash = await uploadToIPFS({
    content,
    tags,
    timestamp: Date.now(),
  });

  const contract = await loadContract("ViewIndex", ViewIndexABI);
  await (contract as any).registerPost(ipfsHash);

  return ipfsHash;
}

export async function submitRetrn(
  content: string,
  parentHash: string,
  contributor: string
) {
  const ipfsHash = await uploadToIPFS({
    content,
    parent: parentHash,
    author: contributor,
    timestamp: Date.now(),
  });

  const retrnIndex = await loadContract("RetrnIndex", RetrnIndexABI);
  const weightOracle = await loadContract(
    "RetrnWeightOracle",
    RetrnWeightOracleABI
  );

  // 🔎 Assume we already have a category tag (or fallback to "general")
  const category = "general"; // TODO: Replace with AI tag from IPFS content if available
  const rawScore = 100;
  const trustScore = await getTrustScore(category, contributor);
  const adjustedScore = Math.floor(rawScore * (1 + trustScore / 100));

  await (retrnIndex as any).registerRetrn(parentHash, ipfsHash);
  await (weightOracle as any).recordRetrnScore(
    ipfsHash,
    parentHash,
    contributor,
    rawScore,
    adjustedScore
  );

  return ipfsHash;
}
