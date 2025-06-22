import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

export type CIDLog = {
  cid: string;
  type: string; // e.g. "trending", "merkle", "post", "proposal"
  timestamp: string;
  context?: string;
};

const logPath = path.join("indexer", "output", "ipfs-log.json");

/**
 * Logs a new IPFS CID with its type and metadata.
 */
export function logCID(cid: string, type: string, context?: string) {
  const entry: CIDLog = {
    cid,
    type,
    timestamp: new Date().toISOString(),
    context,
  };

  let current: CIDLog[] = [];

  if (existsSync(logPath)) {
    const raw = readFileSync(logPath, "utf-8");
    current = JSON.parse(raw);
  }

  current.unshift(entry); // newest first

  writeFileSync(logPath, JSON.stringify(current, null, 2));
  console.log(`📦 Logged CID: ${cid} (${type})`);
}
