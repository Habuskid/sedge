import { http, createConfig, cookieStorage, createStorage } from 'wagmi';
import { sepolia, polygonAmoy, baseSepolia, arbitrumSepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { arcTestnet } from './chains';

export const wagmiConfig = createConfig({
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
  chains: [arcTestnet, sepolia, polygonAmoy, baseSepolia, arbitrumSepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [arcTestnet.id]: http(process.env.NEXT_PUBLIC_ARC_RPC_URL),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
    [polygonAmoy.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});
