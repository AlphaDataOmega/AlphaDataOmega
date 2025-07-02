import { useVaultStatus } from '@/hooks/useVaultStatus';
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi';
import TRNUsageOracleABI from '@/abi/TRNUsageOracle.json';
import { useState } from 'react';

const ORACLE_ADDRESS = process.env.NEXT_PUBLIC_TRN_USAGE_ORACLE_ADDRESS || '0xYourOracleAddressHere';

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-8 right-8 z-50 bg-green-600 text-white px-6 py-3 rounded shadow-lg">
      {message}
      <button className="ml-4 text-white font-bold" onClick={onClose}>×</button>
    </div>
  );
}

export default function VaultPanel({ userId }: { userId: string }) {
  const { address } = useAccount();
  const { balance, isLoading, error } = useVaultStatus(userId);
  const [toast, setToast] = useState<string | null>(null);

  // Placeholder earnings breakdown
  const earnings = [
    { type: 'Views', amount: balance ? balance * 0.4 : 0 },
    { type: 'Retrns', amount: balance ? balance * 0.2 : 0 },
    { type: 'Boosts', amount: balance ? balance * 0.15 : 0 },
    { type: 'Lotto', amount: balance ? balance * 0.1 : 0 },
    { type: 'DAO', amount: balance ? balance * 0.1 : 0 },
    { type: 'Country', amount: balance ? balance * 0.05 : 0 },
  ];

  const { write, data, isLoading: isClaiming } = useContractWrite({
    address: ORACLE_ADDRESS,
    abi: TRNUsageOracleABI,
    functionName: 'claimEarnings',
    args: [],
  });

  const { isSuccess } = useWaitForTransaction({ hash: data?.hash });

  // Show toast and refresh after claim
  if (isSuccess && toast !== 'Claim successful!') {
    setToast('Claim successful!');
    console.log('Claim result:', data);
    setTimeout(() => window.location.reload(), 1500);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">TRN Earnings Breakdown</h2>
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {earnings.map((e) => (
            <div key={e.type} className="bg-white rounded-2xl shadow p-4 flex flex-col items-center">
              <span className="font-bold text-blue-700">{e.type}</span>
              <span className="text-green-600 text-xl font-mono">{e.amount.toFixed(2)} TRN</span>
            </div>
          ))}
        </div>
      )}
      <button
        className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 disabled:opacity-50"
        disabled={!balance || balance <= 0 || isClaiming}
        onClick={() => write?.()}
      >
        {isClaiming ? 'Claiming...' : 'Claim Now'}
      </button>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
} 