'use client';

import { WagmiProvider, cookieToInitialState } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/config/wagmi';
import { useState, type ReactNode } from 'react';

import { SessionProvider } from 'next-auth/react';
import { WalletModalProvider } from './WalletModalProvider';

export function Web3Provider({ children, cookie }: { children: ReactNode, cookie?: string | null }) {
  const [queryClient] = useState(() => new QueryClient());
  const initialState = cookieToInitialState(wagmiConfig, cookie);

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </SessionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
