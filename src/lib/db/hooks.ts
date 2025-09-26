import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Hook for fetching user profile
export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/profiles/${userId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch profile');
        }

        setProfile(result.data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = async (updates: any) => {
    if (!userId) return { error: 'No user ID provided' };

    try {
      const response = await fetch(`/api/profiles/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      setProfile(result.data);
      return { data: result.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  return { profile, loading, error, updateProfile };
}

// Hook for fetching strategies
export function useStrategies(userId: string | undefined, includePrivate = true) {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setStrategies([]);
      setLoading(false);
      return;
    }

    const fetchStrategies = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/strategies?includePrivate=${includePrivate}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch strategies');
        }

        setStrategies(result.data || []);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setStrategies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategies();
  }, [userId, includePrivate]);

  const createStrategy = async (strategyData: any) => {
    if (!userId) return { error: 'No user ID provided' };

    try {
      const response = await fetch('/api/strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(strategyData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create strategy');
      }

      setStrategies(prev => [result.data, ...prev]);
      return { data: result.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateStrategy = async (strategyId: string, updates: any) => {
    try {
      const response = await fetch(`/api/strategies/${strategyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update strategy');
      }

      setStrategies(prev => prev.map(strategy =>
        strategy.id === strategyId ? result.data : strategy
      ));
      return { data: result.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const deleteStrategy = async (strategyId: string) => {
    try {
      const response = await fetch(`/api/strategies/${strategyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete strategy');
      }

      setStrategies(prev => prev.filter(strategy => strategy.id !== strategyId));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return { strategies, loading, error, createStrategy, updateStrategy, deleteStrategy };
}

// Hook for fetching trades
export function useTrades(userId: string | undefined, includePrivate = true, isDemoMode?: boolean) {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = async () => {
    if (!userId) {
      setTrades([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        includePrivate: includePrivate.toString(),
      });

      if (isDemoMode !== undefined) {
        params.append('isDemoMode', isDemoMode.toString());
      }

      const response = await fetch(`/api/trades?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch trades');
      }

      setTrades(result.data || []);
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
  }, [userId, includePrivate, isDemoMode]);

  const createTrade = async (trade: any) => {
    if (!userId) return { error: 'No user ID provided' };

    try {
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trade),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create trade');
      }

      setTrades(prev => [result.data, ...prev]);
      return { data: result.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const createMultipleTrades = async (trades: any[]) => {
    if (!userId) return { error: 'No user ID provided' };

    try {
      const newTrades: any[] = [];
      for (const trade of trades) {
        const response = await fetch('/api/trades', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(trade),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create trade');
        }

        newTrades.push(result.data);
      }

      setTrades(prev => [...newTrades, ...prev]);
      return { data: newTrades, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateTrade = async (tradeId: string, updates: any) => {
    try {
      const response = await fetch(`/api/trades/${tradeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update trade');
      }

      setTrades(prev => prev.map(trade => trade.id === tradeId ? result.data : trade));
      return { data: result.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const deleteTrade = async (tradeId: string) => {
    try {
      const response = await fetch(`/api/trades/${tradeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete trade');
      }

      setTrades(prev => prev.filter(trade => trade.id !== tradeId));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return { trades, loading, error, createTrade, createMultipleTrades, updateTrade, deleteTrade, refetch: fetchTrades };
}

// Hook for fetching journal entries
export function useJournalEntries(userId: string | undefined, includePrivate = true) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const fetchEntries = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          includePrivate: includePrivate.toString(),
        });

        const response = await fetch(`/api/journal?${params}`);

        if (!response.ok) {
          throw new Error('Failed to fetch journal entries');
        }

        const { data } = await response.json();
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
  }, [userId, includePrivate]);

  const createEntry = async (entry: any) => {
    if (!userId) return { error: 'No user ID provided' };

    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        throw new Error('Failed to create journal entry');
      }

      const { data } = await response.json();
      setEntries(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateEntry = async (entryId: string, updates: any) => {
    try {
      const response = await fetch(`/api/journal/${entryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update journal entry');
      }

      const { data } = await response.json();
      setEntries(prev => prev.map(entry => entry.id === entryId ? data : entry));
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const deleteEntry = async (entryId: string) => {
    try {
      const response = await fetch(`/api/journal/${entryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete journal entry');
      }

      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return { entries, loading, error, createEntry, updateEntry, deleteEntry };
}

// Hook for activity logs
export function useActivityLogs(userId: string | undefined) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setActivities([]);
      setLoading(false);
      return;
    }

    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/activity-logs');

        if (!response.ok) {
          throw new Error('Failed to fetch activity logs');
        }

        const { data } = await response.json();
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
  }, [userId]);

  const logActivity = async (activityType: 'learning' | 'trading' | 'journal', activityTitle: string) => {
    if (!userId) return { error: 'No user ID provided' };

    try {
      const response = await fetch('/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: activityType,
          activity_title: activityTitle,
          activity_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to log activity');
      }

      const { data } = await response.json();
      setActivities(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  return { activities, loading, error, logActivity };
}
