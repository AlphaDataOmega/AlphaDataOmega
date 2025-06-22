import { useState } from "react";

export default function BoostSimulatorPage() {
  const [trn, setTrn] = useState("10");
  const [conversion, setConversion] = useState("0.003"); // TRN earned per view
  const [reachPerTRN, setReachPerTRN] = useState("30");

  const trnAmount = parseFloat(trn || "0");
  const reachFactor = parseFloat(reachPerTRN || "0");
  const convRate = parseFloat(conversion || "0");

  const estimatedReach = trnAmount * reachFactor;
  const estimatedEarnings = estimatedReach * convRate;
  const perUserPayout = convRate;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🚀 Boost Simulator</h1>

      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">TRN Boost Amount</label>
          <input
            type="number"
            value={trn}
            onChange={(e) => setTrn(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Views per TRN</label>
          <input
            type="number"
            value={reachPerTRN}
            onChange={(e) => setReachPerTRN(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">TRN Earned per View</label>
          <input
            type="number"
            value={conversion}
            onChange={(e) => setConversion(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mt-6 p-4 bg-gray-100 rounded">
          <p className="text-lg font-semibold">📊 Projection</p>
          <p className="mt-2">📈 <strong>{estimatedReach}</strong> views</p>
          <p>💸 <strong>{estimatedEarnings.toFixed(4)}</strong> TRN paid to viewers</p>
          <p>👤 <strong>{perUserPayout}</strong> TRN per viewer</p>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Estimations are based on current system parameters. Actual results may vary based on engagement quality, AI filtering, and Lotto modifiers.
        </p>
      </div>
    </div>
  );
}
