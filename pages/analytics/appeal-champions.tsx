import { useEffect, useState } from "react";
import Link from "next/link";

export default function AppealChampionsPage() {
  const [champions, setChampions] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/moderation/analytics/champions")
      .then((res) => res.json())
      .then(setChampions);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🏛️ Appeal Influence Dashboard</h1>
      <p className="text-gray-600 mb-6">Who’s actually shifting decisions — and earning trust doing it.</p>

      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">User</th>
            <th className="p-2 border">Appeals Filed</th>
            <th className="p-2 border">Approved</th>
            <th className="p-2 border">Win Rate</th>
            <th className="p-2 border">Top Category</th>
            <th className="p-2 border">Trust Gain</th>
          </tr>
        </thead>
        <tbody>
          {champions.map((user) => (
            <tr key={user.address}>
              <td className="p-2 border">
                <Link href={`/account/${user.address}`} className="text-blue-600">
                  {user.name || user.address.slice(0, 10)}
                </Link>
              </td>
              <td className="p-2 border">{user.appeals}</td>
              <td className="p-2 border">{user.approved}</td>
              <td className="p-2 border">{((user.approved / user.appeals) * 100).toFixed(1)}%</td>
              <td className="p-2 border">{user.topCategory}</td>
              <td className="p-2 border">{user.trustChange > 0 ? `+${user.trustChange}` : user.trustChange}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
