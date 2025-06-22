import { useEffect, useState } from "react";
import Link from "next/link";

// Replace with actual list of tracked users or fetch from backend
const trackedUsers = [
  "0x1234...abcd",
  "0xdead...beef",
  "0xface...cafe"
];

export default function AnalyticsPage() {
  const [leaders, setLeaders] = useState<any[]>([]);

  useEffect(() => {
    Promise.all(
      trackedUsers.map(async (addr) => {
        const res = await fetch(`http://localhost:4000/api/earnings/user/${addr}`);
        const data = await res.json();
        return { ...data, addr };
      })
    ).then((all) => {
      setLeaders(all.sort((a, b) => b.totalEarned - a.totalEarned));
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">🌍 Global TRN Leaderboard</h1>
      <p className="text-sm text-gray-600 mb-6">
        Total earnings across posts, vaults, and Merkle drops
      </p>

      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Rank</th>
            <th className="p-2">Address</th>
            <th className="p-2">Total TRN</th>
            <th className="p-2">Oracle</th>
            <th className="p-2">Vaults</th>
            <th className="p-2">Merkle</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((user, i) => (
            <tr key={user.addr} className="border-t">
              <td className="p-2">{i + 1}</td>
              <td className="p-2 font-mono text-xs">
                <Link href={`/account/${user.addr}`} className="text-blue-600 hover:underline">
                  {user.addr.slice(0, 6)}...{user.addr.slice(-4)}
                </Link>
              </td>
              <td className="p-2">{user.totalEarned.toFixed(2)} TRN</td>
              <td className="p-2">{user.oracleTRN.toFixed(2)}</td>
              <td className="p-2">{(user.vaults.investor + user.vaults.contributor).toFixed(2)}</td>
              <td className="p-2">{user.merkleTRN.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
