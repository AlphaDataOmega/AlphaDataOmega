import { useEffect, useState } from "react";
import { fetchPost } from "@/utils/fetchPost";

export default function PostCard({
  ipfsHash,
  post,
}: {
  ipfsHash: string;
  post?: any;
}) {
  const [data, setData] = useState(post || null);

  useEffect(() => {
    if (!post) {
      fetchPost(ipfsHash).then(setData).catch(console.error);
    }
  }, [ipfsHash, post]);

  if (!data)
    return <div className="p-2 bg-gray-100">Loading...</div>;

  return (
    <div className="bg-white border rounded p-3 shadow-sm">
      <p>{data.content}</p>
      <div className="text-xs text-gray-500 mt-2">
        {data.tags?.join(", ")} · {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
