import { useEffect, useState } from "react";
import { fetchPost } from "@/utils/fetchPost";

export default function PostCard({ ipfsHash }: { ipfsHash: string }) {
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    fetchPost(ipfsHash).then(setPost).catch(console.error);
  }, [ipfsHash]);

  if (!post) return <div className="p-4 bg-gray-100">Loading post...</div>;

  return (
    <div className="p-4 bg-white shadow rounded my-2">
      <p>{post.content}</p>
      <div className="text-xs text-gray-500 mt-2">
        {post.tags?.join(", ")} · {new Date(post.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
