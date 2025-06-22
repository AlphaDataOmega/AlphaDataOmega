import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { loadContract } from "@/utils/contract";
import ViewIndexABI from "@/abi/ViewIndex.json";
import RetrnIndexABI from "@/abi/RetrnIndex.json";
import BoostingModuleABI from "@/abi/BoostingModule.json";
import { fetchPost } from "@/utils/fetchPost";
import { calcTrendingScore } from "@/utils/calcTrendingScore";
import PostCard from "@/components/PostCard";

// Placeholder until resonance calculation is implemented
async function getResonanceScore(hash: string): Promise<number> {
  void hash;
  return 0;
}

export default function TrendingPage() {
  const { address: viewerAddr } = useAccount();
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const viewIndex = await loadContract("ViewIndex", ViewIndexABI);
      const hashes: string[] = await (viewIndex as any).getRecentPosts();

      const retrnIndex = await loadContract("RetrnIndex", RetrnIndexABI);
      const boostModule = await loadContract(
        "BoostingModule",
        BoostingModuleABI as any
      );

      const postsWithScores = await Promise.all(
        hashes.map(async (hash) => {
          const post = await fetchPost(hash);
          const retrns: string[] = await (retrnIndex as any).getRetrns(hash);
          const boostTRN = await (boostModule as any).boostAmountFor(hash);
          const resonance = await getResonanceScore(hash);

          const score = calcTrendingScore({
            retrns: retrns.length,
            boostTRN: parseFloat(boostTRN),
            resonance,
            createdAt: post.timestamp,
          });

          return { ...post, hash, score };
        })
      );

      postsWithScores.sort((a, b) => b.score - a.score);
      setPosts(postsWithScores);
    };

    load();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🔥 Trending Posts</h1>
      <div className="space-y-8">
        {posts.map((post) => (
          <div key={post.hash} className="bg-white rounded shadow p-4">
            <PostCard
              ipfsHash={post.hash}
              post={post}
              showReplies={false}
              viewerAddr={viewerAddr || ""}
            />
            <p className="text-xs text-gray-500">
              🔥 Trending Score: {post.score.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
