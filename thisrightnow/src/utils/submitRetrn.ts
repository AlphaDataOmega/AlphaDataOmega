import RetrnIndexABI from "@/abi/RetrnIndex.json";
import { loadContract } from "./contract";
import { uploadToIPFS } from "./uploadToIPFS";
import { applyTrustWeight } from "@/utils/TrustWeightedOracle";
import { getSigner } from "./signer";
import { ethers } from "ethers";

export async function submitRetrn(
  content: string,
  parentHash: string,
  baseTRN: number = 1,
) {
  const signer = await getSigner();
  const userAddr = await signer.getAddress();

  const ipfsHash = await uploadToIPFS({
    content,
    parent: parentHash,
    timestamp: Date.now(),
  });

  const contract = await loadContract("RetrnIndex", RetrnIndexABI);
  const weightedTRN = await applyTrustWeight(userAddr, baseTRN);
  await (contract as any).registerRetrn(parentHash, ipfsHash, weightedTRN);

  return ipfsHash;
}

