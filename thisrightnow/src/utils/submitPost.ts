import ViewIndexABI from "@/abi/ViewIndex.json";
import { loadContract } from "./contract";
import { uploadToIPFS } from "./uploadToIPFS";

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
