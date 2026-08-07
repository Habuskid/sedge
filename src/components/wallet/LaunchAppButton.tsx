'use client';

import { useAccount, useConnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useSiweAuth } from '@/hooks/useSiweAuth';
import { useState } from 'react';

export function LaunchAppButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { signInWithEthereum, isAuthenticated, isSigningIn } = useSiweAuth();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleLaunch = async () => {
    // Already connected + authenticated → go straight to app
    if (isConnected && isAuthenticated) {
      router.push('/command-center');
      return;
    }

    setIsConnecting(true);

    try {
      if (isConnected) {
        // Wallet connected but no SIWE session → just sign
        const success = await signInWithEthereum();
        if (success) router.push('/command-center');
      } else {
        // Connect wallet first, then SIWE
        const injectedConnector = connectors.find(c => c.id === 'injected') || connectors[0];
        if (!injectedConnector) return;

        try {
          if (typeof window !== 'undefined' && (window as any).ethereum) {
            await (window as any).ethereum.request({
              method: 'wallet_requestPermissions',
              params: [{ eth_accounts: {} }],
            });
          }
        } catch {
          // Permission request rejected or unsupported — continue anyway
        }

        // Connect and wait for it
        await new Promise<void>((resolve, reject) => {
          connect(
            { connector: injectedConnector },
            {
              onSuccess: () => resolve(),
              onError: (err) => reject(err),
            }
          );
        });

        // Small delay to let wagmi state settle
        await new Promise(r => setTimeout(r, 500));

        // Now trigger SIWE
        const success = await signInWithEthereum();
        if (success) router.push('/command-center');
      }
    } catch (e) {
      console.error('Launch failed:', e);
    } finally {
      setIsConnecting(false);
    }
  };

  const isLoading = isConnecting || isSigningIn;

  return (
    <button
      onClick={handleLaunch}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
          {isSigningIn ? 'Signing in...' : 'Connecting...'}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
