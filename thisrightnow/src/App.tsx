import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { http, WagmiProvider, useAccount } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/index';
import TRNBalanceHUD from '@/components/TRNBalanceHUD';
import VaultInit from '@/components/VaultInit';
import VaultRecovery from '@/components/VaultRecovery';
import { useVaultStatus } from '@/hooks/useVaultStatus';
import { useState, useEffect } from 'react';
import AIAssistantModal from '@/components/AIAssistantModal';
import { fetchTrustScore } from '@/utils/fetchTrustScore';

const config = getDefaultConfig({
  appName: 'ThisRightNow',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function App() {
  const { initialized, unlocked } = useVaultStatus();
  const { address } = useAccount();
  const [aiOpen, setAIOpen] = useState(false);
  const [trustScore, setTrustScore] = useState(50);
  const regionCode = 'US'; // TODO: Replace with real region lookup

  useEffect(() => {
    if (address) {
      fetchTrustScore(address).then(setTrustScore);
    }
  }, [address]);

  if (!initialized) {
    return <VaultInit onComplete={() => location.reload()} />;
  }

  if (!unlocked) {
    return <VaultRecovery onUnlock={() => location.reload()} />;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Home />
          <TRNBalanceHUD />
          <button
            className="fixed bottom-8 right-8 z-50 bg-blue-600 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl hover:bg-blue-700 focus:outline-none"
            aria-label="Open AI Assistant"
            onClick={() => setAIOpen(true)}
          >
            🤖
          </button>
          <AIAssistantModal
            open={aiOpen}
            onClose={() => setAIOpen(false)}
            trustScore={trustScore}
            regionCode={regionCode}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
