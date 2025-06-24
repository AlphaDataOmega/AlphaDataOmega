import { getLogs } from "../utils/getLogs";
import FlagEscalatorABI from "../../abi/FlagEscalator.json";
import { getGeoDataForPost, getCategoryForPost } from "../utils/postGeoLookup";

export async function getSlashingByCountryAndCategory(): Promise<Record<string, Record<string, number>>> {
  const logs = await getLogs("FlagEscalator", FlagEscalatorABI, "PostSlashed");
  const map: Record<string, Record<string, number>> = {};

  for (const log of logs) {
    const postHash = log.args?.postHash;
    const brn = Number(log.args?.brn || 0);

    const geo = await getGeoDataForPost(postHash); // e.g. "US"
    const category = await getCategoryForPost(postHash); // e.g. "satire"

    if (!geo || !category) continue;

    if (!map[geo]) map[geo] = {};
    map[geo][category] = (map[geo][category] || 0) + brn;
  }

  return map;
}
