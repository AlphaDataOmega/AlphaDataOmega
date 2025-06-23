import type { NextApiRequest, NextApiResponse } from "next";
import { getSlashingByCountry } from "@/indexer/sources/slashingByCountry";

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  const data = await getSlashingByCountry();
  res.status(200).json(data);
}
