import { useEffect, useState } from "react";
import { fetchLottoHistory } from "@/utils/fetchLottoHistory";

export default function LottoAnalytics() {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    fetchLottoHistory().then(setEntries);
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🎰 Lotto Analytics</h1>

      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Winner</th>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Trust</th>
            <th className="p-2 border">TRN</th>
            <th className="p-2 border">Post</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, idx) => (
            <tr key={idx} className="border-b">
              <td className="p-2 border">{e.date}</td>
              <td className="p-2 border">{e.winner.slice(0, 10)}...</td>
              <td className="p-2 border">{e.category}</td>
              <td className="p-2 border">{e.trust}/100</td>
              <td className="p-2 border">{e.amount} TRN</td>
              <td className="p-2 border">
                <a href={`/post/${e.postHash}`} className="text-blue-600 underline">
                  View →
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
