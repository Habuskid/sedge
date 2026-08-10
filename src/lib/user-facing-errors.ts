import type { ApiErrorCode } from './api-error';

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

export function getFriendlyMessageFromCode(code?: string): string {
  switch (code as ApiErrorCode | undefined) {
    case 'UNAUTHORIZED_WALLET':
      return 'Please connect your wallet to continue.';
    case 'INVALID_REQUEST':
      return 'Please check your inputs and try again.';
    case 'WALLET_PROVISION_FAILED':
      return 'We could not prepare your smart wallet right now. Please try again shortly.';
    case 'SCHEDULE_CREATE_FAILED':
      return 'We could not create your recurring payment right now.';
    case 'SCHEDULE_FETCH_FAILED':
      return 'We could not load your recurring schedules right now.';
    case 'TRANSACTIONS_FETCH_FAILED':
      return 'We could not load your activity right now.';
    case 'BRIDGE_TEMP_UNAVAILABLE':
      return 'Bridge route is temporarily unavailable. Please try again.';
    default:
      return FALLBACK_MESSAGE;
  }
}

export function parseApiErrorPayload(payload: any): {
  message: string;
  code?: string;
  requestId?: string;
} {
  const code = typeof payload?.code === 'string' ? payload.code : undefined;
  const message =
    (typeof payload?.message === 'string' && payload.message) ||
    (typeof payload?.error === 'string' && payload.error) ||
    getFriendlyMessageFromCode(code);
  const requestId = typeof payload?.requestId === 'string' ? payload.requestId : undefined;

  return { message, code, requestId };
}

export function withReference(message: string, requestId?: string): string {
  return requestId ? `${message} (Ref: ${requestId})` : message;
}
