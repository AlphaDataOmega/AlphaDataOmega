import type { NextApiRequest, NextApiResponse } from "next";
import { getSlashingAlerts } from "@/indexer/alerts/slashingAlerts";

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  const data = await getSlashingAlerts();
  res.status(200).json(data);
}
