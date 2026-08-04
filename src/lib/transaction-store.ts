import type { ParsedIntent } from '@/types/intents';

export interface TransactionRecord {
  id: string;
  type: 'swap' | 'bridge' | 'send' | 'recurring_payment';
  txHash?: string;
  explorerUrl?: string;
  chainId: number;
  timestamp: number;
  status: 'success' | 'error';
  amount: string;
  token: string;
  description: string;
}

const STORAGE_KEY = 'sedge_transactions';

export function saveTransaction(record: TransactionRecord): void {
  const existing = getTransactions();
  existing.unshift(record);
  if (existing.length > 100) existing.length = 100;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // localStorage may be unavailable or full
  }
}

export function getTransactions(): TransactionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function buildTransactionRecord(
  intent: ParsedIntent,
  txHash?: string,
  explorerUrl?: string,
  error?: string,
): TransactionRecord {
  const base = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    txHash,
    explorerUrl,
    status: error ? 'error' as const : 'success' as const,
  };

  switch (intent.type) {
    case 'swap':
      return {
        ...base,
        type: 'swap',
        chainId: intent.chainId || 5042002,
        amount: intent.amount,
        token: intent.fromToken,
        description: `Swap ${intent.amount} ${intent.fromToken} to ${intent.toToken}`,
      };
    case 'bridge':
      return {
        ...base,
        type: 'bridge',
        chainId: intent.fromChainId,
        amount: intent.amount,
        token: intent.token,
        description: `Bridge ${intent.amount} ${intent.token}`,
      };
    case 'send':
      return {
        ...base,
        type: 'send',
        chainId: intent.chainId || 5042002,
        amount: intent.amount,
        token: intent.token,
        description: `Send ${intent.amount} ${intent.token} to ${intent.recipientAddress.slice(0, 6)}...`,
      };
    case 'recurring_payment':
      return {
        ...base,
        type: 'recurring_payment',
        chainId: 5042002, // Arc Testnet for recurring schedule definition
        amount: intent.amount,
        token: intent.token,
        description: `Schedule ${intent.amount} ${intent.token} ${intent.frequency.toLowerCase()} to ${intent.recipientAddress.slice(0, 6)}...`,
      };
    default:
      return {
        ...base,
        type: 'send',
        chainId: 5042002,
        amount: '0',
        token: 'USDC',
        description: 'Unknown transaction',
      };
  }
}
