import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { loadContract } from "@/utils/contract";
import ViewIndexABI from "@/abi/ViewIndex.json";
import RetrnIndexABI from "@/abi/RetrnIndex.json";
import { fetchPost } from "@/utils/fetchPost";
import { getPostEarnings } from "@/utils/getPostEarnings";
import PostCard from "@/components/PostCard";
import Link from "next/link";
import FeedReply from "@/components/FeedReply";

export default function FeedPage() {
  const { address: viewerAddr } = useAccount();
  const [posts, setPosts] = useState<any[]>([]);
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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🌊 River of Retrns</h1>

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
        {posts.map((p) => (
          <div key={p.hash} className="bg-white rounded shadow p-4">
            <PostCard
              ipfsHash={p.hash}
              post={p}
              showReplies={false}
              viewerAddr={viewerAddr || ""}
            />

            <div className="ml-4 mt-2 text-sm text-gray-600">
              {p.retrns.length > 0 && (
                <>
                  <p className="text-xs mb-1">Top replies:</p>
                  <ul className="space-y-2">
                    {p.retrns.slice(0, 2).map((rHash: string) => (
                      <FeedReply key={rHash} hash={rHash} />
                    ))}
                  </ul>
                </>
              )}

              <Link
                href={`/branch/${p.hash}`}
                className="text-blue-600 mt-2 inline-block"
              >
                View full thread →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
