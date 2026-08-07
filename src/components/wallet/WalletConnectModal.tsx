'use client';

import { useConnect } from 'wagmi';
import { useSiweAuth } from '@/hooks/useSiweAuth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function WalletConnectModal({ onClose }: { onClose: () => void }) {
  const { connect, connectors } = useConnect();
  const { signInWithEthereum } = useSiweAuth();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null);

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleConnect = async (connector: any) => {
    setIsConnecting(true);
    setSelectedConnectorId(connector.id);

    try {
      if (typeof window !== 'undefined' && (window as any).ethereum && connector.id === 'injected') {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }],
          });
        } catch {}
      }

      await new Promise<void>((resolve, reject) => {
        connect(
          { connector },
          {
            onSuccess: () => resolve(),
            onError: (err) => reject(err),
          }
        );
      });

      // Let wagmi settle
      await new Promise(r => setTimeout(r, 500));

      // Auto-trigger SIWE
      const success = await signInWithEthereum();
      if (success) {
        onClose();
        router.push('/command-center');
      } else {
        setIsConnecting(false);
        setSelectedConnectorId(null);
      }
    } catch (e) {
      console.error('Connect failed:', e);
      setIsConnecting(false);
      setSelectedConnectorId(null);
    }
  };

  const getConnectorIcon = (id: string) => {
    switch (id) {
      case 'metaMask':
      case 'metaMaskSDK':
        return '🦊';
      case 'coinbaseWallet':
      case 'coinbaseWalletSDK':
        return '🔵';
      case 'safe':
        return '🛡️';
      case 'injected':
        return '🔌';
      default:
        return '💼';
    }
  };

  const getConnectorName = (connector: any) => {
    if (connector.id === 'injected') return 'Browser Wallet';
    return connector.name;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => !isConnecting && onClose()}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-sm bg-surface dark:bg-[#1E1E1E] rounded-2xl shadow-2xl border border-outline-variant/50 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low dark:bg-[#2A2A2A]">
          <h2 className="font-title-lg font-bold text-on-surface dark:text-white">Connect Wallet</h2>
          <button 
            onClick={onClose}
            disabled={isConnecting}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-highest hover:bg-surface-variant transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        
        <div className="p-6 flex flex-col gap-3">
          {connectors.map((connector) => {
            // Wagmi sometimes duplicates injected connectors, filter out to keep UI clean if needed. 
            // We'll just display them all for now, but rename 'injected' appropriately.
            
            const isSelected = selectedConnectorId === connector.id;
            
            return (
              <button
                key={connector.uid}
                onClick={() => handleConnect(connector)}
                disabled={isConnecting}
                className={`flex items-center gap-4 w-full p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container hover:border-outline-variant dark:bg-[#2A2A2A] dark:hover:bg-[#333]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-xl shrink-0">
                  {getConnectorIcon(connector.id)}
                </div>
                <div className="flex flex-col items-start flex-1 text-left">
                  <span className="font-body-md font-semibold text-on-surface dark:text-white">
                    {getConnectorName(connector)}
                  </span>
                  {isSelected && (
                    <span className="text-[11px] text-primary mt-0.5 animate-pulse">
                      Confirming in wallet...
                    </span>
                  )}
                </div>
                {isSelected && (
                  <span className="material-symbols-outlined text-primary animate-spin">progress_activity</span>
                )}
              </button>
            );
          })}
        </div>
        
        <div className="p-4 bg-surface-container-low dark:bg-[#252525] text-center">
          <p className="font-body-sm text-[12px] text-on-surface-variant dark:text-gray-400">
            By connecting a wallet, you agree to Sedge's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
