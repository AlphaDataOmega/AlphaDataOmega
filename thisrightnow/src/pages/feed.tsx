import { useTrending } from "@/utils/useTrending";
import { useRouter } from "next/router";
import FeedReply from "@/components/FeedReply";
import PostCard from "@/components/PostCard";

export default function FeedPage() {
  const router = useRouter();
  const selected = (router.query.category as string) || "all";
  const { posts, isLoading } = useTrending(selected === "all" ? undefined : selected);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🌊 River of Retrns</h1>

      <div className="flex gap-2 mb-4">
        {["all", "memes", "tech", "politics", "ai", "news"].map((cat) => (
          <button
            key={cat}
            onClick={() => router.push(`/feed?category=${cat}`, undefined, { shallow: true })}
            className={`px-3 py-1 rounded text-sm ${
              selected === cat ? "bg-green-600 text-white" : "bg-gray-100 text-gray-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-gray-400">Loading feed...</p>}

      <div className="space-y-6">
        {posts.map((p: any) => (
          <div key={p.hash} className="bg-white rounded shadow p-4">
            <PostCard ipfsHash={p.hash} post={p} showReplies={false} />
            <div className="ml-4 mt-2 text-sm text-gray-600">
              {p.retrns?.length > 0 && (
                <>
                  <p className="text-xs mb-1">Top replies:</p>
                  <ul className="space-y-2">
                    {p.retrns.slice(0, 2).map((rHash: string) => (
                      <FeedReply key={rHash} hash={rHash} />
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
