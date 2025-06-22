import { useState } from "react";
import { decryptVault } from "@/utils/decryptVault";

export default function VaultRecovery({ onUnlock }: { onUnlock: () => void }) {
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState("");

  const handleRecover = async () => {
    try {
      const cid = localStorage.getItem("ado.vault.cid");
      if (!cid) throw new Error("Vault not found. Try initializing first.");

      // Mock CID fetch (replace with real fetch later)
      const storedVault = {
        encryptedVault: localStorage.getItem("ado.mock.encrypted"),
        iv: localStorage.getItem("ado.mock.iv"),
      };

      const keys = await decryptVault(
        storedVault.encryptedVault!,
        storedVault.iv!,
        passphrase
      );

      console.log("\ud83d\udd13 Vault Restored Keys:", keys);
      localStorage.setItem("ado.vault.unlocked", "true");
      onUnlock();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-2">\ud83d\udd10 Vault Recovery</h2>
      <p className="text-sm mb-4">Enter your passphrase to unlock your vault.</p>

      <input
        type="password"
        className="w-full p-2 border mb-2"
        value={passphrase}
        onChange={(e) => setPassphrase(e.target.value)}
        placeholder="Enter vault passphrase"
      />

      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

      <button
        onClick={handleRecover}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Unlock Vault
      </button>
    </div>
  );
}
