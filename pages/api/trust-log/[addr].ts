import { getAuditTrail } from "@/utils/trustAudit";

export default async function handler(req, res) {
  const { addr } = req.query;
  if (!addr || typeof addr !== "string") {
    return res.status(400).json({ error: "Missing address" });
  }

  const entries = await getAuditTrail(addr as string);
  res.status(200).json(entries);
}
