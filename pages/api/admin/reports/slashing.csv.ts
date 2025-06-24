import type { NextApiRequest, NextApiResponse } from "next";
import { getSlashingByCountryAndCategory } from "@/indexer/sources/slashingByCountryAndCategory";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const data = await getSlashingByCountryAndCategory();
  const rows: string[] = ["country,category,brn"];

  for (const [country, cats] of Object.entries(data)) {
    for (const [cat, brn] of Object.entries(cats)) {
      rows.push(`${country},${cat},${brn}`);
    }
  }

  const csv = rows.join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=slashing.csv");
  res.status(200).send(csv);
}
