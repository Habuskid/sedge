'use client';

import { Toaster } from 'sonner';

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster 
        position="top-right" 
        toastOptions={{
          classNames: {
            toast: 'bg-surface-container border border-outline-variant text-on-surface font-body-sm shadow-md',
            description: 'text-on-surface-variant font-body-sm',
            success: 'border-l-4 border-l-primary',
            error: 'border-l-4 border-l-error text-error',
          }
        }}
      />
    </>
  );
}
