import { http, createConfig, cookieStorage, createStorage } from 'wagmi';
import { sepolia, baseSepolia, arbitrumSepolia } from 'wagmi/chains';
import { injected, coinbaseWallet, safe, walletConnect } from 'wagmi/connectors';
import { arcTestnet } from './chains';

export const wagmiConfig = createConfig({
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
  chains: [arcTestnet, sepolia, baseSepolia, arbitrumSepolia],
  connectors: [
    injected(),
    coinbaseWallet({ appName: 'Sedge' }),
    safe(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '3fcc6bba6f1de962d911bb5b5c3dba68',
      showQrModal: true,
    }),
  ],
  transports: {
    [arcTestnet.id]: http(process.env.NEXT_PUBLIC_ARC_RPC_URL),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});
