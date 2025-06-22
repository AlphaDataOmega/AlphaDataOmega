import { ethers } from "ethers";
import BlessBurnABI from "@/abi/BlessBurnTracker.json";
import BoostingModuleABI from "@/abi/BoostingModule.json";
import OracleABI from "@/abi/TRNUsageOracle.json";
import { loadContract } from "./contract";
import { applyTrustWeight } from "@/utils/TrustWeightedOracle";

export async function blessPost(postHash: string) {
  const tracker = await loadContract("BlessBurnTracker", BlessBurnABI as any);
  const hashBytes = ethers.encodeBytes32String(postHash);
  await (tracker as any).blessPost(hashBytes);

  const provider = new ethers.BrowserProvider(
    (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum!
  );
  const signer = await provider.getSigner();
  const addr = await signer.getAddress();
  const amount = await applyTrustWeight(addr, 1);
  const oracle = await loadContract("TRNUsageOracle", OracleABI);
  await (oracle as any).reportSpend(addr, ethers.parseEther(amount.toString()), "bless");
}

export async function burnPost(postHash: string) {
  const tracker = await loadContract("BlessBurnTracker", BlessBurnABI as any);
  const hashBytes = ethers.encodeBytes32String(postHash);
  await (tracker as any).burnPost(hashBytes);

  const provider = new ethers.BrowserProvider(
    (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum!
  );
  const signer = await provider.getSigner();
  const addr = await signer.getAddress();
  const amount = await applyTrustWeight(addr, 1);
  const oracle = await loadContract("TRNUsageOracle", OracleABI);
  await (oracle as any).reportBurn(addr, ethers.parseEther(amount.toString()), hashBytes);
}

export async function boostPost(postHash: string, baseTRN: number) {
  const provider = new ethers.BrowserProvider(
    (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum!
  );
  const signer = await provider.getSigner();
  const addr = await signer.getAddress();
  const weighted = await applyTrustWeight(addr, baseTRN);
  const contract = await loadContract("BoostingModule", BoostingModuleABI as any);
  const hashBytes = ethers.encodeBytes32String(postHash);
  await (contract as any).startBoost(hashBytes, ethers.parseEther(weighted.toString()));
}
