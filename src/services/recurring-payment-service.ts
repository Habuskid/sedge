import { db } from '@/lib/db';
import { recurringSchedules } from '@/lib/db/schema';
import { lte, eq } from 'drizzle-orm';
import { CircleWalletService } from './circle-wallet-service';

export async function processDuePayments() {
  try {
    const now = new Date();
    
    // 1. Fetch due schedules
    const dueSchedules = await db
      .select()
      .from(recurringSchedules)
      .where(lte(recurringSchedules.nextExecutionTime, now));

    const results = [];

    // 2. Process each due schedule
    for (const schedule of dueSchedules) {
      if (schedule.status !== 'active') continue;

      try {
        console.log(`Processing schedule ${schedule.id}`);
        
        // Ensure walletId is valid
        if (!schedule.walletId || schedule.walletId === 'derive-at-runtime') {
          throw new Error('Invalid wallet ID for schedule');
        }

        // We assume token IDs or use USDC token ID. 
        // Circle's standard Testnet USDC token ID is typically known. For ARC Testnet it might be an empty string if native gas token is USDC or we can use the USDC token ID.
        // If the token is USDC, we'll use a placeholder or known UUID for USDC.
        
        // Execute the transfer using the official Circle SDK
        const transactionId = await CircleWalletService.executeRecurringTransfer({
          walletId: schedule.walletId,
          tokenId: 'ef87c8c3-85de-598a-af50-c5135eecfa74', // Official Arc Testnet USDC Token ID
          destinationAddress: schedule.destinationAddress,
          amount: [schedule.amount],
        });

        // Calculate next execution time
        // Simplistic approach based on cron (e.g. daily, weekly, monthly)
        let nextExecutionTime = new Date(schedule.nextExecutionTime.getTime() + 24 * 60 * 60 * 1000); // Daily fallback
        if (schedule.cronExpression.includes('0 0 1 * *')) {
          nextExecutionTime.setMonth(nextExecutionTime.getMonth() + 1); // Monthly
          intervalMs = 30 * 24 * 60 * 60 * 1000; // Monthly approximation
        } else if (schedule.cronExpression.includes('0 0 * * 1')) {
          intervalMs = 7 * 24 * 60 * 60 * 1000; // Weekly
        }

        // 3. Update database
        const nextExecutionTime = new Date(Date.now() + intervalMs);

        await db.update(recurringSchedules).set({
          lastExecutedAt: new Date(),
          nextExecutionTime,
          executionCount: (schedule.executionCount || 0) + 1,
        }).where(eq(recurringSchedules.id, schedule.id));

        results.push({ scheduleId: schedule.id, status: 'success', transactionId });
      } catch (err: any) {
        console.error(`Failed to process schedule ${schedule.id}:`, err);
        results.push({ scheduleId: schedule.id, status: 'failed', error: err.message });
      }
    }

    return { success: true, processed: results.length, details: results };
  } catch (error) {
    console.error('Error in processDuePayments:', error);
    throw error;
  }
}
