import { useEffect, useState } from "react";
import { fetchPost } from "@/utils/fetchPost";
import { getTrustScore } from "@/utils/TrustScoreEngine";
import Tooltip from "@/components/Tooltip";

export default function FeedReply({ hash }: { hash: string }) {
  const [post, setPost] = useState<any>(null);
  const [trustScore, setTrustScore] = useState<number | null>(null);

  useEffect(() => {
    fetchPost(hash)
      .then(async (p) => {
        setPost(p);
        if (p?.category && p?.author) {
          const score = await getTrustScore(p.category, p.author);
          setTrustScore(score);
        }
      })
      .catch(console.error);
  }, [hash]);

  if (!post) return <li>Loading reply...</li>;

  return (
    <li className="border-l-2 pl-3 text-sm text-gray-800 space-y-1">
      <div>{post.content}</div>

      <div className="flex gap-2 text-xs text-gray-600">
        {post.category && (
          <Tooltip content={`Tagged as ${post.category}`}>
            <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
              🏷 {post.category}
            </span>
          </Tooltip>
        )}

        {trustScore !== null && (
          <Tooltip
            content={`Trust in ${post.category}: ${trustScore} → earnings x${(
              1 + trustScore / 100
            ).toFixed(2)}`}
          >
            <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
              💎 {trustScore}
            </span>
          </Tooltip>
        )}
      </div>
    </li>
  );
}
