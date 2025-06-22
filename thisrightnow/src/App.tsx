import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { http, WagmiProvider } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/index';
import TRNBalanceHUD from '@/components/TRNBalanceHUD';

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
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Home />
          <TRNBalanceHUD />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
