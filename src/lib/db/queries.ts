import { getServerDB } from './server';
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
    const db = getServerDB();
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1);
    return profile;
  },

  getByUsername: async (username: string) => {
    const db = getServerDB();
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.username, username))
      .limit(1);
    return profile;
  },

  update: async (id: string, data: Partial<typeof profiles.$inferInsert>) => {
    const db = getServerDB();
    const [profile] = await db
      .update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();
    return profile;
  },

  getAll: async () => {
    const db = getServerDB();
    return await db
      .select()
      .from(profiles)
      .orderBy(desc(profiles.createdAt));
  },
};

// Strategy queries
export const strategyQueries = {
  getByUserId: async (userId: string, includePrivate = true) => {
    const db = getServerDB();

    let whereCondition = eq(strategies.userId, userId);
    if (!includePrivate) {
      const combinedCondition = and(eq(strategies.userId, userId), eq(strategies.isPrivate, false));
      whereCondition = combinedCondition || whereCondition;
    }

    const query = db
      .select()
      .from(strategies)
      .where(whereCondition)
      .orderBy(desc(strategies.createdAt));

    return await query;
  },

  getPublic: async () => {
    const db = getServerDB();
    return await db
      .select()
      .from(strategies)
      .where(and(eq(strategies.isPrivate, false), eq(strategies.isDuplicate, false)))
      .orderBy(desc(strategies.createdAt));
  },

  getById: async (id: string) => {
    const db = getServerDB();
    const [strategy] = await db
      .select()
      .from(strategies)
      .where(eq(strategies.id, id))
      .limit(1);
    return strategy;
  },

  create: async (data: typeof strategies.$inferInsert) => {
    const db = getServerDB();
    const [strategy] = await db
      .insert(strategies)
      .values(data)
      .returning();
    return strategy;
  },

  update: async (id: string, data: Partial<typeof strategies.$inferInsert>) => {
    const db = getServerDB();
    const [strategy] = await db
      .update(strategies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(strategies.id, id))
      .returning();
    return strategy;
  },

  delete: async (id: string) => {
    const db = getServerDB();
    await db
      .delete(strategies)
      .where(eq(strategies.id, id));
  },
};

// Trade queries
export const tradeQueries = {
  getByUserId: async (userId: string, includePrivate = true, isDemoMode?: boolean) => {
    const db = getServerDB();

    let whereConditions = [eq(trades.userId, userId)];

    if (!includePrivate) {
      whereConditions.push(eq(trades.isPrivate, false));
    }

    if (isDemoMode !== undefined) {
      whereConditions.push(eq(trades.isDemo, isDemoMode));
    }

    const query = db
      .select()
      .from(trades)
      .where(and(...whereConditions))
      .orderBy(desc(trades.tradeDate));

    return await query;
  },

  getPublic: async (isDemoMode = false) => {
    const db = getServerDB();
    return await db
      .select()
      .from(trades)
      .where(and(eq(trades.isPrivate, false), eq(trades.isDemo, isDemoMode)))
      .orderBy(desc(trades.tradeDate));
  },

  getById: async (id: string) => {
    const db = getServerDB();
    const [trade] = await db
      .select()
      .from(trades)
      .where(eq(trades.id, id))
      .limit(1);
    return trade;
  },

  create: async (data: typeof trades.$inferInsert) => {
    const db = getServerDB();
    const [trade] = await db
      .insert(trades)
      .values(data)
      .returning();
    return trade;
  },

  update: async (id: string, data: Partial<typeof trades.$inferInsert>) => {
    const db = getServerDB();
    const [trade] = await db
      .update(trades)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(trades.id, id))
      .returning();
    return trade;
  },

  delete: async (id: string) => {
    const db = getServerDB();
    await db
      .delete(trades)
      .where(eq(trades.id, id));
  },

  getStats: async (userId: string, isDemoMode = false) => {
    const db = getServerDB();
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
    const db = getServerDB();

    let whereCondition = eq(journalEntries.userId, userId);
    if (!includePrivate) {
      const combinedCondition = and(eq(journalEntries.userId, userId), eq(journalEntries.isPrivate, false));
      whereCondition = combinedCondition || whereCondition;
    }

    const query = db
      .select()
      .from(journalEntries)
      .where(whereCondition)
      .orderBy(desc(journalEntries.createdAt));

    return await query;
  },

  getPublic: async () => {
    const db = getServerDB();
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.isPrivate, false))
      .orderBy(desc(journalEntries.createdAt));
  },

  getById: async (id: string) => {
    const db = getServerDB();
    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.id, id))
      .limit(1);
    return entry;
  },

  create: async (data: typeof journalEntries.$inferInsert) => {
    const db = getServerDB();
    const [entry] = await db
      .insert(journalEntries)
      .values(data)
      .returning();
    return entry;
  },

  update: async (id: string, data: Partial<typeof journalEntries.$inferInsert>) => {
    const db = getServerDB();
    const [entry] = await db
      .update(journalEntries)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(journalEntries.id, id))
      .returning();
    return entry;
  },

  delete: async (id: string) => {
    const db = getServerDB();
    await db
      .delete(journalEntries)
      .where(eq(journalEntries.id, id));
  },
};

// Activity log queries
export const activityQueries = {
  getByUserId: async (userId: string) => {
    const db = getServerDB();
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt));
  },

  create: async (data: typeof activityLogs.$inferInsert) => {
    const db = getServerDB();
    const [activity] = await db
      .insert(activityLogs)
      .values(data)
      .returning();
    return activity;
  },
};
