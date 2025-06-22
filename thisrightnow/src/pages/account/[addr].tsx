import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import merkle from "@/data/merkle-2025-06-18.json";
import { readTRNEarnings } from "@/utils/readOracle";
import EarningsBreakdown from "@/components/EarningsBreakdown";
import ClaimHistory from "@/components/ClaimHistory";

export default function AccountPage() {
  const router = useRouter();
  const { addr } = router.query;
  const [merkleClaim, setMerkleClaim] = useState<any>(null);
  const [oracleBalance, setOracleBalance] = useState<string>("...");
  const [vaults, setVaults] = useState({ contributor: 0, investor: 0 });

  useEffect(() => {
    if (!addr || typeof addr !== "string") return;

    const lower = addr.toLowerCase();
    if ((merkle as any).claims[lower]) {
      setMerkleClaim({
        amount: Number((merkle as any).claims[lower].amount) / 1e18,
        proof: (merkle as any).claims[lower].proof,
      });
    } else {
      setMerkleClaim(null);
    }

    readTRNEarnings(lower).then(setOracleBalance);

    // Placeholder vault earnings – replace with actual calls
    setVaults({ contributor: 25, investor: 50 }); // Simulated TRN
  }, [addr]);

  if (!addr) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📂 Account Overview</h1>
      <p className="text-sm text-gray-600">
        Wallet: <code>{addr}</code>
      </p>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">TRN via Oracle</h2>
          <p>{oracleBalance} TRN</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Latest Merkle Drop</h2>
          {merkleClaim ? (
            <>
              <p>💸 {merkleClaim.amount} TRN</p>
              <p className="text-xs text-gray-600">
                Proof length: {merkleClaim.proof.length}
              </p>
            </>
          ) : (
            <p>None found</p>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Vault Earnings</h2>
          <p>Contributor: {vaults.contributor} TRN</p>
          <p>Investor: {vaults.investor} TRN</p>
        </div>
      </div>

      <EarningsBreakdown address={addr as string} />
      <ClaimHistory address={addr as string} />
    </div>
  );
}
