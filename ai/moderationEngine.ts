import { getTrustScore } from "../utils/trust";
import { getAuditTrail } from "../utils/trustAudit";

export type PostData = { author: string; category: string };
export type FlagData = { actor: string; severity: number };

export async function assessModeration(post: PostData, flags: FlagData[]) {
  let score = 0;
  const category = post.category;

  for (const flag of flags) {
    const trust = getTrustScore(flag.actor, category);
    const weight = trust >= 90 ? 1.5 : trust >= 70 ? 1.2 : 1;
    score += flag.severity * weight;
  }

  // 🕵️ Look for mod actions or appeals in the audit trail
  const audit = await getAuditTrail(post.author, category);
  const recentPositives = audit.filter((a) => a.delta > 0).length;
  const recentNegatives = audit.filter((a) => a.delta < 0).length;

  if (recentPositives > recentNegatives) {
    score *= 0.9; // more lenient
  } else {
    score *= 1.1; // stricter
  }

  return score >= 5 ? "ESCALATE" : "ALLOW";
}
