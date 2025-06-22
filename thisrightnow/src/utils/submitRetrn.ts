import RetrnIndexABI from "@/abi/RetrnIndex.json";
import ViewIndexABI from "@/abi/ViewIndex.json";
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
  await (contract as any).logRetrn(ipfsHash, originalHash);

  // Also record this retrn in the view index so it can earn TRN
  const viewIndex = await loadContract("ViewIndex", ViewIndexABI);
  await (viewIndex as any).logView(ipfsHash);

  return ipfsHash;
}
