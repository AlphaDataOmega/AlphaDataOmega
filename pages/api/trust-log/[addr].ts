export default function handler(req, res) {
  const { addr } = req.query;

  const sample = [
    {
      category: "memes",
      delta: +4,
      prev: 85,
      next: 89,
      reason: "boosted viral retrn",
      postHash: "QmXYZ...",
      timestamp: Date.now() - 60000,
    },
    {
      category: "politics",
      delta: -6,
      prev: 72,
      next: 66,
      reason: "flagged and removed by mod",
      postHash: "QmABC...",
      timestamp: Date.now() - 360000,
    },
  ];

  res.status(200).json(sample);
}
