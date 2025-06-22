export async function fetchTrustLog() {
  return [
    {
      user: "0xAbc...",
      prev: 68,
      next: 74,
      delta: 6,
      postHash: "QmXYZ...",
      reason: "strong retrn engagement",
      timestamp: Date.now() - 20000,
    },
    {
      user: "0xDead...",
      prev: 91,
      next: 86,
      delta: -5,
      postHash: "QmDEF...",
      reason: "flagged and removed",
      timestamp: Date.now() - 60000,
    },
  ];
}
