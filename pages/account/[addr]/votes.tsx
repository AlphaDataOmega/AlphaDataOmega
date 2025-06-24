import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function VoteHistoryPage() {
  const { addr } = useRouter().query;
  const [votes, setVotes] = useState<any[]>([]);

  useEffect(() => {
    if (!addr) return;
    fetch(`/api/votes/${addr}`)
      .then((res) => res.json())
      .then(setVotes);
  }, [addr]);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">🗳️ Voting History</h1>
      {votes.length === 0 ? (
        <p>No votes yet.</p>
      ) : (
        <ul className="space-y-2">
          {votes.map((v, i) => (
            <li key={i} className="border rounded p-3">
              <p>Proposal #{v.proposalId}</p>
              <p>Voted: {v.support ? '✅ Yes' : '❌ No'}</p>
              <p className="text-xs text-gray-500">
                {new Date(v.timestamp * 1000).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
