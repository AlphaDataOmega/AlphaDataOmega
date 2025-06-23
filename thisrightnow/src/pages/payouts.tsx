import { useEffect, useState } from "react";

export default function PayoutsDashboard() {
  const [data, setData] = useState<any>(null);
  const [inflow, setInflow] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/payouts")
      .then((res) => res.json())
      .then(setData);
  }, []);

  useEffect(() => {
    fetch("/api/dao/inflow")
      .then((res) => res.json())
      .then(setInflow);
  }, []);

  if (!data) return <p className="p-4">Loading DAO payout summary...</p>;

  const { totalRevenue, breakdown, lastSplitDate } = data;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">🏛️ DAO Payout Dashboard</h1>

      <div className="bg-gray-100 p-4 rounded mb-6">
        <p className="text-lg font-semibold">Total Revenue</p>
        <p className="text-2xl">{totalRevenue.toFixed(2)} TRN</p>
        <p className="text-xs text-gray-600">Last split: {lastSplitDate}</p>
      </div>

      {inflow && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <h3 className="text-red-800 font-bold">🔥 Slashing Inflow</h3>
          <p>{Number(inflow.slashing || 0).toFixed(2)} BRN redirected to DAO</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(breakdown).map(([label, value]) => (
          <div key={label} className="bg-white shadow p-4 rounded border">
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-xl font-semibold">{(value as number).toFixed(2)} TRN</p>
          </div>
        ))}
      </div>

      <div className="mt-6 text-sm">
        <p className="text-gray-500">Links:</p>
        <ul className="list-disc list-inside">
          <li><a className="text-blue-600 underline" href="/vaults">Vault Split Flow</a></li>
          <li><a className="text-blue-600 underline" href="/merkle-preview">Merkle Drop</a></li>
          <li><a className="text-blue-600 underline" href="/analytics">Top Earners</a></li>
          <li><a className="text-blue-600 underline" href="/simulator">Boost Simulator</a></li>
        </ul>
      </div>
    </div>
  );
}
