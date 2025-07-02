import type { NextApiRequest, NextApiResponse } from "next";
import { getTrustMap } from "@/utils/trust";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { addr } = req.query;

  if (!addr || typeof addr !== "string") {
    return res.status(400).json({ error: "Missing or invalid address" });
  }

  try {
    const trustMap = await getTrustMap(addr.toLowerCase());
    res.status(200).json({ trust: trustMap });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch trust map" });
  }
}
