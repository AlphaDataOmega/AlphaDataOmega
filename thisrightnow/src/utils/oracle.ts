import OracleABI from "@/abi/TRNUsageOracle.json";
import { loadContract } from "./contract";

export async function getOracleBalance(addr: string): Promise<string> {
  const contract = await loadContract("TRNUsageOracle", OracleABI);
  const balance = await (contract as any).getAvailableTRN(addr);
  return balance.toString();
}
