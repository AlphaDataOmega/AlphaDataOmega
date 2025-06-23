import { useEffect, useState } from "react";
import { fetchPost } from "@/utils/fetchPost";
import { loadContract } from "@/utils/contract";
import RetrnIndexABI from "@/abi/RetrnIndex.json";

function TrustBadge({ addr, category }: { addr: string; category: string }) {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/trust/${addr}`)
      .then((res) => res.json())
      .then((data) => {
        setScore(data[category] ?? null);
      })
      .catch(() => setScore(null));
  }, [addr, category]);

  if (score === null) return null;

  return (
    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
      🧠 Trust: {score}%
    </span>
  );
}

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
          <p className="text-gray-800">
            {r.content}
            <TrustBadge addr={r.author} category={r.category ?? "general"} />
          </p>
          <RecursiveRetrnTree parentHash={r.hash} />
        </div>
      ))}
    </div>
  );
}
