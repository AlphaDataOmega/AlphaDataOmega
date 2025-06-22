import { useState } from "react";
import { useVaultStatus } from "@/hooks/useVaultStatus";

export default function CreateProposal() {
  const { initialized, unlocked } = useVaultStatus();
  const [text, setText] = useState("");

  if (!initialized || !unlocked) {
    return (
      <div className="p-6 bg-red-100 text-red-800 border border-red-400 rounded">
        🛡 Vault Required to Submit Proposals.
        <br />
        <a href="/vault" className="underline">Initialize your Vault</a> to unlock DAO permissions.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <textarea
        className="w-full border p-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Proposal details"
      />
      <button
        disabled={!unlocked}
        className={`w-full mt-4 py-2 rounded ${
          unlocked ? "bg-black text-white" : "bg-gray-300 text-gray-600 cursor-not-allowed"
        }`}
      >
        Submit Proposal
      </button>
    </div>
  );
}
