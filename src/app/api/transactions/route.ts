import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transactions } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { buildRequestId, errorResponse } from '@/lib/api-error';
import { logException, logWarn, maskWalletAddress } from '@/lib/logger';
import { reportException } from '@/lib/observability';

export async function GET(request: Request) {
  const address = request.headers.get('x-wallet-address') || request.headers.get('X-Wallet-Address');

  try {
    if (!address || !address.trim()) {
      logWarn('api.transactions.unauthorized', { route: '/api/transactions', method: 'GET' });
      return errorResponse({
        code: 'UNAUTHORIZED_WALLET',
        message: 'Please connect your wallet to continue.',
        status: 401,
      });
    }

    const user = await db.select().from(users).where(eq(users.walletAddress, address.trim())).limit(1);
    const walletId = user[0]?.circleWalletId;

    if (!walletId) {
      return NextResponse.json([]); // No wallet, no transactions
    }

    const allTxs = await db.select().from(transactions).where(eq(transactions.walletId, walletId)).orderBy(desc(transactions.timestamp));
    return NextResponse.json(allTxs);
  } catch (error) {
    const requestId = buildRequestId();
    logException('api.transactions.fetch_failed', error, {
      requestId,
      route: '/api/transactions',
      method: 'GET',
      wallet: maskWalletAddress(address),
    });
    void reportException(error, {
      requestId,
      code: 'TRANSACTIONS_FETCH_FAILED',
      route: '/api/transactions',
      method: 'GET',
      wallet: maskWalletAddress(address),
    });
    return errorResponse({
      code: 'TRANSACTIONS_FETCH_FAILED',
      message: 'We could not load your activity right now.',
      status: 500,
      retryable: true,
      requestId,
    });
  }
}
