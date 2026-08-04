import type { RecurringSchedule } from '@/types/recurring';

// Instead of localStorage, we now interact with the Vercel Postgres API
export async function getSchedules(): Promise<RecurringSchedule[]> {
  try {
    const res = await fetch('/api/schedules', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch schedules');
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function saveSchedule(schedule: Partial<RecurringSchedule>): Promise<void> {
  try {
    await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule),
    });
  } catch (error) {
    console.error('Failed to save schedule:', error);
  }
}

export async function updateSchedule(
  id: string,
  updates: Partial<Pick<RecurringSchedule, 'status' | 'lastExecutedAt' | 'lastExecutedPeriod' | 'executionCount'>>,
): Promise<void> {
  try {
    await fetch('/api/schedules', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates }),
    });
  } catch (error) {
    console.error('Failed to update schedule:', error);
  }
}

export async function getActiveSchedules(): Promise<RecurringSchedule[]> {
  const all = await getSchedules();
  return all.filter((s) => s.status === 'active');
}

export async function getScheduleById(id: string): Promise<RecurringSchedule | null> {
  const all = await getSchedules();
  return all.find((s) => s.id === id) || null;
}
