import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";

function TrustBadge({ category, score }: { category: string; score: number }) {
  const color =
    score >= 90
      ? "bg-green-600"
      : score >= 70
      ? "bg-yellow-500"
      : score >= 50
      ? "bg-gray-400"
      : "bg-red-500";

  return (
    <div className={`inline-block ${color} text-white px-3 py-1 rounded-full text-xs mr-2 mb-2`}>
      {category}: {score}
    </div>
  );
}

export default function AccountTrustPage() {
  const router = useRouter();
  const { addr } = router.query;
  const [trust, setTrust] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!addr) return;
    fetch(`/api/trust/${addr}`)
      .then((res) => res.json())
      .then((data) => setTrust(data.trust || {}))
      .catch(console.error);
  }, [addr]);

  if (!addr) return <p>Loading...</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Account: {addr}</h1>
      <h2 className="text-xl font-semibold mt-6 mb-2">🧠 Category Trust</h2>
      <div className="flex flex-wrap">
        {Object.entries(trust).map(([category, score]) => (
          <TrustBadge key={category} category={category} score={score as number} />
        ))}
      </div>
      <Link
        href={`/account/${addr}/trust`}
        className="text-blue-600 underline text-sm mt-2 block"
      >
        View trust score history →
      </Link>
    </div>
  );
}
