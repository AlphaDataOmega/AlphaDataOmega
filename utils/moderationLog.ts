import { logTrustAuditEvent } from './trustAudit';
import { updateTrustScore, getTrustScore } from './trust';

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
    actor: '0xModAlpha...',
    target: '0xFlagged1',
    postHash: 'QmABC123...',
    reason: 'post_removed',
    category: 'politics',
    delta: -5,
    timestamp: Date.now() - 60000,
  },
  {
    actor: '0xModBeta...',
    target: '0xFlagged2',
    postHash: 'QmDEF456...',
    reason: 'appeal_granted',
    category: 'art',
    delta: 2,
    timestamp: Date.now() - 120000,
  },
];

export async function loadTrustAuditTrail(): Promise<ModerationLogEntry[]> {
  return moderationLog;
}

export async function recordAppealResolution(
  postHash: string,
  outcome: 'appeal_granted' | 'appeal_denied',
  author: string,
  category: string,
): Promise<void> {
  const delta = outcome === 'appeal_granted' ? 1 : -1;
  moderationLog.push({
    actor: 'appeals_system',
    target: author,
    postHash,
    reason: outcome,
    category,
    delta,
    timestamp: Date.now(),
  });

  const prev = getTrustScore(author, category);
  const next = Math.max(0, Math.min(100, prev + delta));
  await logTrustAuditEvent({
    actor: author,
    category,
    postHash,
    delta,
    reason: outcome,
    timestamp: Date.now(),
    prev,
    next,
  });
  updateTrustScore(author, category, delta);
}
