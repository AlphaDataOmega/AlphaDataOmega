import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import TRNUsageOracleABI from "@/abi/TRNUsageOracle.json";
import { loadContract } from "@/utils/contract";

export default function TRNBalanceHUD() {
  const { address } = useAccount();
  const [balance, setBalance] = useState<number | null>(null);

  const fetchBalance = async () => {
    if (!address) return;
    const oracle = await loadContract("TRNUsageOracle", TRNUsageOracleABI as any);
    const earned = await (oracle as any).earnedTRN(address);
    setBalance(Number(earned) / 1e18);
  };

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [address]);

  if (!address || balance === null) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-black text-green-400 px-4 py-2 rounded shadow-lg text-sm font-mono">
      TRN: {balance.toFixed(3)}
    </div>
  );
}
