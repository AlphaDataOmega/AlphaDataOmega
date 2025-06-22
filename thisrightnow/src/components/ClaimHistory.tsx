import { useEffect, useState } from "react";
import { getClaimEvents, ClaimEvent } from "@/utils/getClaimEvents";
import { getEarningsBreakdown } from "@/utils/getEarningsBreakdown";

type Claim = ClaimEvent;

export default function ClaimHistory({ address }: { address: string }) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [earnings, setEarnings] = useState({
    views: "0",
    retrns: "0",
    boosts: "0",
  });

  useEffect(() => {
    if (!address) return;
    getClaimEvents(address).then(setClaims);
    getEarningsBreakdown(address).then(setEarnings);
  }, [address]);

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">🧾 Claim History</h2>

      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Source</th>
            <th className="p-2 border">Amount (TRN)</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Tx</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((c, i) => (
            <tr key={i} className="text-center">
              <td className="p-2 border capitalize">{c.type}</td>
              <td className="p-2 border font-mono">{c.amount}</td>
              <td className="p-2 border">
                {new Date(c.timestamp).toLocaleDateString()}
              </td>
              <td className="p-2 border">
                <a
                  href={`https://explorer.zora.energy/tx/${c.tx}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {claims.length === 0 && (
        <p className="mt-4 text-center text-gray-500">No claims yet.</p>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">📊 Earnings Breakdown</h2>
        <ul className="text-sm space-y-1">
          <li>📺 From Views: {earnings.views} TRN</li>
          <li>🔁 From Retrns: {earnings.retrns} TRN</li>
          <li>🚀 From Boosts: {earnings.boosts} TRN</li>
        </ul>
      </div>
    </div>
  );
}
