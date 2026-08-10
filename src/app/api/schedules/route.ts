import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { recurringSchedules } from '@/lib/db/schema';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { validateIntent } from '@/lib/validation';
import { users } from '@/lib/db/schema';
import { CircleWalletService } from '@/services/circle-wallet-service';
import { buildRequestId, errorResponse } from '@/lib/api-error';
import { logException, logWarn, maskWalletAddress } from '@/lib/logger';
import { reportException } from '@/lib/observability';

function getWalletAddressFromRequest(request: Request): string | null {
  const walletAddress = request.headers.get('x-wallet-address') || request.headers.get('X-Wallet-Address');
  if (!walletAddress || !walletAddress.trim()) return null;
  return walletAddress.trim();
}

export async function GET(request: Request) {
  try {
    const address = getWalletAddressFromRequest(request);
    if (!address) {
      logWarn('api.schedules.unauthorized', { route: '/api/schedules', method: 'GET' });
      return errorResponse({
        code: 'UNAUTHORIZED_WALLET',
        message: 'Please connect your wallet to continue.',
        status: 401,
      });
    }

    const user = await db.select().from(users).where(eq(users.walletAddress, address)).limit(1);
    const walletId = user[0]?.circleWalletId;

    if (!walletId) {
      return NextResponse.json([]); // No wallet, no schedules
    }

    const schedules = await db.select().from(recurringSchedules).where(eq(recurringSchedules.walletId, walletId));
    return NextResponse.json(schedules);
  } catch (error) {
    const requestId = buildRequestId();
    logException('api.schedules.fetch_failed', error, {
      requestId,
      route: '/api/schedules',
      method: 'GET',
    });
    void reportException(error, {
      requestId,
      code: 'SCHEDULE_FETCH_FAILED',
      route: '/api/schedules',
      method: 'GET',
    });
    return errorResponse({
      code: 'SCHEDULE_FETCH_FAILED',
      message: 'We could not load your recurring schedules right now.',
      status: 500,
      retryable: true,
      requestId,
    });
  }
}

function frequencyToCron(frequency: string): string {
  const f = frequency.toLowerCase();
  if (f.includes('hour')) return '0 * * * *';
  if (f.includes('week') || f.includes('friday') || f.includes('monday')) return '0 0 * * 1';
  if (f.includes('month')) return '0 0 1 * *';
  return '0 0 * * *'; // Default to daily
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, token, recipientAddress, frequency, startDate, endsAt } = body;

    const fakeIntent = {
      type: 'recurring_payment',
      amount: String(amount),
      token,
      recipientAddress,
      frequency,
      ...(endsAt ? { endsAt } : {}),
    };

    const validation = validateIntent(fakeIntent);

    if (!validation.valid || !validation.intent || validation.intent.type !== 'recurring_payment') {
      return errorResponse({
        code: 'INVALID_REQUEST',
        message: 'Please check your schedule details and try again.',
        status: 400,
      });
    }

    const validIntent = validation.intent;

    const cronExpression = frequencyToCron(validIntent.frequency);
    const nextExecutionTime = startDate ? new Date(startDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const address = getWalletAddressFromRequest(request);
    if (!address) {
      logWarn('api.schedules.unauthorized', { route: '/api/schedules', method: 'POST' });
      return errorResponse({
        code: 'UNAUTHORIZED_WALLET',
        message: 'Please connect your wallet to continue.',
        status: 401,
      });
    }

    const user = await db.select().from(users).where(eq(users.walletAddress, address)).limit(1);
    let walletId = user[0]?.circleWalletId;

    if (!walletId) {
      try {
        const sca = await CircleWalletService.createScaWallet();
        walletId = sca.id;

        if (user.length === 0) {
          await db.insert(users).values({ walletAddress: address, circleWalletId: walletId });
        } else {
          await db.update(users).set({ circleWalletId: walletId }).where(eq(users.walletAddress, address));
        }
      } catch (provisionError) {
        const requestId = buildRequestId();
        logException('api.schedules.wallet_provision_failed', provisionError, {
          requestId,
          route: '/api/schedules',
          method: 'POST',
          wallet: maskWalletAddress(address),
        });
        void reportException(provisionError, {
          requestId,
          code: 'WALLET_PROVISION_FAILED',
          route: '/api/schedules',
          method: 'POST',
          wallet: maskWalletAddress(address),
        });
        return errorResponse({
          code: 'WALLET_PROVISION_FAILED',
          message: 'We could not prepare your smart wallet right now. Please try again shortly.',
          status: 503,
          retryable: true,
          requestId,
        });
      }
    }

    const newSchedule = {
      id: crypto.randomUUID(),
      status: 'active',
      walletId,
      tokenId: validIntent.token.toUpperCase(),
      destinationAddress: validIntent.recipientAddress,
      amount: validIntent.amount,
      cronExpression,
      nextExecutionTime,
      executionCount: 0,
      createdAt: new Date(),
      endsAt: validIntent.endsAt ? new Date(validIntent.endsAt) : null,
    };

    await db.insert(recurringSchedules).values(newSchedule);

    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    const requestId = buildRequestId();
    logException('api.schedules.create_failed', error, {
      requestId,
      route: '/api/schedules',
      method: 'POST',
    });
    void reportException(error, {
      requestId,
      code: 'SCHEDULE_CREATE_FAILED',
      route: '/api/schedules',
      method: 'POST',
    });
    return errorResponse({
      code: 'SCHEDULE_CREATE_FAILED',
      message: 'We could not create your recurring payment right now.',
      status: 500,
      retryable: true,
      requestId,
    });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return errorResponse({
        code: 'INVALID_REQUEST',
        message: 'Schedule ID is required.',
        status: 400,
      });
    }

    const safeUpdates: Record<string, unknown> = {};
    if (updates.status && ['active', 'paused', 'completed'].includes(updates.status)) {
      safeUpdates.status = updates.status;
    }
    if (updates.nextExecutionTime) {
      safeUpdates.nextExecutionTime = new Date(updates.nextExecutionTime);
    }
    if (updates.executionCount !== undefined && typeof updates.executionCount === 'number') {
      safeUpdates.executionCount = updates.executionCount;
    }

    if (Object.keys(safeUpdates).length === 0) {
      return errorResponse({
        code: 'INVALID_REQUEST',
        message: 'No valid schedule updates were provided.',
        status: 400,
      });
    }

    await db
      .update(recurringSchedules)
      .set(safeUpdates)
      .where(eq(recurringSchedules.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    const requestId = buildRequestId();
    logException('api.schedules.update_failed', error, {
      requestId,
      route: '/api/schedules',
      method: 'PATCH',
    });
    void reportException(error, {
      requestId,
      code: 'UNKNOWN_ERROR',
      route: '/api/schedules',
      method: 'PATCH',
    });
    return errorResponse({
      code: 'UNKNOWN_ERROR',
      message: 'We could not update this schedule right now.',
      status: 500,
      retryable: true,
      requestId,
    });
  }
}
