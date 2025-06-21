import RetrnIndexABI from "./abis/RetrnIndex.json";
import { loadContract } from "./contract";

export async function getRetrnDepth(postHash: string): Promise<number> {
  const contract = await loadContract("RetrnIndex", RetrnIndexABI);
  const retrns = await contract.getRetrns(postHash);
  return retrns.length;
}
