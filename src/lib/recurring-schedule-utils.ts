import type { RecurringSchedule, ScheduleFrequency } from '@/types/recurring';

export function getCurrentPeriod(frequency: ScheduleFrequency, ref: Date = new Date()): string {
  const year = ref.getFullYear();
  const month = String(ref.getMonth() + 1).padStart(2, '0');
  const day = String(ref.getDate()).padStart(2, '0');

  switch (frequency) {
    case 'daily':
      return `${year}-${month}-${day}`;
    case 'weekly': {
      const d = new Date(ref);
      d.setHours(0, 0, 0, 0);
      const dayOfWeek = d.getDay();
      const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      d.setDate(diff);
      const wy = d.getFullYear();
      const startOfYear = new Date(wy, 0, 1);
      const days = Math.floor((d.getTime() - startOfYear.getTime()) / 86400000);
      const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
      return `${wy}-W${String(weekNum).padStart(2, '0')}`;
    }
    case 'monthly':
      return `${year}-${month}`;
  }
}

export function buildIdempotencyKey(scheduleId: string, period: string): string {
  return `${scheduleId}:${period}`;
}

export function isScheduleDue(schedule: RecurringSchedule, ref?: Date): boolean {
  if (schedule.status !== 'active') return false;
  const period = getCurrentPeriod(schedule.frequency, ref);
  return schedule.lastExecutedPeriod !== period;
}

export function getNextDueLabel(schedule: RecurringSchedule): string {
  if (schedule.status !== 'active') return 'Inactive';

  const now = new Date();
  const period = getCurrentPeriod(schedule.frequency, now);

  if (schedule.lastExecutedPeriod !== period) return 'Due now';

  switch (schedule.frequency) {
    case 'daily': {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    case 'weekly': {
      const nextMonday = new Date(now);
      const dayOfWeek = nextMonday.getDay();
      const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
      nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
      return nextMonday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    case 'monthly': {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return nextMonth.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  }
}

export function formatFrequency(frequency: ScheduleFrequency): string {
  switch (frequency) {
    case 'daily': return 'Daily';
    case 'weekly': return 'Weekly';
    case 'monthly': return 'Monthly';
  }
}
