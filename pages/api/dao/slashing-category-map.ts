import type { NextApiRequest, NextApiResponse } from "next";
import { getSlashingByCountryAndCategory } from "@/indexer/sources/slashingByCountryAndCategory";

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  const data = await getSlashingByCountryAndCategory();
  res.status(200).json(data);
}
