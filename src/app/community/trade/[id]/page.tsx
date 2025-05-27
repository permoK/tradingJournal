'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/lib/supabase';
import { FiArrowLeft, FiUser, FiCalendar, FiTrendingUp, FiTrendingDown, FiDollarSign, FiBarChart2 } from 'react-icons/fi';
import { format } from 'date-fns';
import Link from 'next/link';
import { Database } from '@/types/database.types';

type Trade = Database['public']['Tables']['trades']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export default function CommunityTradeDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [author, setAuthor] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTradeDetail = async () => {
      setLoading(true);

      try {
        // Fetch trade
        const { data: tradeData, error: tradeError } = await supabase
          .from('trades')
          .select('*')
          .eq('id', params.id)
          .eq('is_private', false)
          .single();

        if (tradeError || !tradeData) {
          setError('Trade not found or is private');
          setLoading(false);
          return;
        }

        setTrade(tradeData);

        // Fetch author profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', tradeData.user_id)
          .single();

        if (!profileError && profileData) {
          setAuthor(profileData);
        }
      } catch (err) {
        console.error('Error fetching trade:', err);
        setError('Failed to load trade');
      }

      setLoading(false);
    };

    fetchTradeDetail();
  }, [params.id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  if (error || !trade) {
    return (
      <AppLayout>
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Trade Not Found</h1>
          <p className="text-slate-600 mb-6">
            This trade doesn't exist or is private.
          </p>
          <Link
            href="/community"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Community
          </Link>
        </div>
      </AppLayout>
    );
  }

  const profitLoss = trade.profit_loss || 0;
  const isProfit = profitLoss > 0;
  const profitLossPercentage = trade.entry_price 
    ? ((profitLoss / trade.entry_price) * 100).toFixed(2)
    : '0.00';

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/community"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4 font-medium"
        >
          <FiArrowLeft className="mr-2" />
          Back to Community
        </Link>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900">{trade.market} Trade</h1>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              trade.status === 'closed' 
                ? isProfit 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-red-100 text-red-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {trade.status === 'closed' ? (isProfit ? 'Profitable' : 'Loss') : 'Open'}
            </div>
          </div>
          
          {/* Author Info */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
              {author?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <FiUser className="text-slate-500 w-4 h-4" />
                <span className="font-semibold text-slate-900">
                  {author?.username || 'Unknown User'}
                </span>
                {author?.full_name && (
                  <span className="text-slate-600">({author.full_name})</span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <FiCalendar className="w-4 h-4" />
                <span>{format(new Date(trade.trade_date), 'MMMM d, yyyy')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Trade Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <FiBarChart2 className="mr-2 text-indigo-600" />
            Trade Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Market:</span>
              <span className="font-semibold text-slate-900">{trade.market}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Type:</span>
              <span className={`font-semibold ${
                trade.trade_type === 'buy' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {trade.trade_type.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Entry Price:</span>
              <span className="font-semibold text-slate-900">${trade.entry_price.toFixed(4)}</span>
            </div>
            {trade.exit_price && (
              <div className="flex justify-between">
                <span className="text-slate-600">Exit Price:</span>
                <span className="font-semibold text-slate-900">${trade.exit_price.toFixed(4)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">Quantity:</span>
              <span className="font-semibold text-slate-900">{trade.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Status:</span>
              <span className={`font-semibold capitalize ${
                trade.status === 'closed' ? 'text-slate-900' : 'text-amber-600'
              }`}>
                {trade.status}
              </span>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <FiDollarSign className="mr-2 text-emerald-600" />
            Performance
          </h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-1 ${
                isProfit ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {isProfit ? '+' : ''}${profitLoss.toFixed(2)}
              </div>
              <div className={`text-sm font-medium ${
                isProfit ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {isProfit ? '+' : ''}{profitLossPercentage}%
              </div>
            </div>
            <div className="flex items-center justify-center">
              {isProfit ? (
                <FiTrendingUp className="w-8 h-8 text-emerald-600" />
              ) : (
                <FiTrendingDown className="w-8 h-8 text-red-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {trade.notes && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Trade Notes</h3>
          <div className="prose max-w-none text-slate-800 leading-relaxed">
            {trade.notes.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-2 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Author Bio */}
      {author?.bio && (
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">About the Trader</h3>
          <div className="flex items-start space-x-4">
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
              {author.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 mb-1">{author.username}</h4>
              {author.full_name && (
                <p className="text-slate-600 mb-2">{author.full_name}</p>
              )}
              <p className="text-slate-700">{author.bio}</p>
              <div className="mt-3 text-sm text-slate-600">
                <span className="font-medium">Streak:</span> {author.streak_count} days •{' '}
                <span className="font-medium">Member since:</span> {format(new Date(author.created_at), 'MMMM yyyy')}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
