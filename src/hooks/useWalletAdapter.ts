'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { createViemAdapterFromProvider } from '@circle-fin/adapter-viem-v2';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Adapter = any;

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
