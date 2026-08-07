'use client';

import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Shared SIWE (Sign-In with Ethereum) authentication hook.
 *
 * Handles the full flow: construct message → wallet signature → NextAuth signIn.
 * Used by LaunchAppButton, ConnectWalletButton, and WalletGate.
 */
export function useSiweAuth() {
  const { address, isConnected } = useAccount();
  const { data: session, status } = useSession();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const signInWithEthereum = useCallback(async (): Promise<boolean> => {
    if (!address) return false;

    setIsSigningIn(true);
    try {
      const message = `Sign into Sedge: ${address}`;
      const signature = await signMessageAsync({ message });

      const res = await signIn('credentials', {
        message,
        signature,
        redirect: false,
      });

      if (res?.error) {
        toast.error('Authentication Failed', { description: res.error });
        // Disconnect wallet if SIWE fails — don't allow unauthenticated access
        disconnect();
        return false;
      }

      toast.success('Welcome to Sedge', { description: 'Wallet authenticated successfully.' });
      return true;
    } catch (e: any) {
      // User rejected the signature or something went wrong
      toast.error('Signature rejected', {
        description: 'You must sign the message to access the app.',
      });
      // Disconnect wallet since they rejected auth
      disconnect();
      return false;
    } finally {
      setIsSigningIn(false);
    }
  }, [address, signMessageAsync, disconnect]);

  const signOutAndDisconnect = useCallback(async () => {
    try {
      await signOut({ redirect: false });
    } catch {}
    disconnect();

    // Clear wagmi cached state
    if (typeof window !== 'undefined') {
      document.cookie = 'wagmi.store=; Max-Age=0; path=/';
      Object.keys(localStorage).forEach(key => {
        if (key.toLowerCase().includes('wagmi') || key.toLowerCase().includes('wallet')) {
          localStorage.removeItem(key);
        }
      });

      try {
        if ((window as any).ethereum) {
          await (window as any).ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }],
          });
        }
      } catch {}
    }
  }, [disconnect]);

  return {
    signInWithEthereum,
    signOutAndDisconnect,
    isSigningIn,
    isAuthenticated: status === 'authenticated',
    isSessionLoading: status === 'loading',
    session,
    status,
  };
}
