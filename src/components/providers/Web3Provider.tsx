'use client';

import { WagmiProvider, cookieToInitialState } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/config/wagmi';
import { useEffect, useState, type ReactNode } from 'react';

import { WalletModalProvider } from './WalletModalProvider';
import { installCircleFetchProxy } from '@/lib/circle-fetch-proxy';

export function Web3Provider({ children, cookie }: { children: ReactNode, cookie?: string | null }) {
  const [queryClient] = useState(() => new QueryClient());
  const initialState = cookieToInitialState(wagmiConfig, cookie);

  useEffect(() => {
    installCircleFetchProxy();
  }, []);

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
