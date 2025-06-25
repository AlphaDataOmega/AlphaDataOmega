import { useEffect, useState } from "react";
import { getPendingRecoveries } from "@/utils/recovery";
import ShardApprovalButton from "@/components/ShardApprovalButton";

export type RecoveryEntry = {
  contributor: string;
  shardCount: number;
  approved: boolean[];
};

export default function AdminRecoveryPage() {
  const [pending, setPending] = useState<RecoveryEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await getPendingRecoveries();
      setPending(data);
    };
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🔐 Vault Recovery Panel</h1>

      {pending.length === 0 ? (
        <p className="text-gray-600">No vaults pending recovery.</p>
      ) : (
        <div className="space-y-6">
          {pending.map((entry) => (
            <div key={entry.contributor} className="p-4 border rounded shadow">
              <h2 className="text-lg font-semibold">
                Vault: <span className="font-mono">{entry.contributor}</span>
              </h2>
              <p className="text-sm text-gray-500 mb-2">
                {entry.approved.filter(Boolean).length} of {entry.shardCount} shards approved
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {entry.approved.map((isApproved, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <span className="text-xs">Shard {i + 1}:</span>
                    {isApproved ? (
                      <span className="text-green-600 text-xs">✅ Approved</span>
                    ) : (
                      <ShardApprovalButton
                        contributor={entry.contributor}
                        shardIndex={i}
                        onApproved={() => {
                          setPending((prev) =>
                            prev.map((p) =>
                              p.contributor === entry.contributor
                                ? {
                                    ...p,
                                    approved: p.approved.map((a, idx) =>
                                      idx === i ? true : a
                                    ),
                                  }
                                : p
                            )
                          );
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
