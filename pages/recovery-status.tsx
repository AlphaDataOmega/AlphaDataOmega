import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { fetchRecoveryStatus, submitApproval } from "@/utils/recovery";
import { getTrustScore } from "@/utils/trust";

export default function RecoveryStatusPage() {
  const { address } = useAccount();
  const [status, setStatus] = useState<any>(null);
  const [approving, setApproving] = useState(false);
  const [trustScore, setTrustScore] = useState<number | null>(null);

  useEffect(() => {
    if (!address) return;
    fetchRecoveryStatus().then(setStatus);
    getTrustScore(address).then(setTrustScore);
  }, [address]);

  const handleApprove = async () => {
    setApproving(true);
    await submitApproval();
    const updated = await fetchRecoveryStatus();
    setStatus(updated);
    setApproving(false);
  };

  if (!status) return <p className="p-6">Loading recovery status...</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🔐 Vault Recovery Status</h1>

      <div className="bg-white shadow rounded p-4 mb-6">
        <p><strong>Initiated by:</strong> {status.initiator}</p>
        <p><strong>Started:</strong> {new Date(status.timestamp * 1000).toLocaleString()}</p>
        <p><strong>Recovered:</strong> {status.recovered ? "✅ Yes" : "⏳ No"}</p>
        <p><strong>Approvals:</strong> {status.approvals.length} / 7</p>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">✅ Approved Shards</h2>
        <ul className="list-disc list-inside">
          {status.approvals.map((addr: string) => (
            <li key={addr}>{addr}</li>
          ))}
        </ul>
      </div>

      {status.recovered ? (
        <div className="text-green-700 font-semibold">🎉 Vault successfully recovered!</div>
      ) : (
        status.userIsShardHolder && !status.userHasApproved && (
          <div className="mt-6">
            {trustScore !== null && trustScore < 30 && (
              <p className="text-red-600 mb-2">⚠️ Your trust score is low ({trustScore}). Approving recovery may trigger review.</p>
            )}
            <button
              onClick={handleApprove}
              disabled={approving}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {approving ? "Approving..." : "Approve Recovery"}
            </button>
          </div>
        )
      )}
    </div>
  );
}
