import OracleABI from "@/abi/TRNUsageOracle.json";
import { loadContract } from "./contract";

const CACHE: Record<string, Record<string, number>> = {};

/**
 * Fetches the trust score for an address in a specific category from the TRNUsageOracle contract.
 * Results are cached per address for thread performance.
 */
export async function fetchTrustScore(
  address: string,
  category = "general",
): Promise<number> {
  const normalized = address.toLowerCase();

  if (CACHE[normalized] && CACHE[normalized][category] !== undefined) {
    return CACHE[normalized][category];
  }

  // TODO: Replace with your deployed TRNUsageOracle contract address
  const TRN_USAGE_ORACLE_ADDRESS = process.env.NEXT_PUBLIC_TRN_USAGE_ORACLE_ADDRESS || "0xYourOracleAddressHere";
  const contract = await loadContract(TRN_USAGE_ORACLE_ADDRESS, OracleABI);

  try {
    const score = await (contract as any).getTrustScore(normalized, category);
    const value = Number(score);
    CACHE[normalized] = { ...(CACHE[normalized] || {}), [category]: value };
    return value;
  } catch (err) {
    console.error("Failed to fetch trust score from contract", err);
    return 50; // fallback neutral trust
  }
}
