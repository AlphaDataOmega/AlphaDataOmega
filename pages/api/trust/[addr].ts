import { NextApiRequest, NextApiResponse } from "next";
import { trustScoreMap } from "@/utils/trustState";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { addr } = req.query;

  if (!addr || typeof addr !== "string") {
    return res.status(400).json({ error: "Missing or invalid address." });
  }

  const trustMap = trustScoreMap[addr.toLowerCase()] || {};
  return res.status(200).json({ address: addr.toLowerCase(), trust: trustMap });
}
