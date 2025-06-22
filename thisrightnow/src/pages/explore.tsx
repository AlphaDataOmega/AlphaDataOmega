import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { loadContract } from "@/utils/contract";
import ViewIndexABI from "@/abi/ViewIndex.json";
import RetrnIndexABI from "@/abi/RetrnIndex.json";
import { fetchPost } from "@/utils/fetchPost";
import { getPostEarnings } from "@/utils/getPostEarnings";
import PostCard from "@/components/PostCard";
import CreateRetrn from "@/components/CreateRetrn";

export default function ExplorePage() {
  const { address: viewerAddr } = useAccount();
  const [posts, setPosts] = useState<any[]>([]);
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "earnings">("recent");

  useEffect(() => {
    const load = async () => {
      const viewIndex = await loadContract("ViewIndex", ViewIndexABI);
      const recentHashes: string[] = await (viewIndex as any).getRecentPosts();

      const retrnIndex = await loadContract("RetrnIndex", RetrnIndexABI);

      const results = await Promise.all(
        recentHashes.map(async (hash) => {
          const data = await fetchPost(hash);
          const retrns: string[] = await (retrnIndex as any).getRetrns(hash);
          const earnings = await getPostEarnings(hash, viewerAddr || "");
          return { ...data, hash, retrns, earnings };
        })
      );

      const sorted =
        sortBy === "earnings"
          ? [...results].sort((a, b) => (b.earnings || 0) - (a.earnings || 0))
          : results;

      setPosts(sorted);
    };

    load();
  }, [sortBy, viewerAddr]);

  const filtered = category === "all" ? posts : posts.filter((p) => p.tags?.includes(category));

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🔎 Explore</h1>

      <div className="mb-4">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2">
          <option value="all">All</option>
          <option value="ai">AI</option>
          <option value="memes">Memes</option>
          <option value="politics">Politics</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="mr-2 text-sm">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="border p-1 text-sm"
        >
          <option value="recent">🕒 Most Recent</option>
          <option value="earnings">💸 TRN Earnings</option>
        </select>
      </div>

      <div className="space-y-8">
        {filtered.map((p) => (
          <div key={p.hash} className="bg-white rounded shadow p-4">
            <PostCard
              ipfsHash={p.hash}
              post={p}
              showReplies={false}
              viewerAddr={viewerAddr || ""}
            />
            {p.earnings > 0 && (
              <span className="text-green-600 text-xs ml-2">
                💸 {p.earnings.toFixed(2)} TRN
              </span>
            )}

            <CreateRetrn
              parentHash={p.hash}
              onRetrn={(newRetrn) => {
                // Just console log or refresh feed later
                console.log("New retrn:", newRetrn);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
