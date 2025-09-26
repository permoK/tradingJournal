import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServerDB } from '@/lib/db/server';
import { strategies, trades } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const isDemoMode = searchParams.get('isDemoMode') === 'true';

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get strategy details and verify ownership
    const db = getServerDB();
    const [strategy] = await db
      .select()
      .from(strategies)
      .where(
        and(
          eq(strategies.id, id),
          eq(strategies.userId, session.user.id)
        )
      )
      .limit(1);

    if (!strategy) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 }
      );
    }

    // Get trades for this strategy filtered by demo mode
    const tradesData = await db
      .select()
      .from(trades)
      .where(
        and(
          eq(trades.strategyId, id),
          eq(trades.userId, session.user.id),
          eq(trades.isDemo, isDemoMode)
        )
      )
      .orderBy(trades.tradeDate);

    const closedTrades = tradesData.filter(trade => trade.status === 'closed' && trade.profitLoss !== null);
    const openTrades = tradesData.filter(trade => trade.status === 'open');

    // Calculate basic metrics
    const totalTrades = closedTrades.length;
    const profitableTrades = closedTrades.filter(trade => Number(trade.profitLoss!) > 0);
    const losingTrades = closedTrades.filter(trade => Number(trade.profitLoss!) < 0);
    const breakEvenTrades = closedTrades.filter(trade => Number(trade.profitLoss!) === 0);

    const totalProfit = profitableTrades.reduce((sum, trade) => sum + Number(trade.profitLoss!), 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + Number(trade.profitLoss!), 0));
    const netProfitLoss = totalProfit - totalLoss;

    const successRate = totalTrades > 0 ? (profitableTrades.length / totalTrades) * 100 : 0;
    const averageWin = profitableTrades.length > 0 ? totalProfit / profitableTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

    // Market analysis
    const marketPerformance = tradesData.reduce((acc, trade) => {
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

      if (trade.status === 'closed' && trade.profitLoss !== null) {
        if (Number(trade.profitLoss) > 0) {
          acc[trade.market].profitableTrades++;
        }
        acc[trade.market].totalProfitLoss += Number(trade.profitLoss);
      }

      return acc;
    }, {} as Record<string, any>);

    // Calculate success rate for each market
    Object.keys(marketPerformance).forEach(market => {
      const marketData = marketPerformance[market];
      const closedMarketTrades = marketData.trades.filter((t: any) => t.status === 'closed' && t.profitLoss !== null);
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
      const type = trade.tradeType as 'buy' | 'sell';
      tradeTypePerformance[type].totalTrades++;
      if (Number(trade.profitLoss!) > 0) {
        tradeTypePerformance[type].profitableTrades++;
      }
      tradeTypePerformance[type].totalProfitLoss += Number(trade.profitLoss!);
    });

    tradeTypePerformance.buy.successRate = tradeTypePerformance.buy.totalTrades > 0
      ? (tradeTypePerformance.buy.profitableTrades / tradeTypePerformance.buy.totalTrades) * 100
      : 0;
    tradeTypePerformance.sell.successRate = tradeTypePerformance.sell.totalTrades > 0
      ? (tradeTypePerformance.sell.profitableTrades / tradeTypePerformance.sell.totalTrades) * 100
      : 0;

    // Monthly performance
    const monthlyPerformance = closedTrades.reduce((acc, trade) => {
      const month = new Date(trade.tradeDate).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = {
          totalTrades: 0,
          profitableTrades: 0,
          totalProfitLoss: 0,
          successRate: 0
        };
      }

      acc[month].totalTrades++;
      if (Number(trade.profitLoss!) > 0) {
        acc[month].profitableTrades++;
      }
      acc[month].totalProfitLoss += Number(trade.profitLoss!);
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
      ? (recentTrades.filter(trade => Number(trade.profitLoss!) > 0).length / recentTrades.length) * 100
      : 0;

    // Longest winning/losing streaks
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;

    closedTrades.forEach(trade => {
      if (Number(trade.profitLoss!) > 0) {
        currentWinStreak++;
        currentLossStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
      } else if (Number(trade.profitLoss!) < 0) {
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
        trade_type: trade.tradeType,
        profit_loss: trade.profitLoss,
        trade_date: trade.tradeDate
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
