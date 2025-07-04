import { recordModeratorDecision } from "@/utils/modAlerts";

export default async function handler(req, res) {
  const { hash, decision, modAddress } = JSON.parse(req.body);
  await recordModeratorDecision(hash, decision, modAddress);
  res.status(200).json({ ok: true });
}
