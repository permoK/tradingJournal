import { useEffect, useState } from 'react';
import { Database } from '../types/database.types';

// Mock data for demonstration purposes
const mockUser = { id: '1', email: 'demo@example.com' };

const mockProfile = {
  id: '1',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
  username: 'demo_user',
  full_name: 'Demo User',
  avatar_url: null,
  bio: 'I am learning Deriv trading',
  streak_count: 5,
  last_active: '2023-06-01T00:00:00.000Z'
};

const mockTopics = [
  {
    id: '1',
    created_at: '2023-01-01T00:00:00.000Z',
    title: 'Introduction to Deriv',
    description: 'Learn the basics of Deriv trading platform',
    category: 'Basics',
    difficulty: 'Beginner',
    order: 1
  },
  {
    id: '2',
    created_at: '2023-01-02T00:00:00.000Z',
    title: 'Understanding Market Types',
    description: 'Explore different markets available on Deriv',
    category: 'Markets',
    difficulty: 'Beginner',
    order: 2
  },
  {
    id: '3',
    created_at: '2023-01-03T00:00:00.000Z',
    title: 'Technical Analysis Basics',
    description: 'Learn how to analyze price charts',
    category: 'Analysis',
    difficulty: 'Intermediate',
    order: 3
  },
  {
    id: '4',
    created_at: '2023-01-04T00:00:00.000Z',
    title: 'Risk Management Strategies',
    description: 'Understand how to manage risk in trading',
    category: 'Strategy',
    difficulty: 'Intermediate',
    order: 4
  },
  {
    id: '5',
    created_at: '2023-01-05T00:00:00.000Z',
    title: 'Advanced Trading Patterns',
    description: 'Master complex trading patterns',
    category: 'Analysis',
    difficulty: 'Advanced',
    order: 5
  }
];

const mockProgress = [
  {
    id: '1',
    created_at: '2023-02-01T00:00:00.000Z',
    user_id: '1',
    topic_id: '1',
    status: 'completed' as const,
    completion_date: '2023-02-05T00:00:00.000Z',
    notes: 'Completed the introduction module'
  },
  {
    id: '2',
    created_at: '2023-02-10T00:00:00.000Z',
    user_id: '1',
    topic_id: '2',
    status: 'completed' as const,
    completion_date: '2023-02-15T00:00:00.000Z',
    notes: 'Learned about forex and crypto markets'
  },
  {
    id: '3',
    created_at: '2023-03-01T00:00:00.000Z',
    user_id: '1',
    topic_id: '3',
    status: 'in_progress' as const,
    completion_date: null,
    notes: 'Working on understanding candlestick patterns'
  }
];

const mockJournalEntries = [
  {
    id: '1',
    created_at: '2023-03-10T00:00:00.000Z',
    user_id: '1',
    title: 'My First Week of Trading',
    content: 'This week I started trading on Deriv. I focused on learning the platform and making small trades to get comfortable with the process.',
    is_private: false,
    tags: ['beginner', 'learning']
  },
  {
    id: '2',
    created_at: '2023-03-15T00:00:00.000Z',
    user_id: '1',
    title: 'Technical Analysis Practice',
    content: 'Today I practiced identifying support and resistance levels on EUR/USD charts. I noticed some interesting patterns forming.',
    is_private: true,
    tags: ['technical', 'analysis', 'forex']
  },
  {
    id: '3',
    created_at: '2023-03-20T00:00:00.000Z',
    user_id: '1',
    title: 'Trading Psychology',
    content: 'I realized how important emotional control is in trading. Today I made a mistake by letting fear drive my decision to exit a trade too early.',
    is_private: false,
    tags: ['psychology', 'emotions']
  }
];

const mockTrades = [
  {
    id: '1',
    created_at: '2023-04-01T00:00:00.000Z',
    user_id: '1',
    trade_date: '2023-04-01T00:00:00.000Z',
    market: 'EUR/USD',
    trade_type: 'Buy',
    entry_price: 1.0850,
    exit_price: 1.0900,
    quantity: 1,
    profit_loss: 50,
    status: 'closed' as const,
    notes: 'Good trade based on support level',
    screenshot_url: null,
    is_private: false
  },
  {
    id: '2',
    created_at: '2023-04-05T00:00:00.000Z',
    user_id: '1',
    trade_date: '2023-04-05T00:00:00.000Z',
    market: 'BTC/USD',
    trade_type: 'Sell',
    entry_price: 28000,
    exit_price: 27500,
    quantity: 0.1,
    profit_loss: 50,
    status: 'closed' as const,
    notes: 'Sold at resistance',
    screenshot_url: null,
    is_private: false
  },
  {
    id: '3',
    created_at: '2023-04-10T00:00:00.000Z',
    user_id: '1',
    trade_date: '2023-04-10T00:00:00.000Z',
    market: 'Gold',
    trade_type: 'Buy',
    entry_price: 1900,
    exit_price: null,
    quantity: 1,
    profit_loss: null,
    status: 'open' as const,
    notes: 'Long-term position',
    screenshot_url: null,
    is_private: true
  }
];

// Hook for authentication
export function useAuth() {
  const [user, setUser] = useState(mockUser);
  const [loading, setLoading] = useState(false);

  return { user, loading };
}

// Hook for fetching user profile
export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Database['public']['Tables']['profiles']['Row'] | null>(mockProfile);
  const [loading, setLoading] = useState(false);

  return { profile, loading };
}

// Hook for fetching learning topics
export function useLearningTopics() {
  const [topics, setTopics] = useState<Database['public']['Tables']['learning_topics']['Row'][]>(mockTopics);
  const [loading, setLoading] = useState(false);

  return { topics, loading };
}

// Hook for fetching user progress
export function useUserProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<Database['public']['Tables']['user_progress']['Row'][]>(mockProgress);
  const [loading, setLoading] = useState(false);

  return { progress, loading };
}

// Hook for fetching journal entries
export function useJournalEntries(userId: string | undefined, includePrivate = true) {
  const [entries, setEntries] = useState<Database['public']['Tables']['journal_entries']['Row'][]>(
    includePrivate
      ? mockJournalEntries
      : mockJournalEntries.filter(entry => !entry.is_private)
  );
  const [loading, setLoading] = useState(false);

  return { entries, loading };
}

// Hook for fetching trades
export function useTrades(userId: string | undefined, includePrivate = true) {
  const [trades, setTrades] = useState<Database['public']['Tables']['trades']['Row'][]>(
    includePrivate
      ? mockTrades
      : mockTrades.filter(trade => !trade.is_private)
  );
  const [loading, setLoading] = useState(false);

  return { trades, loading };
}
