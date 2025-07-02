import { useEffect, useState } from "react";
import { fetchPost } from "@/utils/fetchPost";
import { loadContract } from "@/utils/contract";
import RetrnIndexABI from "@/abi/RetrnIndex.json";
import { getPostEarnings } from "@/utils/getPostEarnings";
import CreateRetrn from "./CreateRetrn";
import { getTrustScore } from "@/utils/TrustScoreEngine";
import Tooltip from "@/components/Tooltip";
import BoostSimulationModal from './BoostSimulationModal';

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
  const [trustScore, setTrustScore] = useState<number | null>(null);
  const [showBoostSim, setShowBoostSim] = useState(false);
  const [showReward, setShowReward] = useState(false);
  // Mocked region for demo
  const region = post?.regionCode || "US";
  // Mocked trust audit
  const trustAudit = [
    { date: "2025-07-01", delta: +5, reason: "Blessed by DAO" },
    { date: "2025-06-28", delta: -2, reason: "Flagged: spam" },
  ];
  const estimatedReward = earnings !== null ? (earnings * 1.1).toFixed(2) : "0.00";

  useEffect(() => {
    if (!post) fetchPost(ipfsHash).then(setData).catch(console.error);
  }, [ipfsHash, post]);

  useEffect(() => {
    const loadTrust = async () => {
      if (post?.category && post?.author) {
        try {
          const score = await getTrustScore(post.category, post.author);
          setTrustScore(score);
        } catch {
          setTrustScore(null);
        }
      }
    };
    loadTrust();
  }, [post?.category, post?.author]);

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
      <div className="text-sm text-gray-600 flex items-center space-x-2">
        <span className="font-mono">{post.author}</span>
        {/* Region badge */}
        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs ml-2">{region}</span>
        {/* Trust badge with hover audit */}
        {trustScore !== null && (
          <div className="relative group ml-2">
            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs cursor-pointer">💎 {trustScore}</span>
            <div className="absolute left-0 top-8 z-10 hidden group-hover:block bg-white border rounded shadow p-2 text-xs w-56">
              <div className="font-bold mb-1">Trust Audit</div>
              {trustAudit.map((a, i) => (
                <div key={i} className={a.delta >= 0 ? "text-green-600" : "text-red-600"}>
                  {a.date}: {a.delta >= 0 ? "+" : ""}{a.delta} ({a.reason})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
        {post.category && (
          <Tooltip content={`Tagged as ${post.category}`}>
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
              🏷 {post.category}
            </span>
          </Tooltip>
        )}
      </div>
      <div
        className="relative"
        onMouseEnter={() => setShowReward(true)}
        onMouseLeave={() => setShowReward(false)}
      >
        <p>{data.content}</p>
        {showReward && (
          <div className="absolute right-0 top-0 bg-green-100 text-green-800 px-3 py-1 rounded shadow text-xs z-20">
            Est. Reward: {estimatedReward} TRN
          </div>
        )}
      </div>
      <div className="text-xs text-gray-500 mt-2">
        {data.tags?.join(", ")} · {new Date(data.timestamp).toLocaleString()}
      </div>
      {earnings !== null && (
        <p className="text-green-600 text-sm mt-1">
          💸 Earned You: {earnings.toFixed(2)} TRN
        </p>
      )}
      <div className="flex gap-2 mt-3">
        <button
          className="bg-purple-100 text-purple-800 px-3 py-1 rounded hover:scale-105 active:scale-95 transition-transform"
          onClick={() => alert('Blessed!')}
        >
          Bless
        </button>
        <button
          className="bg-red-100 text-red-800 px-3 py-1 rounded hover:scale-105 active:scale-95 transition-transform"
          onClick={() => alert('Burned!')}
        >
          Burn
        </button>
        <button
          className="bg-blue-100 text-blue-800 px-3 py-1 rounded hover:scale-105 active:scale-95 transition-transform"
          onClick={() => alert('Retrned!')}
        >
          Retrn
        </button>
      </div>
      <button
        className="mt-2 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700"
        onClick={() => setShowBoostSim(true)}
      >
        Simulate Boost
      </button>
      <BoostSimulationModal
        open={showBoostSim}
        onClose={() => setShowBoostSim(false)}
      />
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
