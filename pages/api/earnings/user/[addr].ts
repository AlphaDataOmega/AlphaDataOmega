import type { NextApiRequest, NextApiResponse } from "next";

// Mock earnings — replace with real indexer data later
const mockEarnings: Record<string, { totals: { views: string; retrns: string; boosts: string }; byPost: { hash: string; views: string; retrns: string; boosts: string }[] }> = {
  "0x123": {
    totals: {
      views: "12.34",
      retrns: "5.67",
      boosts: "3.21",
    },
    byPost: [
      {
        hash: "QmPost1...",
        views: "3.00",
        retrns: "1.00",
        boosts: "0.00",
      },
      {
        hash: "QmPost2...",
        views: "9.34",
        retrns: "4.67",
        boosts: "3.21",
      },
    ],
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { addr } = req.query;
  const lowerAddr = (addr as string).toLowerCase();

  const earnings = mockEarnings[lowerAddr];

  if (!earnings) {
    return res.status(404).json({ error: "No earnings found" });
  }

  return res.status(200).json({
    address: addr,
    ...earnings,
  });
}
