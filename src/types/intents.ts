export type IntentType =
  | 'swap'
  | 'bridge'
  | 'send'
  | 'balance_check'
  | 'recurring_payment';

export interface SwapIntent {
  type: 'swap';
  fromToken: string;
  toToken: string;
  amount: string;
  chainId?: number;
}

export interface BridgeIntent {
  type: 'bridge';
  token: string;
  amount: string;
  fromChainId: number;
  toChainId: number;
}

export interface SendIntent {
  type: 'send';
  token: string;
  amount: string;
  recipientAddress: string;
  chainId?: number;
}

export interface BalanceCheckIntent {
  type: 'balance_check';
  token?: string;
  chainId?: number;
}

export interface RecurringPaymentIntent {
  type: 'recurring_payment';
  token: string;
  amount: string;
  recipientAddress: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  endsAt?: string;
  chainId?: number;
}

export type ParsedIntent =
  | SwapIntent
  | BridgeIntent
  | SendIntent
  | BalanceCheckIntent
  | RecurringPaymentIntent;

export interface ParseIntentResponse {
  intent: ParsedIntent | null;
  message: string;
  confidence: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: ParsedIntent | null;
  timestamp: number;
  balances?: { token: string; amount: string; color: string }[];
}

export interface EstimationData {
  estimatedOutput?: { amount: string; token: string };
  fees?: Array<{ token: string; amount: string; type: string }>;
  estimatedGas?: string;
}

export interface ExecutionData {
  txHash?: string;
  explorerUrl?: string;
  error?: string;
}

export type IntentPhase =
  | 'estimating'
  | 'ready'
  | 'executing'
  | 'success'
  | 'error';

export interface IntentExecState {
  phase: IntentPhase;
  estimation?: EstimationData;
  execution?: ExecutionData;
}
