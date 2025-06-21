# Trading Calculator OANDA Compliance Fixes

## Overview
Updated the trading calculator to match OANDA's real-world trading standards and formulas for accurate profit/loss calculations.

## Key Changes Made

### 1. Forex Calculations (OANDA Standard)
**Before:** Incorrect pip value calculations
**After:** OANDA-compliant formula implementation

#### Formula Applied:
```
Pip Value = (1 pip / Quote Currency Exchange Rate) × Lot size in units
```

#### Examples:
- **EUR/USD**: 1 pip = $10 per standard lot (100,000 units)
- **USD/JPY**: Pip values converted from JPY to USD using exchange rates
- **GBP/USD**: 1 pip = $10 per standard lot (USD quote currency)

### 2. Gold/Precious Metals (OANDA Standard)
**Before:** Incorrect contract sizes and calculations
**After:** OANDA ounce-based trading

#### Changes:
- Contract size changed from 100 to 1 (1 ounce per unit)
- Formula: $1 move = $1 profit per ounce
- Example: 26 ounces × $1.23 move = $31.98 profit (OANDA example)

### 3. Position Size Calculator
**Updated to use OANDA pip values:**
```
Position Size = Risk Amount / (Pip Risk × Pip Value per Lot)
```

### 4. Risk/Reward Calculator
**Updated to use OANDA pip values:**
```
Risk Amount = Risk Pips × Total Pip Value
Reward Amount = Reward Pips × Total Pip Value
```

### 5. Pip Value Calculator
**Updated to match OANDA standards:**
- USD quote pairs: Direct calculation
- Non-USD quote pairs: Currency conversion applied

## Market Configurations Updated

### Forex Pairs
- All major pairs use 100,000 unit standard lots
- USD quote pairs: 1 pip = $10 per standard lot
- Non-USD quote pairs: Converted using exchange rates

### Precious Metals (CORRECTED)
```javascript
'GOLD': { symbol: 'GOLD', category: 'commodities', pip: 0.01, contractSize: 100, quoteCurrency: 'USD' }
'XAU/USD': { symbol: 'XAU/USD', category: 'commodities', pip: 0.01, contractSize: 100, quoteCurrency: 'USD' }
'SILVER': { symbol: 'SILVER', category: 'commodities', pip: 0.001, contractSize: 100, quoteCurrency: 'USD' }
```

**CRITICAL FIX**: Changed contract size from 1 to 100 ounces per lot to match OANDA's actual trading specifications.

## Test Results

### EUR/USD Test
- **Input**: Buy 1 lot from 1.1000 to 1.1050
- **Expected**: 50 pips, $500 profit
- **Result**: ✅ CORRECT

### Gold Test (Real OANDA Trade)
- **Input**: Buy 0.2 lots from $3384.54 to $3362.91
- **Expected**: $432.60 loss ($21.63 × 20 ounces)
- **Result**: ✅ CORRECT (matches actual OANDA trade)

### USD/JPY Test
- **Input**: Buy 1 lot from 154.00 to 154.50
- **Expected**: 50 pips with JPY to USD conversion
- **Result**: ✅ CORRECT

## Files Modified

1. `src/utils/plCalculator.ts` - Main calculator logic
2. `src/utils/calculatorTests.ts` - Updated test cases
3. Market configurations for precious metals

## Benefits

1. **Accurate Real-World Values**: Calculations now match OANDA trading platform
2. **Professional Standards**: Follows industry-standard formulas
3. **Correct Pip Values**: Proper USD conversion for all currency pairs
4. **Gold Trading Accuracy**: Ounce-based calculations as per OANDA
5. **Reliable Position Sizing**: Accurate risk management calculations

## Usage

All calculator pages now provide OANDA-compliant results:
- `/tools/profit-loss` - P&L Calculator
- `/tools/position-size` - Position Size Calculator  
- `/tools/risk-reward` - Risk/Reward Calculator
- `/tools/pip-value` - Pip Value Calculator

## Testing

Run the test suite to verify calculations:
1. Navigate to `/tools/test-calculators`
2. Click "Run Tests" 
3. All tests should pass with OANDA-compliant results

The calculator now provides accurate, real-world trading values that match OANDA's platform standards.
