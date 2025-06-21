// Simple test script to verify gold calculations
const { calculatePL, getMarketInfo } = require('./src/utils/plCalculator.ts');

// Test OANDA Gold calculation
function testGoldCalculation() {
  console.log('🧪 Testing OANDA Gold Calculation...\n');

  const market = getMarketInfo('GOLD');
  if (!market) {
    console.error('❌ Market info not found for GOLD');
    return;
  }

  console.log('Market Info:', market);

  // Test Case 1: Real OANDA example
  // Entry: $3384.54, Exit: $3362.91, 0.2 lots (20 ounces)
  // Price movement: $3362.91 - $3384.54 = -$21.63
  // Expected: -$21.63 × 20 ounces = -$432.60
  const testCase1 = {
    market,
    tradeType: 'buy',
    entryPrice: 3384.54,
    exitPrice: 3362.91,
    quantity: 0.2 // 0.2 lots = 20 ounces
  };

  const result1 = calculatePL(testCase1);
  console.log('Test Case 1 - Real OANDA Trade:');
  console.log('Entry: $3384.54, Exit: $3362.91, Size: 0.2 lots');
  console.log('Expected: -$432.60');
  console.log('Result:', result1);
  console.log('Correct?', Math.abs(result1.profitLoss - (-432.60)) < 0.1 ? '✅' : '❌');
  console.log('');

  // Test Case 2: Simple 1 lot, $1 move
  // Entry: $2000.00, Exit: $2001.00, 1 lot (100 ounces)
  // Price movement: $2001.00 - $2000.00 = +$1.00
  // Expected: +$1.00 × 100 ounces = +$100.00
  const testCase2 = {
    market,
    tradeType: 'buy',
    entryPrice: 2000.00,
    exitPrice: 2001.00,
    quantity: 1 // 1 lot = 100 ounces
  };

  const result2 = calculatePL(testCase2);
  console.log('Test Case 2 - Simple $1 move:');
  console.log('Entry: $2000.00, Exit: $2001.00, Size: 1 lot');
  console.log('Expected: +$100.00');
  console.log('Result:', result2);
  console.log('Correct?', Math.abs(result2.profitLoss - 100.00) < 0.1 ? '✅' : '❌');
  console.log('');

  // Test Case 3: 1 pip move (0.01)
  // Entry: $2000.00, Exit: $2000.01, 1 lot (100 ounces)
  // Price movement: $2000.01 - $2000.00 = +$0.01 (1 pip)
  // Expected: +$0.01 × 100 ounces = +$1.00
  const testCase3 = {
    market,
    tradeType: 'buy',
    entryPrice: 2000.00,
    exitPrice: 2000.01,
    quantity: 1 // 1 lot = 100 ounces
  };

  const result3 = calculatePL(testCase3);
  console.log('Test Case 3 - 1 pip move:');
  console.log('Entry: $2000.00, Exit: $2000.01, Size: 1 lot');
  console.log('Expected: +$1.00 (1 pip = $1 for 1 lot)');
  console.log('Result:', result3);
  console.log('Correct?', Math.abs(result3.profitLoss - 1.00) < 0.01 ? '✅' : '❌');
  console.log('');
}

testGoldCalculation();
