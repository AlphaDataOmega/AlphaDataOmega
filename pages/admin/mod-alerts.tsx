import { useEffect, useState } from "react";

export default function ModAlertsPage() {
  const [alerts, setAlerts] = useState([] as Array<any>);

  useEffect(() => {
    fetch("/api/alerts/slashing")
      .then((res) => res.json())
      .then(setAlerts);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🔥 BRN Slashing Alerts</h1>
      {alerts.length === 0 ? (
        <p>No burn thresholds exceeded.</p>
      ) : (
        <ul className="space-y-4">
          {alerts.map((a, i) => (
            <li key={i} className="p-4 bg-red-100 border-l-4 border-red-500">
              <strong>{a.country}</strong> exceeded the <strong>{a.category}</strong> threshold.
              <br />
              <span>{a.brn} BRN burned vs threshold of {a.threshold}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
