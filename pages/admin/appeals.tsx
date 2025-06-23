import { useEffect, useState } from "react";
import Link from "next/link";

export default function AppealsAdminPage() {
  const [appeals, setAppeals] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/moderation/appeals/pending")
      .then((res) => res.json())
      .then(setAppeals)
      .catch(console.error);
  }, []);

  const handleDecision = async (hash: string, approve: boolean) => {
    const res = await fetch("/api/moderation/appeals/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postHash: hash, decision: approve ? "approve" : "reject" }),
    });

    if (res.ok) {
      setAppeals((prev) => prev.filter((a) => a.postHash !== hash));
    } else {
      alert("Error resolving appeal");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📜 Pending Appeals</h1>
      {appeals.length === 0 ? (
        <p className="text-gray-600">No pending appeals at this time.</p>
      ) : (
        <ul className="space-y-6">
          {appeals.map((a) => (
            <li key={a.postHash} className="border p-4 rounded bg-white">
              <p>
                <b>Post:</b>{" "}
                <Link href={`/post/${a.postHash}`} className="text-blue-600 underline">
                  view
                </Link>{" "}
                |{" "}
                <Link href={`/post/${a.postHash}/moderation`} className="text-blue-600 underline">
                  log
                </Link>
              </p>
              <p>
                <b>Author:</b>{" "}
                <Link href={`/account/${a.author}`} className="text-blue-600">
                  {a.author}
                </Link>
              </p>
              <p>
                <b>Category:</b> {a.category}
              </p>
              <p>
                <b>Appeal:</b> {a.reason}
              </p>
              <div className="mt-3 flex gap-4">
                <button
                  onClick={() => handleDecision(a.postHash, true)}
                  className="bg-green-600 text-white px-4 py-1 rounded"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => handleDecision(a.postHash, false)}
                  className="bg-red-600 text-white px-4 py-1 rounded"
                >
                  ❌ Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
