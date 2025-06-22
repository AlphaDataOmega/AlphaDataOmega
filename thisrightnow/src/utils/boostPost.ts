import { ethers } from "ethers";
import BoostingModuleABI from "@/abi/BoostingModule.json";
import { loadContract } from "./contract";
import { applyTrustWeight } from "@/utils/TrustWeightedOracle";

export async function boostPost(ipfsHash: string, baseTRN: number): Promise<string> {
  const provider = new ethers.BrowserProvider(
    (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum!
  );
  const signer = await provider.getSigner();
  const userAddr = await signer.getAddress();

  const weightedTRN = await applyTrustWeight(userAddr, baseTRN);

  const contract = await loadContract("BoostingModule", BoostingModuleABI as any);
  const tx = await (contract as any).startBoost(
    ethers.encodeBytes32String(ipfsHash),
    ethers.parseEther(weightedTRN.toString())
  );
  await tx.wait();

  return tx.hash as string;
}
