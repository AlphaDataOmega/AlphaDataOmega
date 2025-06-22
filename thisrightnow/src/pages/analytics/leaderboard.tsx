import { useEffect, useState } from "react";
import Link from "next/link";

export default function LeaderboardPage() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/earnings/leaderboard");
      const raw = await res.json();
      const sorted = Object.entries(raw)
        .map(([addr, amount]) => ({ addr, amount }))
        .sort((a, b) => b.amount - a.amount);
      const totalTRN = sorted.reduce((sum, x) => sum + x.amount, 0);
      setData(sorted);
      setTotal(totalTRN);
    };
    load();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🏆 Top Earners Leaderboard</h1>

      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Rank</th>
            <th className="p-2">Address</th>
            <th className="p-2 text-right">TRN</th>
            <th className="p-2 text-right">% of Total</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.addr} className="border-t">
              <td className="p-2">{i + 1}</td>
              <td className="p-2">{row.addr.slice(0, 6)}…{row.addr.slice(-4)}</td>
              <td className="p-2 text-right text-green-700">
                {row.amount.toFixed(3)}
              </td>
              <td className="p-2 text-right text-gray-500">
                {((row.amount / total) * 100).toFixed(2)}%
              </td>
              <td className="p-2 text-right">
                <Link href={`/account/${row.addr}/earnings`} className="text-blue-600 underline">
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
