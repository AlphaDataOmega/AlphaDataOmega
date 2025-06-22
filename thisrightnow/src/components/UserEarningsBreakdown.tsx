import { useEffect, useState } from "react";

export default function UserEarningsBreakdown({ addr }: { addr: string }) {
  const [parts, setParts] = useState<{ merkle: number; vault: number; posts: number }>({
    merkle: 0,
    vault: 0,
    posts: 0,
  });

  useEffect(() => {
    const load = async () => {
      const [m, v1, v2, p] = await Promise.all([
        fetch("/src/data/merkle-2025-06-18.json").then((r) => r.json()),
        fetch("/src/data/vault-investor.json").then((r) => r.json()),
        fetch("/src/data/vault-contributor.json").then((r) => r.json()),
        fetch("/src/data/post-earnings.json").then((r) => r.json()),
      ]);

      const lc = addr.toLowerCase();
      setParts({
        merkle: m[lc] || 0,
        vault: (v1[lc] || 0) + (v2[lc] || 0),
        posts: p[lc] || 0,
      });
    };

    load();
  }, [addr]);

  const total = parts.merkle + parts.vault + parts.posts;

  return (
    <div>
      <div>
        Merkle: <span className="text-green-600">{parts.merkle.toFixed(3)} TRN</span>
      </div>
      <div>
        Vaults: <span className="text-blue-600">{parts.vault.toFixed(3)} TRN</span>
      </div>
      <div>
        Posts: <span className="text-purple-600">{parts.posts.toFixed(3)} TRN</span>
      </div>
      <div className="mt-1 text-xs text-gray-600">Total: {total.toFixed(3)} TRN</div>
    </div>
  );
}
