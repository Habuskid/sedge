import React, { useEffect, useState } from 'react';
import { type TransactionRecord } from '@/lib/transaction-store';

interface ModernReceiptModalProps {
  transaction: TransactionRecord | null;
  onClose: () => void;
}

export function ModernReceiptModal({ transaction, onClose }: ModernReceiptModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copiedId, setCopiedId] = useState<'hash' | 'uuid' | null>(null);

  useEffect(() => {
    if (transaction) {
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
      setCopiedId(null);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [transaction]);

  const handleCopy = (text: string, type: 'hash' | 'uuid') => {
    navigator.clipboard.writeText(text);
    setCopiedId(type);
    import('sonner').then((m) => m.toast.success(`Copied to clipboard`));
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!transaction) return null;

  const isSuccess = transaction.status === 'success';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Soft Blurred Backdrop */}
      <div
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
      />

      {/* Main Card Container (Reduced Size & Height) */}
      <div
        className={`relative w-full max-w-[340px] bg-white dark:bg-[#121212] rounded-[28px] shadow-2xl overflow-hidden transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
        }`}
      >
        <div className="px-5 py-6 flex flex-col items-center text-center">
          
          {/* Status Icon (Smaller) */}
          <div className="mb-4">
            <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center ${isSuccess ? 'bg-primary/10' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center ${isSuccess ? 'bg-primary' : 'bg-red-500'}`}>
                <span className="material-symbols-outlined text-white text-[20px] font-bold">
                  {isSuccess ? 'check' : 'close'}
                </span>
              </div>
            </div>
          </div>

          {/* Title & Subtitle */}
          <h2 className="font-display-sm text-[20px] font-semibold text-gray-900 dark:text-gray-100 tracking-tight leading-tight mb-1.5">
            {isSuccess ? 'Success! Transaction confirmed.' : 'Failed! Transaction could not complete.'}
          </h2>
          <p className="font-body-sm text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed max-w-[260px] mb-5">
            {transaction.type === 'recurring_payment' 
              ? 'Your recurring payment schedule has been created and will process on Arc Testnet.' 
              : `Your ${transaction.type} operation has been processed on Arc Testnet.`}
          </p>

          {/* Data Block (Tighter) */}
          <div className="w-full bg-[#F8F9FA] dark:bg-[#1E1E1E] rounded-[20px] p-4 flex flex-col gap-3">
            
            {/* Amount */}
            <div className="flex justify-between items-center">
              <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Amount</span>
              <span className="font-body-sm text-[13px] text-gray-900 dark:text-gray-100 font-medium">
                {transaction.amount} {transaction.token}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Date</span>
              <span className="font-body-sm text-[13px] text-gray-900 dark:text-gray-100 font-medium">
                {new Date(transaction.timestamp).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Time</span>
              <span className="font-body-sm text-[13px] text-gray-900 dark:text-gray-100 font-medium">
                {new Date(transaction.timestamp).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Network</span>
              <span className="font-body-sm text-[13px] text-gray-900 dark:text-gray-100 font-medium">
                ARC Testnet
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Internal Ref</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono-data text-[12px] text-gray-900 dark:text-gray-100 font-medium tracking-tight">
                  {transaction.id.slice(0, 8)}...{transaction.id.slice(-4)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(transaction.id, 'uuid');
                  }}
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copiedId === 'uuid' ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                Tx Hash
                {!transaction.txHash && <span className="text-[9px] text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-1 rounded">Pending</span>}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono-data text-[12px] text-gray-900 dark:text-gray-100 font-medium tracking-tight">
                  {transaction.txHash ? `${transaction.txHash.slice(0, 6)}...${transaction.txHash.slice(-4)}` : 'N/A'}
                </span>
                {transaction.txHash && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(transaction.txHash!, 'hash');
                    }}
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copiedId === 'hash' ? 'check' : 'content_copy'}
                    </span>
                  </button>
                )}
              </div>
            </div>
            
          </div>
          
          {/* Actions (Tighter) */}
          <div className="w-full mt-5 flex flex-col gap-2">
            {transaction.txHash ? (
              <a
                href={transaction.explorerUrl || `https://testnet.arcscan.app/tx/${transaction.txHash}`}
                target={transaction.type === 'recurring_payment' ? "_self" : "_blank"}
                rel="noopener noreferrer"
                className="w-full py-3 rounded-full font-body-sm font-medium bg-[#0A0D1D] hover:bg-[#1A1D2D] dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white transition-colors flex items-center justify-center gap-2"
              >
                {transaction.type === 'recurring_payment' ? 'View active schedules' : 'View on Explorer'}
              </a>
            ) : (
              <button
                disabled
                className="w-full py-3 rounded-full font-body-sm font-medium bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2"
              >
                Explorer Unavailable
              </button>
            )}
            
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="w-full py-3 rounded-full font-body-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Close Receipt
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
