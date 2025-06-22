import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

// Utility to load JSON safely
function loadJSON(filePath: string): Record<string, number> {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const base = path.resolve(process.cwd(), "src/data");

  // 🔹 Load from MerkleDropDistributor earnings
  const merkleData = loadJSON(path.join(base, "merkle-2025-06-18.json"));

  // 🔹 Load from vault earnings (merged contributor + investor maps)
  const investorVault = loadJSON(path.join(base, "vault-investor.json"));
  const contributorVault = loadJSON(path.join(base, "vault-contributor.json"));

  // 🔹 Load from post-level earnings
  const postEarnings = loadJSON(path.join(base, "post-earnings.json"));

  const aggregate: Record<string, number> = {};

  const addTo = (source: Record<string, number>) => {
    for (const [addr, amt] of Object.entries(source)) {
      const key = addr.toLowerCase();
      aggregate[key] = (aggregate[key] || 0) + amt;
    }
  };

  addTo(merkleData);
  addTo(investorVault);
  addTo(contributorVault);
  addTo(postEarnings);

  res.status(200).json(aggregate);
}
