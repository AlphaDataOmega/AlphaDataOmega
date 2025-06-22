import { useEffect, useState } from "react";
import { fetchPost } from "@/utils/fetchPost";

export default function FeedReply({ hash }: { hash: string }) {
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    fetchPost(hash).then(setPost).catch(console.error);
  }, [hash]);

  if (!post) return <li>Loading reply...</li>;

  return (
    <li className="border-l-2 pl-3 text-sm text-gray-800">
      {post.content}
    </li>
  );
}
