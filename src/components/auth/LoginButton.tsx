'use client';

import { useAccount, useSignMessage } from 'wagmi';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function LoginButton() {
  const { isConnected, address } = useAccount();
  const { data: session, status } = useSession();
  const { signMessageAsync } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  // Reset prompt state if they disconnect
  useEffect(() => {
    if (!isConnected) {
      setHasPrompted(false);
    }
  }, [isConnected]);

  const handleLogin = async () => {
    setIsLoading(true);
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
      } else {
        toast.success('Successfully authenticated', { description: 'Your session is now secure.' });
      }
    } catch (e: any) {
      toast.error('Signature rejected', { description: e?.message || 'You must sign the message to log in.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-prompt on connect
  useEffect(() => {
    if (isConnected && address && status === 'unauthenticated' && !hasPrompted && !isLoading) {
      setHasPrompted(true);
      handleLogin();
    }
  }, [isConnected, address, status, hasPrompted, isLoading]);

  // If they aren't connected to a wallet, don't show the login button
  if (!isConnected || !address) {
    return null;
  }

  // If they are connected to a wallet, but signed in with a DIFFERENT wallet, maybe warn them?
  // For now, if they are authenticated, we don't need to show any extra UI since ConnectWalletButton handles the connection display.
  if (status === 'authenticated') {
    return null;
  }

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
        isLoading 
          ? 'bg-primary/50 cursor-not-allowed text-white/70' 
          : 'bg-primary hover:bg-primary-hover text-white'
      }`}
    >
      {isLoading ? (
        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
      ) : (
        <span className="material-symbols-outlined text-sm">lock_open</span>
      )}
      {isLoading ? 'Signing...' : 'Sign In'}
    </button>
  );
}
