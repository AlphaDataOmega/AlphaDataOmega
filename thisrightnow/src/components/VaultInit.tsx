import { useState } from "react";
import { encryptVault } from "@/utils/encryptVault";
import { pinVaultToIPFS } from "@/utils/pinVaultToIPFS";

const defaultKeys = [
  "Voice",
  "Face",
  "Thumb",
  "Passphrase",
  "QR Code",
  "Backup Email",
  "AI Auth",
];

export default function VaultInit({ onComplete }: { onComplete: () => void }) {
  const [keys, setKeys] = useState<string[]>([]);
  const [error, setError] = useState("");

  const toggleKey = (k: string) => {
    setKeys((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );
  };

  const handleSubmit = async () => {
    if (keys.length !== 7) {
      setError("You must initialize with exactly 7 keys.");
      return;
    }

    const passphrase = prompt(
      "\ud83d\udd10 Set a secure Vault passphrase (keep this safe):"
    );
    if (!passphrase || passphrase.length < 6) {
      setError("Passphrase too short.");
      return;
    }

    const encrypted = await encryptVault(keys, passphrase);
    const payload = {
      address: (window as any).ethereum.selectedAddress || "anon",
      createdAt: Date.now(),
      encryptedVault: encrypted.encrypted,
      iv: encrypted.iv,
    };

    // temporarily store encrypted vault locally for dev until IPFS fetch is live
    localStorage.setItem("ado.mock.encrypted", encrypted.encrypted);
    localStorage.setItem("ado.mock.iv", encrypted.iv);

    const cid = await pinVaultToIPFS(payload);

    // Save metadata locally
    localStorage.setItem("ado.vault.cid", cid);
    localStorage.setItem("ado.vault.initialized", "true");
    setError("");
    onComplete();
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">🔐 Initialize Your Vault</h2>
      <p className="mb-2 text-sm text-gray-600">
        Choose exactly 7 identity keys to secure your vault:
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {defaultKeys.map((k) => (
          <button
            key={k}
            onClick={() => toggleKey(k)}
            className={`px-3 py-1 rounded border ${
              keys.includes(k) ? "bg-green-600 text-white" : "bg-gray-100"
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
        Lock Vault
      </button>
    </div>
  );
}
