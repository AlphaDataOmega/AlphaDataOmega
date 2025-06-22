import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { boostPost } from "@/utils/boostPost";
import { fetchTrustScore } from "@/utils/fetchTrustScore";
import { applyTrustWeight } from "@/utils/TrustWeightedOracle";

export default function BoostPage() {
  const { address } = useAccount();
  const [ipfsHash, setIpfsHash] = useState("");
  const [baseTRN, setBaseTRN] = useState(1);
  const [trust, setTrust] = useState<number | null>(null);
  const [weightedTRN, setWeightedTRN] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    fetchTrustScore(address).then(setTrust);
  }, [address]);

  useEffect(() => {
    if (trust !== null) {
      const scaled =
        baseTRN *
        (trust >= 90
          ? 1.25
          : trust >= 75
          ? 1.1
          : trust >= 50
          ? 1.0
          : trust >= 30
          ? 0.6
          : 0.3);
      setWeightedTRN(parseFloat(scaled.toFixed(2)));
    }
  }, [baseTRN, trust]);

  const handleBoost = async () => {
    const tx = await boostPost(ipfsHash, baseTRN);
    setTxHash(tx);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow space-y-4">
      <h1 className="text-2xl font-bold">🚀 Boost a Post</h1>

      <input
        type="text"
        value={ipfsHash}
        onChange={(e) => setIpfsHash(e.target.value)}
        placeholder="Enter IPFS hash of post"
        className="w-full border p-2 rounded"
      />

      <input
        type="number"
        value={baseTRN}
        onChange={(e) => setBaseTRN(Number(e.target.value))}
        min={0.1}
        step={0.1}
        className="w-full border p-2 rounded"
      />

      {trust !== null && (
        <div className="text-sm text-gray-700">
          🧠 Trust Score: <strong>{trust}</strong>
          <br />
          🔧 Adjusted TRN: <strong>{weightedTRN} TRN</strong>
        </div>
      )}

      <button
        onClick={handleBoost}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Boost Now
      </button>

      {txHash && (
        <div className="text-sm mt-4">
          ✅ Boosted! TX:{" "}
          <a
            href={`https://explorer.testnet.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            View on Explorer
          </a>
        </div>
      )}
    </div>
  );
}
