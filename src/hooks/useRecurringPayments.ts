'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getSchedules,
  updateSchedule,
} from '@/lib/recurring-schedule-store';
import type { RecurringSchedule } from '@/types/recurring';

export function useRecurringPayments() {
  const [schedules, setSchedules] = useState<RecurringSchedule[]>([]);

  const refresh = useCallback(async () => {
    const data = await getSchedules();
    setSchedules(data);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const pauseSchedule = useCallback(
    async (id: string) => {
      await updateSchedule(id, { status: 'paused' });
      await refresh();
    },
    [refresh],
  );

  const resumeSchedule = useCallback(
    async (id: string) => {
      await updateSchedule(id, { status: 'active' });
      await refresh();
    },
    [refresh],
  );

  const cancelSchedule = useCallback(
    async (id: string) => {
      await updateSchedule(id, { status: 'cancelled' });
      await refresh();
    },
    [refresh],
  );

  return {
    schedules,
    duePayments: [], // Managed by backend cron now
    pauseSchedule,
    resumeSchedule,
    cancelSchedule,
    refresh,
  };
}
