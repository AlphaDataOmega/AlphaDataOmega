import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  // Mock: return a user-specific or random balance for demonstration
  let balance = 123.45;
  if (typeof userId === 'string') {
    // Simple deterministic mock: hash userId to a float
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = (hash * 31 + userId.charCodeAt(i)) % 10000;
    }
    balance = 50 + (hash % 1000) / 10; // Range: 50.0 - 149.9
  }
  res.status(200).json({ userId, balance });
} 