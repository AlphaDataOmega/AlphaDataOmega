import { useAccount } from "wagmi";
import { useVaultStatus } from "@/hooks/useVaultStatus";

export default function TRNBalanceHUD() {
  const { address } = useAccount();
  const { balance, isLoading, error } = useVaultStatus(address);

  if (!address) return null;
  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-black text-yellow-400 px-4 py-2 rounded shadow-lg text-sm font-mono">
        Loading vault TRN...
      </div>
    );
  }
  if (error) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-black text-red-400 px-4 py-2 rounded shadow-lg text-sm font-mono">
        Vault error: {error}
      </div>
    );
  }
  if (balance === null) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-black text-green-400 px-4 py-2 rounded shadow-lg text-sm font-mono">
      Vault TRN: {balance.toFixed(3)}
    </div>
  );
}
