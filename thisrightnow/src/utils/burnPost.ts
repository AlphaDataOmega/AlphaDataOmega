import BlessBurnABI from "@/abi/BlessBurnTracker.json";
import { loadContract } from "./contract";
import { getSigner } from "./signer";
import { applyTrustWeight } from "@/utils/TrustWeightedOracle";
import { ethers } from "ethers";

export async function burnPost(ipfsHash: string, baseTRN: number) {
  const signer = await getSigner();
  const userAddr = await signer.getAddress();

  const weightedTRN = await applyTrustWeight(userAddr, baseTRN);
  const contract = await loadContract("BlessBurnTracker", BlessBurnABI as any);
  const tx = await (contract as any).burnPost(
    ethers.encodeBytes32String(ipfsHash),
    ethers.parseEther(weightedTRN.toString()),
  );
  await tx.wait();

  return tx.hash as string;
}
