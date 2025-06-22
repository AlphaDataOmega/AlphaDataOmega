import { useEffect, useState } from "react";
import { loadContract } from "@/utils/contract";
import ViewIndexABI from "@/abi/ViewIndex.json";
import { fetchPost } from "@/utils/fetchPost";
import PostCard from "@/components/PostCard";
import CreateRetrn from "@/components/CreateRetrn";

export default function ExplorePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    const load = async () => {
      const viewIndex = await loadContract("ViewIndex", ViewIndexABI);
      const recentHashes: string[] = await (viewIndex as any).getRecentPosts();

      const results = await Promise.all(
        recentHashes.map(async (hash) => {
          const data = await fetchPost(hash);
          return { ...data, hash };
        })
      );

      setPosts(results);
    };

    load();
  }, []);

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

      <div className="space-y-8">
        {filtered.map((p) => (
          <div key={p.hash} className="bg-white rounded shadow p-4">
            <PostCard ipfsHash={p.hash} post={p} showReplies={false} />

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
