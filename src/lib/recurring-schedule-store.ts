import type { RecurringSchedule } from '@/types/recurring';

const STORAGE_KEY = 'sedge_recurring_schedules';
const MAX_SCHEDULES = 50;

export function getSchedules(): RecurringSchedule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSchedule(schedule: RecurringSchedule): void {
  const existing = getSchedules();
  existing.unshift(schedule);
  if (existing.length > MAX_SCHEDULES) existing.length = MAX_SCHEDULES;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // localStorage may be unavailable or full
  }
}

export function updateSchedule(
  id: string,
  updates: Partial<Pick<RecurringSchedule, 'status' | 'lastExecutedAt' | 'lastExecutedPeriod' | 'executionCount'>>,
): void {
  const schedules = getSchedules();
  const index = schedules.findIndex((s) => s.id === id);
  if (index === -1) return;

  schedules[index] = { ...schedules[index], ...updates };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  } catch {
    // localStorage may be unavailable or full
  }
}

export function getActiveSchedules(): RecurringSchedule[] {
  return getSchedules().filter((s) => s.status === 'active');
}

export function getScheduleById(id: string): RecurringSchedule | null {
  return getSchedules().find((s) => s.id === id) || null;
}
