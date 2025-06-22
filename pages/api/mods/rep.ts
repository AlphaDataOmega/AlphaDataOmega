import { loadModAuditTrail } from "@/utils/modReputation";

export default async function handler(req, res) {
  const data = await loadModAuditTrail();

  const result = data.reduce((acc, entry) => {
    const { actor, delta, reason } = entry;
    if (!acc[actor]) acc[actor] = { approvals: 0, dismissals: 0, appealReversals: 0, netTrust: 0 };
    if (reason === "mod_approval") acc[actor].approvals++;
    if (reason === "mod_dismissal") acc[actor].dismissals++;
    if (reason === "appeal_reversal") acc[actor].appealReversals++;
    acc[actor].netTrust += delta;
    return acc;
  }, {} as Record<string, { approvals: number; dismissals: number; appealReversals: number; netTrust: number }>);

  const mods = Object.entries(result).map(([address, stats]) => ({ address, ...stats }));
  res.status(200).json(mods);
}
