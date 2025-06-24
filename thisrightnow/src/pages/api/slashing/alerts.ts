import type { NextApiRequest, NextApiResponse } from "next";
import { loadContract } from "@/utils/contract";
import SlashingPolicyABI from "@/abi/SlashingPolicyManager.json";
import { fetchRecentSlashingEvents } from "@/utils/fetchLogs";
import countryCodes from "@/data/countryCodes.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const slashingEvents = await fetchRecentSlashingEvents();
    const contract = await loadContract("SlashingPolicyManager", SlashingPolicyABI);

    const alerts: any[] = [];

    for (const event of slashingEvents) {
      const { country, category, amount } = event;
      const threshold = await contract.getThreshold(country, category);
      if (Number(amount) >= Number(threshold)) {
        alerts.push({
          country,
          category,
          amount,
          threshold: Number(threshold),
          exceeded: true,
        });
      }
    }

    res.status(200).json({ alerts });
  } catch (err) {
    console.error("Slashing alert fetch failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
