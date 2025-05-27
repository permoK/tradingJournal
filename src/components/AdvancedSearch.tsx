'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { FiSearch, FiFileText, FiBarChart2, FiUsers, FiTrendingUp } from 'react-icons/fi';

interface SearchResult {
  id: string;
  type: 'journal' | 'trade' | 'community_journal' | 'community_trade';
  title: string;
  subtitle: string;
  count?: number;
  market?: string;
  author?: string;
}

interface AdvancedSearchProps {
  onSearch?: (term: string) => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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

      // Search user's trades by market
      const { data: trades } = await supabase
        .from('trades')
        .select('id, market, trade_date, profit_loss, notes')
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

      // Search community trades
      const { data: communityTrades } = await supabase
        .from('trades')
        .select(`
          id, market, trade_date, profit_loss,
          profiles!inner(username)
        `)
        .eq('is_private', false)
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

      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setSearchTerm('');

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
      case 'community_journal':
        router.push(`/community/journal/${result.id}`);
        break;
      case 'community_trade':
        router.push(`/community/trade/${result.id}`);
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
      default:
        return <FiSearch className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-slate-500" />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search trades, journals, markets, community..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            className="w-full pl-10 p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white"
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="w-4 h-4 border-2 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium"
        >
          Search
        </button>
      </form>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.id}-${index}`}
              onClick={() => handleResultClick(result)}
              className="w-full px-4 py-3 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none border-b border-slate-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {getResultIcon(result.type)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 truncate">
                    {result.title}
                  </div>
                  <div className="text-sm text-slate-600 truncate">
                    {result.subtitle}
                  </div>
                </div>
                {result.count && (
                  <div className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full font-medium">
                    {result.count}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
