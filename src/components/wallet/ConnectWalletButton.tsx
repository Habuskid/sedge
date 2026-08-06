'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState, useRef, useEffect } from 'react';

export function ConnectWalletButton() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isConnected && address) {
    const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg font-mono-data text-mono-data text-on-surface hover:bg-surface-container transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{truncated}</span>
          <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
        </button>
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg py-1 z-50">
            <div className="px-3 py-2 border-b border-outline-variant/50">
              <p className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Connected</p>
              <p className="font-mono-data text-[12px] text-on-surface mt-0.5 break-all">{address}</p>
            </div>
            <button
              onClick={() => {
                disconnect();
                document.cookie = 'wagmi.store=; Max-Age=0; path=/';
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 font-body-sm text-error hover:bg-error-container/20 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          const injectedConnector = connectors.find(c => c.id === 'injected');
          if (injectedConnector) {
            connect({ connector: injectedConnector });
          } else if (connectors.length > 0) {
            connect({ connector: connectors[0] });
          }
        }}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm"
      >
        <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
        Connect Wallet
      </button>
    </div>
  );
}
