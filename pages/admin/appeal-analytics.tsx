import { useEffect, useState } from "react";

export default function AppealAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/moderation/analytics/appeals")
      .then((res) => res.json())
      .then(setStats);
  }, []);

  if (!stats) return <p className="p-6">Loading appeal analytics...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📈 Appeal Outcomes Analytics</h1>

      <div className="grid grid-cols-2 gap-6">
        <Stat label="Total Appeals" value={stats.total} />
        <Stat label="Approved Appeals" value={stats.approved} />
        <Stat label="Denied Appeals" value={stats.rejected} />
        <Stat label="Avg Decision Time" value={`${stats.avgTimeMinutes} mins`} />
        <Stat label="Most Reversed Category" value={stats.topCategory} />
        <Stat label="Top Moderator by Trust" value={stats.topMod?.name || stats.topMod?.address} />
      </div>

      <h2 className="text-xl font-bold mt-10 mb-4">📚 Category Breakdown</h2>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Appeals</th>
            <th className="p-2 border">Approved</th>
            <th className="p-2 border">Rejected</th>
            <th className="p-2 border">Trust Shift</th>
          </tr>
        </thead>
        <tbody>
          {stats.categories.map((cat) => (
            <tr key={cat.name}>
              <td className="p-2 border">{cat.name}</td>
              <td className="p-2 border">{cat.count}</td>
              <td className="p-2 border">{cat.approved}</td>
              <td className="p-2 border">{cat.rejected}</td>
              <td className="p-2 border">{cat.trustChange}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
