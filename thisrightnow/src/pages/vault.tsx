import { useVaultStatus } from "@/hooks/useVaultStatus";
import VaultInit from "@/components/VaultInit";
import VaultRecovery from "@/components/VaultRecovery";

export default function VaultPage() {
  const { initialized, unlocked } = useVaultStatus();

  if (!initialized) return <VaultInit onComplete={() => location.reload()} />;
  if (!unlocked) return <VaultRecovery onUnlock={() => location.reload()} />;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">✅ Vault Unlocked</h1>
      <p className="mt-2 text-green-600">You now have full access to post, vote, and earn.</p>
    </div>
  );
}
