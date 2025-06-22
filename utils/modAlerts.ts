export type ModAlert = {
  timestamp: number;
  postHash: string;
  category: string;
  author: string;
  score: number;
  contentPreview: string;
  trustReport: { actor: string; trust: number; source: string }[];
  auditTrail: { delta: number; reason: string; postHash: string }[];
};

export async function loadAlertsFromStorageOrIPFS(): Promise<ModAlert[]> {
  return [
    {
      timestamp: Date.now() - 15000,
      postHash: "QmABC123...",
      category: "politics",
      author: "0xFlagged1",
      score: 6.8,
      contentPreview: "Lorem ipsum dolor sit amet...",
      trustReport: [
        { actor: "0xmod123...", trust: 92, source: "human" },
        { actor: "0xbot456...", trust: 25, source: "bot" },
      ],
      auditTrail: [
        { delta: -4, reason: "prior removal", postHash: "QmPrev1..." },
        { delta: 2, reason: "appeal granted", postHash: "QmPrev2..." },
      ],
    },
    {
      timestamp: Date.now() - 30000,
      postHash: "QmDEF456...",
      category: "art",
      author: "0xFlagged2",
      score: 5.4,
      contentPreview: "Another questionable post...",
      trustReport: [
        { actor: "0xalpha...", trust: 88, source: "human" },
      ],
      auditTrail: [
        { delta: -2, reason: "spam warning", postHash: "QmPrev3..." },
      ],
    },
  ];
}

import { logTrustAuditEvent } from "./trustAudit";
import { getCategoryFromPost } from "./fetchPost";
import { getTrustScore } from "./trust";
import { updateTrustScore } from "./trust";

export async function recordModeratorDecision(
  postHash: string,
  decision: string,
  modAddress: string,
): Promise<void> {
  const category = await getCategoryFromPost(postHash);
  const delta = decision === "approve" ? 2 : -2;
  const prev = getTrustScore(modAddress, category);
  const next = Math.max(0, Math.min(100, prev + delta));

  await logTrustAuditEvent({
    actor: modAddress,
    category,
    postHash,
    delta,
    reason: decision === "approve" ? "mod_approval" : "mod_dismissal",
    timestamp: Date.now(),
    prev,
    next,
  });

  updateTrustScore(modAddress, category, delta);
}
