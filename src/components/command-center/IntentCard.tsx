'use client';

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
  if (!id) return 'Arc Testnet';
  return CHAIN_DISPLAY_NAMES[id] || `Chain ${id}`;
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function truncateHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

function FeeGrid({ estimation, intent }: { estimation?: EstimationData; intent: ParsedIntent }) {
  if (!estimation?.fees?.length && !estimation?.estimatedGas) return null;

  const totalFee = estimation.fees
    ?.reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0)
    .toFixed(6);
  const feeToken = estimation.fees?.[0]?.token || 'USDC';

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {totalFee && (
        <div className="bg-white/60 p-3 rounded-lg border border-outline-variant/30">
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Est. Fee</p>
          <p className="font-mono-data text-mono-data text-on-surface">
            {totalFee} {feeToken}
          </p>
        </div>
      )}
      <div className="bg-white/60 p-3 rounded-lg border border-outline-variant/30">
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Network</p>
        <p className="font-mono-data text-mono-data text-on-surface">
          {intent.type === 'bridge'
            ? `${getChainDisplayName(intent.fromChainId)} -> ${getChainDisplayName(intent.toChainId)}`
            : getChainDisplayName('chainId' in intent ? intent.chainId : undefined)}
        </p>
      </div>
    </div>
  );
}

function SwapCard({
  intent,
  estimation,
}: {
  intent: Extract<ParsedIntent, { type: 'swap' }>;
  estimation?: EstimationData;
}) {
  const receiveAmount = estimation?.estimatedOutput?.amount;

  return (
    <>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Pay</p>
            <p className="font-headline-md text-headline-md text-on-surface font-mono-data">{intent.amount}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">{intent.fromToken}</p>
          </div>
          <span className="material-symbols-outlined text-outline-variant text-3xl">arrow_right_alt</span>
          <div className="text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Receive</p>
            <p className="font-headline-md text-headline-md text-primary font-mono-data">
              {receiveAmount || '--'}
            </p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">{intent.toToken}</p>
          </div>
        </div>
      </div>
      <FeeGrid estimation={estimation} intent={intent} />
    </>
  );
}

function BridgeCard({
  intent,
  estimation,
}: {
  intent: Extract<ParsedIntent, { type: 'bridge' }>;
  estimation?: EstimationData;
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">From</p>
            <p className="font-headline-md text-headline-md text-on-surface font-mono-data">{intent.amount}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">{intent.token}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {getChainDisplayName(intent.fromChainId)}
            </p>
          </div>
          <span className="material-symbols-outlined text-outline-variant text-3xl">arrow_right_alt</span>
          <div className="text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">To</p>
            <p className="font-headline-md text-headline-md text-primary font-mono-data">{intent.amount}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">{intent.token}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {getChainDisplayName(intent.toChainId)}
            </p>
          </div>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-md border border-outline-variant/50 shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary-container"></span>
          <span className="font-label-caps text-label-caps text-on-surface">CCTP</span>
        </div>
      </div>
      <FeeGrid estimation={estimation} intent={intent} />
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
      <div className="mb-6 pb-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Send</p>
            <p className="font-headline-md text-headline-md text-on-surface font-mono-data">
              {intent.amount} <span className="text-on-surface-variant">{intent.token}</span>
            </p>
          </div>
          <span className="material-symbols-outlined text-outline-variant text-3xl">arrow_right_alt</span>
          <div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">To</p>
            <p className="font-mono-data text-mono-data text-primary" title={intent.recipientAddress}>
              {truncateAddress(intent.recipientAddress)}
            </p>
          </div>
        </div>
      </div>
      <FeeGrid estimation={estimation} intent={intent} />
    </>
  );
}

function BalanceCheckCard({ intent }: { intent: Extract<ParsedIntent, { type: 'balance_check' }> }) {
  return (
    <div className="mb-6 pb-4 border-b border-outline-variant/30">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-2xl">account_balance_wallet</span>
        <div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Balance Check</p>
          <p className="font-mono-data text-mono-data text-on-surface">
            {intent.token || 'All tokens'}
            {intent.chainId ? ` on ${getChainDisplayName(intent.chainId)}` : ' across all chains'}
          </p>
        </div>
      </div>
    </div>
  );
}

