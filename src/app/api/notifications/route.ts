import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import crypto from 'crypto';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allNotifications = await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));
    return NextResponse.json(allNotifications);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newNotification = {
      id: crypto.randomUUID(),
      title: body.title || 'New Notification',
      message: body.message || '',
      type: body.type || 'info',
      isRead: false,
      createdAt: new Date(),
    };

    await db.insert(notifications).values(newNotification);

    return NextResponse.json(newNotification, { status: 201 });
  } catch (error) {
    console.error('Failed to create notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

  export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isRead, markAll } = body;

    if (markAll) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.isRead, false));
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await db
      .update(notifications)
      .set({ isRead })
      .where(eq(notifications.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
