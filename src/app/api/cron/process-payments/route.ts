import { NextResponse } from 'next/server';
import { processDuePayments } from '@/services/recurring-payment-service';

// Required for Vercel Cron Jobs to ensure the endpoint doesn't time out immediately
export const maxDuration = 60; // 60 seconds
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Verify Vercel Cron Authorization
    // Vercel automatically sends a CRON_SECRET header to prevent unauthorized executions
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Trigger the payment processing service
    const result = await processDuePayments();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error processing cron job:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
