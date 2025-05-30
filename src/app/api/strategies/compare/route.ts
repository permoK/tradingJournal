import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { strategyIds, userId } = await request.json();

    console.log('Strategy comparison request:', { strategyIds, userId });

    if (!strategyIds || !Array.isArray(strategyIds) || strategyIds.length < 2) {
      console.error('Invalid strategy IDs:', strategyIds);
      return NextResponse.json(
        { error: 'At least 2 strategy IDs are required for comparison' },
        { status: 400 }
      );
    }

    if (!userId) {
      console.error('Missing user ID');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Use service role key for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get strategies
    console.log('Fetching strategies for user:', userId);
    const { data: strategies, error: strategiesError } = await supabase
      .from('strategies')
      .select('*')
      .in('id', strategyIds)
      .eq('user_id', userId);

    if (strategiesError) {
      console.error('Error fetching strategies:', strategiesError);
      return NextResponse.json(
        { error: `Failed to fetch strategies: ${strategiesError.message}` },
        { status: 500 }
      );
    }

    console.log('Found strategies:', strategies?.length);

    if (!strategies || strategies.length === 0) {
      console.error('No strategies found for user');
      return NextResponse.json(
        { error: 'No strategies found for the current user' },
        { status: 404 }
      );
    }

    if (strategies.length !== strategyIds.length) {
      console.error('Strategy count mismatch:', { found: strategies.length, requested: strategyIds.length });
      return NextResponse.json(
        { error: 'Some strategies not found or not accessible' },
        { status: 404 }
      );
    }

    // Get trades for all strategies
    console.log('Fetching trades for strategies:', strategyIds);
    const { data: allTrades, error: tradesError } = await supabase
      .from('trades')
      .select('*')
      .in('strategy_id', strategyIds)
      .eq('user_id', userId)
      .order('trade_date', { ascending: true });

    if (tradesError) {
      console.error('Error fetching trades:', tradesError);
      return NextResponse.json(
        { error: `Failed to fetch trade data: ${tradesError.message}` },
        { status: 500 }
      );
    }

    console.log('Found trades:', allTrades?.length || 0);

    // Process data for each strategy
    const comparisonData = strategies.map(strategy => {
      console.log(`Processing strategy: ${strategy.name} (${strategy.id})`);

      const strategyTrades = allTrades?.filter(trade => trade.strategy_id === strategy.id) || [];
      const closedTrades = strategyTrades.filter(trade => trade.status === 'closed' && trade.profit_loss !== null);

      console.log(`Strategy ${strategy.name}: ${strategyTrades.length} total trades, ${closedTrades.length} closed trades`);

      const totalTrades = closedTrades.length;
      const profitableTrades = closedTrades.filter(trade => trade.profit_loss! > 0);
      const losingTrades = closedTrades.filter(trade => trade.profit_loss! < 0);

      const totalProfit = profitableTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);
      const totalLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0));
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
        const closedMarketTrades = strategyTrades.filter(t =>
          t.market === market && t.status === 'closed' && t.profit_loss !== null
        );
        marketData.successRate = closedMarketTrades.length > 0
          ? (marketData.profitableTrades / closedMarketTrades.length) * 100
          : 0;
      });

      // Monthly performance
      const monthlyPerformance = closedTrades.reduce((acc, trade) => {
        try {
          const month = new Date(trade.trade_date).toISOString().slice(0, 7);
          if (!acc[month]) {
            acc[month] = { totalTrades: 0, profitableTrades: 0, totalProfitLoss: 0 };
          }
          acc[month].totalTrades++;
          if ((trade.profit_loss || 0) > 0) {
            acc[month].profitableTrades++;
          }
          acc[month].totalProfitLoss += trade.profit_loss || 0;
        } catch (error) {
          console.error('Error processing trade date:', trade.trade_date, error);
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
          profit_loss: trade.profit_loss,
          trade_date: trade.trade_date
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
      .filter(trade => trade.status === 'closed' && trade.trade_date)
      .map(trade => {
        try {
          return new Date(trade.trade_date).toISOString().slice(0, 7);
        } catch (error) {
          console.error('Error parsing trade date:', trade.trade_date, error);
          return null;
        }
      })
      .filter(Boolean)
    )].sort();

    comparison.timeComparison = allMonths.reduce((acc, month) => {
      acc[month] = comparisonData.map(strategyData => ({
        strategyName: strategyData.strategy.name,
        strategyId: strategyData.strategy.id,
        performance: strategyData.monthlyPerformance[month] || {
          totalTrades: 0,
          profitableTrades: 0,
          totalProfitLoss: 0
        }
      }));
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
