import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { boostPost } from "@/utils/boostPost";
import { getTrustScore, getTrustWeight } from "@/utils/trust";

export default function BoostPage() {
  const { address } = useAccount();
  const [ipfsHash, setIpfsHash] = useState("");
  const [baseTRN, setBaseTRN] = useState(1);
  const [category, setCategory] = useState("art");
  const [baseReach, setBaseReach] = useState(100);
  const [trust, setTrust] = useState<number | null>(null);
  const [weightedTRN, setWeightedTRN] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const userAddress = address || "";

  useEffect(() => {
    setBaseReach(baseTRN * 30);
  }, [baseTRN]);

  useEffect(() => {
    if (!address) return;
    const score = getTrustScore(address, category);
    setTrust(score);
  }, [address, category]);

  useEffect(() => {
    if (!address) return;
    const weight = getTrustWeight(address, category);
    setWeightedTRN(parseFloat((baseTRN * weight).toFixed(2)));
  }, [baseTRN, address, category]);

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

      <p className="text-sm text-gray-700">
        Trust Score in <b>{category}</b>:{" "}
        <span className="text-blue-600">
          {getTrustScore(userAddress, category)}
        </span>{" "}
        → Multiplier:{" "}
        <span className="text-green-600">
          x{getTrustWeight(userAddress, category).toFixed(2)}
        </span>
      </p>

      <p className="mt-2 text-sm text-gray-800">
        📈 Estimated Reach:{" "}
        <span className="font-bold">
          {(baseReach * getTrustWeight(userAddress, category)).toFixed(0)} views
        </span>
      </p>

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
