import { useEffect, useState } from "react";

export default function GovernanceLeaderboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/governance")
      .then((res) => res.json())
      .then((res) => setData(res.leaderboard))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">🗳️ Governance Leaderboard</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Rank</th>
              <th className="text-left p-2">Address</th>
              <th className="text-center p-2">Votes</th>
              <th className="text-center p-2">Aligned</th>
              <th className="text-center p-2">Alignment %</th>
              <th className="text-center p-2">Avg Trust</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.addr} className="border-t">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">
                  <a
                    href={`/account/${row.addr}`}
                    className="text-blue-600 hover:underline"
                  >
                    {row.addr.slice(0, 6)}...{row.addr.slice(-4)}
                  </a>
                </td>
                <td className="text-center p-2">{row.votes}</td>
                <td className="text-center p-2">{row.aligned}</td>
                <td className="text-center p-2">
                  {(row.alignmentRate * 100).toFixed(1)}%
                </td>
                <td className="text-center p-2">{row.avgTrust.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
