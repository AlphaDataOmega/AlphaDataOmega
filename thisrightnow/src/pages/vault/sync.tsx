import Link from "next/link";

export default function VaultSyncPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">\ud83d\udd10 Vault Sync</h1>
      <p className="mb-4">Manage your vault keys and backups.</p>
      <ul className="list-disc pl-4 space-y-2">
        <li>Re-upload updated vault keys</li>
        <li>Attach ENS or alias metadata</li>
        <li>Export backup ZIP of your soulbound identity</li>
      </ul>
      <div className="mt-6">
        <Link href="/vault" className="text-blue-600">
          \u2190 Back to Vault
        </Link>
      </div>
    </div>
  );
}
