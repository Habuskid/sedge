import React, { useEffect } from 'react';

export function ReceiptModal({ activity, onClose }: { activity: any, onClose: () => void }) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!activity) return null;

  const isFailed = activity.status === 'FAILED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-surface-container-highest/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Card - Designed like a modern digital slip */}
      <div className="relative w-full max-w-xs bg-surface-container-lowest rounded-[20px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Dark Premium Header */}
        <div className="bg-surface-container-highest p-5 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
          
          <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border shadow-inner ${isFailed ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' : 'bg-primary/20 text-primary border-primary/30'}`}>
            <span className="material-symbols-outlined text-[20px]">{isFailed ? 'error' : 'check'}</span>
          </div>
          
          <h2 className="font-title-lg text-title-lg tracking-tight text-on-surface mb-0.5">SEDGE</h2>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Transaction Slip</p>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Amount Area */}
          <div className="text-center mb-6">
            <p className="text-xs text-on-surface-variant mb-1">{isFailed ? 'Amount Attempted' : 'Amount Settled'}</p>
            <div className="text-3xl text-on-surface font-medium leading-none">
              {activity.amount ? `${activity.amount.toFixed(4)}` : 'N/A'}
              {activity.token && <span className="text-primary text-xl ml-1">{activity.token}</span>}
            </div>
            <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded border border-outline-variant/50 ${isFailed ? 'text-orange-500' : 'text-primary'}`}>
              <span className="material-symbols-outlined text-[14px]">{isFailed ? 'cancel' : 'verified'}</span>
              <span className="text-[10px] font-medium text-on-surface uppercase tracking-wider">{isFailed ? 'Transaction Failed' : 'Settled On-Chain'}</span>
            </div>
          </div>

          {/* Details Grid (Bento style) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
              <span className="text-xs text-on-surface-variant">Date & Time</span>
              <span className="text-xs font-medium text-on-surface text-right">
                {new Date(activity.createdAt).toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
              <span className="text-xs text-on-surface-variant">Type</span>
              <span className="text-xs font-medium text-on-surface text-right capitalize">
                {activity.operation?.includes('Recurring Payment to') ? 'Recurring Payment' : (activity.operation || 'Transaction')}
              </span>
            </div>

            {activity.operation?.includes('Recurring Payment to') && (
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
                <span className="text-xs text-on-surface-variant">Destination</span>
                <span className="text-[10px] font-mono-data font-medium text-on-surface text-right truncate pl-4">
                  {activity.operation.split('to ')[1]}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
              <span className="text-xs text-on-surface-variant">Blockchain</span>
              <span className="text-xs font-medium text-on-surface text-right">
                {activity.network || 'Arc'}
              </span>
            </div>

            <div className="pt-1">
              <span className="text-xs text-on-surface-variant block mb-1">Transaction {activity.transactionHash?.startsWith('0x') ? 'Hash' : 'ID'}</span>
              <div className="flex items-center justify-between bg-surface-container-low p-2 rounded-md border border-outline-variant/50">
                <span className="font-mono-data text-[10px] text-on-surface truncate pr-2">
                  {activity.transactionHash}
                </span>
                <a 
                  href={`https://testnet.arcscan.app/tx/${activity.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 w-5 h-5 flex items-center justify-center rounded bg-surface-container-high hover:bg-surface-container-highest text-primary transition-colors"
                  title="View on Explorer"
                >
                  <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-surface-container-low px-5 py-3 border-t border-outline-variant/50 text-center">
          <div className="flex items-center justify-center gap-1 mb-1 text-on-surface">
            <span className="material-symbols-outlined text-[12px]">lock</span>
            <span className="text-[10px] font-medium">Powered by Circle Smart Contracts</span>
          </div>
        </div>

      </div>
    </div>
  );
}
