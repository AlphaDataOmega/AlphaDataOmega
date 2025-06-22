import { useState, useEffect } from "react";
import { ethers, formatEther, parseEther } from "ethers";
import { loadContract } from "@/utils/contract";
import BoostingModuleABI from "@/abi/BoostingModule.json";
import { getOracleBalance } from "@/utils/oracle";
import { useAccount } from "wagmi";

export default function BoostPage() {
  const { address } = useAccount();
  const [postHash, setPostHash] = useState("");
  const [amount, setAmount] = useState("5");
  const [status, setStatus] = useState("");
  const [oracleTRN, setOracleTRN] = useState("0");

  useEffect(() => {
    if (!address) return;
    getOracleBalance(address).then(setOracleTRN);
  }, [address]);

  const canBoost = parseEther(amount || "0") <= BigInt(oracleTRN);
  const usageRatio =
    parseFloat(amount || "0") /
    parseFloat(formatEther(oracleTRN || "1"));
  let barColor = "bg-green-500";
  if (usageRatio > 1) {
    barColor = "bg-red-500";
  } else if (usageRatio > 0.5) {
    barColor = "bg-orange-500";
  }

  const handleBoost = async () => {
    setStatus("Sending transaction...");

    try {
      const contract = await loadContract(
        "BoostingModule",
        BoostingModuleABI as any,
      );
      const hashBytes = ethers.encodeBytes32String(postHash);
      const boostAmount = ethers.parseEther(amount);

      const tx = await (contract as any).startBoost(hashBytes, boostAmount);
      await tx.wait();

      setStatus("✅ Boost started successfully!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Error starting boost.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🚀 Boost a Post</h1>

      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Post Hash</label>
          <input
            type="text"
            value={postHash}
            onChange={(e) => setPostHash(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g. post-abc"
          />
        </div>

          <div>
            <label className="block font-semibold mb-1">Amount (TRN)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border rounded"
            />
          <p className="text-sm text-gray-600">
            Available TRN via Oracle: {formatEther(oracleTRN)}
          </p>
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Boost Allocation
            </label>

            <div className="w-full bg-gray-200 rounded h-4 overflow-hidden">
              <div
                className={`${barColor} h-4`}
                style={{
                  width: `${Math.min(usageRatio * 100, 100)}%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            <p className="text-xs text-gray-500 mt-1">
              Using {amount || "0"} / {formatEther(oracleTRN)} TRN
            </p>
          </div>
        </div>

          <button
            onClick={handleBoost}
            disabled={!address || !canBoost}
            className={`px-6 py-2 rounded ${
              canBoost
                ? "bg-purple-600 text-white"
                : "bg-gray-400 text-gray-100 cursor-not-allowed"
            }`}
          >
            Start Boost
          </button>

        {status && <p className="mt-3 text-sm text-gray-700">{status}</p>}
      </div>
    </div>
  );
}
