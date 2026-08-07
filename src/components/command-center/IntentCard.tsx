import { useState, useEffect } from 'react';
import type { ParsedIntent, IntentExecState, EstimationData } from '@/types/intents';
import { CHAIN_DISPLAY_NAMES, CHAIN_EXPLORER_URLS } from '@/config/chains';

interface IntentCardProps {
  intent: ParsedIntent;
  execState?: IntentExecState;
  walletConnected?: boolean;
  onApprove?: () => void;
  onCancel?: () => void;
}

function getChainDisplayName(id?: number): string {
  if (!id) return 'ARC Testnet';
  return CHAIN_DISPLAY_NAMES[id] || `Chain ${id}`;
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}


function FeeGrid({ estimation, intent, isEstimating }: { estimation?: EstimationData; intent: ParsedIntent; isEstimating?: boolean }) {
  if (isEstimating) {
    return (
      <div className="w-full bg-[#F8F9FA] dark:bg-[#1E1E1E] rounded-[20px] p-4 flex flex-col gap-3 mt-4">
        <div className="flex justify-between items-center">
          <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Est. Network Fee</span>
          <div className="h-4 w-16 bg-surface-container-high rounded animate-pulse"></div>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Network</span>
          <div className="h-4 w-24 bg-surface-container-high rounded animate-pulse"></div>
        </div>
        {(intent.type === 'swap' || intent.type === 'bridge') && (
          <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-800">
            <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Route</span>
            <div className="h-4 w-20 bg-surface-container-high rounded animate-pulse"></div>
          </div>
        )}
      </div>
    );
  }

  if (!estimation?.fees?.length && !estimation?.estimatedGas) return null;

  const totalFee = estimation.fees
    ?.reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0)
    .toFixed(6);
  const feeToken = estimation.fees?.[0]?.token || 'USDC';

  return (
    <div className="w-full bg-[#F8F9FA] dark:bg-[#1E1E1E] rounded-[20px] p-4 flex flex-col gap-3 mt-4 transition-all duration-300">
      {totalFee && (
        <div className="flex justify-between items-center">
          <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Est. Network Fee</span>
          <span className="font-body-sm text-[13px] text-gray-900 dark:text-gray-100 font-medium">
            {totalFee} {feeToken}
          </span>
        </div>
      )}
      <div className="flex justify-between items-center">
        <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Network</span>
        <span className="font-body-sm text-[13px] text-gray-900 dark:text-gray-100 font-medium">
          {intent.type === 'bridge'
            ? `${getChainDisplayName(intent.fromChainId)} → ${getChainDisplayName(intent.toChainId)}`
            : getChainDisplayName('chainId' in intent ? intent.chainId : undefined)}
        </span>
      </div>
      {intent.type === 'swap' && (
        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-800">
          <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Route</span>
          <span className="font-body-sm text-[13px] text-primary font-medium flex items-center gap-1">
            Circle App Kit
            <span className="material-symbols-outlined text-[14px]">route</span>
          </span>
        </div>
      )}
      {intent.type === 'bridge' && (
        <div className="flex flex-col gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Protocol</span>
            <span className="font-body-sm text-[13px] text-primary font-medium flex items-center gap-1">
              Circle CCTP
              <span className="material-symbols-outlined text-[14px]">route</span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Process</span>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded">Burn (Source)</span>
              <span className="material-symbols-outlined text-[12px] text-gray-400">arrow_forward</span>
              <span className="text-[11px] font-medium bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">Mint (Dest)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SwapCard({
  intent,
  phase,
  estimation,
}: {
  intent: Extract<ParsedIntent, { type: 'swap' }>;
  phase: string;
  estimation?: EstimationData;
}) {
  const receiveAmount = estimation?.estimatedOutput?.amount;
  const isEstimating = phase === 'estimating';

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <div className="flex flex-col gap-1 w-[40%]">
          <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Pay</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display-sm text-[24px] font-semibold text-gray-900 dark:text-gray-100 tracking-tight truncate">{intent.amount}</span>
            <span className="font-body-sm text-[14px] text-primary font-medium">{intent.fromToken}</span>
          </div>
        </div>
        
        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-[#1A1A1A] flex items-center justify-center border border-gray-100 dark:border-gray-800 shrink-0 relative overflow-hidden">
          {isEstimating ? (
            <span className="material-symbols-outlined text-[16px] text-primary animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-[18px] text-gray-400">arrow_forward</span>
          )}
        </div>

        <div className="flex flex-col gap-1 text-right w-[40%] items-end">
          <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Receive (Est)</span>
          <div className="flex items-baseline justify-end gap-1.5 w-full">
            {isEstimating ? (
              <div className="h-8 w-20 bg-surface-container-high rounded animate-pulse mt-0.5"></div>
            ) : (
              <span className="font-display-sm text-[24px] font-semibold text-gray-900 dark:text-gray-100 tracking-tight truncate">{receiveAmount || '--'}</span>
            )}
            <span className="font-body-sm text-[14px] text-primary font-medium shrink-0">{intent.toToken}</span>
          </div>
        </div>
      </div>
      <div className="px-5 pb-5">
        <FeeGrid estimation={estimation} intent={intent} isEstimating={isEstimating} />
      </div>
    </>
  );
}

function BridgeCard({
  intent,
  phase,
  estimation,
}: {
  intent: Extract<ParsedIntent, { type: 'bridge' }>;
  phase: string;
  estimation?: EstimationData;
}) {
  const isEstimating = phase === 'estimating';
  const isExecuting = phase === 'executing';
  const [bridgeStep, setBridgeStep] = useState(0);

  // Live simulation of CCTP bridge steps
  useEffect(() => {
    if (isExecuting) {
      setBridgeStep(1); // Approving
      const t1 = setTimeout(() => setBridgeStep(2), 2000);  // Burning
      const t2 = setTimeout(() => setBridgeStep(3), 8000);  // Attesting
      const t3 = setTimeout(() => setBridgeStep(4), 16000); // Minting
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    } else {
      setBridgeStep(0);
    }
  }, [isExecuting]);

  return (
    <>
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <div className="flex flex-col gap-1 w-[40%]">
          <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Bridge</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display-sm text-[24px] font-semibold text-gray-900 dark:text-gray-100 tracking-tight truncate">{intent.amount}</span>
            <span className="font-body-sm text-[14px] text-primary font-medium">{intent.token}</span>
          </div>
          <span className="font-body-sm text-[11px] text-gray-400">{getChainDisplayName(intent.fromChainId)}</span>
        </div>
        
        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-[#1A1A1A] flex items-center justify-center border border-gray-100 dark:border-gray-800 shrink-0 relative overflow-hidden">
          {isEstimating || isExecuting ? (
            <span className="material-symbols-outlined text-[16px] text-primary animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-[18px] text-gray-400">flight_takeoff</span>
          )}
          <div className="absolute -bottom-3 text-[9px] font-bold text-primary tracking-wider bg-white dark:bg-[#121212] px-1 rounded">CCTP</div>
        </div>

        <div className="flex flex-col gap-1 text-right w-[40%] items-end">
          <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Receive</span>
          <div className="flex items-baseline justify-end gap-1.5 w-full">
            {isEstimating ? (
              <div className="h-8 w-20 bg-surface-container-high rounded animate-pulse mt-0.5"></div>
            ) : (
              <span className="font-display-sm text-[24px] font-semibold text-gray-900 dark:text-gray-100 tracking-tight truncate">{intent.amount}</span>
            )}
            <span className="font-body-sm text-[14px] text-primary font-medium shrink-0">{intent.token}</span>
          </div>
          <span className="font-body-sm text-[11px] text-gray-400">{getChainDisplayName(intent.toChainId)}</span>
        </div>
      </div>
      
      <div className="px-4 pb-4">
        <div className="w-full bg-[#F8F9FA] dark:bg-[#1E1E1E] rounded-[16px] p-3 flex flex-col gap-2 mt-2 transition-all duration-300">
          {!isEstimating && estimation?.fees && (
            <div className="flex justify-between items-center">
              <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Est. Network Fee</span>
              <span className="font-body-sm text-[13px] text-gray-900 dark:text-gray-100 font-medium">
                {estimation.fees.reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0).toFixed(6)} {estimation.fees[0]?.token || 'USDC'}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Network</span>
            <span className="font-body-sm text-[13px] text-gray-900 dark:text-gray-100 font-medium">
              {getChainDisplayName(intent.fromChainId)} → {getChainDisplayName(intent.toChainId)}
            </span>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center">
              <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Protocol</span>
              <span className="font-body-sm text-[13px] text-primary font-medium flex items-center gap-1">
                Circle CCTP
                <span className="material-symbols-outlined text-[14px]">route</span>
              </span>
            </div>
            
            {/* Live Simulation / Static Process */}
            <div className="mt-1 bg-white dark:bg-[#121212] rounded-xl p-2.5 border border-outline-variant/30 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                {isExecuting ? 'Live Simulation' : 'Bridge Process'}
              </span>
              {[
                { id: 1, label: 'Approve USDC' },
                { id: 2, label: 'Burn on Source Chain' },
                { id: 3, label: 'Circle Attestation' },
                { id: 4, label: 'Mint on Destination' },
              ].map((step) => {
                const isActive = isExecuting && bridgeStep === step.id;
                const isPast = (isExecuting && bridgeStep > step.id) || phase === 'success';
                return (
                  <div key={step.id} className="flex items-center gap-1.5">
                    {isPast ? (
                      <span className="material-symbols-outlined text-[14px] text-black dark:text-white">check_circle</span>
                    ) : isActive ? (
                      <span className="material-symbols-outlined text-[14px] text-black dark:text-white animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[14px] text-gray-300 dark:text-gray-700">radio_button_unchecked</span>
                    )}
                    <span className={`text-[12px] ${isActive ? 'text-black dark:text-white font-medium' : isPast ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SendCard({
  intent,
  estimation,
}: {
  intent: Extract<ParsedIntent, { type: 'send' }>;
  estimation?: EstimationData;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <div className="flex flex-col gap-1">
          <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Send</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display-sm text-[24px] font-semibold text-gray-900 dark:text-gray-100 tracking-tight">{intent.amount}</span>
            <span className="font-body-sm text-[14px] text-primary font-medium">{intent.token}</span>
          </div>
        </div>
        
        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-[#1A1A1A] flex items-center justify-center border border-gray-100 dark:border-gray-800">
          <span className="material-symbols-outlined text-[18px] text-gray-400">arrow_forward</span>
        </div>

        <div className="flex flex-col gap-1 text-right">
          <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">To Address</span>
          <span className="font-mono-data text-[13px] text-gray-900 dark:text-gray-100 font-medium mt-1">
            {truncateAddress(intent.recipientAddress)}
          </span>
        </div>
      </div>
      <div className="px-5 pb-5">
        <FeeGrid estimation={estimation} intent={intent} />
      </div>
    </>
  );
}

function BalanceCheckCard({ intent }: { intent: Extract<ParsedIntent, { type: 'balance_check' }> }) {
  return (
    <div className="px-5 py-5">
      <div className="w-full bg-[#F8F9FA] dark:bg-[#1E1E1E] rounded-[20px] p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
             <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
          </div>
          <div>
            <span className="font-body-sm text-[14px] text-gray-900 dark:text-gray-100 font-medium block">Balance Query</span>
            <span className="font-body-sm text-[12px] text-gray-500">Checking current holdings</span>
          </div>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-800">
          <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Asset</span>
          <span className="font-body-sm text-[13px] text-gray-900 dark:text-gray-100 font-medium">
            {intent.token || 'All tokens'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Network</span>
          <span className="font-body-sm text-[13px] text-gray-900 dark:text-gray-100 font-medium">
            {intent.chainId ? getChainDisplayName(intent.chainId) : 'All networks'}
          </span>
        </div>
      </div>
    </div>
  );
}

function RecurringCard({ intent }: { intent: Extract<ParsedIntent, { type: 'recurring_payment' }> }) {
  return (
    <div className="px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1">
          <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Recurring Send</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display-sm text-[24px] font-semibold text-gray-900 dark:text-gray-100 tracking-tight">{intent.amount}</span>
            <span className="font-body-sm text-[14px] text-primary font-medium">{intent.token}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">To</span>
          <p className="font-mono-data text-[13px] text-gray-900 dark:text-gray-100 font-medium mt-1">
            {truncateAddress(intent.recipientAddress)}
          </p>
        </div>
      </div>
      
      <div className="w-full bg-[#F8F9FA] dark:bg-[#1E1E1E] rounded-[20px] p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Frequency</span>
          <span className="font-body-sm text-[13px] text-gray-900 dark:text-gray-100 font-medium capitalize">
            {intent.frequency}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-body-sm text-[12px] text-gray-500 dark:text-gray-400 font-medium">Network</span>
          <span className="font-body-sm text-[13px] text-gray-900 dark:text-gray-100 font-medium">
            {getChainDisplayName(intent.chainId)}
          </span>
        </div>
      </div>
    </div>
  );
}

function SuccessScreen({ execState, intent, onDone }: { execState: IntentExecState; intent: ParsedIntent; onDone?: () => void }) {
  const [showReceipt, setShowReceipt] = useState(false);
  const { explorerUrl, txHash } = execState.execution || {};

  const titles: Record<string, string> = {
    swap: 'Swapped',
    bridge: 'Bridged',
    send: 'Sent',
    recurring_payment: 'Recurring Payment Setup',
    balance_check: 'Checked',
  };

  const title = titles[intent.type] || 'Successful';

  if (showReceipt) {
    return (
      <div className="flex flex-col p-6 bg-white dark:bg-[#121212] w-full">
        <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
          <h2 className="font-display-sm text-[20px] font-semibold text-gray-900 dark:text-gray-100">Transaction Receipt</h2>
          <button onClick={() => setShowReceipt(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-4 font-body-sm text-[14px] text-gray-600 dark:text-gray-400">
          <div className="flex justify-between items-center bg-[#F8F9FA] dark:bg-[#1E1E1E] p-4 rounded-[16px]">
            <span className="font-medium">Status</span>
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full text-[12px]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Confirmed
            </div>
          </div>
          
          <div className="flex justify-between items-center px-2">
            <span>Action</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium capitalize">{title}</span>
          </div>
          
          {'amount' in intent && (
            <div className="flex justify-between items-center px-2">
              <span>Amount</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">{intent.amount} {'token' in intent ? intent.token : (intent as any).fromToken}</span>
            </div>
          )}

          {txHash && (
            <div className="flex flex-col gap-1.5 mt-4">
              <span className="px-2">Transaction Hash</span>
              <div className="flex items-center justify-between gap-2 bg-[#F8F9FA] dark:bg-[#1E1E1E] p-3 rounded-[16px] break-all text-xs font-mono text-gray-900 dark:text-gray-100 border border-outline-variant/20">
                <span className="truncate">{txHash}</span>
                {explorerUrl && (
                  <a href={explorerUrl} target="_blank" rel="noreferrer" title="View on Explorer" className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-[#2A2A2A] shadow-sm hover:scale-105 transition-transform text-primary">
                     <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <button onClick={onDone} className="w-full bg-[#1A1A1A] hover:bg-[#2A2A2A] dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white py-3.5 rounded-full font-body-sm font-medium transition-colors">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-[#121212]">
      <style>{`
        @keyframes scaleInBadge {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes drawCheck {
          0% { stroke-dasharray: 100; stroke-dashoffset: 100; opacity: 0; }
          10% { opacity: 1; }
          100% { stroke-dasharray: 100; stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes tickPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .animate-badge-pop {
          animation: scaleInBadge 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .animate-check-draw {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          opacity: 0;
          animation: 
            drawCheck 0.4s ease-out 0.2s forwards,
            tickPulse 2s ease-in-out 0.6s infinite;
        }
      `}</style>
      
      {/* Animated Checkmark Seal */}
      <div className="relative mb-6 animate-badge-pop w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
        <svg viewBox="0 0 24 24" className="w-12 h-12 text-white stroke-[3.5] fill-none animate-check-draw">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M5 12l5 5L20 7" />
        </svg>
      </div>

      <h2 className="font-display-md text-[28px] font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h2>
      <p className="font-body-md text-[15px] text-gray-500 text-center mb-8">
        Your transaction is successfully confirmed.
      </p>

      <button
        onClick={onDone}
        className="w-full bg-[#1A1A1A] hover:bg-[#2A2A2A] dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white rounded-full py-4 font-body-md font-medium transition-colors mb-4"
      >
        Done
      </button>

      <button
        onClick={() => setShowReceipt(true)}
        className="font-body-sm text-[13px] text-primary hover:underline"
      >
        View Receipt
      </button>
    </div>
  );
}

function ErrorBanner({ execState }: { execState: IntentExecState }) {
  const errorMsg = execState.execution?.error || 'Transaction failed';
  return (
    <div className="mx-5 mb-5 p-4 bg-red-50 dark:bg-red-900/10 rounded-[20px] border border-red-100 dark:border-red-800/30 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-800/30 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-red-600 dark:text-red-400">error</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body-sm text-[14px] text-red-800 dark:text-red-300 font-semibold mb-0.5">Failed</p>
        <p className="font-body-sm text-[12px] text-red-600/80 dark:text-red-400/80 truncate" title={errorMsg}>
          {errorMsg}
        </p>
      </div>
    </div>
  );
}

export default function IntentCard({
  intent,
  execState,
  walletConnected = false,
  onApprove,
  onCancel,
}: IntentCardProps) {
  const intentLabel: Record<string, string> = {
    swap: 'Swap Action',
    bridge: 'Bridge Action',
    send: 'Send Action',
    balance_check: 'Balance Query',
    recurring_payment: 'Recurring Schedule',
  };

  const phase = execState?.phase || 'ready';
  const isBusy = phase === 'estimating' || phase === 'executing';
  const isDone = phase === 'success';
  const isError = phase === 'error';
  const canApprove = walletConnected && !isBusy && !isDone;

  if (isDone) {
    return (
      <div className="w-full max-w-[400px] glass-card rounded-[28px] shadow-xl overflow-hidden flex flex-col border border-outline-variant/30 transition-all duration-500 animate-in fade-in zoom-in-95">
        <SuccessScreen execState={execState!} intent={intent} onDone={onCancel} />
      </div>
    );
  }

  return (
    <div className={`w-full max-w-[400px] glass-card rounded-[28px] shadow-xl overflow-hidden flex flex-col border border-outline-variant/30 relative transition-all duration-500 ${phase === 'estimating' ? 'ring-1 ring-primary/20 shadow-primary/5' : ''}`}>
      {/* Shimmer effect when estimating */}
      {phase === 'estimating' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none z-0"></div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 dark:border-gray-800/50 relative z-10">
        <div className={`w-2.5 h-2.5 rounded-full ${isError ? 'bg-red-500' : 'bg-primary animate-pulse'}`}></div>
        <span className="font-body-sm text-[13px] text-gray-900 dark:text-gray-100 font-medium">
          {intentLabel[intent.type] || 'Action Intent'}
        </span>
        
        {phase === 'estimating' && (
          <span className="font-body-sm text-[12px] text-primary ml-auto flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>Simulating...</span>
        )}
        {phase === 'executing' && (
          <span className="font-body-sm text-[12px] text-primary ml-auto font-medium">Awaiting wallet...</span>
        )}
      </div>

      {/* Body Content */}
      <div className="flex flex-col relative z-10 transition-all duration-300">
        {intent.type === 'swap' && <SwapCard intent={intent} phase={phase} estimation={execState?.estimation} />}
        {intent.type === 'bridge' && <BridgeCard intent={intent} phase={phase} estimation={execState?.estimation} />}
        {intent.type === 'send' && <SendCard intent={intent} estimation={execState?.estimation} />}
        {intent.type === 'balance_check' && <BalanceCheckCard intent={intent} />}
        {intent.type === 'recurring_payment' && <RecurringCard intent={intent} />}

        {isError && <ErrorBanner execState={execState!} />}
      </div>

      {/* Action Footer */}
      <div className="px-5 pb-5 pt-1 flex gap-2 relative z-10">
        <button
          onClick={onCancel}
          disabled={isBusy}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#1A1A1A] dark:hover:bg-[#2A2A2A] text-gray-500 dark:text-gray-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          title="Cancel"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
        
        <button
          onClick={onApprove}
          disabled={!canApprove}
          className="flex-1 bg-[#0A0D1D] hover:bg-[#1A1D2D] dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white rounded-full font-body-sm font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isBusy ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              {phase === 'estimating' ? 'Estimating...' : 'Confirming...'}
            </>
          ) : (
            <>
              {!walletConnected
                ? 'Connect Wallet'
                : intent.type === 'balance_check'
                  ? 'Check Balance'
                  : isError
                    ? 'Retry Transaction'
                    : 'Approve & Execute'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
