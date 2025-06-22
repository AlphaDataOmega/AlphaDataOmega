import { useEffect, useState } from "react";
import { fetchTrustLog } from "@/utils/trustLog";

export default function TrustLogAdminPage() {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    fetchTrustLog().then(setEntries).catch(console.error);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">🧠 Contributor Trust Audit</h1>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">User</th>
            <th className="p-2 text-left">Prev</th>
            <th className="p-2 text-left">Next</th>
            <th className="p-2 text-left">Δ</th>
            <th className="p-2 text-left">Post</th>
            <th className="p-2 text-left">Reason</th>
            <th className="p-2 text-left">Time</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry: any, idx: number) => (
            <tr key={idx}>
              <td className="p-2 font-mono">{entry.user}</td>
              <td className="p-2">{entry.prev}</td>
              <td className="p-2">{entry.next}</td>
              <td className={`p-2 ${entry.delta >= 0 ? "text-green-600" : "text-red-600"}`}>
                {entry.delta >= 0 ? "+" : ""}
                {entry.delta}
              </td>
              <td className="p-2">
                <a
                  href={`/post/${entry.postHash}`}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  view ↗
                </a>
              </td>
              <td className="p-2">{entry.reason}</td>
              <td className="p-2 text-xs text-gray-600">
                {new Date(entry.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
