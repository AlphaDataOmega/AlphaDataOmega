import BoostingModuleABI from "@/abi/BoostingModule.json";
import { parseAbiItem } from "viem";
import { getLogsForEvent } from "@/utils/logs";
import { getTrustScore } from "../TrustScoreEngine";
import { isPostBurned } from "@/utils/postModeration";

export async function fetchBoostViewers(postHash: string): Promise<string[]> {
  // Placeholder: In production fetch from on-chain indexer or IPFS log
  const viewerMap: Record<string, string[]> = {
    "0xpost": ["0xViewerA", "0xViewerB"],
  };
  return viewerMap[postHash] || [];
}

async function getTrustSum(addresses: string[], category: string) {
  let sum = 0;
  for (const addr of addresses) {
    sum += await getTrustScore(addr, category);
  }
  return sum;
}

export async function getBoostEarnings(
  startBlock: number,
  endBlock: number,
): Promise<Record<string, number>> {
  const event = parseAbiItem(
    "event Boosted(address indexed poster, bytes32 postHash, uint256 amount)",
  );

  const logs = await getLogsForEvent({
    contractName: "BoostingModule",
    abi: BoostingModuleABI as any,
    event,
    fromBlock: startBlock,
    toBlock: endBlock,
  });

  const results: Record<string, number> = {};

  for (const log of logs) {
    const { poster, postHash, amount } = log.args as any;

    const burned = await isPostBurned(postHash);
    if (burned) continue;

    const viewers = await fetchBoostViewers(postHash);
    const distributable = (Number(amount) * 90) / 100;

    const trustSum = await getTrustSum(viewers, "boosting");
    for (const viewer of viewers) {
      const trust = await getTrustScore(viewer, "boosting");
      const portion = (distributable * trust) / (trustSum || 1);
      results[viewer] = (results[viewer] || 0) + portion;
    }
  }

  return results;
}
