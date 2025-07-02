import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { budget = 100, trustScore = 80 } = req.body;
  // Simple mock logic
  const views = Math.round(budget * (1 + trustScore / 100) * 10);
  const payout = (budget * 0.9).toFixed(2); // 90% of budget to viewers
  const roi = ((views * 0.01) / budget).toFixed(2); // mock ROI
  res.status(200).json({ views, payout, roi });
} 