// Test cases for calculator functions
import {
  calculatePL,
  calculatePositionSize,
  calculateRiskReward,
  calculatePipValue,
  getMarketInfo,
  validateTradeSetup,
  type TradeParams,
  type PositionSizeParams,
  type RiskRewardParams,
  type PipValueParams
} from './plCalculator';

// Test function to run all calculator tests
export function runCalculatorTests(): void {
  console.log('🧪 Running Calculator Tests...\n');

  testForexPLCalculation();
  testGoldPLCalculation();
  testPositionSizeCalculation();
  testRiskRewardCalculation();
  testPipValueCalculation();
  testTradeValidation();

  console.log('✅ All calculator tests completed!\n');
}

// Test Forex P&L Calculation
function testForexPLCalculation(): void {
  console.log('📊 Testing Forex P&L Calculation...');

  const market = getMarketInfo('EUR/USD');
  if (!market) {
    console.error('❌ Market info not found for EUR/USD');
    return;
  }

  // Test Case 1: Buy EUR/USD - Profitable trade
  const buyParams: TradeParams = {
    market,
    tradeType: 'buy',
    entryPrice: 1.1000,
    exitPrice: 1.1050,
    quantity: 1 // 1 lot
  };

  const buyResult = calculatePL(buyParams);
  console.log('Buy Trade Result:', {
    profitLoss: buyResult.profitLoss,
    pips: buyResult.pips,
    percentage: buyResult.percentage
  });

  // Expected: 50 pips profit, $500 profit for 1 lot
  const expectedProfit = 500;
  const expectedPips = 50;
  
  if (Math.abs(buyResult.profitLoss - expectedProfit) < 1 && 
      Math.abs(buyResult.pips - expectedPips) < 0.1) {
    console.log('✅ Buy trade calculation correct');
  } else {
    console.log('❌ Buy trade calculation incorrect');
    console.log(`Expected: $${expectedProfit}, ${expectedPips} pips`);
    console.log(`Got: $${buyResult.profitLoss}, ${buyResult.pips} pips`);
  }

  // Test Case 2: Sell EUR/USD - Profitable trade
  const sellParams: TradeParams = {
    market,
    tradeType: 'sell',
    entryPrice: 1.1050,
    exitPrice: 1.1000,
    quantity: 1
  };

  const sellResult = calculatePL(sellParams);
  console.log('Sell Trade Result:', {
    profitLoss: sellResult.profitLoss,
    pips: sellResult.pips,
    percentage: sellResult.percentage
  });

  if (Math.abs(sellResult.profitLoss - expectedProfit) < 1 && 
      Math.abs(sellResult.pips - expectedPips) < 0.1) {
    console.log('✅ Sell trade calculation correct');
  } else {
    console.log('❌ Sell trade calculation incorrect');
  }

  console.log('');
}

// Test Gold P&L Calculation
function testGoldPLCalculation(): void {
  console.log('🥇 Testing Gold P&L Calculation...');

  const market = getMarketInfo('GOLD');
  if (!market) {
    console.error('❌ Market info not found for GOLD');
    return;
  }

  // Test Case: Buy GOLD - $1 move up
  // Entry: $2000, Exit: $2001, 1 lot
  // Expected: $1 profit ($1 move × 1 lot = $1 profit)
  const goldParams: TradeParams = {
    market,
    tradeType: 'buy',
    entryPrice: 2000.00,
    exitPrice: 2001.00,
    quantity: 1 // 1 lot
  };

  const goldResult = calculatePL(goldParams);
  console.log('Gold Trade Result:', {
    profitLoss: goldResult.profitLoss,
    pips: goldResult.pips,
    percentage: goldResult.percentage,
    priceMovement: goldResult.breakdown.priceMovement
  });

  // Expected: $1 move = 100 pips (since pip = 0.01), $1 profit for 1 lot
  const expectedProfit = 1; // $1 move × 1 lot = $1 profit
  const expectedPips = 100; // $1.00 / $0.01 = 100 pips

  if (Math.abs(goldResult.profitLoss - expectedProfit) < 0.01 &&
      Math.abs(goldResult.pips - expectedPips) < 0.1) {
    console.log('✅ Gold calculation correct');
    console.log(`✅ $1 move on 1 lot gold = $${goldResult.profitLoss} profit`);
  } else {
    console.log('❌ Gold calculation incorrect');
    console.log(`Expected: $${expectedProfit}, ${expectedPips} pips`);
    console.log(`Got: $${goldResult.profitLoss}, ${goldResult.pips} pips`);
  }

  // Test smaller move: $0.10 (10 cents)
  const smallMoveParams: TradeParams = {
    market,
    tradeType: 'buy',
    entryPrice: 2000.00,
    exitPrice: 2000.10,
    quantity: 1
  };

  const smallResult = calculatePL(smallMoveParams);
  const expectedSmallProfit = 0.10; // $0.10 move × 1 lot = $0.10 profit
  const expectedSmallPips = 10; // $0.10 / $0.01 = 10 pips

  console.log('Small Gold Move Result:', {
    profitLoss: smallResult.profitLoss,
    pips: smallResult.pips
  });

  if (Math.abs(smallResult.profitLoss - expectedSmallProfit) < 0.01 &&
      Math.abs(smallResult.pips - expectedSmallPips) < 0.1) {
    console.log('✅ Small gold move calculation correct');
  } else {
    console.log('❌ Small gold move calculation incorrect');
    console.log(`Expected: $${expectedSmallProfit}, ${expectedSmallPips} pips`);
    console.log(`Got: $${smallResult.profitLoss}, ${smallResult.pips} pips`);
  }

  console.log('');
}

