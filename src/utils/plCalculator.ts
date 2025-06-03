// Professional P&L Calculator for different trading instruments

export interface MarketInfo {
  symbol: string;
  category: 'forex' | 'commodities' | 'indices' | 'crypto';
  pip: number;
  contractSize?: number;
  tickValue?: number;
  quoteCurrency?: string;
}

export interface TradeParams {
  market: MarketInfo;
  tradeType: 'buy' | 'sell';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  accountCurrency?: string;
}

export interface PLResult {
  profitLoss: number;
  pips: number;
  percentage: number;
  breakdown: {
    priceMovement: number;
    pipMovement: number;
    contractValue: number;
    totalValue: number;
  };
}

// Market configurations with proper contract sizes and pip values
const MARKET_CONFIGS: Record<string, MarketInfo> = {
  // Forex Major Pairs (Standard lot = 100,000 units)
  'EUR/USD': { symbol: 'EUR/USD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'USD' },
  'GBP/USD': { symbol: 'GBP/USD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'USD' },
  'USD/JPY': { symbol: 'USD/JPY', category: 'forex', pip: 0.01, contractSize: 100000, quoteCurrency: 'JPY' },
  'USD/CHF': { symbol: 'USD/CHF', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'CHF' },
  'AUD/USD': { symbol: 'AUD/USD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'USD' },
  'USD/CAD': { symbol: 'USD/CAD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'CAD' },
  'NZD/USD': { symbol: 'NZD/USD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'USD' },

  // Forex Minor Pairs (Cross Pairs)
  'EUR/GBP': { symbol: 'EUR/GBP', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'GBP' },
  'EUR/JPY': { symbol: 'EUR/JPY', category: 'forex', pip: 0.01, contractSize: 100000, quoteCurrency: 'JPY' },
  'EUR/CHF': { symbol: 'EUR/CHF', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'CHF' },
  'EUR/AUD': { symbol: 'EUR/AUD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'AUD' },
  'EUR/CAD': { symbol: 'EUR/CAD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'CAD' },
  'EUR/NZD': { symbol: 'EUR/NZD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'NZD' },
  'GBP/JPY': { symbol: 'GBP/JPY', category: 'forex', pip: 0.01, contractSize: 100000, quoteCurrency: 'JPY' },
  'GBP/CHF': { symbol: 'GBP/CHF', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'CHF' },
  'GBP/AUD': { symbol: 'GBP/AUD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'AUD' },
  'GBP/CAD': { symbol: 'GBP/CAD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'CAD' },
  'GBP/NZD': { symbol: 'GBP/NZD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'NZD' },
  'AUD/JPY': { symbol: 'AUD/JPY', category: 'forex', pip: 0.01, contractSize: 100000, quoteCurrency: 'JPY' },
  'AUD/CHF': { symbol: 'AUD/CHF', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'CHF' },
  'AUD/CAD': { symbol: 'AUD/CAD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'CAD' },
  'AUD/NZD': { symbol: 'AUD/NZD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'NZD' },
  'CAD/JPY': { symbol: 'CAD/JPY', category: 'forex', pip: 0.01, contractSize: 100000, quoteCurrency: 'JPY' },
  'CAD/CHF': { symbol: 'CAD/CHF', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'CHF' },
  'CHF/JPY': { symbol: 'CHF/JPY', category: 'forex', pip: 0.01, contractSize: 100000, quoteCurrency: 'JPY' },
  'NZD/JPY': { symbol: 'NZD/JPY', category: 'forex', pip: 0.01, contractSize: 100000, quoteCurrency: 'JPY' },
  'NZD/CHF': { symbol: 'NZD/CHF', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'CHF' },
  'NZD/CAD': { symbol: 'NZD/CAD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'CAD' },

  // Forex Exotic Pairs
  'USD/SEK': { symbol: 'USD/SEK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'SEK' },
  'USD/NOK': { symbol: 'USD/NOK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'NOK' },
  'USD/DKK': { symbol: 'USD/DKK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'DKK' },
  'USD/PLN': { symbol: 'USD/PLN', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'PLN' },
  'USD/HUF': { symbol: 'USD/HUF', category: 'forex', pip: 0.01, contractSize: 100000, quoteCurrency: 'HUF' },
  'USD/CZK': { symbol: 'USD/CZK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'CZK' },
  'USD/TRY': { symbol: 'USD/TRY', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'TRY' },
  'USD/ZAR': { symbol: 'USD/ZAR', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'ZAR' },
  'USD/MXN': { symbol: 'USD/MXN', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'MXN' },
  'USD/SGD': { symbol: 'USD/SGD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'SGD' },
  'USD/HKD': { symbol: 'USD/HKD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'HKD' },
  'EUR/SEK': { symbol: 'EUR/SEK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'SEK' },
  'EUR/NOK': { symbol: 'EUR/NOK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'NOK' },
  'EUR/DKK': { symbol: 'EUR/DKK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'DKK' },
  'EUR/PLN': { symbol: 'EUR/PLN', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'PLN' },
  'EUR/HUF': { symbol: 'EUR/HUF', category: 'forex', pip: 0.01, contractSize: 100000, quoteCurrency: 'HUF' },
  'EUR/CZK': { symbol: 'EUR/CZK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'CZK' },
  'EUR/TRY': { symbol: 'EUR/TRY', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'TRY' },
  'EUR/ZAR': { symbol: 'EUR/ZAR', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'ZAR' },
  'GBP/SEK': { symbol: 'GBP/SEK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'SEK' },
  'GBP/NOK': { symbol: 'GBP/NOK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'NOK' },
  'GBP/DKK': { symbol: 'GBP/DKK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'DKK' },
  'GBP/PLN': { symbol: 'GBP/PLN', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'PLN' },
  'GBP/ZAR': { symbol: 'GBP/ZAR', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'ZAR' },

  // Precious Metals
  'GOLD': { symbol: 'GOLD', category: 'commodities', pip: 0.01, contractSize: 100, tickValue: 1 },
  'SILVER': { symbol: 'SILVER', category: 'commodities', pip: 0.001, contractSize: 5000, tickValue: 5 },
  'PLATINUM': { symbol: 'PLATINUM', category: 'commodities', pip: 0.01, contractSize: 50, tickValue: 0.5 },
  'PALLADIUM': { symbol: 'PALLADIUM', category: 'commodities', pip: 0.01, contractSize: 100, tickValue: 1 },

  // Energy Commodities
  'OIL': { symbol: 'OIL', category: 'commodities', pip: 0.01, contractSize: 1000, tickValue: 10 },
  'BRENT': { symbol: 'BRENT', category: 'commodities', pip: 0.01, contractSize: 1000, tickValue: 10 },
  'NATGAS': { symbol: 'NATGAS', category: 'commodities', pip: 0.001, contractSize: 10000, tickValue: 10 },
  'HEATING': { symbol: 'HEATING', category: 'commodities', pip: 0.0001, contractSize: 42000, tickValue: 4.2 },
  'GASOLINE': { symbol: 'GASOLINE', category: 'commodities', pip: 0.0001, contractSize: 42000, tickValue: 4.2 },

  // Agricultural Commodities
  'WHEAT': { symbol: 'WHEAT', category: 'commodities', pip: 0.25, contractSize: 5000, tickValue: 12.5 },
  'CORN': { symbol: 'CORN', category: 'commodities', pip: 0.25, contractSize: 5000, tickValue: 12.5 },
  'SOYBEANS': { symbol: 'SOYBEANS', category: 'commodities', pip: 0.25, contractSize: 5000, tickValue: 12.5 },
  'SUGAR': { symbol: 'SUGAR', category: 'commodities', pip: 0.01, contractSize: 112000, tickValue: 11.2 },
  'COFFEE': { symbol: 'COFFEE', category: 'commodities', pip: 0.05, contractSize: 37500, tickValue: 18.75 },
  'COCOA': { symbol: 'COCOA', category: 'commodities', pip: 1, contractSize: 10, tickValue: 10 },
  'COTTON': { symbol: 'COTTON', category: 'commodities', pip: 0.01, contractSize: 50000, tickValue: 5 },

  // Base Metals
  'COPPER': { symbol: 'COPPER', category: 'commodities', pip: 0.0001, contractSize: 25000, tickValue: 2.5 },
  'ALUMINUM': { symbol: 'ALUMINUM', category: 'commodities', pip: 0.5, contractSize: 25, tickValue: 12.5 },
  'ZINC': { symbol: 'ZINC', category: 'commodities', pip: 0.5, contractSize: 25, tickValue: 12.5 },
  'NICKEL': { symbol: 'NICKEL', category: 'commodities', pip: 1, contractSize: 6, tickValue: 6 },

  // US Indices
  'SPX500': { symbol: 'SPX500', category: 'indices', pip: 0.1, contractSize: 1, tickValue: 0.1 },
  'NAS100': { symbol: 'NAS100', category: 'indices', pip: 0.1, contractSize: 1, tickValue: 0.1 },
  'US30': { symbol: 'US30', category: 'indices', pip: 1, contractSize: 1, tickValue: 1 },
  'RUSSELL2000': { symbol: 'RUSSELL2000', category: 'indices', pip: 0.1, contractSize: 1, tickValue: 0.1 },
  'VIX': { symbol: 'VIX', category: 'indices', pip: 0.01, contractSize: 1, tickValue: 0.01 },

  // European Indices
  'GER40': { symbol: 'GER40', category: 'indices', pip: 0.1, contractSize: 1, tickValue: 0.1 },
  'UK100': { symbol: 'UK100', category: 'indices', pip: 0.1, contractSize: 1, tickValue: 0.1 },
  'FRA40': { symbol: 'FRA40', category: 'indices', pip: 0.1, contractSize: 1, tickValue: 0.1 },
  'ESP35': { symbol: 'ESP35', category: 'indices', pip: 0.1, contractSize: 1, tickValue: 0.1 },
  'ITA40': { symbol: 'ITA40', category: 'indices', pip: 1, contractSize: 1, tickValue: 1 },
  'NED25': { symbol: 'NED25', category: 'indices', pip: 0.01, contractSize: 1, tickValue: 0.01 },
  'SWI20': { symbol: 'SWI20', category: 'indices', pip: 0.1, contractSize: 1, tickValue: 0.1 },
  'EUSTX50': { symbol: 'EUSTX50', category: 'indices', pip: 0.1, contractSize: 1, tickValue: 0.1 },

  // Asian Indices
  'JPN225': { symbol: 'JPN225', category: 'indices', pip: 1, contractSize: 1, tickValue: 1 },
  'HK50': { symbol: 'HK50', category: 'indices', pip: 1, contractSize: 1, tickValue: 1 },
  'AUS200': { symbol: 'AUS200', category: 'indices', pip: 0.1, contractSize: 1, tickValue: 0.1 },
  'SING30': { symbol: 'SING30', category: 'indices', pip: 0.1, contractSize: 1, tickValue: 0.1 },
  'CHINA50': { symbol: 'CHINA50', category: 'indices', pip: 0.1, contractSize: 1, tickValue: 0.1 },
  'INDIA50': { symbol: 'INDIA50', category: 'indices', pip: 0.05, contractSize: 1, tickValue: 0.05 },

  // Major Cryptocurrencies
  'BTC/USD': { symbol: 'BTC/USD', category: 'crypto', pip: 1, contractSize: 1, quoteCurrency: 'USD' },
  'ETH/USD': { symbol: 'ETH/USD', category: 'crypto', pip: 0.01, contractSize: 1, quoteCurrency: 'USD' },
  'LTC/USD': { symbol: 'LTC/USD', category: 'crypto', pip: 0.01, contractSize: 1, quoteCurrency: 'USD' },
  'XRP/USD': { symbol: 'XRP/USD', category: 'crypto', pip: 0.0001, contractSize: 1, quoteCurrency: 'USD' },
  'ADA/USD': { symbol: 'ADA/USD', category: 'crypto', pip: 0.0001, contractSize: 1, quoteCurrency: 'USD' },
  'DOT/USD': { symbol: 'DOT/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'LINK/USD': { symbol: 'LINK/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'BCH/USD': { symbol: 'BCH/USD', category: 'crypto', pip: 0.01, contractSize: 1, quoteCurrency: 'USD' },
  'BNB/USD': { symbol: 'BNB/USD', category: 'crypto', pip: 0.01, contractSize: 1, quoteCurrency: 'USD' },
  'SOL/USD': { symbol: 'SOL/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'MATIC/USD': { symbol: 'MATIC/USD', category: 'crypto', pip: 0.0001, contractSize: 1, quoteCurrency: 'USD' },
  'AVAX/USD': { symbol: 'AVAX/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'UNI/USD': { symbol: 'UNI/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'ATOM/USD': { symbol: 'ATOM/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'ALGO/USD': { symbol: 'ALGO/USD', category: 'crypto', pip: 0.0001, contractSize: 1, quoteCurrency: 'USD' },
  'XLM/USD': { symbol: 'XLM/USD', category: 'crypto', pip: 0.00001, contractSize: 1, quoteCurrency: 'USD' },
  'VET/USD': { symbol: 'VET/USD', category: 'crypto', pip: 0.00001, contractSize: 1, quoteCurrency: 'USD' },
  'FIL/USD': { symbol: 'FIL/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'THETA/USD': { symbol: 'THETA/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'TRX/USD': { symbol: 'TRX/USD', category: 'crypto', pip: 0.00001, contractSize: 1, quoteCurrency: 'USD' },
  'EOS/USD': { symbol: 'EOS/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'XTZ/USD': { symbol: 'XTZ/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'AAVE/USD': { symbol: 'AAVE/USD', category: 'crypto', pip: 0.01, contractSize: 1, quoteCurrency: 'USD' },
  'MKR/USD': { symbol: 'MKR/USD', category: 'crypto', pip: 0.1, contractSize: 1, quoteCurrency: 'USD' },
  'COMP/USD': { symbol: 'COMP/USD', category: 'crypto', pip: 0.01, contractSize: 1, quoteCurrency: 'USD' },
  'SUSHI/USD': { symbol: 'SUSHI/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'YFI/USD': { symbol: 'YFI/USD', category: 'crypto', pip: 1, contractSize: 1, quoteCurrency: 'USD' },
  'SNX/USD': { symbol: 'SNX/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'CRV/USD': { symbol: 'CRV/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'BAL/USD': { symbol: 'BAL/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'DOGE/USD': { symbol: 'DOGE/USD', category: 'crypto', pip: 0.00001, contractSize: 1, quoteCurrency: 'USD' },
  'SHIB/USD': { symbol: 'SHIB/USD', category: 'crypto', pip: 0.00000001, contractSize: 1, quoteCurrency: 'USD' },
};

export function getMarketInfo(symbol: string): MarketInfo | null {
  return MARKET_CONFIGS[symbol] || null;
}

export function calculatePL(params: TradeParams): PLResult {
  const { market, tradeType, entryPrice, exitPrice, quantity } = params;

  // Calculate basic price movement
  const priceMovement = exitPrice - entryPrice;

  // Determine if this is a profitable move based on trade type
  const effectiveMovement = tradeType === 'buy' ? priceMovement : -priceMovement;

  // Calculate pip movement
  const pipMovement = Math.abs(priceMovement) / market.pip;

  let profitLoss = 0;
  let contractValue = 0;

  switch (market.category) {
    case 'forex':
      // Forex calculation: (Price Movement) × (Lot Size) × (Contract Size)
      contractValue = quantity * (market.contractSize || 100000);
      profitLoss = effectiveMovement * contractValue;

      // For JPY pairs, convert from JPY to USD (approximate)
      if (market.quoteCurrency === 'JPY') {
        profitLoss = profitLoss / 150; // Approximate USD/JPY rate
      }
      break;

    case 'commodities':
      // Commodities: (Price Movement) × (Quantity) × (Contract Size)
      contractValue = quantity * (market.contractSize || 1);
      profitLoss = effectiveMovement * contractValue;
      break;

    case 'indices':
      // Indices: (Point Movement) × (Quantity) × (Tick Value)
      contractValue = quantity * (market.tickValue || 1);
      profitLoss = effectiveMovement * contractValue;
      break;

    case 'crypto':
      // Crypto: (Price Movement) × (Quantity)
      contractValue = quantity;
      profitLoss = effectiveMovement * contractValue;
      break;

    default:
      // Fallback: Simple calculation
      profitLoss = effectiveMovement * quantity;
      contractValue = quantity;
  }

  // Calculate percentage return
  const totalInvestment = entryPrice * quantity;
  const percentage = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

  return {
    profitLoss: Math.round(profitLoss * 100) / 100, // Round to 2 decimal places
    pips: Math.round(pipMovement * 100) / 100,
    percentage: Math.round(percentage * 100) / 100,
    breakdown: {
      priceMovement: Math.round(priceMovement * 100000) / 100000, // 5 decimal places for forex
      pipMovement: Math.round(pipMovement * 100) / 100,
      contractValue,
      totalValue: Math.round((entryPrice * contractValue) * 100) / 100
    }
  };
}

// Helper function to format P&L display
export function formatPL(amount: number, currency: string = 'USD'): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}${currency === 'USD' ? '$' : ''}${amount.toFixed(2)}${currency !== 'USD' ? ` ${currency}` : ''}`;
}

// Helper function to format pips
export function formatPips(pips: number): string {
  return `${pips.toFixed(1)} pip${Math.abs(pips) !== 1 ? 's' : ''}`;
}

// Helper function to format percentage
export function formatPercentage(percentage: number): string {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
}

// Validation function
export function validateTradeInputs(entryPrice: number, exitPrice: number, quantity: number): string | null {
  if (entryPrice <= 0) return 'Entry price must be greater than 0';
  if (exitPrice <= 0) return 'Exit price must be greater than 0';
  if (quantity <= 0) return 'Quantity must be greater than 0';
  if (entryPrice === exitPrice) return 'Entry and exit prices cannot be the same';
  return null;
}

// Get suggested lot sizes for different markets
export function getSuggestedLotSizes(category: string): number[] {
  switch (category) {
    case 'forex':
      return [0.01, 0.1, 0.5, 1, 2, 5, 10]; // Standard, mini, micro lots
    case 'commodities':
      return [0.1, 0.5, 1, 2, 5, 10, 20];
    case 'indices':
      return [1, 5, 10, 20, 50, 100];
    case 'crypto':
      return [0.001, 0.01, 0.1, 0.5, 1, 2, 5];
    default:
      return [1, 5, 10, 50, 100];
  }
}

// Position Size Calculator Interfaces
export interface PositionSizeParams {
  accountBalance: number;
  riskPercentage: number;
  entryPrice: number;
  stopLossPrice: number;
  market: MarketInfo;
  accountCurrency?: string;
}

export interface PositionSizeResult {
  positionSize: number;
  riskAmount: number;
  pipRisk: number;
  lotSize: number;
  contractValue: number;
  marginRequired?: number;
}

// Risk/Reward Calculator Interfaces
export interface RiskRewardParams {
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  positionSize: number;
  market: MarketInfo;
}

export interface RiskRewardResult {
  riskAmount: number;
  rewardAmount: number;
  riskRewardRatio: number;
  riskPips: number;
  rewardPips: number;
  breakEvenWinRate: number;
}

// Pip Value Calculator Interfaces
export interface PipValueParams {
  market: MarketInfo;
  positionSize: number;
  accountCurrency?: string;
}

export interface PipValueResult {
  pipValue: number;
  pipValueInAccountCurrency: number;
  contractSize: number;
  tickSize: number;
}

// Position Size Calculator
export function calculatePositionSize(params: PositionSizeParams): PositionSizeResult {
  const { accountBalance, riskPercentage, entryPrice, stopLossPrice, market } = params;

  // Calculate risk amount in account currency
  const riskAmount = (accountBalance * riskPercentage) / 100;

  // Calculate pip risk
  const priceRisk = Math.abs(entryPrice - stopLossPrice);
  const pipRisk = priceRisk / market.pip;

  // Calculate pip value for 1 lot
  const contractSize = market.contractSize || 100000;
  let pipValuePerLot = market.pip * contractSize;

  // Adjust for JPY pairs
  if (market.quoteCurrency === 'JPY') {
    pipValuePerLot = pipValuePerLot / 150; // Approximate USD/JPY rate
  }

  // Calculate position size
  const positionSize = riskAmount / (pipRisk * pipValuePerLot);
  const contractValue = entryPrice * positionSize * contractSize;

  return {
    positionSize: Math.round(positionSize * 100) / 100,
    riskAmount: Math.round(riskAmount * 100) / 100,
    pipRisk: Math.round(pipRisk * 100) / 100,
    lotSize: Math.round(positionSize * 100) / 100,
    contractValue: Math.round(contractValue * 100) / 100,
    marginRequired: Math.round((contractValue * 0.01) * 100) / 100 // Assuming 1% margin
  };
}

// Risk/Reward Calculator
export function calculateRiskReward(params: RiskRewardParams): RiskRewardResult {
  const { entryPrice, stopLossPrice, takeProfitPrice, positionSize, market } = params;

  // Calculate pip movements
  const riskPips = Math.abs(entryPrice - stopLossPrice) / market.pip;
  const rewardPips = Math.abs(takeProfitPrice - entryPrice) / market.pip;

  // Calculate monetary amounts
  const contractSize = market.contractSize || 100000;
  let pipValue = market.pip * positionSize * contractSize;

  // Adjust for JPY pairs
  if (market.quoteCurrency === 'JPY') {
    pipValue = pipValue / 150;
  }

  const riskAmount = riskPips * pipValue;
  const rewardAmount = rewardPips * pipValue;

  // Calculate risk/reward ratio
  const riskRewardRatio = rewardAmount / riskAmount;

  // Calculate break-even win rate
  const breakEvenWinRate = (1 / (1 + riskRewardRatio)) * 100;

  return {
    riskAmount: Math.round(riskAmount * 100) / 100,
    rewardAmount: Math.round(rewardAmount * 100) / 100,
    riskRewardRatio: Math.round(riskRewardRatio * 100) / 100,
    riskPips: Math.round(riskPips * 100) / 100,
    rewardPips: Math.round(rewardPips * 100) / 100,
    breakEvenWinRate: Math.round(breakEvenWinRate * 100) / 100
  };
}

// Pip Value Calculator
export function calculatePipValue(params: PipValueParams): PipValueResult {
  const { market, positionSize } = params;

  const contractSize = market.contractSize || 100000;
  let pipValue = market.pip * positionSize * contractSize;

  // Adjust for JPY pairs
  if (market.quoteCurrency === 'JPY') {
    pipValue = pipValue / 150; // Convert to USD
  }

  return {
    pipValue: Math.round(pipValue * 100) / 100,
    pipValueInAccountCurrency: Math.round(pipValue * 100) / 100,
    contractSize,
    tickSize: market.pip
  };
}

// Helper function to format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Helper function to format ratio
export function formatRatio(ratio: number): string {
  return `1:${ratio.toFixed(2)}`;
}
