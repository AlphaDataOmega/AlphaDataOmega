import { useRouter } from "next/router";
import { useTrending } from "@/utils/useTrending";
import { useEffect, useState } from "react";

const categories = ["all", "memes", "tech", "politics", "ai", "news"];

export default function AccountEarningsPage() {
  const router = useRouter();
  const addr = router.query.addr as string;
  const selected = (router.query.category as string) || "all";
  const [earnings, setEarnings] = useState<any[]>([]);
  const [totalTRN, setTotalTRN] = useState(0);

  const { posts, isLoading: loadingPosts } = useTrending(selected === "all" ? undefined : selected);

  // 🔁 Fetch earnings per post
  useEffect(() => {
    if (!addr || !posts.length) return;

    const load = async () => {
      let sum = 0;
      const all = await Promise.all(
        posts.map(async (p) => {
          const res = await fetch(`/api/earnings/post/${p.hash}`);
          const data = await res.json();
          const earned = data?.[addr?.toLowerCase()] || 0;
          sum += earned;
          return { ...p, earned };
        })
      );
      setEarnings(all.filter((e) => e.earned > 0));
      setTotalTRN(sum);
    };

    load();
  }, [addr, posts]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        💰 Earnings: {addr?.slice(0, 6)}…
      </h1>

      <div className="mb-4 text-lg font-medium">
        Total: <span className="text-green-600">{totalTRN.toFixed(3)} TRN</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              router.push(
                `/account/${addr}/earnings?category=${cat}`,
                undefined,
                { shallow: true }
              )
            }
            className={`px-3 py-1 rounded text-sm ${
              selected === cat ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loadingPosts && <p className="text-sm text-gray-400">Loading posts…</p>}

      <table className="w-full border mt-4 text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Post</th>
            <th className="p-2">TRN Earned</th>
            <th className="p-2">Category</th>
            <th className="p-2">Link</th>
          </tr>
        </thead>
        <tbody>
          {earnings.map((e) => (
            <tr key={e.hash} className="border-t">
              <td className="p-2">{e.content.slice(0, 50)}…</td>
              <td className="p-2 text-green-700">{e.earned.toFixed(3)}</td>
              <td className="p-2">{e.category}</td>
              <td className="p-2">
                <a
                  href={`/branch/${e.hash}`}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View ↗
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
