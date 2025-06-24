import { NextApiRequest, NextApiResponse } from 'next';
import votes from '@/data/votes.json';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { addr } = req.query;
  if (!addr) {
    return res.status(400).json({ error: 'Missing address' });
  }
  const lower = (addr as string).toLowerCase();
  const userVotes = (votes as any[]).filter((v: any) => v.voter.toLowerCase() === lower);
  res.status(200).json(userVotes);
}
