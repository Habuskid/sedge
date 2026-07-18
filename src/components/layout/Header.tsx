'use client';

import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton';

export function Header() {
  return (
    <header className="bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-xl sticky top-0 right-0 w-full z-40 border-b border-outline-variant dark:border-outline shadow-sm flex justify-between items-center h-16 px-margin-desktop md:pl-margin-desktop pl-4">
      <div className="flex items-center gap-4 flex-1">
        <div className="md:hidden">
          <img alt="Sedge Brand Logo" className="w-8 h-8 rounded-DEFAULT object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2D2sLa0tJyu9hZGtV5oZhvZmUgcYqkH3I-djhceSdyybf3fZK6Rq2m4aPCo7M_UovmdRI6sclI95y6B1rxqjIah1HadQnpLJX4Bfq0r4c4aFonNAmlEEQcnn6H9Z8IxSV2VoIp2gBls2WPp_uErKqDwClHdobxQ2hzep0pFhBFc3qFrbGUiJjd61QU5SAg4TN_F74bkBZFLzDXvDQGwL07pBvBrSA57eARfcMI-bvbuAzzAHgOq56"/>
        </div>
      </div>
      <div className="flex items-center gap-4 relative">
        <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <ConnectWalletButton />
      </div>
    </header>
  );
}
