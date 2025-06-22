import { useState } from "react";
import { claimMerkle, claimVaults } from "@/utils/claim";

export default function Dashboard() {
  const [status, setStatus] = useState<string | null>(null);

  const handleClaimAll = async () => {
    setStatus("Processing...");
    try {
      await claimMerkle();
      await claimVaults();
      setStatus("✅ All claims successful!");
    } catch (e) {
      setStatus("❌ Claim failed. Try again.");
    }
    setTimeout(() => setStatus(null), 5000);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Claim Dashboard</h1>
      <button
        className="bg-purple-600 text-white px-4 py-2 rounded"
        onClick={handleClaimAll}
      >
        Claim All
      </button>
      {status && <p className="mt-4 text-center text-sm">{status}</p>}
    </div>
  );
}
