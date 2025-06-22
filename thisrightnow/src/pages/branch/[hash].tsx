import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { fetchPost } from "@/utils/fetchPost";
import { loadContract } from "@/utils/contract";
import RetrnIndexABI from "@/abi/RetrnIndex.json";
import PostCard from "@/components/PostCard";

async function fetchRetrns(parent: string) {
  const contract = await loadContract("RetrnIndex", RetrnIndexABI);
  const hashes: string[] = await (contract as any).getRetrns(parent);
  const data = await Promise.all(
    hashes.map(async (h) => {
      const d = await fetchPost(h);
      return { ...d, hash: h };
    })
  );
  return data;
}

function RecursiveRetrnTree({ parentHash }: { parentHash: string }) {
  const [children, setChildren] = useState<any[]>([]);

  useEffect(() => {
    fetchRetrns(parentHash).then(setChildren).catch(console.error);
  }, [parentHash]);

  if (!children.length) return null;

  return (
    <div className="mt-4 space-y-4 pl-4 border-l-2 border-green-400">
      {children.map((child) => (
        <div key={child.hash}>
          <PostCard ipfsHash={child.hash} post={child} />
          <RecursiveRetrnTree parentHash={child.hash} />
        </div>
      ))}
    </div>
  );
}

export default function BranchPage() {
  const router = useRouter();
  const { hash } = router.query;
  const [rootPost, setRootPost] = useState<any>(null);

  useEffect(() => {
    if (!hash || typeof hash !== "string") return;
    fetchPost(hash as string)
      .then((p) => setRootPost({ ...p, hash }))
      .catch(console.error);
  }, [hash]);

  if (!hash || typeof hash !== "string") return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🌳 Retrn Thread</h1>
      {rootPost && <PostCard ipfsHash={rootPost.hash} post={rootPost} />}
      {hash && <RecursiveRetrnTree parentHash={hash as string} />}
    </div>
  );
}
