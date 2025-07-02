import type { NextApiRequest, NextApiResponse } from 'next';

const sampleLogs = [
  {
    postId: '0xabc123',
    actionType: 'flag',
    region: 'US',
    flagType: 'spam',
    category: 'engagement',
    timestamp: Date.now() - 100000,
  },
  {
    postId: '0xdef456',
    actionType: 'geo-block',
    region: 'CA',
    flagType: 'policy',
    category: 'policy',
    timestamp: Date.now() - 500000,
  },
  {
    postId: '0xaaa111',
    actionType: 'burn',
    region: 'UK',
    flagType: 'abuse',
    category: 'art',
    timestamp: Date.now() - 2000000,
  },
  {
    postId: '0xbbbb222',
    actionType: 'slashing',
    region: 'US',
    flagType: 'slashing',
    category: 'music',
    timestamp: Date.now() - 3000000,
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ logs: sampleLogs });
} 