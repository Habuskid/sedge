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

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  type: varchar('type', { length: 50 }).notNull(), // e.g. 'recurring_payment', 'send'
  status: varchar('status', { length: 20 }).notNull().default('success'),
  amount: text('amount').notNull(),
  token: text('token').notNull(),
  txHash: text('tx_hash'),
  explorerUrl: text('explorer_url'),
  description: text('description'),
  chainId: integer('chain_id').notNull().default(5042002), // Arc Testnet
  walletId: text('wallet_id'), // Optional link to SCA
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const users = pgTable('users', {
  walletAddress: text('wallet_address').primaryKey(), // EVM Address
  circleWalletId: text('circle_wallet_id'), // Their dedicated Circle SCA Wallet ID
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
