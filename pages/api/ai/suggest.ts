import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt } = req.body;
  res.status(200).json({ result: `**AI Suggestion:** ${prompt}\n\nHere is a markdown draft for your post!` });
} 