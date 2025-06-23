import { getLogsForEvent } from "@/utils/logs";
import RetrnIndexABI from "@/abi/RetrnIndex.json";
import { parseAbiItem } from "viem";
import { getTrustScore } from "@/utils/TrustScoreEngine";

const event = parseAbiItem(
  "event RetrnRegistered(address indexed author, bytes32 indexed parent, bytes32 newHash)"
);

/**
 * Retrieve trust-weighted retrn earnings for each author.
 *
 * Every RetrnRegistered log gives the author 1 point multiplied by their trust
 * score percentage. For example a trust score of 80 results in `0.8` earnings.
 */
export async function getRetrnEarnings(): Promise<Record<string, number>> {
  const logs = await getLogsForEvent({
    contractName: "RetrnIndex",
    abi: RetrnIndexABI,
    event,
    fromBlock: 0, // adjust to the desired indexing start
  });

  const earnings: Record<string, number> = {};

  for (const log of logs) {
    const author = log.args.author as string;

    const trust = await getTrustScore(author, "engagement.retrn");
    const weighted = (1 * trust) / 100;

    earnings[author] = (earnings[author] || 0) + weighted;
  }

  return earnings;
}
