import { useEffect, useState } from 'react';
import { Database } from '../types/database.types';
import { createClient } from './supabase';
import { useAuth } from '@/contexts/AuthContext';

// Hook for fetching user profile
export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Database['public']['Tables']['profiles']['Row'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw error;
        }

        setProfile(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, supabase]);

  const updateProfile = async (updates: Partial<Database['public']['Tables']['profiles']['Update']>) => {
    if (!userId) return { error: 'No user ID provided' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  return { profile, loading, error, updateProfile };
}

// Hook for fetching strategies
export function useStrategies(userId: string | undefined) {
  const [strategies, setStrategies] = useState<Database['public']['Tables']['strategies']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) {
      setStrategies([]);
      setLoading(false);
      return;
    }

    const fetchStrategies = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('strategies')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setStrategies(data || []);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setStrategies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategies();
  }, [userId, supabase]);

  const createStrategy = async (strategyData: Omit<Database['public']['Tables']['strategies']['Insert'], 'user_id' | 'id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return { error: 'No user ID provided' };

    try {
      const { data, error } = await supabase
        .from('strategies')
        .insert({
          ...strategyData,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      setStrategies(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateStrategy = async (strategyId: string, updates: Partial<Database['public']['Tables']['strategies']['Update']>) => {
    try {
      const { data, error } = await supabase
        .from('strategies')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', strategyId)
        .select()
        .single();

      if (error) throw error;

      setStrategies(prev => prev.map(strategy =>
        strategy.id === strategyId ? data : strategy
      ));
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const deleteStrategy = async (strategyId: string) => {
    try {
      const { error } = await supabase
        .from('strategies')
        .delete()
        .eq('id', strategyId);

      if (error) throw error;

      setStrategies(prev => prev.filter(strategy => strategy.id !== strategyId));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return { strategies, loading, error, createStrategy, updateStrategy, deleteStrategy };
}

// Hook for fetching journal entries
export function useJournalEntries(userId: string | undefined, includePrivate = true) {
  const [entries, setEntries] = useState<Database['public']['Tables']['journal_entries']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const fetchEntries = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('journal_entries')
          .select('*')
          .order('created_at', { ascending: false });

        if (includePrivate) {
          query = query.eq('user_id', userId);
        } else {
          query = query.or(`user_id.eq.${userId},is_private.eq.false`);
        }

        const { data, error } = await query;

        if (error) throw error;

        setEntries(data || []);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [userId, includePrivate, supabase]);

  const createEntry = async (entry: Omit<Database['public']['Tables']['journal_entries']['Insert'], 'user_id' | 'id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return { error: 'No user ID provided' };

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          ...entry,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      setEntries(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateEntry = async (entryId: string, updates: Partial<Database['public']['Tables']['journal_entries']['Update']>) => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', entryId)
        .select()
        .single();

      if (error) throw error;

      setEntries(prev => prev.map(entry => entry.id === entryId ? data : entry));
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const deleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return { entries, loading, error, createEntry, updateEntry, deleteEntry };
}

// Hook for fetching trades
export function useTrades(userId: string | undefined, includePrivate = true, isDemoMode?: boolean) {
  const [trades, setTrades] = useState<Database['public']['Tables']['trades']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchTrades = async () => {
    if (!userId) {
      setTrades([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let query = supabase
        .from('trades')
        .select('*')
        .order('trade_date', { ascending: false });

      if (includePrivate) {
        query = query.eq('user_id', userId);
      } else {
        query = query.or(`user_id.eq.${userId},is_private.eq.false`);
      }

      // Filter by demo mode if specified
      if (isDemoMode !== undefined) {
        query = query.eq('is_demo', isDemoMode);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTrades(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [userId, includePrivate, isDemoMode, supabase]);

  const createTrade = async (trade: Omit<Database['public']['Tables']['trades']['Insert'], 'user_id' | 'id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return { error: 'No user ID provided' };

    try {
      const { data, error } = await supabase
        .from('trades')
        .insert({
          ...trade,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      setTrades(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const createMultipleTrades = async (trades: Omit<Database['public']['Tables']['trades']['Insert'], 'user_id' | 'id' | 'created_at' | 'updated_at'>[]) => {
    if (!userId) return { error: 'No user ID provided' };

    try {
      const tradesWithUserId = trades.map(trade => ({
        ...trade,
        user_id: userId,
      }));

      const { data, error } = await supabase
        .from('trades')
        .insert(tradesWithUserId)
        .select();

      if (error) throw error;

      setTrades(prev => [...data, ...prev]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateTrade = async (tradeId: string, updates: Partial<Database['public']['Tables']['trades']['Update']>) => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', tradeId)
        .select()
        .single();

      if (error) throw error;

      setTrades(prev => prev.map(trade => trade.id === tradeId ? data : trade));
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const deleteTrade = async (tradeId: string) => {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeId);

      if (error) throw error;

      setTrades(prev => prev.filter(trade => trade.id !== tradeId));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return { trades, loading, error, createTrade, createMultipleTrades, updateTrade, deleteTrade, refetch: fetchTrades };
}

// Hook for fetching activity logs (for streak tracking)
export function useActivityLogs(userId: string | undefined) {
  const [activities, setActivities] = useState<Database['public']['Tables']['activity_logs']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) {
      setActivities([]);
      setLoading(false);
      return;
    }

    const fetchActivities = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', userId)
          .order('activity_date', { ascending: false });

        if (error) throw error;

        setActivities(data || []);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userId, supabase]);

  const logActivity = async (activityType: 'strategies' | 'trading' | 'journal', activityTitle: string) => {
    if (!userId) return { error: 'No user ID provided' };

    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          activity_type: activityType,
          activity_title: activityTitle,
          activity_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        })
        .select()
        .single();

      if (error) throw error;

      setActivities(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  return { activities, loading, error, logActivity };
}
