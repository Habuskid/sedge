'use client';

import { useAccount, useConnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function LaunchAppButton({ className, children }: { className?: string, children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);

  return (
    <button
      onClick={() => {
        if (isConnected) {
          router.push('/dashboard');
        } else {
          const injectedConnector = connectors.find(c => c.id === 'injected');
          if (injectedConnector) {
            connect({ connector: injectedConnector });
          } else if (connectors.length > 0) {
            connect({ connector: connectors[0] });
          }
        }
      }}
      className={className}
    >
      {children}
    </button>
  );
}
