import { useEffect, useState } from "react";
import { fetchPost } from "@/utils/fetchPost";
import { loadContract } from "@/utils/contract";
import RetrnIndexABI from "@/abi/RetrnIndex.json";
import Tooltip from "./Tooltip";
import { getTrustScore } from "@/utils/TrustScoreEngine";

export default function RecursiveRetrnTree({ parentHash }: { parentHash: string }) {
  const [retrns, setRetrns] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const contract = await loadContract("RetrnIndex", RetrnIndexABI);
      const hashes = await (contract as any).getRetrns(parentHash);
      const results = await Promise.all(
        hashes.map(async (h: string) => {
          const d = await fetchPost(h);
          let trust = d.trustScore;
          if (trust === undefined && d.category && d.author) {
            try {
              trust = await getTrustScore(d.category, d.author);
            } catch {
              trust = undefined;
            }
          }
          return { ...d, hash: h, trustScore: trust };
        })
      );
      setRetrns(results);
    };
    load();
  }, [parentHash]);

  if (retrns.length === 0) return null;

  const badgeClass = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="ml-6 border-l-2 pl-4 mt-4 space-y-4">
      {retrns.map((r) => (
        <div key={r.hash}>
          <p className="text-sm text-gray-600">
            {r.content}
            {typeof r.trustScore === "number" && (
              <Tooltip
                content={`Trust in ${r.category}: ${r.trustScore} → earnings x${(
                  1 + r.trustScore / 100
                ).toFixed(2)}`}
              >
                <span
                  className={`ml-2 text-xs px-2 py-0.5 rounded ${badgeClass(
                    r.trustScore
                  )}`}
                >
                  🧠 {r.trustScore}%
                </span>
              </Tooltip>
            )}
          </p>
          <RecursiveRetrnTree parentHash={r.hash} />
        </div>
      ))}
    </div>
  );
}
