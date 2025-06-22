import { loadTrustAuditTrail } from "@/utils/moderationLog";

export default async function handler(req, res) {
  const { addr } = req.query;
  const all = await loadTrustAuditTrail();
  const userLogs = all.filter((e) => e.actor === addr || e.target === addr);
  res.status(200).json(userLogs);
}
