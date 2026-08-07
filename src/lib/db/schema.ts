import { pgTable, text, timestamp, varchar, integer, boolean } from 'drizzle-orm/pg-core';

export const recurringSchedules = pgTable('recurring_schedules', {
  id: text('id').primaryKey(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  
  // Web3 Execution Details
  walletId: text('wallet_id').notNull(),
  tokenId: text('token_id').notNull(),
  destinationAddress: text('destination_address').notNull(),
  amount: text('amount').notNull(),
  
  // Timing
  cronExpression: text('cron_expression').notNull(),
  nextExecutionTime: timestamp('next_execution_time').notNull(),
  
  // Metadata
  executionCount: integer('execution_count').notNull().default(0),
  lastExecutedAt: timestamp('last_executed_at'),
  endsAt: timestamp('ends_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull().default('info'),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
