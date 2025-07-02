import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { content } = req.body;
  const earnings = (content?.length || 0) * 0.01 + 1;
  res.status(200).json({ result: `Estimated earnings for this post: ${earnings.toFixed(2)} TRN` });
} 