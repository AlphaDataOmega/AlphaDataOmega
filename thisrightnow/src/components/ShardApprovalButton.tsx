import { useState } from "react";
import { approveRecovery } from "@/utils/recovery";

export default function ShardApprovalButton({
  contributor,
  shardIndex,
  onApproved,
}: {
  contributor: string;
  shardIndex: number;
  onApproved?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(false);

  const handleApprove = async () => {
    try {
      setLoading(true);
      await approveRecovery(contributor, shardIndex);
      setApproved(true);
      onApproved?.();
    } catch (err) {
      console.error("Approval failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (approved) {
    return (
      <button disabled className="bg-green-600 text-white px-3 py-1 rounded">
        ✅ Approved
      </button>
    );
  }

  return (
    <button
      onClick={handleApprove}
      className="bg-blue-600 text-white px-3 py-1 rounded"
      disabled={loading}
    >
      {loading ? "Approving..." : "Approve Recovery"}
    </button>
  );
}
