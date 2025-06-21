import ViewIndexABI from "./abis/ViewIndex.json";
import RetrnIndexABI from "./abis/RetrnIndex.json";
import BlessBurnABI from "./abis/BlessBurnTracker.json";
import { loadContract } from "./contract";
import { getRetrnDepth } from "./retrnWalker";

export async function getPostEarningsFromChain(postHash: string) {
  const views = await getViewCount(postHash);
  const retrns = await getRetrnDepth(postHash);
  const blessScore = await getBlessScore(postHash);
  const resonance = Math.floor(retrns * blessScore * 0.1);

  return {
    views,
    retrns,
    blessings: blessScore,
    resonance,
    vault: 0,
    total: views + retrns + blessScore + resonance,
  };
}

async function getViewCount(hash: string) {
  const contract = await loadContract("ViewIndex", ViewIndexABI);
  const result = await contract.viewCount(hash);
  return Number(result);
}

async function getBlessScore(hash: string) {
  const contract = await loadContract("BlessBurnTracker", BlessBurnABI);
  const result = await contract.score(hash);
  return Number(result);
}