function RecurringCard({ intent }: { intent: Extract<ParsedIntent, { type: 'recurring_payment' }> }) {
  return (
    <>
      <div className="mb-6 pb-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Recurring Send</p>
            <p className="font-headline-md text-headline-md text-on-surface font-mono-data">
              {intent.amount} <span className="text-on-surface-variant">{intent.token}</span>
            </p>
          </div>
          <span className="material-symbols-outlined text-outline-variant text-3xl">arrow_right_alt</span>
          <div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">To</p>
            <p className="font-mono-data text-mono-data text-primary" title={intent.recipientAddress}>
              {truncateAddress(intent.recipientAddress)}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/60 p-3 rounded-lg border border-outline-variant/30">
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Frequency</p>
          <p className="font-mono-data text-mono-data text-on-surface capitalize">{intent.frequency}</p>
        </div>
        <div className="bg-white/60 p-3 rounded-lg border border-outline-variant/30">
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Network</p>
          <p className="font-mono-data text-mono-data text-on-surface">{getChainDisplayName(intent.chainId)}</p>
        </div>
        <div className="bg-white/60 p-3 rounded-lg border border-outline-variant/30">
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Type</p>
          <p className="font-mono-data text-mono-data text-on-surface">Recurring</p>
        </div>
      </div>
    </>
  );
}

function SuccessBanner({ execState }: { execState: IntentExecState }) {
  const { txHash, explorerUrl } = execState.execution || {};
  return (
    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200 mb-4">
      <span className="material-symbols-outlined text-emerald-600">check_circle</span>
      <div className="flex-1 min-w-0">
        <p className="font-body-sm text-body-sm text-emerald-800 font-medium">Transaction confirmed</p>
        {txHash && (
          <p className="font-mono-data text-mono-data text-emerald-600 truncate">{truncateHash(txHash)}</p>
        )}
      </div>
      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-3 py-1.5 rounded-md border border-emerald-300 bg-white text-emerald-700 font-body-sm font-medium hover:bg-emerald-50 transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          Explorer
        </a>
      )}
    </div>
  );
}

function ErrorBanner({ execState }: { execState: IntentExecState }) {
  const errorMsg = execState.execution?.error || 'Transaction failed';
  return (
    <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg border border-rose-200 mb-4">
      <span className="material-symbols-outlined text-rose-600">error</span>
      <p className="font-body-sm text-body-sm text-rose-800">{errorMsg}</p>
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
    swap: 'SWAP',
    bridge: 'BRIDGE',
    send: 'SEND',
    balance_check: 'BALANCE CHECK',
    recurring_payment: 'RECURRING PAYMENT',
  };

  const phase = execState?.phase || 'ready';
  const isBusy = phase === 'estimating' || phase === 'executing';
  const isDone = phase === 'success';
  const isError = phase === 'error';
  const canApprove = walletConnected && !isBusy && !isDone;

  return (
    <div
      className="ai-gradient-border bg-surface-container-lowest/50 backdrop-blur-sm p-6"
      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2 h-2 rounded-full ${isDone ? 'bg-emerald-500' : isError ? 'bg-rose-500' : 'bg-primary-container'}`}></span>
        <span className="font-label-caps text-label-caps text-on-surface-variant">
          {intentLabel[intent.type] || 'INTENT'}
        </span>
        {phase === 'estimating' && (
          <span className="font-body-sm text-body-sm text-on-surface-variant animate-pulse ml-auto">Estimating...</span>
        )}
        {phase === 'executing' && (
          <span className="font-body-sm text-body-sm text-primary animate-pulse ml-auto">Awaiting wallet...</span>
        )}
      </div>

      {isDone && <SuccessBanner execState={execState!} />}
      {isError && <ErrorBanner execState={execState!} />}

      {intent.type === 'swap' && <SwapCard intent={intent} estimation={execState?.estimation} />}
      {intent.type === 'bridge' && <BridgeCard intent={intent} estimation={execState?.estimation} />}
      {intent.type === 'send' && <SendCard intent={intent} estimation={execState?.estimation} />}
      {intent.type === 'balance_check' && <BalanceCheckCard intent={intent} />}
      {intent.type === 'recurring_payment' && <RecurringCard intent={intent} />}

      {!isDone && (
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onApprove}
            disabled={!canApprove}
            className="flex-1 bg-primary-container text-white py-2.5 rounded-lg font-body-sm font-medium hover:opacity-90 transition-colors shadow-sm flex justify-center items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isBusy ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                {phase === 'estimating' ? 'Estimating...' : 'Confirming...'}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                {!walletConnected
                  ? 'Connect Wallet'
                  : intent.type === 'balance_check'
                    ? 'Check Now'
                    : isError
                      ? 'Retry'
                      : 'Approve'}
              </>
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isBusy}
            className="p-2.5 rounded-lg border border-outline-variant bg-white text-error font-body-sm hover:bg-error-container/20 transition-colors shadow-sm flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
