import { ethers } from "ethers";
import ViewIndexABI from "./abis/ViewIndex.json";
import fs from "fs";
import { dedupeViews } from "./dedupe";

const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const contract = new ethers.Contract("0xYourViewIndexAddress", ViewIndexABI, provider);

const views: {
  [day: string]: { postHash: string; viewer: string; timestamp: number }[];
} = {};

contract.on("ViewLogged", (viewer: string, postHash: string, timestamp: ethers.BigNumberish) => {
  const day = new Date(Number(timestamp) * 1000).toISOString().split("T")[0];

  if (!views[day]) views[day] = [];
  views[day].push({
    postHash,
    viewer,
    timestamp: Number(timestamp),
  });

  console.log(`[${day}] View recorded for post ${postHash} by ${viewer}`);
});

// Optionally dump raw + deduped view data
setInterval(() => {
  const today = new Date().toISOString().split("T")[0];
  const deduped = dedupeViews(views[today] || []);
  fs.writeFileSync(`./output/views-${today}.json`, JSON.stringify(deduped, null, 2));
  console.log(`✅ Wrote ${deduped.length} deduped views to views-${today}.json`);
}, 60000);
