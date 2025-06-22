import { useState } from "react";
import { loadContract } from "@/utils/contract";
import ContributorNFTABI from "@/abi/ContributorNFT.json";

export default function MintContributorNFT() {
  const [cid, setCID] = useState("");
  const [status, setStatus] = useState("");

  const handleMint = async () => {
    if (!cid) return alert("Vault CID required");

    try {
      const contract = await loadContract("ContributorNFT", ContributorNFTABI);
      const tx = await contract.mint(cid);
      await tx.wait();
      setStatus("✅ ContributorNFT minted!");
    } catch (err: any) {
      setStatus("❌ " + (err?.message || "Mint failed"));
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Mint ContributorNFT 🪪</h1>
      <p className="text-gray-600 mb-2">
        Paste your vault CID to verify your contributor identity.
      </p>
      <input
        type="text"
        placeholder="Qm... (Vault CID)"
        className="w-full p-2 border rounded mb-4"
        value={cid}
        onChange={(e) => setCID(e.target.value)}
      />
      <button onClick={handleMint} className="bg-purple-600 text-white px-4 py-2 rounded">
        Mint ContributorNFT
      </button>

      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}
