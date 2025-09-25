import { db } from './connection';
import { 
  profiles, 
  strategies, 
  trades, 
  journalEntries, 
  activityLogs,
  newsPreferences,
  newsAlerts 
} from './schema';
import { eq, and, desc, asc, sql, count } from 'drizzle-orm';

// Profile queries
export const profileQueries = {
  getById: async (id: string) => {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1);
    return profile;
  },

  getByUsername: async (username: string) => {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.username, username))
      .limit(1);
    return profile;
  },

  update: async (id: string, data: Partial<typeof profiles.$inferInsert>) => {
    const [profile] = await db
      .update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();
    return profile;
  },

  getAll: async () => {
    return await db
      .select()
      .from(profiles)
      .orderBy(desc(profiles.createdAt));
  },
};

// Strategy queries
export const strategyQueries = {
  getByUserId: async (userId: string, includePrivate = true) => {
    const query = db
      .select()
      .from(strategies)
      .where(eq(strategies.userId, userId))
      .orderBy(desc(strategies.createdAt));

    if (!includePrivate) {
      query.where(and(eq(strategies.userId, userId), eq(strategies.isPrivate, false)));
    }

    return await query;
  },

  getPublic: async () => {
    return await db
      .select()
      .from(strategies)
      .where(and(eq(strategies.isPrivate, false), eq(strategies.isDuplicate, false)))
      .orderBy(desc(strategies.createdAt));
  },

  getById: async (id: string) => {
    const [strategy] = await db
      .select()
      .from(strategies)
      .where(eq(strategies.id, id))
      .limit(1);
    return strategy;
  },

  create: async (data: typeof strategies.$inferInsert) => {
    const [strategy] = await db
      .insert(strategies)
      .values(data)
      .returning();
    return strategy;
  },

  update: async (id: string, data: Partial<typeof strategies.$inferInsert>) => {
    const [strategy] = await db
      .update(strategies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(strategies.id, id))
      .returning();
    return strategy;
  },

  delete: async (id: string) => {
    await db
      .delete(strategies)
      .where(eq(strategies.id, id));
  },
};

// Trade queries
export const tradeQueries = {
  getByUserId: async (userId: string, includePrivate = true, isDemoMode?: boolean) => {
    let query = db
      .select()
      .from(trades)
      .where(eq(trades.userId, userId))
      .orderBy(desc(trades.tradeDate));

    if (!includePrivate) {
      query = query.where(and(eq(trades.userId, userId), eq(trades.isPrivate, false)));
    }

    if (isDemoMode !== undefined) {
      query = query.where(and(eq(trades.userId, userId), eq(trades.isDemo, isDemoMode)));
    }

    return await query;
  },

  getPublic: async (isDemoMode = false) => {
    return await db
      .select()
      .from(trades)
      .where(and(eq(trades.isPrivate, false), eq(trades.isDemo, isDemoMode)))
      .orderBy(desc(trades.tradeDate));
  },

  getById: async (id: string) => {
    const [trade] = await db
      .select()
      .from(trades)
      .where(eq(trades.id, id))
      .limit(1);
    return trade;
  },

  create: async (data: typeof trades.$inferInsert) => {
    const [trade] = await db
      .insert(trades)
      .values(data)
      .returning();
    return trade;
  },

  update: async (id: string, data: Partial<typeof trades.$inferInsert>) => {
    const [trade] = await db
      .update(trades)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(trades.id, id))
      .returning();
    return trade;
  },

  delete: async (id: string) => {
    await db
      .delete(trades)
      .where(eq(trades.id, id));
  },

  getStats: async (userId: string, isDemoMode = false) => {
    const userTrades = await db
      .select()
      .from(trades)
      .where(and(eq(trades.userId, userId), eq(trades.isDemo, isDemoMode)));

    const totalTrades = userTrades.length;
    const profitableTrades = userTrades.filter(trade => 
      trade.profitLoss && parseFloat(trade.profitLoss) > 0
    ).length;
    const totalPnL = userTrades.reduce((sum, trade) => 
      sum + (trade.profitLoss ? parseFloat(trade.profitLoss) : 0), 0
    );

    return {
      totalTrades,
      profitableTrades,
      totalPnL,
      winRate: totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0,
    };
  },
};

// Journal queries
export const journalQueries = {
  getByUserId: async (userId: string, includePrivate = true) => {
    let query = db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt));

    if (!includePrivate) {
      query = query.where(and(eq(journalEntries.userId, userId), eq(journalEntries.isPrivate, false)));
    }

    return await query;
  },

  getPublic: async () => {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.isPrivate, false))
      .orderBy(desc(journalEntries.createdAt));
  },

  getById: async (id: string) => {
    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.id, id))
      .limit(1);
    return entry;
  },

  create: async (data: typeof journalEntries.$inferInsert) => {
    const [entry] = await db
      .insert(journalEntries)
      .values(data)
      .returning();
    return entry;
  },

  update: async (id: string, data: Partial<typeof journalEntries.$inferInsert>) => {
    const [entry] = await db
      .update(journalEntries)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(journalEntries.id, id))
      .returning();
    return entry;
  },

  delete: async (id: string) => {
    await db
      .delete(journalEntries)
      .where(eq(journalEntries.id, id));
  },
};

// Activity log queries
export const activityQueries = {
  getByUserId: async (userId: string) => {
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt));
  },

  create: async (data: typeof activityLogs.$inferInsert) => {
    const [activity] = await db
      .insert(activityLogs)
      .values(data)
      .returning();
    return activity;
  },
};
