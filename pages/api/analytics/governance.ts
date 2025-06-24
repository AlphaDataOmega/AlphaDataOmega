import type { NextApiRequest, NextApiResponse } from "next";
import { fetchGovernanceVotes } from "@/utils/governanceFetcher";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const votes = await fetchGovernanceVotes();

    const leaderboard = aggregateGovernanceData(votes);

    res.status(200).json({ leaderboard });
  } catch (err: any) {
    console.error("[/api/analytics/governance] error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

function aggregateGovernanceData(votes: any[]) {
  const voterMap: Record<string, { votes: number; aligned: number; trust: number }> = {};

  for (const v of votes) {
    const { voter, vote, trustScore, passed } = v;

    if (!voterMap[voter]) {
      voterMap[voter] = { votes: 0, aligned: 0, trust: 0 };
    }

    voterMap[voter].votes++;
    voterMap[voter].trust += trustScore;

    if (passed === vote) {
      voterMap[voter].aligned++;
    }
  }

  return Object.entries(voterMap)
    .map(([addr, { votes, aligned, trust }]) => ({
      addr,
      votes,
      aligned,
      alignmentRate: votes ? aligned / votes : 0,
      avgTrust: trust / votes,
    }))
    .sort((a, b) => b.votes - a.votes);
}
