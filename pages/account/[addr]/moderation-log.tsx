import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ModerationLogPage() {
  const router = useRouter();
  const { addr } = router.query;
  const [log, setLog] = useState<any[]>([]);

  useEffect(() => {
    if (!addr) return;
    fetch(`/api/modlog/${addr}`)
      .then((res) => res.json())
      .then(setLog);
  }, [addr]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🧾 Moderation Log for {addr}</h1>
      {log.length === 0 ? (
        <p>No moderation actions recorded for this address.</p>
      ) : (
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Post</th>
              <th className="p-2 text-left">Action</th>
              <th className="p-2">Category</th>
              <th className="p-2">Trust Δ</th>
              <th className="p-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {log.map((e, i) => (
              <tr key={i} className="border-t">
                <td className="p-2 font-mono">
                  <a
                    href={`/post/${e.postHash}`}
                    className="text-blue-600 underline"
                  >
                    {e.postHash.slice(0, 8)}...
                  </a>
                </td>
                <td className="p-2">{e.reason.replaceAll("_", " ")}</td>
                <td className="p-2">{e.category}</td>
                <td className={`p-2 text-center ${e.delta < 0 ? "text-red-600" : "text-green-600"}`}>
                  {e.delta > 0 ? `+${e.delta}` : e.delta}
                </td>
                <td className="p-2 text-xs text-gray-500">
                  {new Date(e.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
