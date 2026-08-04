'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Currency = 'USD' | 'EUR' | 'GBP';

export function getCurrencySymbol(currency: Currency): string {
  switch (currency) {
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'USD': default: return '$';
  }
}

interface SettingsContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const storedCurrency = localStorage.getItem('sedge-currency') as Currency;
      if (storedCurrency) setCurrency(storedCurrency);

      const storedNotifs = localStorage.getItem('sedge-notifications');
      if (storedNotifs !== null) setNotificationsEnabled(storedNotifs === 'true');
    } catch (e) {
      console.error('Failed to load settings', e);
    }
    setMounted(true);
  }, []);

  // Save changes & apply theme
  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem('sedge-currency', currency);
    localStorage.setItem('sedge-notifications', String(notificationsEnabled));
  }, [currency, notificationsEnabled, mounted]);

  if (!mounted) {
    return null; 
  }

  return (
    <SettingsContext.Provider value={{ currency, setCurrency, notificationsEnabled, setNotificationsEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
