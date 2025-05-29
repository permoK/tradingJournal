import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get strategy details and verify ownership
    const { data: strategy, error: strategyError } = await supabase
      .from('strategies')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (strategyError || !strategy) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 }
      );
    }

    // Get all trades for this strategy (only user's trades)
    const { data: trades, error: tradesError } = await supabase
      .from('trades')
      .select('*')
      .eq('strategy_id', id)
      .eq('user_id', user.id)
      .order('trade_date', { ascending: true });

    if (tradesError) {
      console.error('Error fetching trades:', tradesError);
      return NextResponse.json(
        { error: 'Failed to fetch trade data' },
        { status: 500 }
      );
    }

    const closedTrades = trades.filter(trade => trade.status === 'closed' && trade.profit_loss !== null);
    const openTrades = trades.filter(trade => trade.status === 'open');

    // Calculate basic metrics
    const totalTrades = closedTrades.length;
    const profitableTrades = closedTrades.filter(trade => trade.profit_loss! > 0);
    const losingTrades = closedTrades.filter(trade => trade.profit_loss! < 0);
    const breakEvenTrades = closedTrades.filter(trade => trade.profit_loss === 0);

    const totalProfit = profitableTrades.reduce((sum, trade) => sum + trade.profit_loss!, 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.profit_loss!, 0));
    const netProfitLoss = totalProfit - totalLoss;

    const successRate = totalTrades > 0 ? (profitableTrades.length / totalTrades) * 100 : 0;
    const averageWin = profitableTrades.length > 0 ? totalProfit / profitableTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

    // Market analysis
    const marketPerformance = trades.reduce((acc, trade) => {
      if (!acc[trade.market]) {
        acc[trade.market] = {
          totalTrades: 0,
          profitableTrades: 0,
          totalProfitLoss: 0,
          trades: []
        };
      }

      acc[trade.market].totalTrades++;
      acc[trade.market].trades.push(trade);

      if (trade.status === 'closed' && trade.profit_loss !== null) {
        if (trade.profit_loss > 0) {
          acc[trade.market].profitableTrades++;
        }
        acc[trade.market].totalProfitLoss += trade.profit_loss;
      }

      return acc;
    }, {} as Record<string, any>);

    // Calculate success rate for each market
    Object.keys(marketPerformance).forEach(market => {
      const marketData = marketPerformance[market];
      const closedMarketTrades = marketData.trades.filter((t: any) => t.status === 'closed' && t.profit_loss !== null);
      marketData.successRate = closedMarketTrades.length > 0
        ? (marketData.profitableTrades / closedMarketTrades.length) * 100
        : 0;
    });

    // Trade type analysis
    const tradeTypePerformance = {
      buy: {
        totalTrades: 0,
        profitableTrades: 0,
        totalProfitLoss: 0,
        successRate: 0
      },
      sell: {
        totalTrades: 0,
        profitableTrades: 0,
        totalProfitLoss: 0,
        successRate: 0
      }
    };

    closedTrades.forEach(trade => {
      const type = trade.trade_type as 'buy' | 'sell';
      tradeTypePerformance[type].totalTrades++;
      if (trade.profit_loss! > 0) {
        tradeTypePerformance[type].profitableTrades++;
      }
      tradeTypePerformance[type].totalProfitLoss += trade.profit_loss!;
    });

    tradeTypePerformance.buy.successRate = tradeTypePerformance.buy.totalTrades > 0
      ? (tradeTypePerformance.buy.profitableTrades / tradeTypePerformance.buy.totalTrades) * 100
      : 0;
    tradeTypePerformance.sell.successRate = tradeTypePerformance.sell.totalTrades > 0
      ? (tradeTypePerformance.sell.profitableTrades / tradeTypePerformance.sell.totalTrades) * 100
      : 0;

    // Monthly performance
    const monthlyPerformance = closedTrades.reduce((acc, trade) => {
      const month = new Date(trade.trade_date).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = {
          totalTrades: 0,
          profitableTrades: 0,
          totalProfitLoss: 0,
          successRate: 0
        };
      }

      acc[month].totalTrades++;
      if (trade.profit_loss! > 0) {
        acc[month].profitableTrades++;
      }
      acc[month].totalProfitLoss += trade.profit_loss!;
      acc[month].successRate = (acc[month].profitableTrades / acc[month].totalTrades) * 100;

      return acc;
    }, {} as Record<string, any>);

    // Best and worst performing markets
    const marketStats = Object.entries(marketPerformance)
      .map(([market, data]: [string, any]) => ({
        market,
        ...data
      }))
      .sort((a, b) => b.totalProfitLoss - a.totalProfitLoss);

    const bestMarkets = marketStats.slice(0, 5);
    const worstMarkets = marketStats.slice(-5).reverse();

    // Recent performance trend (last 10 trades)
    const recentTrades = closedTrades.slice(-10);
    const recentSuccessRate = recentTrades.length > 0
      ? (recentTrades.filter(trade => trade.profit_loss! > 0).length / recentTrades.length) * 100
      : 0;

    // Longest winning/losing streaks
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;

    closedTrades.forEach(trade => {
      if (trade.profit_loss! > 0) {
        currentWinStreak++;
        currentLossStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
      } else if (trade.profit_loss! < 0) {
        currentLossStreak++;
        currentWinStreak = 0;
        maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
      }
    });

    const analytics = {
      strategy,
      overview: {
        totalTrades,
        openTrades: openTrades.length,
        profitableTrades: profitableTrades.length,
        losingTrades: losingTrades.length,
        breakEvenTrades: breakEvenTrades.length,
        successRate,
        netProfitLoss,
        totalProfit,
        totalLoss,
        averageWin,
        averageLoss,
        profitFactor,
        recentSuccessRate,
        maxWinStreak,
        maxLossStreak,
        currentWinStreak,
        currentLossStreak
      },
      marketPerformance,
      tradeTypePerformance,
      monthlyPerformance,
      bestMarkets,
      worstMarkets,
      recentTrades: recentTrades.map(trade => ({
        id: trade.id,
        market: trade.market,
        trade_type: trade.trade_type,
        profit_loss: trade.profit_loss,
        trade_date: trade.trade_date
      }))
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error in strategy analytics API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
