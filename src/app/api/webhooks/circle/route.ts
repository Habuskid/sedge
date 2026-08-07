import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transactions, notifications } from '@/lib/db/schema';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log('Circle Webhook Received:', JSON.stringify(payload, null, 2));

    // Handle AWS SNS Subscription Confirmation if Circle sends it
    if (payload.Type === 'SubscriptionConfirmation' && payload.SubscribeURL) {
      await fetch(payload.SubscribeURL);
      console.log('Confirmed Circle SNS Subscription');
      return NextResponse.json({ status: 'confirmed' });
    }

    // Parse the actual notification which may be wrapped in SNS Message or direct JSON
    let notification = payload;
    if (payload.Message && typeof payload.Message === 'string') {
      try {
        notification = JSON.parse(payload.Message);
      } catch (e) {
        // Not a JSON message, ignore
      }
    }

    const transaction = notification.transaction || notification.transfer;

    // Check if it's a completed transaction
    if (transaction && transaction.state === 'COMPLETE') {
      const txHash = transaction.txHash;
      const walletId = transaction.walletId;
      const amounts = transaction.amounts || [transaction.amount?.amount || '0'];
      const amount = amounts[0];
      
      const txId = transaction.id || crypto.randomUUID();

      // Log the transaction in the database
      await db.insert(transactions).values({
        id: txId,
        type: 'recurring_payment', // We assume recurring payment for SCA outbound transfers
        status: 'success',
        amount: amount.toString(),
        token: 'USDC', // Arc Testnet primarily uses USDC for these
        txHash: txHash,
        explorerUrl: `https://testnet.explorer.arc.network/tx/${txHash}`,
        description: 'Automated Recurring Payment executed by Circle SCA',
        chainId: 5042002, // Arc Testnet
        walletId: walletId,
      }).onConflictDoNothing(); // Prevent duplicates if webhook retries

      // Notify the user in the UI
      await db.insert(notifications).values({
        id: crypto.randomUUID(),
        title: 'Recurring Payment Successful',
        message: `Your automated payment of ${amount} USDC was successfully executed!`,
        type: 'success',
      });

      return NextResponse.json({ status: 'processed' });
    }

    return NextResponse.json({ status: 'ignored' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Return 200 so Circle doesn't endlessly retry badly formatted ones, unless it's a real failure
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
