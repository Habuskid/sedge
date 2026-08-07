'use client';

import { useAccount } from 'wagmi';
import { ReactNode, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSiweAuth } from '@/hooks/useSiweAuth';

export function WalletGate({ children }: { children: ReactNode }) {
  const { isConnected, isConnecting, isReconnecting } = useAccount();
  const { isAuthenticated, isSessionLoading, signInWithEthereum, isSigningIn } = useSiweAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const hasAutoSigned = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to landing if wallet disconnects
  useEffect(() => {
    if (mounted && !isConnecting && !isReconnecting && !isConnected) {
      router.replace('/');
    }
  }, [mounted, isConnecting, isReconnecting, isConnected, router]);

  // Auto-trigger SIWE if wallet is connected but session is missing (e.g. page refresh)
  useEffect(() => {
    if (
      mounted &&
      isConnected &&
      !isConnecting &&
      !isReconnecting &&
      !isAuthenticated &&
      !isSessionLoading &&
      !isSigningIn &&
      !hasAutoSigned.current
    ) {
      hasAutoSigned.current = true;
      signInWithEthereum();
    }
  }, [mounted, isConnected, isConnecting, isReconnecting, isAuthenticated, isSessionLoading, isSigningIn, signInWithEthereum]);

  // Reset auto-sign flag if wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      hasAutoSigned.current = false;
    }
  }, [isConnected]);

  // Show skeleton while resolving state
  if (!mounted || isConnecting || isReconnecting || !isConnected) {
    return (
      <div className="w-full h-full space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
        {/* Top Header Skeleton */}
        <div className="bg-surface-container-low/50 animate-pulse rounded-[20px] p-5 flex items-start gap-4 shadow-sm border border-outline-variant/30">
          <div className="w-12 h-12 bg-surface-container/80 rounded-full shrink-0"></div>
          <div className="space-y-3 w-full mt-1.5">
            <div className="h-4 bg-surface-container/80 rounded w-1/4"></div>
            <div className="h-3 bg-surface-container/80 rounded w-2/3"></div>
          </div>
        </div>

        {/* Bento Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(280px,auto)]">
          {/* Main Large Card */}
          <div className="glass-card animate-pulse rounded-[24px] p-6 md:col-span-8 shadow-sm flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="h-5 bg-surface-container/80 rounded w-1/3"></div>
              <div className="w-6 h-6 bg-surface-container/80 rounded-full"></div>
            </div>
            <div className="h-14 bg-surface-container/80 rounded w-1/2 mb-auto relative z-10"></div>
            <div className="h-40 bg-surface-container/60 rounded-xl w-full mt-8 relative z-10"></div>
          </div>

          {/* Side Card */}
          <div className="bg-white/40 border border-outline-variant/30 animate-pulse rounded-[24px] p-6 md:col-span-4 shadow-sm flex flex-col items-center justify-center">
            <div className="w-full flex justify-between items-center mb-auto">
              <div className="h-4 bg-surface-container/80 rounded w-2/5"></div>
              <div className="w-5 h-5 bg-surface-container/80 rounded"></div>
            </div>
            <div className="w-40 h-40 bg-surface-container/80 rounded-full mt-6"></div>
            <div className="w-full space-y-3 mt-auto pt-8">
              <div className="flex justify-between items-center">
                 <div className="h-3 bg-surface-container/80 rounded w-1/3"></div>
                 <div className="h-3 bg-surface-container/80 rounded w-1/4"></div>
              </div>
              <div className="flex justify-between items-center">
                 <div className="h-3 bg-surface-container/80 rounded w-1/3"></div>
                 <div className="h-3 bg-surface-container/80 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom List Skeleton */}
        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-[24px] p-6 shadow-sm overflow-hidden">
          <div className="h-5 bg-surface-container/80 rounded w-1/4 mb-6"></div>
          <div className="space-y-5 w-full">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <div className="flex gap-4 items-center w-1/2">
                   <div className="w-10 h-10 bg-surface-container/80 rounded-full"></div>
                   <div className="space-y-2 w-full">
                     <div className="h-3 bg-surface-container/80 rounded w-1/2"></div>
                     <div className="h-2.5 bg-surface-container/80 rounded w-1/3"></div>
                   </div>
                </div>
                <div className="h-4 bg-surface-container/80 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
