import { pgTable, uuid, timestamp, text, boolean, integer, decimal, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { profiles } from './schema';

// User privacy settings table
export const userPrivacySettings = pgTable('user_privacy_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  profileVisibility: text('profile_visibility').default('public'), // 'public', 'private', 'friends'
  showTradingStats: boolean('show_trading_stats').default(true),
  showOnlineStatus: boolean('show_online_status').default(true),
  allowDirectMessages: boolean('allow_direct_messages').default(true),
  dataCollection: boolean('data_collection').default(true),
  analyticsTracking: boolean('analytics_tracking').default(false),
  marketingEmails: boolean('marketing_emails').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  uniqueUserId: unique().on(table.userId),
}));

// User trading preferences table
export const userTradingPreferences = pgTable('user_trading_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  defaultRiskPercentage: decimal('default_risk_percentage', { precision: 5, scale: 2 }).default('2.00'),
  defaultLeverage: integer('default_leverage').default(1),
  preferredTimeframe: text('preferred_timeframe').default('1h'),
  autoCalculatePositionSize: boolean('auto_calculate_position_size').default(true),
  showPnLInPercentage: boolean('show_pnl_in_percentage').default(false),
  defaultCurrency: text('default_currency').default('USD'),
  riskManagementAlerts: boolean('risk_management_alerts').default(true),
  maxDailyLoss: decimal('max_daily_loss', { precision: 5, scale: 2 }).default('5.00'),
  maxPositionsOpen: integer('max_positions_open').default(5),
  tradingHoursOnly: boolean('trading_hours_only').default(false),
  confirmBeforeClosing: boolean('confirm_before_closing').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  uniqueUserId: unique().on(table.userId),
}));

// User security settings table
export const userSecuritySettings = pgTable('user_security_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  twoFactorSecret: text('two_factor_secret'), // Encrypted TOTP secret
  backupCodes: text('backup_codes').array(), // Array of backup codes
  lastPasswordChange: timestamp('last_password_change', { withTimezone: true }),
  sessionTimeout: integer('session_timeout').default(30), // Minutes
  loginNotifications: boolean('login_notifications').default(true),
  suspiciousActivityAlerts: boolean('suspicious_activity_alerts').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  uniqueUserId: unique().on(table.userId),
}));

// Relations
export const userPrivacySettingsRelations = relations(userPrivacySettings, ({ one }) => ({
  user: one(profiles, {
    fields: [userPrivacySettings.userId],
    references: [profiles.id],
  }),
}));

export const userTradingPreferencesRelations = relations(userTradingPreferences, ({ one }) => ({
  user: one(profiles, {
    fields: [userTradingPreferences.userId],
    references: [profiles.id],
  }),
}));

export const userSecuritySettingsRelations = relations(userSecuritySettings, ({ one }) => ({
  user: one(profiles, {
    fields: [userSecuritySettings.userId],
    references: [profiles.id],
  }),
}));
