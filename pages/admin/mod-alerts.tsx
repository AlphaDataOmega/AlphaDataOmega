import { useEffect, useState } from "react";
import { createProposal } from "@/utils/proposals";

export default function ModAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [proposing, setProposing] = useState(false);
  const [proposalStatus, setProposalStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      const res = await fetch("/api/slashing/alerts");
      const data = await res.json();
      setAlerts(data.alerts || []);
      setLoading(false);
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30_000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handlePropose = async (
    alert: any,
    type: "mute" | "geo" | "dao",
  ) => {
    setProposing(true);
    setProposalStatus(null);

    try {
      const payload = {
        country: alert.country,
        category: alert.category,
        actionType: type,
      };

      await createProposal(payload);
      setProposalStatus("✅ Proposal submitted!");
    } catch (err) {
      console.error(err);
      setProposalStatus("❌ Failed to submit proposal.");
    }

    setProposing(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🛡️ Moderation Alert Panel</h1>

      {loading && <p>Loading alerts...</p>}

      {!loading && alerts.length === 0 && (
        <p className="text-green-600">✅ No thresholds exceeded at this time.</p>
      )}

      <ul className="space-y-4">
        {alerts.map((a, i) => (
          <li key={i} className="border p-4 rounded bg-white shadow">
            <p className="font-semibold">
              🚨 {a.category} posts in <strong>{a.country}</strong> triggered an alert!
            </p>
            <p className="text-sm mt-1 text-gray-600">
              Burned: <strong>{a.amount} BRN</strong> — Threshold: {a.threshold} BRN
            </p>
            <p className="text-xs text-gray-500 mt-2">Real-time auto-feed from on-chain data.</p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handlePropose(a, "mute")}
                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                disabled={proposing}
              >
                Mute Category
              </button>

              <button
                onClick={() => handlePropose(a, "geo")}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                disabled={proposing}
              >
                Geo Ban
              </button>

              <button
                onClick={() => handlePropose(a, "dao")}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                disabled={proposing}
              >
                Propose DAO Vote
              </button>
            </div>

            {proposalStatus && <p className="text-xs mt-2">{proposalStatus}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
