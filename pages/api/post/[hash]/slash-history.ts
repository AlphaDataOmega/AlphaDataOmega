import type { NextApiRequest, NextApiResponse } from "next";
import { getLogs } from "@/utils/getLogs";
import FlagEscalatorABI from "@/abi/FlagEscalator.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query;
  if (!hash || typeof hash !== "string") return res.status(400).json({ error: "Invalid hash" });

  try {
    const logs = await getLogs("FlagEscalator", FlagEscalatorABI, "PostSlashed", {
      postHash: hash,
    });

    res.status(200).json({ slashes: logs });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch slash history" });
  }
}
