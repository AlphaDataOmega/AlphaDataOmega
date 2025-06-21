import OracleABI from "./abis/TRNUsageOracle.json";
import { loadContract } from "./contract";

export async function getOracleBalance(addr: string): Promise<number> {
  const contract = await loadContract("TRNUsageOracle", OracleABI as any);
  const earned = await contract.earnedTRN(addr);
  return Number(earned) / 1e18;
}
