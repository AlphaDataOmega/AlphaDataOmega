import { useState } from "react";

export default function RecoverPage() {
  const [shards, setShards] = useState(["", "", "", ""]);
  const [status, setStatus] = useState("");

  const updateShard = (i: number, val: string) => {
    const copy = [...shards];
    copy[i] = val;
    setShards(copy);
  };

  const handleRecover = async () => {
    if (shards.filter((s) => s.trim().length > 0).length < 4) {
      setStatus("❌ At least 4 shard keys are required.");
      return;
    }

    try {
      setStatus("🔐 Submitting recovery…");

      // Stubbed recovery logic — plug into smart contract here
      const res = await fetch("/api/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shards }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus("✅ Recovery successful.");
      } else {
        setStatus("❌ Recovery failed.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Unexpected error.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">🔐 Recover Identity Vault</h1>

      <p className="mb-4 text-sm text-gray-600">
        You must submit at least <strong>4 of 7 shard keys</strong> to recover access to your eTRN_id vault.
      </p>

      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          type="text"
          value={shards[i]}
          onChange={(e) => updateShard(i, e.target.value)}
          placeholder={`Shard Key #${i + 1}`}
          className="w-full p-2 border rounded mb-3"
        />
      ))}

      <button
        onClick={handleRecover}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit Recovery
      </button>

      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
}
