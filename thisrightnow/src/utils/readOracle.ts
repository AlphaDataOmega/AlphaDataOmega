import OracleABI from "@/abi/TRNUsageOracle.json";
import { loadContract } from "./contract";

export async function readTRNEarnings(address: string): Promise<string> {
  const contract = await loadContract("TRNUsageOracle", OracleABI);
  const earned = await contract.earnedTRN(address);
  return (Number(earned) / 1e18).toFixed(2);
}
