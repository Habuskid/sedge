'use client';

import { useConnect } from 'wagmi';
import { useSiweAuth } from '@/hooks/useSiweAuth';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const WALLET_LIST = [
  { 
    id: 'metaMask',
    name: 'MetaMask', 
    matchIds: ['metaMask', 'metaMaskSDK', 'io.metamask'], 
    icon: '/icons/metamask.png' 
  },
  { 
    id: 'rabby',
    name: 'Rabby Wallet', 
    matchIds: ['rabby', 'io.rabby'], 
    icon: '/icons/rabby.png' 
  },
  { 
    id: 'okx',
    name: 'OKX Wallet', 
    matchIds: ['okx', 'com.okex.wallet'], 
    icon: '/icons/okx.png' 
  }
];

export function WalletConnectModal({ onClose }: { onClose: () => void }) {
  const { connectAsync, connectors } = useConnect();
  const { signInWithEthereum } = useSiweAuth();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const unifiedWallets = useMemo(() => {
    return WALLET_LIST.map((predefined) => {
      // Strictly match EIP-6963 IDs to prevent 'injected' hijacking (e.g., Rabby pretending to be MetaMask)
      const wagmiConnector = connectors.find(c => predefined.matchIds.includes(c.id));
      return {
        ...predefined,
        wagmiConnector,
        isInstalled: !!wagmiConnector,
      };
    });
  }, [connectors]);

  const handleWalletClick = async (wallet: any) => {
    setIsConnecting(true);
    setSelectedWalletId(wallet.id);

    try {
      let targetConnector = wallet.wagmiConnector;

      if (!targetConnector) {
        throw new Error(`${wallet.name} is not installed. Please install the extension.`);
      }

      if (typeof window !== 'undefined' && (window as any).ethereum && targetConnector.id === 'injected') {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }],
          });
        } catch {}
      }

      const result = await connectAsync({ connector: targetConnector });
      const address = result.accounts[0];

      await new Promise(r => setTimeout(r, 500));

      const success = await signInWithEthereum(address);
      if (success) {
        onClose();
        router.push('/command-center');
      } else {
        setIsConnecting(false);
        setSelectedWalletId(null);
      }
    } catch (e: any) {
      console.error('Connect failed:', e);
      toast.error('Connection Failed', { description: e?.message || 'Failed to connect to wallet. Check console for details.' });
      setIsConnecting(false);
      setSelectedWalletId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => !isConnecting && onClose()}
      />
      
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
        
        <div className="p-6 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
          {unifiedWallets.map((wallet) => {
            const isSelected = selectedWalletId === wallet.id;
            
            return (
              <button
                key={wallet.id}
                onClick={() => handleWalletClick(wallet)}
                disabled={isConnecting}
                className={`flex items-center gap-4 w-full p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container hover:border-outline-variant dark:bg-[#2A2A2A] dark:hover:bg-[#333]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-xl shrink-0 overflow-hidden bg-white/5 dark:bg-white/10">
                  {wallet.icon.includes('/') || wallet.icon.startsWith('http') || wallet.icon.startsWith('data:') ? (
                    <img src={wallet.icon} alt={wallet.name} className="w-7 h-7 object-contain rounded-md" />
                  ) : (
                    <span className="material-symbols-outlined text-[24px] text-primary">{wallet.icon}</span>
                  )}
                </div>
                <div className="flex flex-col items-start flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-body-md font-semibold text-on-surface dark:text-white">
                      {wallet.name}
                    </span>
                    {wallet.isInstalled && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary dark:text-primary-fixed border border-primary/20">
                        Installed
                      </span>
                    )}
                  </div>
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
