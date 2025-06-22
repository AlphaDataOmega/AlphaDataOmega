import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { fetchPost } from "@/utils/fetchPost";
import PostCard from "@/components/PostCard";
import RecursiveRetrnTree from "@/components/RecursiveRetrnTree";

export default function BranchPage() {
  const router = useRouter();
  const { address: viewerAddr } = useAccount();
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
      {rootPost && (
        <>
          <PostCard
            ipfsHash={rootPost.hash}
            post={rootPost}
            showReplies={true}
            viewerAddr={viewerAddr || ""}
          />
          <RecursiveRetrnTree parentHash={rootPost.hash} />
        </>
      )}
    </div>
  );
}
