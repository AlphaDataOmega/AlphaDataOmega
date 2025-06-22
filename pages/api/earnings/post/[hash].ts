import type { NextApiRequest, NextApiResponse } from "next";

// Mock earnings per post by address
const mockPostEarnings: Record<string, Record<string, number>> = {
  "ipfs://bafkreighfakehash1": {
    "0x123": 2.5,
    "0xabc": 1.1,
    "0xdeadbeef": 0.4,
  },
  "ipfs://bafkreighfakehash2": {
    "0xabc": 4.2,
    "0x123": 0.2,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query;
  const data = mockPostEarnings[(hash as string)] || {};

  if (Object.keys(data).length === 0) {
    return res.status(404).json({ error: "No earnings found" });
  }

  res.status(200).json(data);
}
