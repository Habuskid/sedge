'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { createViemAdapterFromProvider } from '@circle-fin/adapter-viem-v2';
import { createPublicClient, http, type Chain } from 'viem';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Adapter = any;

/**
 * Maps chain names AND chain IDs to RPC URLs.
 * AppKit passes its own chain objects to getPublicClient — these may use
 * chain.name (e.g. "Base Sepolia") rather than chain.id. We match both
 * to ensure our Alchemy RPC is always used instead of the default public one.
 */
const RPC_BY_CHAIN_NAME: Record<string, string | undefined> = {
  'Arc Testnet': process.env.NEXT_PUBLIC_ARC_RPC_URL,
  'Sepolia': process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
  'Ethereum Sepolia': process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
  'Base Sepolia': process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL,
  'Arbitrum Sepolia': process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL,
};

const RPC_BY_CHAIN_ID: Record<number, string | undefined> = {
  5042002: process.env.NEXT_PUBLIC_ARC_RPC_URL,
  11155111: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
  84532: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL,
  421614: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL,
};

function getRpcUrl(chain: Chain): string | undefined {
  // Try name first (AppKit's chain objects), then ID (viem/wagmi chains)
  return RPC_BY_CHAIN_NAME[chain.name] || RPC_BY_CHAIN_ID[chain.id];
}

export function useWalletAdapter() {
  const { connector, isConnected } = useAccount();
  const [adapter, setAdapter] = useState<Adapter>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!isConnected || !connector) {
        setAdapter(null);
        setError(null);
        return;
      }

      try {
        const provider = await connector.getProvider();
        const a = await createViemAdapterFromProvider({
          provider: provider as Parameters<typeof createViemAdapterFromProvider>[0]['provider'],
          getPublicClient: ({ chain }: { chain: Chain }) => {
            const rpcUrl = getRpcUrl(chain);
            console.log(`[WalletAdapter] getPublicClient called for chain: "${chain.name}" (id: ${chain.id}) -> RPC: ${rpcUrl ? 'custom' : 'default'}`);
            
            return createPublicClient({
              chain,
              transport: http(rpcUrl, {
                retryCount: 3,
                timeout: 30_000,
              }),
            });
          }
        });
        if (!cancelled) {
          setAdapter(a);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setAdapter(null);
          setError(err instanceof Error ? err.message : 'Failed to create wallet adapter');
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, [isConnected, connector]);

  return { adapter, isReady: adapter !== null, error };
}
