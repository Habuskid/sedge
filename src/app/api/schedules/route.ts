import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { recurringSchedules } from '@/lib/db/schema';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { validateIntent } from '@/lib/validation';

export async function GET() {
  try {
    const schedules = await db.select().from(recurringSchedules);
    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Failed to fetch schedules:', error);
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
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
    const { amount, token, recipientAddress, frequency, startDate } = body;

    // High-Severity Fix: Unvalidated Data Injection
    // Validate the incoming request strictly using the same logic as the AI Intent Parser
    const fakeIntent = {
      type: 'recurring_payment',
      amount: String(amount),
      token,
      recipientAddress,
      frequency,
    };

    const validation = validateIntent(fakeIntent);
    
    if (!validation.valid || !validation.intent || validation.intent.type !== 'recurring_payment') {
      return NextResponse.json({ error: 'Invalid payload: ' + validation.errors.join(', ') }, { status: 400 });
    }

    const validIntent = validation.intent;

    const cronExpression = frequencyToCron(validIntent.frequency);
    
    // Determine next execution time (default to tomorrow if not specified)
    const nextExecutionTime = startDate ? new Date(startDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);

    let walletId = process.env.CIRCLE_WALLET_ID;
    
    // Create an SCA Wallet dynamically if one isn't globally provided
    if (!walletId || walletId === 'derive-at-runtime') {
      const { CircleWalletService } = await import('@/services/circle-wallet-service');
      const scaWallet = await CircleWalletService.createScaWallet();
      walletId = scaWallet.id;
    }

    const newSchedule = {
      id: crypto.randomUUID(),
      status: 'active',
      walletId,
      tokenId: validIntent.token.toUpperCase(),
      destinationAddress: validIntent.recipientAddress, // Now strictly checksummed
      amount: validIntent.amount, // Now strictly validated as a positive finite number
      cronExpression,
      nextExecutionTime,
      executionCount: 0,
      createdAt: new Date(),
    };

    await db.insert(recurringSchedules).values(newSchedule);

    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create schedule:', error);
    const pgError = error?.cause?.message || error?.detail || error?.message || String(error);
    return NextResponse.json({ error: 'Failed to create schedule: ' + pgError }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // High-Severity Fix: Mass Assignment Vulnerability
    // Stripping out malicious overrides like walletId, amount, destinationAddress, etc.
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
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    await db
      .update(recurringSchedules)
      .set(safeUpdates)
      .where(eq(recurringSchedules.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update schedule:', error);
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
  }
}
