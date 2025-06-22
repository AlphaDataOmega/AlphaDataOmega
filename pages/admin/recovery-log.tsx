import { useEffect, useState } from "react";
import { ethers } from "ethers";
import VaultRecoveryABI from "@/abi/VaultRecovery.json";
import { loadContract } from "@/utils/contract";

export default function RecoveryLogPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadRecoveries = async () => {
      const contract = await loadContract("VaultRecovery", VaultRecoveryABI);
      const filter = contract.filters.RecoverySubmitted();

      const events = await contract.queryFilter(filter, -5000); // last 5000 blocks
      const entries = await Promise.all(
        events.map(async (e: any) => {
          const user = e.args[0];
          const ts = Number(e.args[1]);
          const completed = await contract.getRecoveryStatus(user);
          const count = await contract.getShardCount(user);
          return { user, ts, completed, count };
        })
      );
      setEntries(entries);
    };

    loadRecoveries();
  }, []);

  const finalize = async (addr: string) => {
    setStatus("Finalizing recovery...");
    try {
      const contract = await loadContract("VaultRecovery", VaultRecoveryABI, true);
      const tx = await contract.finalizeRecovery(addr);
      await tx.wait();
      setStatus("✅ Finalized.");
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to finalize.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">🛠️ Vault Recovery Log</h1>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">User</th>
            <th className="p-2 text-left">Shards</th>
            <th className="p-2 text-left">Submitted</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.user}>
              <td className="p-2 font-mono">{e.user}</td>
              <td className="p-2">{e.count}</td>
              <td className="p-2">{new Date(e.ts * 1000).toLocaleString()}</td>
              <td className="p-2">
                {e.completed ? "✅ Complete" : "⏳ Pending"}
              </td>
              <td className="p-2">
                {!e.completed && (
                  <button
                    onClick={() => finalize(e.user)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Finalize
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
}
