import { useEffect, useState } from "react";

export default function ModAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          </li>
        ))}
      </ul>
    </div>
  );
}
