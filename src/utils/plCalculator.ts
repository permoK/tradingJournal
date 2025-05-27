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
  
  // Forex Cross Pairs
  'EUR/GBP': { symbol: 'EUR/GBP', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'GBP' },
  'EUR/JPY': { symbol: 'EUR/JPY', category: 'forex', pip: 0.01, contractSize: 100000, quoteCurrency: 'JPY' },
  'GBP/JPY': { symbol: 'GBP/JPY', category: 'forex', pip: 0.01, contractSize: 100000, quoteCurrency: 'JPY' },
  
  // Commodities (per ounce/barrel/unit)
  'GOLD': { symbol: 'GOLD', category: 'commodities', pip: 0.01, contractSize: 100, tickValue: 1 },
  'SILVER': { symbol: 'SILVER', category: 'commodities', pip: 0.001, contractSize: 5000, tickValue: 5 },
  'OIL': { symbol: 'OIL', category: 'commodities', pip: 0.01, contractSize: 1000, tickValue: 10 },
  'NATGAS': { symbol: 'NATGAS', category: 'commodities', pip: 0.001, contractSize: 10000, tickValue: 10 },
  
  // Indices (per point)
  'SPX500': { symbol: 'SPX500', category: 'indices', pip: 0.1, contractSize: 1, tickValue: 0.1 },
  'NAS100': { symbol: 'NAS100', category: 'indices', pip: 0.1, contractSize: 1, tickValue: 0.1 },
  'US30': { symbol: 'US30', category: 'indices', pip: 1, contractSize: 1, tickValue: 1 },
  'GER40': { symbol: 'GER40', category: 'indices', pip: 0.1, contractSize: 1, tickValue: 0.1 },
  'UK100': { symbol: 'UK100', category: 'indices', pip: 0.1, contractSize: 1, tickValue: 0.1 },
  
  // Crypto (per coin)
  'BTC/USD': { symbol: 'BTC/USD', category: 'crypto', pip: 1, contractSize: 1, quoteCurrency: 'USD' },
  'ETH/USD': { symbol: 'ETH/USD', category: 'crypto', pip: 0.01, contractSize: 1, quoteCurrency: 'USD' },
  'LTC/USD': { symbol: 'LTC/USD', category: 'crypto', pip: 0.01, contractSize: 1, quoteCurrency: 'USD' },
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
