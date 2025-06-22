import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { shards } = req.body as { shards?: string[] };
  if (!Array.isArray(shards) || shards.filter((s) => s.trim().length > 0).length < 4) {
    return res.status(400).json({ success: false, error: "At least 4 shard keys required" });
  }

  try {
    // TODO: Integrate on-chain VaultRecovery.sol logic
    // For now we simply echo success
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Recovery error", err);
    return res.status(500).json({ success: false, error: "Internal error" });
  }
}
