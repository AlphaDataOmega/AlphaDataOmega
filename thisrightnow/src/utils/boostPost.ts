import { ethers } from "ethers";
import BoostingModuleABI from "@/abi/BoostingModule.json";
import { loadContract } from "./contract";
import { applyTrustWeight } from "@/utils/TrustWeightedOracle";
import { fetchTrustScore } from "@/utils/fetchTrustScore";
import { getSigner } from "@/utils/signer";

export async function boostPost(ipfsHash: string, baseTRN: number): Promise<string> {
  const signer = await getSigner();
  const userAddr = await signer.getAddress();

  const trustScore = await fetchTrustScore(userAddr);
  const weightedTRN = await applyTrustWeight(userAddr, baseTRN);

  const contract = await loadContract("BoostingModule", BoostingModuleABI as any);
  const tx = await (contract as any).startBoost(
    ethers.encodeBytes32String(ipfsHash),
    ethers.parseEther(weightedTRN.toString())
  );
  await tx.wait();

  console.log(`[BOOST] ${userAddr} trust: ${trustScore}, scaled TRN: ${weightedTRN}`);

  return tx.hash as string;
}
