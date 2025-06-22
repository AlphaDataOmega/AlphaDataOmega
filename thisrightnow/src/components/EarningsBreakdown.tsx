import { useEffect, useState } from "react";
import { formatEther, parseEther } from "ethers";

export default function EarningsBreakdown({ address }: { address: string }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!address) return;
    fetch(`http://localhost:4000/api/earnings/user/${address}`)
      .then((res) => res.json())
      .then(setData);
  }, [address]);

  if (!data) return <p className="text-gray-500">Loading earnings...</p>;

  const merkleClaimable = parseEther(String(data.merkleTRN || 0));
  const investorClaimable = parseEther(String(data.vaults.investor || 0));
  const contributorClaimable = parseEther(String(data.vaults.contributor || 0));
  const total = merkleClaimable + investorClaimable + contributorClaimable;

  return (
    <div className="mt-4 space-y-4">
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold mb-2">💼 Oracle + Vault Earnings</h2>
        <p>🔮 Oracle: {data.oracleTRN} TRN</p>
        <p>🏦 Investor Vault: {data.vaults.investor} TRN</p>
        <p>🧑‍💻 Contributor Vault: {data.vaults.contributor} TRN</p>
        <p>🌳 Merkle Drop: {data.merkleTRN} TRN</p>
        <div className="space-y-3 mt-4">
          <p>
            <strong>Merkle Airdrops:</strong> {formatEther(merkleClaimable)} TRN
          </p>
          <p>
            <strong>Investor Vault:</strong> {formatEther(investorClaimable)} TRN
          </p>
          <p>
            <strong>Contributor Vault:</strong> {formatEther(contributorClaimable)} TRN
          </p>
          <p>
            <strong>Total Claimable:</strong>{" "}
            <span className="text-green-600">{formatEther(total)} TRN</span>
          </p>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold mb-2">📣 Post-Level Earnings</h2>
        {data.posts.map((post: any) => (
          <div key={post.hash} className="border-t pt-2 mt-2 text-sm">
            <p><code>{post.hash.slice(0, 10)}...</code></p>
            <ul className="ml-4 list-disc">
              <li>👁️ Views: {post.views}</li>
              <li>🔁 Retrns: {post.retrns}</li>
              <li>🔥 Blessings: {post.blessings}</li>
              <li>🧠 Resonance: {post.resonance}</li>
              <li className="font-semibold">💰 Total: {post.total} TRN</li>
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-green-100 p-4 rounded font-bold">
        🧾 Total Earned: {data.totalEarned} TRN
      </div>
    </div>
  );
}
