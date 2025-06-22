import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "ethers";
import { loadContract } from "@/utils/contract";
import ViewIndexABI from "@/abi/ViewIndex.json";
import RetrnIndexABI from "@/abi/RetrnIndex.json";
import BoostingModuleABI from "@/abi/BoostingModule.json";
import { fetchPost } from "@/utils/fetchPost";
import PostCard from "@/components/PostCard";
import { calcTrendingScore } from "@/utils/calcTrendingScore";
import { getResonanceScore } from "@/utils/getResonanceScore";

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
          const boostData = await (boostModule as any).getBoost(hash);
          const boostTRN = boostData && boostData.amount
            ? parseFloat(formatEther(boostData.amount))
            : 0;
          const resonance = await getResonanceScore(hash);

          const score = calcTrendingScore({
            retrns: retrns.length,
            boostTRN,
            resonance,
            createdAt: post.timestamp,
          });

          return { ...post, hash, retrns, boostAmount: boostTRN, resonance, score };
        })
      );

      postsWithScores.sort((a, b) => b.score - a.score);
      setPosts(postsWithScores);
    };

    load();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🔥 Trending Retrns</h1>

      <div className="space-y-6">
        {posts.map((p, i) => (
          <div key={p.hash} className="bg-white rounded shadow p-4">
            <div className="flex justify-between mb-1 text-xs text-gray-500">
              <span># {i + 1}</span>
              <span>🔥 Score: {p.score.toFixed(2)}</span>
            </div>
            <PostCard ipfsHash={p.hash} post={p} viewerAddr={viewerAddr || ""} />
          </div>
        ))}
      </div>
    </div>
  );
}
