import { recordAppealResolution } from "./moderationLog";

export type AppealEntry = {
  postHash: string;
  author: string;
  category: string;
  reason: string;
  timestamp: number;
};

const pendingAppeals: AppealEntry[] = [
  {
    postHash: "QmAppealAlpha...",
    author: "0xUserAlpha...",
    category: "politics",
    reason: "This moderation was unfair",
    timestamp: Date.now() - 45000,
  },
  {
    postHash: "QmAppealBeta...",
    author: "0xUserBeta...",
    category: "art",
    reason: "Removal was a mistake",
    timestamp: Date.now() - 120000,
  },
];

export async function getPendingAppeals(): Promise<AppealEntry[]> {
  return pendingAppeals;
}

export async function resolvePendingAppeal(
  postHash: string,
  decision: "approve" | "reject",
): Promise<void> {
  const idx = pendingAppeals.findIndex((a) => a.postHash === postHash);
  if (idx === -1) throw new Error("Appeal not found");
  const appeal = pendingAppeals.splice(idx, 1)[0];
  await recordAppealResolution(
    appeal.postHash,
    decision === "approve" ? "appeal_granted" : "appeal_denied",
    appeal.author,
    appeal.category,
  );
}
