import { useRouter } from "next/router";
import PostCard from "@/components/PostCard";
import { useTrending } from "@/utils/useTrending";

const categories = ["all", "memes", "ai", "politics", "news", "tech"];

export default function ExplorePage() {
  const router = useRouter();
  const selected = (router.query.category as string) || "all";

  const { posts, isLoading } = useTrending(
    selected === "all" ? undefined : selected
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🧭 Explore by Topic</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`text-sm px-3 py-1 rounded ${
              selected === cat
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => {
              router.push(`/explore?category=${cat}`, undefined, { shallow: true });
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading posts…</p>}

      <div className="space-y-6">
        {posts.map((p) => (
          <PostCard key={p.hash} ipfsHash={p.hash} post={p} />
        ))}
      </div>
    </div>
  );
}
