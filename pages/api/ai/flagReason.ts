import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { postId } = req.body;
  res.status(200).json({ result: `Post ${postId} was flagged for potential policy violation. Please review the content and appeal if you believe this is an error.` });
} 