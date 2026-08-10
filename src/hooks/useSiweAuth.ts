'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { useState, useCallback } from 'react';

/**
 * Wallet-only auth shim for hackathon mode.
 * No NextAuth session calls to avoid /api/auth/session client fetch errors.
 */
export function useSiweAuth() {
  const { address: hookAddress } = useAccount();
  const { disconnect } = useDisconnect();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const signInWithEthereum = useCallback(async (explicitAddress?: string): Promise<boolean> => {
    const address = explicitAddress || hookAddress;
    if (!address) return false;

    setIsSigningIn(true);
    try {
      // Wallet is the source of truth for this flow.
      return true;
    } finally {
      setIsSigningIn(false);
    }
  }, [hookAddress]);

  const signOutAndDisconnect = useCallback(async () => {
    disconnect();

    if (typeof window !== 'undefined') {
      document.cookie = 'wagmi.store=; Max-Age=0; path=/';
      Object.keys(localStorage).forEach(key => {
        if (key.toLowerCase().includes('wagmi') || key.toLowerCase().includes('wallet')) {
          localStorage.removeItem(key);
        }
      });
    }
  }, [disconnect]);

  return {
    signInWithEthereum,
    signOutAndDisconnect,
    isSigningIn,
    isAuthenticated: !!hookAddress,
    isSessionLoading: false,
    session: null,
    status: hookAddress ? 'authenticated' : 'unauthenticated',
  };
}