// Test Position Size Calculation
function testPositionSizeCalculation(): void {
  console.log('📏 Testing Position Size Calculation...');

  const market = getMarketInfo('EUR/USD');
  if (!market) {
    console.error('❌ Market info not found for EUR/USD');
    return;
  }

  const params: PositionSizeParams = {
    accountBalance: 10000,
    riskPercentage: 2,
    entryPrice: 1.1000,
    stopLossPrice: 1.0950,
    market
  };

  const result = calculatePositionSize(params);
  console.log('Position Size Result:', {
    positionSize: result.positionSize,
    riskAmount: result.riskAmount,
    pipRisk: result.pipRisk,
    marginRequired: result.marginRequired
  });

  // Expected: Risk $200 (2% of $10,000), 50 pips risk
  const expectedRisk = 200;
  const expectedPipRisk = 50;

  if (Math.abs(result.riskAmount - expectedRisk) < 1 && 
      Math.abs(result.pipRisk - expectedPipRisk) < 0.1) {
    console.log('✅ Position size calculation correct');
  } else {
    console.log('❌ Position size calculation incorrect');
    console.log(`Expected: $${expectedRisk} risk, ${expectedPipRisk} pip risk`);
    console.log(`Got: $${result.riskAmount} risk, ${result.pipRisk} pip risk`);
  }

  console.log('');
}

// Test Risk/Reward Calculation
function testRiskRewardCalculation(): void {
  console.log('⚖️ Testing Risk/Reward Calculation...');

  const market = getMarketInfo('EUR/USD');
  if (!market) {
    console.error('❌ Market info not found for EUR/USD');
    return;
  }

  const params: RiskRewardParams = {
    entryPrice: 1.1000,
    stopLossPrice: 1.0950,
    takeProfitPrice: 1.1100,
    positionSize: 1,
    market
  };

  const result = calculateRiskReward(params);
  console.log('Risk/Reward Result:', {
    riskAmount: result.riskAmount,
    rewardAmount: result.rewardAmount,
    riskRewardRatio: result.riskRewardRatio,
    breakEvenWinRate: result.breakEvenWinRate
  });

  // Expected: 50 pips risk, 100 pips reward, 1:2 ratio
  const expectedRatio = 2;
  const expectedBreakEven = 33.33; // For 1:2 ratio

  if (Math.abs(result.riskRewardRatio - expectedRatio) < 0.1 && 
      Math.abs(result.breakEvenWinRate - expectedBreakEven) < 1) {
    console.log('✅ Risk/reward calculation correct');
  } else {
    console.log('❌ Risk/reward calculation incorrect');
    console.log(`Expected: 1:${expectedRatio} ratio, ${expectedBreakEven}% break-even`);
    console.log(`Got: 1:${result.riskRewardRatio} ratio, ${result.breakEvenWinRate}% break-even`);
  }

  console.log('');
}

// Test Pip Value Calculation
function testPipValueCalculation(): void {
  console.log('💰 Testing Pip Value Calculation...');

  const market = getMarketInfo('EUR/USD');
  if (!market) {
    console.error('❌ Market info not found for EUR/USD');
    return;
  }

  const params: PipValueParams = {
    market,
    positionSize: 1
  };

  const result = calculatePipValue(params);
  console.log('Pip Value Result:', {
    pipValue: result.pipValue,
    contractSize: result.contractSize,
    tickSize: result.tickSize
  });

  // Expected: $10 per pip for 1 lot EUR/USD
  const expectedPipValue = 10;

  if (Math.abs(result.pipValue - expectedPipValue) < 0.1) {
    console.log('✅ Pip value calculation correct');
  } else {
    console.log('❌ Pip value calculation incorrect');
    console.log(`Expected: $${expectedPipValue} per pip`);
    console.log(`Got: $${result.pipValue} per pip`);
  }

  console.log('');
}

// Test Trade Validation
function testTradeValidation(): void {
  console.log('🔍 Testing Trade Validation...');

  // Test valid buy trade
  const validBuy = validateTradeSetup(1.1000, 1.0950, 1.1100, 'buy');
  if (validBuy === null) {
    console.log('✅ Valid buy trade validation correct');
  } else {
    console.log('❌ Valid buy trade validation failed:', validBuy);
  }

  // Test invalid buy trade (stop loss above entry)
  const invalidBuy = validateTradeSetup(1.1000, 1.1050, 1.1100, 'buy');
  if (invalidBuy !== null) {
    console.log('✅ Invalid buy trade validation correct');
  } else {
    console.log('❌ Invalid buy trade validation failed');
  }

  // Test valid sell trade
  const validSell = validateTradeSetup(1.1000, 1.1050, 1.0900, 'sell');
  if (validSell === null) {
    console.log('✅ Valid sell trade validation correct');
  } else {
    console.log('❌ Valid sell trade validation failed:', validSell);
  }

  // Test invalid sell trade (stop loss below entry)
  const invalidSell = validateTradeSetup(1.1000, 1.0950, 1.0900, 'sell');
  if (invalidSell !== null) {
    console.log('✅ Invalid sell trade validation correct');
  } else {
    console.log('❌ Invalid sell trade validation failed');
  }

  console.log('');
}

// Export for use in development
if (typeof window !== 'undefined') {
  (window as any).runCalculatorTests = runCalculatorTests;
}
