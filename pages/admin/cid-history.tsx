import { useEffect, useState } from "react";
import Link from "next/link";

type CIDLog = {
  cid: string;
  type: string;
  timestamp: string;
  context?: string;
};

export default function CIDHistoryPage() {
  const [log, setLog] = useState<CIDLog[]>([]);

  useEffect(() => {
    fetch("/ipfs-log.json")
      .then((res) => res.json())
      .then(setLog)
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📦 IPFS CID History</h1>

      <table className="w-full text-sm border">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2 border-b">CID</th>
            <th className="p-2 border-b">Type</th>
            <th className="p-2 border-b">Timestamp</th>
            <th className="p-2 border-b">Context</th>
          </tr>
        </thead>
        <tbody>
          {log.map((entry, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="p-2 border-b break-all">
                <a
                  href={`https://ipfs.io/ipfs/${entry.cid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {entry.cid.slice(0, 8)}…{entry.cid.slice(-6)}
                </a>
              </td>
              <td className="p-2 border-b">{entry.type}</td>
              <td className="p-2 border-b">{new Date(entry.timestamp).toLocaleString()}</td>
              <td className="p-2 border-b">{entry.context || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {log.length === 0 && (
        <p className="text-gray-500 text-center mt-6">No CID log entries found.</p>
      )}
    </div>
  );
}
