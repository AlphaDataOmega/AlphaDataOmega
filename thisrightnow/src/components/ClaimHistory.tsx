import { useEffect, useState } from "react";
import { getClaimEvents, ClaimEvent } from "@/utils/getClaimEvents";

type Claim = ClaimEvent;

export default function ClaimHistory({ address }: { address: string }) {
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    if (!address) return;
    getClaimEvents(address).then(setClaims);
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
                  className="text-blue-600"
                  target="_blank"
                  rel="noreferrer"
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
    </div>
  );
}
