import { useEffect, useState } from "react";
import { fetchPost } from "@/utils/fetchPost";
import { loadContract } from "@/utils/contract";
import RetrnIndexABI from "@/abi/RetrnIndex.json";
import PostCard from "./PostCard";

export default function RecursiveRetrnTree({ parentHash }: { parentHash: string }) {
  const [retrns, setRetrns] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const contract = await loadContract("RetrnIndex", RetrnIndexABI);
      const hashes = await (contract as any).getRetrns(parentHash);
      const results = await Promise.all(
        hashes.map(async (h: string) => {
          const d = await fetchPost(h);
          return { ...d, hash: h };
        })
      );
      setRetrns(results);
    };
    load();
  }, [parentHash]);

  if (retrns.length === 0) return null;

  return (
    <div className="ml-6 border-l-2 pl-4 mt-4 space-y-4">
      {retrns.map((r) => (
        <div key={r.hash}>
          <PostCard ipfsHash={r.hash} post={r} showReplies={false} />
          <RecursiveRetrnTree parentHash={r.hash} />
        </div>
      ))}
    </div>
  );
}
