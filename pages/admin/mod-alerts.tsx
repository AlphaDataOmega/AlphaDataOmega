import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function ModAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const { address } = useAccount();

  useEffect(() => {
    fetch("/api/mod-alerts")
      .then((res) => res.json())
      .then(setAlerts);
  }, []);

  const handleDecision = async (hash: string, decision: string) => {
    await fetch(`/api/mod-alerts/resolve`, {
      method: "POST",
      body: JSON.stringify({ hash, decision, modAddress: address }),
      headers: { "Content-Type": "application/json" },
    });
    setAlerts((a) => a.filter((x) => x.postHash !== hash));
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🚨 AI-Flagged Posts</h1>
      {alerts.map((a, i) => (
        <div key={i} className="bg-white border p-4 rounded mb-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">{new Date(a.timestamp).toLocaleString()}</p>
          <p><strong>Post:</strong> <a href={`/post/${a.postHash}`} className="text-blue-600 underline">{a.postHash.slice(0, 10)}...</a></p>
          <p><strong>Category:</strong> {a.category}</p>
          <p><strong>Author:</strong> {a.author}</p>
          <p><strong>Score:</strong> <span className="text-red-600 font-bold">{a.score}</span></p>
          <p className="mt-2"><strong>Preview:</strong> {a.contentPreview}</p>
          
          <div className="mt-4">
            <h3 className="font-semibold text-sm">Flaggers:</h3>
            <ul className="text-sm text-gray-700 pl-4 list-disc">
              {a.trustReport.map((t: any, idx: number) => (
                <li key={idx}>
                  {t.actor} — {t.trust} trust ({t.source})
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold text-sm">Recent Audit Trail:</h3>
            <ul className="text-xs text-gray-600 pl-4 list-disc">
              {a.auditTrail.map((e: any, idx: number) => (
                <li key={idx}>
                  Δ{e.delta}: {e.reason} — <a href={`/post/${e.postHash}`} className="text-blue-500 underline">view</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => handleDecision(a.postHash, "approve")}
              className="bg-green-600 text-white px-4 py-1 rounded"
            >
              ✅ Approve
            </button>
            <button
              onClick={() => handleDecision(a.postHash, "dismiss")}
              className="bg-gray-400 text-white px-4 py-1 rounded"
            >
              ❌ Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
