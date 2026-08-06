'use client';

import { useAccount, useConnect } from 'wagmi';
import { useRouter } from 'next/navigation';

export function LaunchAppButton({ className, children }: { className?: string, children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect({
    mutation: {
      onSuccess: () => {
        router.push('/command-center');
      }
    }
  });
  const router = useRouter();

  return (
    <button
      onClick={() => {
        if (isConnected) {
          router.push('/command-center');
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
