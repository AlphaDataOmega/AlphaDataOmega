import { useEffect, useState } from "react";

export default function TrustAuditTrail({ address }: { address: string }) {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/trust-log/${address}`)
      .then((res) => res.json())
      .then(setEntries)
      .catch(console.error);
  }, [address]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📊 Trust Score Audit Trail</h1>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Category</th>
            <th className="p-2 text-left">Δ</th>
            <th className="p-2 text-left">From</th>
            <th className="p-2 text-left">To</th>
            <th className="p-2 text-left">Reason</th>
            <th className="p-2 text-left">Post</th>
            <th className="p-2 text-left">Time</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={i}>
              <td className="p-2">{e.category}</td>
              <td className={`p-2 ${e.delta >= 0 ? "text-green-600" : "text-red-600"}`}> 
                {e.delta >= 0 ? "+" : ""}
                {e.delta}
              </td>
              <td className="p-2">{e.prev}</td>
              <td className="p-2">{e.next}</td>
              <td className="p-2">{e.reason}</td>
              <td className="p-2">
                <a href={`/post/${e.postHash}`} className="text-blue-600 underline">
                  view ↗
                </a>
              </td>
              <td className="p-2 text-xs text-gray-500">
                {new Date(e.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
