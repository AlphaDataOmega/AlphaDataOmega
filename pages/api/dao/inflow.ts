import type { NextApiRequest, NextApiResponse } from "next";
import { aggregateInflow } from "@/indexer/aggregateEarnings";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await aggregateInflow();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch inflow" });
  }
}
