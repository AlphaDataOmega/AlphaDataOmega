import { useState } from "react";

const defaultKeys = [
  "Voice",
  "Face",
  "Thumb",
  "Passphrase",
  "QR Code",
  "Backup Email",
  "AI Auth",
];

export default function VaultRecovery({ onUnlock }: { onUnlock: () => void }) {
  const [keys, setKeys] = useState<string[]>([]);
  const [error, setError] = useState("");

  const stored = JSON.parse(localStorage.getItem("ado.vault.keys") || "[]");

  const toggleKey = (k: string) => {
    setKeys((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );
  };

  const handleSubmit = () => {
    const match = keys.filter((k) => stored.includes(k)).length;
    if (match >= 4) {
      localStorage.setItem("ado.vault.unlocked", "true");
      setError("");
      onUnlock();
    } else {
      setError("Need at least 4 correct keys to unlock vault.");
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">🛠 Recover Your Vault</h2>
      <p className="mb-2 text-sm text-gray-600">Select 4 of your saved keys to unlock:</p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {defaultKeys.map((k) => (
          <button
            key={k}
            onClick={() => toggleKey(k)}
            className={`px-3 py-1 rounded border ${
              keys.includes(k) ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      <button
        onClick={handleSubmit}
        className="w-full bg-black text-white py-2 rounded"
      >
        Unlock Vault
      </button>
    </div>
  );
}
