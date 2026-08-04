import { getAddress, isAddress } from 'viem';
import { SUPPORTED_CHAIN_IDS, SUPPORTED_TOKENS } from '@/config/chains';
import type { ParsedIntent, ParseIntentResponse } from '@/types/intents';

const MAX_AMOUNT = 1_000_000_000_000;

function isValidToken(token: unknown): token is string {
  return typeof token === 'string' && (SUPPORTED_TOKENS as readonly string[]).includes(token);
}

function isValidChainId(chainId: unknown): chainId is number {
  return typeof chainId === 'number' && (SUPPORTED_CHAIN_IDS as readonly number[]).includes(chainId);
}

function isValidAmount(amount: unknown): amount is string {
  if (typeof amount !== 'string') return false;
  const num = parseFloat(amount);
  return !isNaN(num) && isFinite(num) && num > 0 && num <= MAX_AMOUNT;
}

function validateAddress(addr: unknown): string | null {
  if (typeof addr !== 'string') return null;
  try {
    if (!isAddress(addr)) return null;
    return getAddress(addr);
  } catch {
    return null;
  }
}

const VALID_FREQUENCIES = ['daily', 'weekly', 'monthly'] as const;

export function validateIntent(raw: unknown): { valid: boolean; intent: ParsedIntent | null; errors: string[] } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, intent: null, errors: ['Intent is not a valid object'] };
  }

  const obj = raw as Record<string, unknown>;
  const errors: string[] = [];

  switch (obj.type) {
    case 'swap': {
      if (!isValidToken(obj.fromToken)) errors.push(`Invalid fromToken: must be one of ${SUPPORTED_TOKENS.join(', ')}`);
      if (!isValidToken(obj.toToken)) errors.push(`Invalid toToken: must be one of ${SUPPORTED_TOKENS.join(', ')}`);
      if (!isValidAmount(obj.amount)) errors.push('Invalid amount: must be a positive number');
      if (obj.chainId !== undefined && !isValidChainId(obj.chainId)) errors.push(`Invalid chainId: must be one of ${SUPPORTED_CHAIN_IDS.join(', ')}`);
      if (obj.fromToken === obj.toToken && typeof obj.fromToken === 'string') errors.push('fromToken and toToken must be different');
      if (errors.length) return { valid: false, intent: null, errors };
      return {
        valid: true,
        errors: [],
        intent: {
          type: 'swap',
          fromToken: obj.fromToken as string,
          toToken: obj.toToken as string,
          amount: obj.amount as string,
          ...(obj.chainId !== undefined ? { chainId: obj.chainId as number } : {}),
        },
      };
    }

    case 'bridge': {
      if (obj.token !== 'USDC') errors.push(`Invalid token for bridge: CCTP only supports bridging USDC.`);
      if (!isValidAmount(obj.amount)) errors.push('Invalid amount: must be a positive number');
      if (!isValidChainId(obj.fromChainId)) errors.push(`Invalid fromChainId: must be one of ${SUPPORTED_CHAIN_IDS.join(', ')}`);
      if (!isValidChainId(obj.toChainId)) errors.push(`Invalid toChainId: must be one of ${SUPPORTED_CHAIN_IDS.join(', ')}`);
      if (obj.fromChainId === obj.toChainId) errors.push('fromChainId and toChainId must be different');
      if (errors.length) return { valid: false, intent: null, errors };
      return {
        valid: true,
        errors: [],
        intent: {
          type: 'bridge',
          token: obj.token as string,
          amount: obj.amount as string,
          fromChainId: obj.fromChainId as number,
          toChainId: obj.toChainId as number,
        },
      };
    }

    case 'send': {
      if (!isValidToken(obj.token)) errors.push(`Invalid token: must be one of ${SUPPORTED_TOKENS.join(', ')}`);
      if (!isValidAmount(obj.amount)) errors.push('Invalid amount: must be a positive number');
      const checksummed = validateAddress(obj.recipientAddress);
      if (!checksummed) errors.push('Invalid recipientAddress: must be a valid Ethereum address');
      if (obj.chainId !== undefined && !isValidChainId(obj.chainId)) errors.push(`Invalid chainId: must be one of ${SUPPORTED_CHAIN_IDS.join(', ')}`);
      if (errors.length) return { valid: false, intent: null, errors };
      return {
        valid: true,
        errors: [],
        intent: {
          type: 'send',
          token: obj.token as string,
          amount: obj.amount as string,
          recipientAddress: checksummed!,
          ...(obj.chainId !== undefined ? { chainId: obj.chainId as number } : {}),
        },
      };
    }

    case 'balance_check': {
      if (obj.token !== undefined && obj.token !== null && !isValidToken(obj.token)) {
        errors.push(`Invalid token: must be one of ${SUPPORTED_TOKENS.join(', ')}`);
      }
      if (obj.chainId !== undefined && obj.chainId !== null && !isValidChainId(obj.chainId)) {
        errors.push(`Invalid chainId: must be one of ${SUPPORTED_CHAIN_IDS.join(', ')}`);
      }
      if (errors.length) return { valid: false, intent: null, errors };
      return {
        valid: true,
        errors: [],
        intent: {
          type: 'balance_check',
          ...(isValidToken(obj.token) ? { token: obj.token } : {}),
          ...(isValidChainId(obj.chainId) ? { chainId: obj.chainId } : {}),
        },
      };
    }

    case 'recurring_payment': {
      if (!isValidToken(obj.token)) errors.push(`Invalid token: must be one of ${SUPPORTED_TOKENS.join(', ')}`);
      if (!isValidAmount(obj.amount)) errors.push('Invalid amount: must be a positive number');
      const addr = validateAddress(obj.recipientAddress);
      if (!addr) errors.push('Invalid recipientAddress: must be a valid Ethereum address');
      if (typeof obj.frequency !== 'string' || !(VALID_FREQUENCIES as readonly string[]).includes(obj.frequency)) {
        errors.push('Invalid frequency: must be daily, weekly, or monthly');
      }
      if (obj.chainId !== undefined && !isValidChainId(obj.chainId)) errors.push(`Invalid chainId: must be one of ${SUPPORTED_CHAIN_IDS.join(', ')}`);
      if (errors.length) return { valid: false, intent: null, errors };
      return {
        valid: true,
        errors: [],
        intent: {
          type: 'recurring_payment',
          token: obj.token as string,
          amount: obj.amount as string,
          recipientAddress: addr!,
          frequency: obj.frequency as 'daily' | 'weekly' | 'monthly',
          ...(obj.chainId !== undefined ? { chainId: obj.chainId as number } : {}),
        },
      };
    }

    default:
      return { valid: false, intent: null, errors: [`Unrecognized intent type: ${String(obj.type)}`] };
  }
}

export function validateParseResponse(raw: unknown): {
  valid: boolean;
  response: ParseIntentResponse | null;
  errors: string[];
} {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, response: null, errors: ['Response is not a valid object'] };
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj.message !== 'string') {
    return { valid: false, response: null, errors: ['Missing message field'] };
  }

  let confidence = typeof obj.confidence === 'number' ? obj.confidence : 0;
  confidence = Math.max(0, Math.min(1, confidence));

  if (obj.intent === null || obj.intent === undefined) {
    return {
      valid: true,
      response: { intent: null, message: obj.message, confidence },
      errors: [],
    };
  }

  const result = validateIntent(obj.intent);
  if (!result.valid) {
    return { valid: false, response: null, errors: result.errors };
  }

  return {
    valid: true,
    response: { intent: result.intent, message: obj.message, confidence },
    errors: [],
  };
}
