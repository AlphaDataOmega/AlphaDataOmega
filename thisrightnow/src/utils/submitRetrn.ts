import RetrnIndexABI from "@/abi/RetrnIndex.json";
import { loadContract } from "./contract";
import { uploadToIPFS } from "./uploadToIPFS";

export async function submitRetrn(originalHash: string, content: string, tags: string[] = []) {
  const ipfsHash = await uploadToIPFS({
    content,
    parent: originalHash,
    tags,
    timestamp: Date.now(),
  });

  const contract = await loadContract("RetrnIndex", RetrnIndexABI);
  await (contract as any).registerRetrn(ipfsHash, originalHash);

  return ipfsHash;
}
