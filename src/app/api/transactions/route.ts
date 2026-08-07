import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transactions } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

import { getServerSession } from "next-auth/next";
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getServerSession();
    const address = (session as any)?.address;
    if (!address) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.select().from(users).where(eq(users.walletAddress, address)).limit(1);
    const walletId = user[0]?.circleWalletId;

    if (!walletId) {
      return NextResponse.json([]); // No wallet, no transactions
    }

    const allTxs = await db.select().from(transactions).where(eq(transactions.walletId, walletId)).orderBy(desc(transactions.timestamp));
    return NextResponse.json(allTxs);
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
