import { useState } from "react";
import { useAccount } from "wagmi";
import { loadContract } from "@/utils/contract";
import ContributorNFT from "@/abi/ContributorNFT.json";

export default function MintPage() {
  const { address } = useAccount();
  const [status, setStatus] = useState("");

  const handleMint = async () => {
    try {
      const cid = localStorage.getItem("ado.vault.cid");
      if (!cid) throw new Error("No vault found. Please create your vault first.");

      setStatus("Minting Contributor NFT...");

      const contract = await loadContract("ContributorNFT", ContributorNFT);
      const tx = await (contract as any).mintContributor(cid);
      await tx.wait();

      setStatus("✅ Minted! You are now a verified contributor.");
    } catch (err: any) {
      setStatus(`❌ ${err.message}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">🪪 Mint Contributor NFT</h1>
      <p className="mb-4 text-sm">
        This NFT proves your identity and vault access. Required for earnings, proposals, and trust weighting.
      </p>

      <button
        onClick={handleMint}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        Mint ContributorNFT
      </button>

      {status && <div className="mt-4 text-sm">{status}</div>}
    </div>
  );
}
