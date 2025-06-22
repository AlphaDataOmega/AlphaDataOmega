import { useState } from "react";
import { ethers } from "ethers";
import { loadContract } from "@/utils/contract";
import BoostingModuleABI from "@/abi/BoostingModule.json";
import { useAccount } from "wagmi";

export default function BoostPage() {
  const { address } = useAccount();
  const [postHash, setPostHash] = useState("");
  const [amount, setAmount] = useState("5");
  const [status, setStatus] = useState("");

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
        </div>

        <button
          onClick={handleBoost}
          disabled={!address}
          className="bg-purple-600 text-white px-6 py-2 rounded"
        >
          Start Boost
        </button>

        {status && <p className="mt-3 text-sm text-gray-700">{status}</p>}
      </div>
    </div>
  );
}
