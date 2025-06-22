import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const category = req.query.category?.toString().toLowerCase();
    const filePath = path.join(process.cwd(), "thisrightnow", "public", "trending.json");

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Trending data not found." });
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    let data = JSON.parse(raw);

    if (category) {
      data = data.filter((p: any) => p.category?.toLowerCase() === category);
    }

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    res.status(200).json(data);
  } catch (err) {
    console.error("Error loading trending:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
