export type AuditEntry = {
  category: string;
  delta: number;
  prev: number;
  next: number;
  reason: string;
  postHash: string;
  timestamp: number;
};

const auditLog: Record<string, AuditEntry[]> = {
  "0xtrustedalpha...": [
    {
      category: "politics",
      delta: 2,
      prev: 70,
      next: 72,
      reason: "accurate flag",
      postHash: "Qm123...",
      timestamp: Date.now() - 200000,
    },
    {
      category: "politics",
      delta: -1,
      prev: 72,
      next: 71,
      reason: "incorrect appeal",
      postHash: "Qm456...",
      timestamp: Date.now() - 400000,
    },
  ],
};

export async function getAuditTrail(addr: string, category: string): Promise<AuditEntry[]> {
  const entries = auditLog[addr.toLowerCase()] || [];
  return entries.filter((e) => e.category.toLowerCase() === category.toLowerCase());
}
