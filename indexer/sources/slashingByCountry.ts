import { getLogs } from "../utils/getLogs";
import FlagEscalatorABI from "../../abi/FlagEscalator.json";
import { getGeoDataForPost } from "../utils/postGeoLookup";

export async function getSlashingByCountry(): Promise<Record<string, number>> {
  const logs = await getLogs("FlagEscalator", FlagEscalatorABI, "PostSlashed");
  const countryMap: Record<string, number> = {};

  for (const log of logs) {
    const postHash = log.args?.postHash;
    const brn = Number(log.args?.brn || 0);
    const geo = await getGeoDataForPost(postHash); // ISO-3166 alpha-2 code

    if (!geo) continue;

    countryMap[geo] = (countryMap[geo] || 0) + brn;
  }

  return countryMap;
}
