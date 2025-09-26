import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServerDB } from '@/lib/db/server';
import { strategies, trades } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { strategyIds, isDemoMode } = await request.json();

    console.log('Strategy comparison request:', { strategyIds, userId: session.user.id, isDemoMode });

    if (!strategyIds || !Array.isArray(strategyIds) || strategyIds.length < 2) {
      console.error('Invalid strategy IDs:', strategyIds);
      return NextResponse.json(
        { error: 'At least 2 strategy IDs are required for comparison' },
        { status: 400 }
      );
    }

    const db = getServerDB();

    // Get strategies
    console.log('Fetching strategies for user:', session.user.id);
    const strategiesData = await db
      .select()
      .from(strategies)
      .where(
        and(
          inArray(strategies.id, strategyIds),
          eq(strategies.userId, session.user.id)
        )
      );

    console.log('Found strategies:', strategiesData?.length);

    if (!strategiesData || strategiesData.length === 0) {
      console.error('No strategies found for user');
      return NextResponse.json(
        { error: 'No strategies found for the current user' },
        { status: 404 }
      );
    }

    if (strategiesData.length !== strategyIds.length) {
      console.error('Strategy count mismatch:', { found: strategiesData.length, requested: strategyIds.length });
      return NextResponse.json(
        { error: 'Some strategies not found or not accessible' },
        { status: 404 }
      );
    }

    // Get trades for all strategies filtered by demo mode
    console.log('Fetching trades for strategies:', strategyIds, 'isDemoMode:', isDemoMode);

    let whereConditions = [
      inArray(trades.strategyId, strategyIds),
      eq(trades.userId, session.user.id)
    ];

    // Filter by demo mode if specified
    if (isDemoMode !== undefined) {
      whereConditions.push(eq(trades.isDemo, isDemoMode));
    }

    const allTrades = await db
      .select()
      .from(trades)
      .where(and(...whereConditions))
      .orderBy(trades.tradeDate);

    console.log('Found trades:', allTrades?.length || 0);

    // Process data for each strategy
    const comparisonData = strategiesData.map(strategy => {
      console.log(`Processing strategy: ${strategy.name} (${strategy.id})`);

      const strategyTrades = allTrades?.filter(trade => trade.strategyId === strategy.id) || [];
      const closedTrades = strategyTrades.filter(trade => trade.status === 'closed' && trade.profitLoss !== null);

      console.log(`Strategy ${strategy.name}: ${strategyTrades.length} total trades, ${closedTrades.length} closed trades`);

      const totalTrades = closedTrades.length;
      const profitableTrades = closedTrades.filter(trade => Number(trade.profitLoss!) > 0);
      const losingTrades = closedTrades.filter(trade => Number(trade.profitLoss!) < 0);

      const totalProfit = profitableTrades.reduce((sum, trade) => sum + Number(trade.profitLoss || 0), 0);
      const totalLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + Number(trade.profitLoss || 0), 0));
      const netProfitLoss = totalProfit - totalLoss;

      const successRate = totalTrades > 0 ? (profitableTrades.length / totalTrades) * 100 : 0;
      const averageWin = profitableTrades.length > 0 ? totalProfit / profitableTrades.length : 0;
      const averageLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;
      const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

      // Market analysis
      const marketPerformance = strategyTrades.reduce((acc, trade) => {
        if (!trade.market) return acc; // Skip trades without market data

        if (!acc[trade.market]) {
          acc[trade.market] = { totalTrades: 0, profitableTrades: 0, totalProfitLoss: 0 };
        }
        acc[trade.market].totalTrades++;
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
        const closedMarketTrades = strategyTrades.filter(t =>
          t.market === market && t.status === 'closed' && t.profitLoss !== null
        );
        marketData.successRate = closedMarketTrades.length > 0
          ? (marketData.profitableTrades / closedMarketTrades.length) * 100
          : 0;
      });

      // Monthly performance
      const monthlyPerformance = closedTrades.reduce((acc, trade) => {
        try {
          const month = new Date(trade.tradeDate).toISOString().slice(0, 7);
          if (!acc[month]) {
            acc[month] = { totalTrades: 0, profitableTrades: 0, totalProfitLoss: 0 };
          }
          acc[month].totalTrades++;
          if (Number(trade.profitLoss || 0) > 0) {
            acc[month].profitableTrades++;
          }
          acc[month].totalProfitLoss += Number(trade.profitLoss || 0);
        } catch (error) {
          console.error('Error processing trade date:', trade.tradeDate, error);
        }
        return acc;
      }, {} as Record<string, any>);

      // Best performing markets
      const bestMarkets = Object.entries(marketPerformance)
        .map(([market, data]: [string, any]) => ({
          market,
          ...data
        }))
        .sort((a, b) => b.totalProfitLoss - a.totalProfitLoss)
        .slice(0, 3);

      return {
        strategy,
        metrics: {
          totalTrades,
          profitableTrades: profitableTrades.length,
          losingTrades: losingTrades.length,
          successRate,
          netProfitLoss,
          totalProfit,
          totalLoss,
          averageWin,
          averageLoss,
          profitFactor
        },
        marketPerformance,
        monthlyPerformance,
        bestMarkets,
        recentPerformance: closedTrades.slice(-5).map(trade => ({
          market: trade.market,
          profit_loss: trade.profitLoss,
          trade_date: trade.tradeDate
        }))
      };
    });

    // Calculate comparative metrics
    console.log('Calculating comparative metrics for', comparisonData.length, 'strategies');

    const comparison = {
      strategies: comparisonData,
      summary: {
        bestPerformer: comparisonData.length > 0 ? comparisonData.reduce((best, current) =>
          current.metrics.netProfitLoss > best.metrics.netProfitLoss ? current : best
        ) : null,
        mostConsistent: comparisonData.length > 0 ? comparisonData.reduce((best, current) =>
          current.metrics.successRate > best.metrics.successRate ? current : best
        ) : null,
        mostActive: comparisonData.length > 0 ? comparisonData.reduce((best, current) =>
          current.metrics.totalTrades > best.metrics.totalTrades ? current : best
        ) : null,
        bestProfitFactor: comparisonData.length > 0 ? comparisonData.reduce((best, current) =>
          current.metrics.profitFactor > best.metrics.profitFactor ? current : best
        ) : null
      },
      marketComparison: {},
      timeComparison: {}
    };

    // Market comparison across strategies
    const allMarkets = [...new Set((allTrades || []).map(trade => trade.market).filter(Boolean))];
    comparison.marketComparison = allMarkets.reduce((acc, market) => {
      acc[market] = comparisonData.map(strategyData => ({
        strategyName: strategyData.strategy.name,
        strategyId: strategyData.strategy.id,
        performance: strategyData.marketPerformance[market] || {
          totalTrades: 0,
          profitableTrades: 0,
          totalProfitLoss: 0,
          successRate: 0
        }
      }));
      return acc;
    }, {} as Record<string, any>);

    // Time-based comparison
    const allMonths = [...new Set((allTrades || [])
      .filter(trade => trade.status === 'closed' && trade.tradeDate)
      .map(trade => {
        try {
          return new Date(trade.tradeDate).toISOString().slice(0, 7);
        } catch (error) {
          console.error('Error parsing trade date:', trade.tradeDate, error);
          return null;
        }
      })
      .filter(Boolean)
    )].sort();

    comparison.timeComparison = allMonths.reduce((acc, month) => {
      if (month) {
        acc[month] = comparisonData.map(strategyData => ({
          strategyName: strategyData.strategy.name,
          strategyId: strategyData.strategy.id,
          performance: strategyData.monthlyPerformance[month] || {
            totalTrades: 0,
            profitableTrades: 0,
            totalProfitLoss: 0
          }
        }));
      }
      return acc;
    }, {} as Record<string, any>);

    console.log('Comparison completed successfully');
    return NextResponse.json(comparison);
  } catch (error) {
    console.error('Error in strategy comparison API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
