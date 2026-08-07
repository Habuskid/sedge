'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { WalletConnectModal } from '@/components/wallet/WalletConnectModal';

interface WalletModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const WalletModalContext = createContext<WalletModalContextType | undefined>(undefined);

export function WalletModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <WalletModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
      {isOpen && <WalletConnectModal onClose={closeModal} />}
    </WalletModalContext.Provider>
  );
}

export function useWalletModal() {
  const context = useContext(WalletModalContext);
  if (context === undefined) {
    throw new Error('useWalletModal must be used within a WalletModalProvider');
  }
  return context;
}
