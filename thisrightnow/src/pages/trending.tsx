import PostCard from "@/components/PostCard";
import { useAccount } from "wagmi";
import { useTrending } from "@/utils/useTrending";

export default function TrendingPage() {
  const { address } = useAccount();
  const { posts, isLoading } = useTrending();

  if (isLoading) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🔥 Trending Retrns</h1>

      <div className="space-y-6">
        {posts.map((p: any, i: number) => (
          <div key={p.hash} className="bg-white rounded shadow p-4">
            <div className="flex justify-between mb-1 text-xs text-gray-500">
              <span># {i + 1}</span>
              <span>🔥 Score: {p.trustAdjustedScore.toFixed(2)}</span>
            </div>
            <PostCard ipfsHash={p.hash} post={p} viewerAddr={address} />
          </div>
        ))}
      </div>
    </div>
  );
}
