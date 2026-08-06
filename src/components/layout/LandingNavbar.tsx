'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LaunchAppButton } from '@/components/wallet/LaunchAppButton';

export function LandingNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full glass-panel border-b border-outline-variant/30 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/icons/sedge-logo.png" alt="Sedge Logo" className="w-10 h-10 md:w-14 md:h-14 object-contain" />
            <span className="font-headline-md font-bold text-on-surface text-xl">Sedge</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-body-sm text-on-surface-variant">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
            <Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link>
            <Link href="/whitepaper" className="hover:text-primary transition-colors">Whitepaper</Link>
          </div>
          <div className="flex items-center gap-4">
            <LaunchAppButton className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-label-md font-medium transition-colors hidden md:block border border-outline-variant px-4 py-2 rounded-full">
              Launch App
            </LaunchAppButton>
            <button 
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surface-container-low text-on-surface transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="material-symbols-outlined">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-md md:hidden flex flex-col p-6 overflow-y-auto">
          <div className="flex flex-col gap-6 text-lg font-medium">
            <a href="#features" className="text-on-surface hover:text-primary border-b border-outline-variant/30 pb-4" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="text-on-surface hover:text-primary border-b border-outline-variant/30 pb-4" onClick={() => setIsMobileMenuOpen(false)}>How it Works</a>
            <Link href="/docs" className="text-on-surface hover:text-primary border-b border-outline-variant/30 pb-4" onClick={() => setIsMobileMenuOpen(false)}>Documentation</Link>
            <Link href="/whitepaper" className="text-on-surface hover:text-primary border-b border-outline-variant/30 pb-4" onClick={() => setIsMobileMenuOpen(false)}>Whitepaper</Link>
          </div>
          <div className="mt-8 w-full flex justify-center">
            <div onClick={() => setIsMobileMenuOpen(false)} className="w-full">
              <LaunchAppButton className="w-full text-on-primary bg-primary font-label-md font-medium transition-colors px-4 py-3 rounded-full text-center flex justify-center items-center">
                Launch App
              </LaunchAppButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
