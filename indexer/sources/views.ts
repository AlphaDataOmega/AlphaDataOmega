import { getLogsForEvent } from "@/utils/logs";
import ViewIndexABI from "@/abi/ViewIndex.json";
import { parseAbiItem } from "viem";

const event = parseAbiItem(
  "event ViewLogged(address indexed viewer, bytes32 indexed postHash)"
);

export async function getViewEarnings(): Promise<Record<string, number>> {
  const logs = await getLogsForEvent({
    contractName: "ViewIndex",
    abi: ViewIndexABI,
    event,
    fromBlock: "latest", // 👈 Replace with actual block range
  });

  const earnings: Record<string, number> = {};

  for (const log of logs) {
    const viewer = log.args.viewer as string;

    // Trust-weighted: add your logic here if trust scores are available
    const points = 1; // default value

    earnings[viewer] = (earnings[viewer] || 0) + points;
  }

  return earnings;
}
