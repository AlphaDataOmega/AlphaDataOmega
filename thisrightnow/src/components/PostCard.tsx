import { useEffect, useState } from "react";
import { fetchPost } from "@/utils/fetchPost";
import { loadContract } from "@/utils/contract";
import RetrnIndexABI from "@/abi/RetrnIndex.json";
import { getPostEarnings } from "@/utils/getPostEarnings";
import CreateRetrn from "./CreateRetrn";

export default function PostCard({
  ipfsHash,
  post,
  showReplies = false,
  viewerAddr,
}: {
  ipfsHash: string;
  post?: any;
  showReplies?: boolean;
  viewerAddr?: string;
}) {
  const [data, setData] = useState(post || null);
  const [retrns, setRetrns] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<number | null>(null);

  useEffect(() => {
    if (!post) fetchPost(ipfsHash).then(setData).catch(console.error);
  }, [ipfsHash, post]);

  useEffect(() => {
    if (!viewerAddr) return;
    getPostEarnings(ipfsHash, viewerAddr).then(setEarnings);
  }, [ipfsHash, viewerAddr]);

  useEffect(() => {
    if (!showReplies || !ipfsHash) return;
    const loadRetrns = async () => {
      const contract = await loadContract("RetrnIndex", RetrnIndexABI);
      const hashes = await (contract as any).getRetrns(ipfsHash);
      const results = await Promise.all(
        hashes.map(async (h: string) => {
          const d = await fetchPost(h);
          return { ...d, hash: h };
        })
      );
      setRetrns(results);
    };
    loadRetrns();
  }, [showReplies, ipfsHash]);

  if (!data) return <div className="p-2 bg-gray-100">Loading...</div>;

  return (
    <div className="bg-white border rounded p-4 shadow-sm">
      <p>{data.content}</p>
      <div className="text-xs text-gray-500 mt-2">
        {data.tags?.join(", ")} · {new Date(data.timestamp).toLocaleString()}
      </div>

      {earnings !== null && (
        <p className="text-green-600 text-sm mt-1">
          💸 Earned You: {earnings.toFixed(2)} TRN
        </p>
      )}

      {showReplies && (
        <>
          <CreateRetrn
            parentHash={ipfsHash}
            onRetrn={(r) => setRetrns([r, ...retrns])}
          />
          <div className="ml-4 mt-4 border-l-2 pl-4 space-y-3">
            {retrns.map((r) => (
              <PostCard
                key={r.hash}
                ipfsHash={r.hash}
                post={r}
                showReplies={false}
                viewerAddr={viewerAddr}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
