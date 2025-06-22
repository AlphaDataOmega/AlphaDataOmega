import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import merkle from "@/data/merkle-2025-06-18.json";
import { readTRNEarnings } from "@/utils/readOracle";
import EarningsBreakdown from "@/components/EarningsBreakdown";
import ClaimHistory from "@/components/ClaimHistory";
import { useTrending } from "@/utils/useTrending";
import PostCard from "@/components/PostCard";

const categories = ["all", "memes", "tech", "politics", "ai", "news"];

export default function AccountPage() {
  const router = useRouter();
  const { addr } = router.query;
  const selected = (router.query.category as string) || "all";
  const [merkleClaim, setMerkleClaim] = useState<any>(null);
  const [oracleBalance, setOracleBalance] = useState<string>("...");
  const [vaults, setVaults] = useState({ contributor: 0, investor: 0 });

  const { posts, isLoading } = useTrending(
    selected === "all" ? undefined : selected
  );

  const userPosts = posts.filter(
    (p: any) => p.author?.toLowerCase() === (addr as string)?.toLowerCase()
  );

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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📘 Account: {addr.slice(0, 6)}…</h1>

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

      <div className="flex flex-wrap gap-2 my-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              router.push(`/account/${addr}?category=${cat}`, undefined, {
                shallow: true,
              })
            }
            className={`px-3 py-1 rounded text-sm ${
              selected === cat
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-gray-400">Loading posts…</p>}

      <div className="space-y-6">
        {userPosts.map((p: any) => (
          <PostCard key={p.hash} ipfsHash={p.hash} post={p} />
        ))}
      </div>
    </div>
  );
}
