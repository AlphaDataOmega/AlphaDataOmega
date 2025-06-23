import { useEffect, useState } from "react";

export default function SlashHistory({ hash }: { hash: string }) {
  const [slashes, setSlashes] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/post/${hash}/slash-history`)
      .then((res) => res.json())
      .then((data) => setSlashes(data.slashes || []));
  }, [hash]);

  if (slashes.length === 0) return null;

  return (
    <div className="mt-4 text-sm text-red-600">
      <h4 className="font-bold">🔥 This post was slashed</h4>
      <ul>
        {slashes.map((s, i) => (
          <li key={i}>
            <div>Amount: {s.args?.brn} BRN</div>
            <div>Sent to DAO at: {s.args?.daoTreasury}</div>
            <div>Block: {s.blockNumber}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
