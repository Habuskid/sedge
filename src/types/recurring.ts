export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly';
export type ScheduleStatus = 'active' | 'paused' | 'cancelled';

export interface RecurringSchedule {
  id: string;
  token: string;
  amount: string;
  recipientAddress: string;
  frequency: ScheduleFrequency;
  chainId: number;
  status: ScheduleStatus;
  createdAt: number;
  lastExecutedAt: number | null;
  /** Calendar period key of last execution (e.g. "2026-07-25") for idempotency. */
  lastExecutedPeriod: string | null;
  executionCount: number;
}

export interface DuePayment {
  schedule: RecurringSchedule;
  period: string;
  idempotencyKey: string;
}
