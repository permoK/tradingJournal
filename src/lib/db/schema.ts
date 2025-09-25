import { pgTable, uuid, timestamp, text, boolean, integer, decimal, pgEnum, unique, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { AdapterAccount } from '@auth/core/adapters';

// Enums
export const tradeStatusEnum = pgEnum('trade_status', ['open', 'closed']);
export const activityTypeEnum = pgEnum('activity_type', ['learning', 'trading', 'journal']);

// NextAuth.js tables
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  password: text('password'), // For email/password authentication
  username: text('username').unique(), // For user profiles
});

export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verificationTokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// Profiles table (extends user data)
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  username: text('username').unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  streakCount: integer('streak_count').default(0),
  lastActive: timestamp('last_active', { withTimezone: true }).defaultNow(),
  balance: decimal('balance', { precision: 15, scale: 2 }).default('10000'),
});

// Strategies table
export const strategies = pgTable('strategies', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  details: text('details'),
  imageUrl: text('image_url'),
  category: text('category'),
  isActive: boolean('is_active').default(true),
  isPrivate: boolean('is_private').default(true),
  successRate: decimal('success_rate', { precision: 5, scale: 2 }).default('0'),
  totalTrades: integer('total_trades').default(0),
  profitableTrades: integer('profitable_trades').default(0),
  originalStrategyId: uuid('original_strategy_id').references(() => strategies.id, { onDelete: 'set null' }),
  duplicateCount: integer('duplicate_count').default(0),
  isDuplicate: boolean('is_duplicate').default(false),
});

// Journal entries table
export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  isPrivate: boolean('is_private').default(true),
  tags: text('tags').array().default([]),
});

// Trades table
export const trades = pgTable('trades', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  strategyId: uuid('strategy_id').references(() => strategies.id, { onDelete: 'set null' }),
  tradeDate: timestamp('trade_date', { withTimezone: true }).notNull(),
  market: text('market').notNull(),
  tradeType: text('trade_type').notNull(),
  entryPrice: decimal('entry_price', { precision: 15, scale: 8 }).notNull(),
  exitPrice: decimal('exit_price', { precision: 15, scale: 8 }),
  quantity: decimal('quantity', { precision: 15, scale: 8 }).notNull(),
  profitLoss: decimal('profit_loss', { precision: 15, scale: 2 }),
  status: tradeStatusEnum('status').default('open'),
  notes: text('notes'),
  screenshotUrl: text('screenshot_url'),
  isPrivate: boolean('is_private').default(true),
  isDemo: boolean('is_demo').default(false),
});

// Activity logs table
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  activityType: activityTypeEnum('activity_type').notNull(),
  activityTitle: text('activity_title').notNull(),
  activityDate: timestamp('activity_date', { mode: 'date' }).defaultNow(),
});

// News preferences table
export const newsPreferences = pgTable('news_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  categories: text('categories').array().default(['forex', 'economic', 'central-bank', 'market']),
  importanceLevels: text('importance_levels').array().default(['high', 'medium']),
  notificationsEnabled: boolean('notifications_enabled').default(true),
  emailNotifications: boolean('email_notifications').default(false),
  pushNotifications: boolean('push_notifications').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  uniqueUserId: unique().on(table.userId),
}));

// News alerts table
export const newsAlerts = pgTable('news_alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  newsId: text('news_id').notNull(),
  alertType: text('alert_type').notNull(),
  shownAt: timestamp('shown_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  uniqueUserNews: unique().on(table.userId, table.newsId),
}));

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const profilesRelations = relations(profiles, ({ many, one }) => ({
  user: one(users, {
    fields: [profiles.id],
    references: [users.id],
  }),
  strategies: many(strategies),
  journalEntries: many(journalEntries),
  trades: many(trades),
  activityLogs: many(activityLogs),
  newsPreferences: many(newsPreferences),
  newsAlerts: many(newsAlerts),
}));

export const strategiesRelations = relations(strategies, ({ one, many }) => ({
  user: one(profiles, {
    fields: [strategies.userId],
    references: [profiles.id],
  }),
  trades: many(trades),
  originalStrategy: one(strategies, {
    fields: [strategies.originalStrategyId],
    references: [strategies.id],
  }),
  duplicates: many(strategies, {
    relationName: 'strategy_duplicates',
  }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(profiles, {
    fields: [journalEntries.userId],
    references: [profiles.id],
  }),
}));

export const tradesRelations = relations(trades, ({ one }) => ({
  user: one(profiles, {
    fields: [trades.userId],
    references: [profiles.id],
  }),
  strategy: one(strategies, {
    fields: [trades.strategyId],
    references: [strategies.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(profiles, {
    fields: [activityLogs.userId],
    references: [profiles.id],
  }),
}));

export const newsPreferencesRelations = relations(newsPreferences, ({ one }) => ({
  user: one(profiles, {
    fields: [newsPreferences.userId],
    references: [profiles.id],
  }),
}));

export const newsAlertsRelations = relations(newsAlerts, ({ one }) => ({
  user: one(profiles, {
    fields: [newsAlerts.userId],
    references: [profiles.id],
  }),
}));
