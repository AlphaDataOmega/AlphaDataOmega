import { useEffect, useState } from "react";
import { loadContract } from "@/utils/contract";
import RecoveryOracleABI from "@/abi/RecoveryOracle.json";
import { useAccount } from "wagmi";

export default function RecoveryStatus() {
  const [approvals, setApprovals] = useState<string[]>([]);
  const [isRecovered, setIsRecovered] = useState(false);
  const [initiator, setInitiator] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  const { address } = useAccount();

  useEffect(() => {
    const load = async () => {
      const oracle = await loadContract(
        "RecoveryOracle",
        RecoveryOracleABI as any,
      );

      const [approved, recovered, started, initiatorAddr] = await Promise.all([
        (oracle as any).getApprovals(),
        (oracle as any).isRecovered(),
        (oracle as any).getStartTime(),
        (oracle as any).getInitiator(),
      ]);

      setApprovals(approved as string[]);
      setIsRecovered(recovered as boolean);
      setStartTime(Number(started));
      setInitiator(initiatorAddr as string);
    };

    load();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🔐 Vault Recovery Status</h1>

      {isRecovered ? (
        <div className="text-green-600 font-semibold mb-4">✅ Recovery Complete</div>
      ) : startTime ? (
        <div className="text-yellow-600 font-semibold mb-4">🕒 Recovery In Progress</div>
      ) : (
        <div className="text-gray-600 mb-4">No active recovery session.</div>
      )}

      {initiator && (
        <div className="mb-2">
          <strong>Initiated by:</strong> <span className="text-xs">{initiator}</span>
        </div>
      )}

      {startTime && (
        <div className="mb-4">
          <strong>Started at:</strong>{" "}
          {new Date(startTime * 1000).toLocaleString()}
        </div>
      )}

      <div className="mb-4">
        <strong>Approvals:</strong>
        <ul className="mt-2 pl-4 list-disc text-sm text-gray-800">
          {approvals.map((addr) => (
            <li key={addr}>{addr}</li>
          ))}
        </ul>
      </div>

      <div className="text-sm text-gray-500">
        You are {approvals.includes(address || "") ? "✅ an approver" : "❌ not yet approved"}.
      </div>
    </div>
  );
}
