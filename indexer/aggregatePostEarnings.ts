import ViewIndexABI from "./abis/ViewIndex.json";
import RetrnIndexABI from "./abis/RetrnIndex.json";
import BoostingModuleABI from "./abis/BoostingModule.json";
import { getLogs } from "../utils/getLogs";
import { getTrustScore } from "../utils/TrustScoreEngine";
import { getPostCreator, getPostCategory } from "../utils/postMeta";

export type PostEarning = {
  postHash: string;
  creator: string;
  category: string;
  totalEarned: number;
};

/**
 * Aggregate TRN earnings for posts based on on-chain engagement events.
 *
 * @returns Array of post earning objects sorted by post hash
 */
export async function aggregatePostEarnings(): Promise<PostEarning[]> {
  const [viewLogs, retrnLogs, boostLogs] = await Promise.all([
    getLogs("ViewIndex", ViewIndexABI as any, "ViewLogged"),
    getLogs("RetrnIndex", RetrnIndexABI as any, "RetrnLogged"),
    getLogs("BoostingModule", BoostingModuleABI as any, "BoostStarted"),
  ]);

  const totals: Record<string, number> = {};

  for (const log of viewLogs) {
    const postHash = log.args?.postHash as string;
    if (!postHash) continue;
    totals[postHash] = (totals[postHash] || 0) + 1;
  }

  for (const log of retrnLogs) {
    const postHash = log.args?.originalPostHash as string;
    const amount = Number(log.args?.weightedTRN || 0);
    if (!postHash) continue;
    totals[postHash] = (totals[postHash] || 0) + amount;
  }

  for (const log of boostLogs) {
    const postHash = log.args?.postHash as string;
    const amount = Number(log.args?.trnAmount || 0);
    if (!postHash) continue;
    totals[postHash] = (totals[postHash] || 0) + amount;
  }

  const results: PostEarning[] = [];
  for (const [hash, raw] of Object.entries(totals)) {
    const creator = await getPostCreator(hash);
    const category = await getPostCategory(hash);
    const trust = await getTrustScore(creator, category);
    const adjusted = (raw * trust) / 100;
    results.push({ postHash: hash, creator, category, totalEarned: adjusted });
  }

  return results;
}
