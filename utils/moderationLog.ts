export type ModerationLogEntry = {
  actor: string;
  target: string;
  postHash: string;
  reason: string;
  category: string;
  delta: number;
  timestamp: number;
};

const moderationLog: ModerationLogEntry[] = [
  {
    actor: "0xModAlpha...",
    target: "0xFlagged1",
    postHash: "QmABC123...",
    reason: "post_removed",
    category: "politics",
    delta: -5,
    timestamp: Date.now() - 60000,
  },
  {
    actor: "0xModBeta...",
    target: "0xFlagged2",
    postHash: "QmDEF456...",
    reason: "appeal_granted",
    category: "art",
    delta: 2,
    timestamp: Date.now() - 120000,
  },
];

export async function loadTrustAuditTrail(): Promise<ModerationLogEntry[]> {
  return moderationLog;
}
