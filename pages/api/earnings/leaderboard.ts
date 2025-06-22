import type { NextApiRequest, NextApiResponse } from "next";

// Mock leaderboard data. Replace with real indexer output.
const leaderboard: Record<string, number> = {
  "0x123...abc": 12340.312,
  "0xdef...456": 7221.1,
  "0xdead...beef": 5120.45,
  "0xcafe...babe": 3300.0,
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(leaderboard);
}
