import { ethers } from "ethers";
import ViewIndexABI from "./abis/ViewIndex.json";
import fs from "fs";
import { dedupeViews } from "./dedupe";

const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const contract = new ethers.Contract("0xYourViewIndexAddress", ViewIndexABI, provider);

const views: {
  [day: string]: { postHash: string; viewer: string; timestamp: number }[];
} = {};

contract.on(
  "ViewLogged",
  async (postHash: string, viewer: string, event: ethers.EventLog) => {
    const block = await event.getBlock();
    const timestamp = block.timestamp;
    const day = new Date(Number(timestamp) * 1000)
      .toISOString()
      .split("T")[0];

    if (!views[day]) views[day] = [];
    views[day].push({
      postHash,
      viewer,
      timestamp: Number(timestamp),
    });

    console.log(`[${day}] View recorded for post ${postHash} by ${viewer}`);
  }
);

// Optionally dump raw + deduped view data
setInterval(() => {
  const today = new Date().toISOString().split("T")[0];
  const deduped = dedupeViews(views[today] || []);
  fs.writeFileSync(`./output/views-${today}.json`, JSON.stringify(deduped, null, 2));
  console.log(`✅ Wrote ${deduped.length} deduped views to views-${today}.json`);
}, 60000);

export function getDailyViews(date?: string) {
  const today = date ?? new Date().toISOString().split("T")[0];
  try {
    const raw = fs.readFileSync(`./output/views-${today}.json`, "utf-8");
    const logs: { postHash: string; viewer: string; timestamp: number }[] = JSON.parse(raw);
    const result: Record<string, { viewers: Record<string, number> }> = {};

    for (const { postHash, viewer } of logs) {
      if (!result[postHash]) result[postHash] = { viewers: {} };
      const viewsByAddr = result[postHash].viewers;
      viewsByAddr[viewer] = (viewsByAddr[viewer] || 0) + 1;
    }

    return result;
  } catch {
    return {};
  }
}
