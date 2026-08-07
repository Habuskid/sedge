'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useSiweAuth } from '@/hooks/useSiweAuth';
import { useState } from 'react';
import { useWalletModal } from '@/components/providers/WalletModalProvider';

export function LaunchAppButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const { signInWithEthereum, isAuthenticated, isSigningIn } = useSiweAuth();
  const router = useRouter();
  const { openModal } = useWalletModal();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleLaunch = async () => {
    // Already connected + authenticated → go straight to app
    if (isConnected && isAuthenticated) {
      router.push('/command-center');
      return;
    }

    if (isConnected) {
      // Wallet connected but no SIWE session → just sign
      setIsConnecting(true);
      try {
        const success = await signInWithEthereum();
        if (success) router.push('/command-center');
      } finally {
        setIsConnecting(false);
      }
    } else {
      // Not connected -> open the custom modal to let user choose wallet
      openModal();
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
