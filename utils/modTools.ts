import { getTrustScore } from "./trust";
import { getAuditTrail } from "./trustAudit";

export type Flag = { actor: string; severity: number; source: string };
export type FlaggedPost = { postHash: string; flags: Flag[] };

export async function fetchFlaggedPosts(): Promise<FlaggedPost[]> {
  return [
    {
      postHash: "QmABC...",
      flags: [
        { actor: "0xFlagger1", severity: 3, source: "human" },
        { actor: "0xBot42", severity: 1, source: "bot" },
      ],
    },
    {
      postHash: "QmDEF...",
      flags: [
        { actor: "0xFlagger2", severity: 2, source: "human" },
      ],
    },
  ];
}

export { getTrustScore, getAuditTrail };
