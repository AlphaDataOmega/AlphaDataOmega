import RetrnIndexABI from "@/abi/RetrnIndex.json";
import ViewIndexABI from "@/abi/ViewIndex.json";
import OracleABI from "@/abi/TRNUsageOracle.json";
import { loadContract } from "./contract";
import { uploadToIPFS } from "./uploadToIPFS";
import { applyTrustWeight } from "@/utils/TrustWeightedOracle";
import { ethers } from "ethers";

export async function submitRetrn(
  originalHash: string,
  content: string,
  tags: string[] = [],
) {
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
  await (viewIndex as any).registerPost(ipfsHash);

  // Trust-weighted burn recorded via Oracle
  const provider = new ethers.BrowserProvider(
    (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum!
  );
  const signer = await provider.getSigner();
  const addr = await signer.getAddress();
  const weight = await applyTrustWeight(addr, 1);
  const oracle = await loadContract("TRNUsageOracle", OracleABI);
  await (oracle as any).reportBurn(
    addr,
    ethers.parseEther(weight.toString()),
    ethers.encodeBytes32String(originalHash),
  );

  return ipfsHash;
}
