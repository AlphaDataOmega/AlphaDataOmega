export type ModAuditEntry = {
  actor: string;
  delta: number;
  reason: string;
  timestamp?: number;
};

export async function loadModAuditTrail(): Promise<ModAuditEntry[]> {
  return [
    { actor: "0xModAlpha...", delta: 2, reason: "mod_approval", timestamp: Date.now() - 200000 },
    { actor: "0xModAlpha...", delta: -1, reason: "appeal_reversal", timestamp: Date.now() - 150000 },
    { actor: "0xModBeta...", delta: -2, reason: "mod_dismissal", timestamp: Date.now() - 100000 },
    { actor: "0xModGamma...", delta: 3, reason: "mod_approval", timestamp: Date.now() - 50000 },
  ];
}
