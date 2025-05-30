'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { FiSearch, FiFileText, FiBarChart2, FiUsers, FiTrendingUp, FiTarget, FiActivity, FiUser } from 'react-icons/fi';

interface SearchResult {
  id: string;
  type: 'journal' | 'trade' | 'community_journal' | 'community_trade' | 'strategy' | 'community_strategy' | 'activity' | 'profile';
  title: string;
  subtitle: string;
  count?: number;
  market?: string;
  author?: string;
  category?: string;
}

interface AdvancedSearchProps {
  onSearch?: (term: string) => void;
  placeholder?: string;
  className?: string;
  minimal?: boolean;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  placeholder = "Search trades, journals, strategies, community...",
  className = "",
  minimal = false
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search function with debouncing
  useEffect(() => {
    setSelectedIndex(-1); // Reset selection when search term changes
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        performSearch(searchTerm.trim());
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, user?.id]);

  const performSearch = async (term: string) => {
    if (!user) return;

    setLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      // Search user's journal entries
      const { data: journalEntries } = await supabase
        .from('journal_entries')
        .select('id, title, content, created_at')
        .eq('user_id', user.id)
        .or(`title.ilike.%${term}%, content.ilike.%${term}%`)
        .limit(5);

      if (journalEntries) {
        journalEntries.forEach(entry => {
          searchResults.push({
            id: entry.id,
            type: 'journal',
            title: entry.title,
            subtitle: `Journal • ${new Date(entry.created_at).toLocaleDateString()}`
          });
        });
      }

      // Search user's strategies
      const { data: strategies } = await supabase
        .from('strategies')
        .select('id, name, description, category, created_at')
        .eq('user_id', user.id)
        .or(`name.ilike.%${term}%, description.ilike.%${term}%, category.ilike.%${term}%`)
        .limit(5);

      if (strategies) {
        strategies.forEach(strategy => {
          searchResults.push({
            id: strategy.id,
            type: 'strategy',
            title: strategy.name,
            subtitle: `Strategy • ${strategy.category || 'Uncategorized'}`,
            category: strategy.category
          });
        });
      }

      // Search user's trades by market (enhanced with strategy info)
      const { data: trades } = await supabase
        .from('trades')
        .select(`
          id, market, trade_date, profit_loss, notes,
          strategies(name)
        `)
        .eq('user_id', user.id)
        .or(`market.ilike.%${term}%, notes.ilike.%${term}%`)
        .limit(5);

      if (trades) {
        // Group trades by market
        const marketCounts: Record<string, number> = {};
        trades.forEach(trade => {
          marketCounts[trade.market] = (marketCounts[trade.market] || 0) + 1;
        });

        // Add market-based results
        Object.entries(marketCounts).forEach(([market, count]) => {
          if (market.toLowerCase().includes(term.toLowerCase())) {
            searchResults.push({
              id: `market-${market}`,
              type: 'trade',
              title: market,
              subtitle: `${count} trade${count > 1 ? 's' : ''} in your portfolio`,
              count,
              market
            });
          }
        });

        // Add individual trades with notes
        trades.forEach(trade => {
          if (trade.notes && trade.notes.toLowerCase().includes(term.toLowerCase())) {
            searchResults.push({
              id: trade.id,
              type: 'trade',
              title: `${trade.market} Trade`,
              subtitle: `Trade • ${new Date(trade.trade_date).toLocaleDateString()}`
            });
          }
        });
      }

      // Search community journal entries
      const { data: communityJournals } = await supabase
        .from('journal_entries')
        .select(`
          id, title, content, created_at,
          profiles!inner(username)
        `)
        .eq('is_private', false)
        .neq('user_id', user.id)
        .or(`title.ilike.%${term}%, content.ilike.%${term}%`)
        .limit(3);

      if (communityJournals) {
        communityJournals.forEach(entry => {
          searchResults.push({
            id: entry.id,
            type: 'community_journal',
            title: entry.title,
            subtitle: `Community Journal • by ${(entry.profiles as any)?.username || 'Unknown'}`,
            author: (entry.profiles as any)?.username
          });
        });
      }

      // Search community trades (exclude demo trades)
      const { data: communityTrades } = await supabase
        .from('trades')
        .select(`
          id, market, trade_date, profit_loss,
          profiles!inner(username)
        `)
        .eq('is_private', false)
        .eq('is_demo', false)
        .neq('user_id', user.id)
        .ilike('market', `%${term}%`)
        .limit(3);

      if (communityTrades) {
        communityTrades.forEach(trade => {
          searchResults.push({
            id: trade.id,
            type: 'community_trade',
            title: `${trade.market} Trade`,
            subtitle: `Community Trade • by ${(trade.profiles as any)?.username || 'Unknown'}`,
            author: (trade.profiles as any)?.username
          });
        });
      }

      // Search community strategies
      const { data: communityStrategies } = await supabase
        .from('strategies')
        .select(`
          id, name, description, category,
          profiles!inner(username)
        `)
        .eq('is_private', false)
        .neq('user_id', user.id)
        .or(`name.ilike.%${term}%, description.ilike.%${term}%, category.ilike.%${term}%`)
        .limit(3);

      if (communityStrategies) {
        communityStrategies.forEach(strategy => {
          searchResults.push({
            id: strategy.id,
            type: 'community_strategy',
            title: strategy.name,
            subtitle: `Community Strategy • by ${(strategy.profiles as any)?.username || 'Unknown'}`,
            author: (strategy.profiles as any)?.username,
            category: strategy.category
          });
        });
      }

      // Search user's activity logs
      const { data: activities } = await supabase
        .from('activity_logs')
        .select('id, activity_title, activity_type, activity_date')
        .eq('user_id', user.id)
        .ilike('activity_title', `%${term}%`)
        .limit(3);

      if (activities) {
        activities.forEach(activity => {
          searchResults.push({
            id: activity.id,
            type: 'activity',
            title: activity.activity_title,
            subtitle: `Activity • ${activity.activity_type} • ${new Date(activity.activity_date).toLocaleDateString()}`
          });
        });
      }

      // Search community profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, bio')
        .neq('id', user.id)
        .or(`username.ilike.%${term}%, full_name.ilike.%${term}%, bio.ilike.%${term}%`)
        .limit(3);

      if (profiles) {
        profiles.forEach(profile => {
          searchResults.push({
            id: profile.id,
            type: 'profile',
            title: profile.username || profile.full_name || 'Unknown User',
            subtitle: `Profile • ${profile.full_name ? profile.full_name : 'Community Member'}`
          });
        });
      }

      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex]);
        } else {
          handleSubmit(e as any);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setSearchTerm('');
    setSelectedIndex(-1);

    switch (result.type) {
      case 'journal':
        router.push(`/journal/edit/${result.id}`);
        break;
      case 'trade':
        if (result.market) {
          router.push(`/trading?market=${encodeURIComponent(result.market)}`);
        } else {
          router.push(`/trading/edit/${result.id}`);
        }
        break;
      case 'strategy':
        router.push(`/strategies/${result.id}`);
        break;
      case 'activity':
        // Navigate to the appropriate section based on activity type
        if (result.subtitle?.includes('trading')) {
          router.push('/trading');
        } else if (result.subtitle?.includes('journal')) {
          router.push('/journal');
        } else if (result.subtitle?.includes('strategies')) {
          router.push('/strategies');
        } else {
          router.push('/dashboard');
        }
        break;
      case 'profile':
        router.push(`/community/profile/${result.id}`);
        break;
      case 'community_journal':
        router.push(`/community/journal/${result.id}`);
        break;
      case 'community_trade':
        router.push(`/community/trade/${result.id}`);
        break;
      case 'community_strategy':
        router.push(`/community/strategy/${result.id}`);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsOpen(false);
      if (onSearch) {
        onSearch(searchTerm.trim());
      } else {
        router.push(`/journal?search=${encodeURIComponent(searchTerm.trim())}`);
      }
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'journal':
      case 'community_journal':
        return <FiFileText className="w-4 h-4 text-indigo-600" />;
      case 'trade':
      case 'community_trade':
        return <FiBarChart2 className="w-4 h-4 text-emerald-600" />;
      case 'strategy':
      case 'community_strategy':
        return <FiTarget className="w-4 h-4 text-purple-600" />;
      case 'activity':
        return <FiActivity className="w-4 h-4 text-amber-600" />;
      case 'profile':
        return <FiUser className="w-4 h-4 text-blue-600" />;
      default:
        return <FiSearch className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className={minimal ? "w-full" : "flex gap-3"}>
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className={minimal ? "text-slate-400 w-4 h-4" : "text-slate-500"} />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            className={minimal
              ? "w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white text-slate-900 placeholder-slate-500"
              : "w-full pl-10 p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white placeholder-slate-500"
            }
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className={`border-2 border-indigo-600 rounded-full border-t-transparent animate-spin ${minimal ? 'w-4 h-4' : 'w-4 h-4'}`}></div>
            </div>
          )}
        </div>
        {!minimal && (
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Search
          </button>
        )}
      </form>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Results Header */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
            <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.id}-${index}`}
              onClick={() => handleResultClick(result)}
              className={`w-full px-4 py-3 text-left focus:outline-none border-b border-slate-100 last:border-b-0 transition-colors group ${
                selectedIndex === index
                  ? 'bg-indigo-50 border-indigo-200'
                  : 'hover:bg-slate-50 focus:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                {getResultIcon(result.type)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                    {result.title}
                  </div>
                  <div className="text-sm text-slate-600 truncate">
                    {result.subtitle}
                  </div>
                  {result.category && (
                    <div className="text-xs text-slate-500 mt-1">
                      Category: {result.category}
                    </div>
                  )}
                </div>
                {result.count && (
                  <div className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full font-medium">
                    {result.count}
                  </div>
                )}
              </div>
            </button>
          ))}

          {/* Search Footer */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-200">
            <div className="text-xs text-slate-500 text-center">
              Press Enter to search all content
            </div>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {isOpen && results.length === 0 && searchTerm.length >= 2 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50">
          <div className="px-4 py-6 text-center">
            <FiSearch className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <div className="text-sm font-medium text-slate-900 mb-1">No results found</div>
            <div className="text-xs text-slate-500">
              Try searching for trades, journals, strategies, or community content
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
