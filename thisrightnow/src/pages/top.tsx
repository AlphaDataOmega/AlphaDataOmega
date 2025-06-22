import { useEffect, useState } from "react";
import { fetchTopEarners, fetchTopPosts } from "@/utils/topData";
import Link from "next/link";

export default function TopPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchTopEarners().then(setUsers);
    fetchTopPosts().then(setPosts);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🏆 Top Earners</h1>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-2">🧑‍🚀 Users</h2>
        <ul className="space-y-2">
          {users.map((u, i) => (
            <li key={u.address} className="p-3 bg-white rounded shadow">
              #{i + 1} – <Link href={`/account/${u.address}`} className="text-blue-600">{u.address}</Link>
              <span className="float-right font-bold">{u.trn} TRN</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">📝 Posts</h2>
        <ul className="space-y-2">
          {posts.map((p, i) => (
            <li key={p.hash} className="p-3 bg-white rounded shadow">
              #{i + 1} – <Link href={`/post/${p.hash}`} className="text-blue-600">{p.preview}</Link>
              <span className="float-right font-bold">{p.trn} TRN</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
