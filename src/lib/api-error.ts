import { NextResponse } from 'next/server';

export type ApiErrorCode =
  | 'UNAUTHORIZED_WALLET'
  | 'INVALID_REQUEST'
  | 'WALLET_PROVISION_FAILED'
  | 'SCHEDULE_CREATE_FAILED'
  | 'SCHEDULE_FETCH_FAILED'
  | 'TRANSACTIONS_FETCH_FAILED'
  | 'BRIDGE_TEMP_UNAVAILABLE'
  | 'UNKNOWN_ERROR';

export interface PublicApiError {
  ok: false;
  code: ApiErrorCode;
  message: string;
  error: string; // Backward-compatible alias for existing callers
  retryable: boolean;
  requestId: string;
}

export function buildRequestId(): string {
  return crypto.randomUUID();
}

export function errorResponse(params: {
  code: ApiErrorCode;
  message: string;
  status: number;
  retryable?: boolean;
  requestId?: string;
}) {
  const requestId = params.requestId || buildRequestId();

  const payload: PublicApiError = {
    ok: false,
    code: params.code,
    message: params.message,
    error: params.message,
    retryable: params.retryable ?? false,
    requestId,
  };

  return NextResponse.json(payload, { status: params.status });
}
