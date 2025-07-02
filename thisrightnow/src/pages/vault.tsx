import { useVaultStatus } from "@/hooks/useVaultStatus";
import VaultInit from "@/components/VaultInit";
import VaultRecovery from "@/components/VaultRecovery";
import { useAccount } from "wagmi";
import VaultPanel from "@/components/VaultPanel";

export default function VaultPage() {
  const { initialized, unlocked } = useVaultStatus();
  const { address } = useAccount();

  if (!initialized) return <VaultInit onComplete={() => location.reload()} />;
  if (!unlocked) return <VaultRecovery onUnlock={() => location.reload()} />;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Vault</h1>
      <VaultPanel userId={address || ''} />
    </div>
  );
}
