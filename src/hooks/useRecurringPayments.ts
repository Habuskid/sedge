'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getSchedules,
  updateSchedule,
} from '@/lib/recurring-schedule-store';
import {
  isScheduleDue,
  getCurrentPeriod,
  buildIdempotencyKey,
} from '@/lib/recurring-schedule-utils';
import type { RecurringSchedule, DuePayment } from '@/types/recurring';

const CHECK_INTERVAL_MS = 60_000;

export function useRecurringPayments() {
  const [schedules, setSchedules] = useState<RecurringSchedule[]>([]);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    setSchedules(getSchedules());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const duePayments = useMemo<DuePayment[]>(() => {
    void tick;
    return schedules
      .filter((schedule) => isScheduleDue(schedule))
      .map((schedule) => {
        const period = getCurrentPeriod(schedule.frequency);
        return {
          schedule,
          period,
          idempotencyKey: buildIdempotencyKey(schedule.id, period),
        };
      });
  }, [schedules, tick]);

  const pauseSchedule = useCallback(
    (id: string) => {
      updateSchedule(id, { status: 'paused' });
      refresh();
    },
    [refresh],
  );

  const resumeSchedule = useCallback(
    (id: string) => {
      updateSchedule(id, { status: 'active' });
      refresh();
    },
    [refresh],
  );

  const cancelSchedule = useCallback(
    (id: string) => {
      updateSchedule(id, { status: 'cancelled' });
      refresh();
    },
    [refresh],
  );

  const markExecuted = useCallback(
    (id: string, period: string) => {
      const current = getSchedules().find((s) => s.id === id);
      updateSchedule(id, {
        lastExecutedAt: Date.now(),
        lastExecutedPeriod: period,
        executionCount: (current?.executionCount || 0) + 1,
      });
      refresh();
    },
    [refresh],
  );

  return {
    schedules,
    duePayments,
    pauseSchedule,
    resumeSchedule,
    cancelSchedule,
    markExecuted,
    refresh,
  };
}
