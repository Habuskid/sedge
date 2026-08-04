import { db } from '@/lib/db';
import { recurringSchedules, notifications } from '@/lib/db/schema';
import { circleServer } from '@/lib/circle-server-client';
import crypto from 'crypto';
import { lte, eq } from 'drizzle-orm';

/**
 * Executes a token transfer from a Developer-Controlled Wallet.
 */
export async function executeAutomatedTransfer(
  walletId: string,
  destinationAddress: string,
  amount: string,
  tokenId: string
) {
  try {
    let finalWalletId = walletId;
    const walletAddress = process.env.CIRCLE_WALLET_ADDRESS;
    const blockchain = process.env.CIRCLE_WALLET_BLOCKCHAIN || 'ARC-TESTNET';

    // 1. Resolve Developer-Controlled Wallet ID from environment
    if (finalWalletId === 'derive-at-runtime') {
      if (!walletAddress) throw new Error('CIRCLE_WALLET_ADDRESS is required in .env');
      const deriveResponse = await circleServer.deriveWalletByAddress({
        sourceBlockchain: blockchain as any,
        walletAddress,
        targetBlockchain: blockchain as any,
      });
      finalWalletId = deriveResponse.data?.wallet?.id || '';
      if (!finalWalletId) throw new Error('Could not derive Wallet ID from Circle API');
    }

    // 2. Resolve token address for Arc Testnet
    const ARC_TESTNET_USDC = '0x3600000000000000000000000000000000000000';
    const finalTokenId = tokenId === 'USDC' ? ARC_TESTNET_USDC : tokenId;

    const idempotencyKey = crypto.randomUUID();

    const response = await circleServer.createTransaction({
      walletId: finalWalletId,
      tokenId: finalTokenId,
      destinationAddress,
      amount: [amount],
      fee: {
        type: 'level',
        config: {
          feeLevel: 'MEDIUM',
        },
      },
      idempotencyKey,
    });

    console.log(`[Recurring Payment] Successfully initiated transfer for ${amount}. Transaction ID: ${response.data?.id}`);
    return response.data;
  } catch (error) {
    console.error('[Recurring Payment] Transfer execution failed:', error);
    throw error;
  }
}

/**
 * Central function called by the Cron Job to evaluate and process all due payments.
 */
export async function processDuePayments() {
  console.log('[Cron] Checking for due recurring payments...');
  
  try {
    // 1. Fetch all active schedules where nextExecutionTime is in the past or now
    const now = new Date();
    const dueSchedules = await db
      .select()
      .from(recurringSchedules)
      .where(lte(recurringSchedules.nextExecutionTime, now));

    console.log(`[Cron] Found ${dueSchedules.length} due schedules.`);

    let processedCount = 0;

    // 2. Process each due payment
    for (const schedule of dueSchedules) {
      if (schedule.status !== 'active') continue;

      console.log(`[Cron] Processing schedule ID: ${schedule.id}`);
      
      try {
        const txData = await executeAutomatedTransfer(
          schedule.walletId,
          schedule.destinationAddress,
          schedule.amount,
          schedule.tokenId
        );

        // Calculate next execution time based on cron expression (Simplified for this prototype)
        // In a production app, you would use a cron parser library like `cron-parser`
        // For this prototype, we'll just add 1 week
        const nextTime = new Date(now);
        nextTime.setDate(nextTime.getDate() + 7);

        // Update the schedule in the database
        await db
          .update(recurringSchedules)
          .set({
            lastExecutedAt: now,
            executionCount: schedule.executionCount + 1,
            nextExecutionTime: nextTime,
          })
          .where(eq(recurringSchedules.id, schedule.id));

        // Generate a Push Notification in the database
        await db.insert(notifications).values({
          id: crypto.randomUUID(),
          title: 'Payment Processed Successfully',
          message: `Your automated payment of ${schedule.amount} was sent to ${schedule.destinationAddress.substring(0, 6)}... (Tx: ${txData?.id?.substring(0, 8)}...)`,
          type: 'success',
          isRead: false,
          createdAt: new Date(),
        });

        processedCount++;
      } catch (err) {
        console.error(`[Cron] Failed to process schedule ${schedule.id}:`, err);
        
        // Generate a failure notification
        await db.insert(notifications).values({
          id: crypto.randomUUID(),
          title: 'Payment Failed',
          message: `Your automated payment of ${schedule.amount} to ${schedule.destinationAddress.substring(0, 6)}... failed to process.`,
          type: 'error',
          isRead: false,
          createdAt: new Date(),
        });
      }
    }

    return { success: true, processedCount, message: 'Cron processed successfully.' };
  } catch (error) {
    console.error('[Cron] Failed to fetch or process schedules from DB:', error);
    throw error;
  }
}
