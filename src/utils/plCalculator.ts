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

  // Additional Minor Pairs (Inverted and JPY crosses)
  'GBP/EUR': { symbol: 'GBP/EUR', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'EUR' },
  'JPY/AUD': { symbol: 'JPY/AUD', category: 'forex', pip: 0.00001, contractSize: 100000, quoteCurrency: 'AUD' },
  'JPY/CAD': { symbol: 'JPY/CAD', category: 'forex', pip: 0.00001, contractSize: 100000, quoteCurrency: 'CAD' },
  'JPY/CHF': { symbol: 'JPY/CHF', category: 'forex', pip: 0.000001, contractSize: 100000, quoteCurrency: 'CHF' },
  'JPY/EUR': { symbol: 'JPY/EUR', category: 'forex', pip: 0.000001, contractSize: 100000, quoteCurrency: 'EUR' },
  'JPY/GBP': { symbol: 'JPY/GBP', category: 'forex', pip: 0.000001, contractSize: 100000, quoteCurrency: 'GBP' },
  'JPY/NZD': { symbol: 'JPY/NZD', category: 'forex', pip: 0.00001, contractSize: 100000, quoteCurrency: 'NZD' },
  'AUD/EUR': { symbol: 'AUD/EUR', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'EUR' },
  'AUD/GBP': { symbol: 'AUD/GBP', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'GBP' },
  'CAD/AUD': { symbol: 'CAD/AUD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'AUD' },
  'CAD/EUR': { symbol: 'CAD/EUR', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'EUR' },
  'CAD/GBP': { symbol: 'CAD/GBP', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'GBP' },
  'CAD/NZD': { symbol: 'CAD/NZD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'NZD' },
  'CHF/AUD': { symbol: 'CHF/AUD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'AUD' },
  'CHF/CAD': { symbol: 'CHF/CAD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'CAD' },
  'CHF/EUR': { symbol: 'CHF/EUR', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'EUR' },
  'CHF/GBP': { symbol: 'CHF/GBP', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'GBP' },
  'CHF/NZD': { symbol: 'CHF/NZD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'NZD' },
  'NZD/AUD': { symbol: 'NZD/AUD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'AUD' },
  'NZD/EUR': { symbol: 'NZD/EUR', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'EUR' },
  'NZD/GBP': { symbol: 'NZD/GBP', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'GBP' },

  // Forex Exotic Pairs
  'USD/TRY': { symbol: 'USD/TRY', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'TRY' },
  'USD/ZAR': { symbol: 'USD/ZAR', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'ZAR' },
  'USD/MXN': { symbol: 'USD/MXN', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'MXN' },
  'USD/SEK': { symbol: 'USD/SEK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'SEK' },
  'USD/NOK': { symbol: 'USD/NOK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'NOK' },
  'USD/DKK': { symbol: 'USD/DKK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'DKK' },
  'USD/SGD': { symbol: 'USD/SGD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'SGD' },
  'USD/HKD': { symbol: 'USD/HKD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'HKD' },
  'USD/THB': { symbol: 'USD/THB', category: 'forex', pip: 0.01, contractSize: 100000, quoteCurrency: 'THB' },
  'USD/PLN': { symbol: 'USD/PLN', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'PLN' },
  'USD/CZK': { symbol: 'USD/CZK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'CZK' },
  'USD/HUF': { symbol: 'USD/HUF', category: 'forex', pip: 0.01, contractSize: 100000, quoteCurrency: 'HUF' },
  'USD/RUB': { symbol: 'USD/RUB', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'RUB' },
  'USD/CNH': { symbol: 'USD/CNH', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'CNH' },
  'USD/INR': { symbol: 'USD/INR', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'INR' },
  'USD/KRW': { symbol: 'USD/KRW', category: 'forex', pip: 0.01, contractSize: 100000, quoteCurrency: 'KRW' },
  'EUR/TRY': { symbol: 'EUR/TRY', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'TRY' },
  'EUR/ZAR': { symbol: 'EUR/ZAR', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'ZAR' },
  'EUR/SEK': { symbol: 'EUR/SEK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'SEK' },
  'EUR/NOK': { symbol: 'EUR/NOK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'NOK' },
  'EUR/DKK': { symbol: 'EUR/DKK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'DKK' },
  'EUR/PLN': { symbol: 'EUR/PLN', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'PLN' },
  'EUR/CZK': { symbol: 'EUR/CZK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'CZK' },
  'EUR/HUF': { symbol: 'EUR/HUF', category: 'forex', pip: 0.01, contractSize: 100000, quoteCurrency: 'HUF' },
  'GBP/TRY': { symbol: 'GBP/TRY', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'TRY' },
  'GBP/ZAR': { symbol: 'GBP/ZAR', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'ZAR' },
  'GBP/SEK': { symbol: 'GBP/SEK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'SEK' },
  'GBP/NOK': { symbol: 'GBP/NOK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'NOK' },
  'GBP/DKK': { symbol: 'GBP/DKK', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'DKK' },
  'GBP/PLN': { symbol: 'GBP/PLN', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'PLN' },
  'GBP/SGD': { symbol: 'GBP/SGD', category: 'forex', pip: 0.0001, contractSize: 100000, quoteCurrency: 'SGD' },

  // Precious Metals (OANDA standard - 100 ounces per lot)
  // OANDA: 1 pip = 0.01, 1 lot = 100 ounces, profit = price_movement × total_ounces
  'GOLD': { symbol: 'GOLD', category: 'commodities', pip: 0.01, contractSize: 100, tickValue: 1, quoteCurrency: 'USD' },
  'XAU/USD': { symbol: 'XAU/USD', category: 'commodities', pip: 0.01, contractSize: 100, tickValue: 1, quoteCurrency: 'USD' },
  'SILVER': { symbol: 'SILVER', category: 'commodities', pip: 0.001, contractSize: 1, tickValue: 1, quoteCurrency: 'USD' },
  'XAG/USD': { symbol: 'XAG/USD', category: 'commodities', pip: 0.001, contractSize: 1, tickValue: 1, quoteCurrency: 'USD' },
  'PLATINUM': { symbol: 'PLATINUM', category: 'commodities', pip: 0.01, contractSize: 1, tickValue: 1, quoteCurrency: 'USD' },
  'PALLADIUM': { symbol: 'PALLADIUM', category: 'commodities', pip: 0.01, contractSize: 1, tickValue: 1, quoteCurrency: 'USD' },

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
  'RICE': { symbol: 'RICE', category: 'commodities', pip: 0.01, contractSize: 2000, tickValue: 20 },
  'OATS': { symbol: 'OATS', category: 'commodities', pip: 0.25, contractSize: 5000, tickValue: 12.5 },
  'LUMBER': { symbol: 'LUMBER', category: 'commodities', pip: 0.1, contractSize: 110, tickValue: 11 },
  'ORANGE_JUICE': { symbol: 'ORANGE_JUICE', category: 'commodities', pip: 0.05, contractSize: 15000, tickValue: 7.5 },

  // Base Metals
  'COPPER': { symbol: 'COPPER', category: 'commodities', pip: 0.0001, contractSize: 25000, tickValue: 2.5 },
  'ALUMINUM': { symbol: 'ALUMINUM', category: 'commodities', pip: 0.5, contractSize: 25, tickValue: 12.5 },
  'ZINC': { symbol: 'ZINC', category: 'commodities', pip: 0.5, contractSize: 25, tickValue: 12.5 },
  'NICKEL': { symbol: 'NICKEL', category: 'commodities', pip: 1, contractSize: 6, tickValue: 6 },
  'LEAD': { symbol: 'LEAD', category: 'commodities', pip: 0.5, contractSize: 25, tickValue: 12.5 },
  'TIN': { symbol: 'TIN', category: 'commodities', pip: 1, contractSize: 5, tickValue: 5 },
  'STEEL': { symbol: 'STEEL', category: 'commodities', pip: 0.1, contractSize: 100, tickValue: 10 },

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
  'KOREA200': { symbol: 'KOREA200', category: 'indices', pip: 0.01, contractSize: 1, tickValue: 0.01 },
  'TAIWAN': { symbol: 'TAIWAN', category: 'indices', pip: 0.01, contractSize: 1, tickValue: 0.01 },
  'INDONESIA': { symbol: 'INDONESIA', category: 'indices', pip: 0.1, contractSize: 1, tickValue: 0.1 },
  'MALAYSIA': { symbol: 'MALAYSIA', category: 'indices', pip: 0.01, contractSize: 1, tickValue: 0.01 },
  'THAILAND': { symbol: 'THAILAND', category: 'indices', pip: 0.01, contractSize: 1, tickValue: 0.01 },

  // Additional Regional Indices
  'BRAZIL60': { symbol: 'BRAZIL60', category: 'indices', pip: 1, contractSize: 1, tickValue: 1 },
  'MEXICO35': { symbol: 'MEXICO35', category: 'indices', pip: 0.1, contractSize: 1, tickValue: 0.1 },
  'SOUTH_AFRICA40': { symbol: 'SOUTH_AFRICA40', category: 'indices', pip: 0.1, contractSize: 1, tickValue: 0.1 },
  'RUSSIA50': { symbol: 'RUSSIA50', category: 'indices', pip: 0.1, contractSize: 1, tickValue: 0.1 },
  'TURKEY30': { symbol: 'TURKEY30', category: 'indices', pip: 1, contractSize: 1, tickValue: 1 },
  'ISRAEL25': { symbol: 'ISRAEL25', category: 'indices', pip: 0.01, contractSize: 1, tickValue: 0.01 },

  // Major Cryptocurrencies
  'BTC/USD': { symbol: 'BTC/USD', category: 'crypto', pip: 1, contractSize: 1, quoteCurrency: 'USD' },
  'ETH/USD': { symbol: 'ETH/USD', category: 'crypto', pip: 0.01, contractSize: 1, quoteCurrency: 'USD' },
  'BNB/USD': { symbol: 'BNB/USD', category: 'crypto', pip: 0.01, contractSize: 1, quoteCurrency: 'USD' },
  'SOL/USD': { symbol: 'SOL/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'XRP/USD': { symbol: 'XRP/USD', category: 'crypto', pip: 0.0001, contractSize: 1, quoteCurrency: 'USD' },
  'ADA/USD': { symbol: 'ADA/USD', category: 'crypto', pip: 0.0001, contractSize: 1, quoteCurrency: 'USD' },
  'AVAX/USD': { symbol: 'AVAX/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'DOT/USD': { symbol: 'DOT/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'MATIC/USD': { symbol: 'MATIC/USD', category: 'crypto', pip: 0.0001, contractSize: 1, quoteCurrency: 'USD' },
  'LINK/USD': { symbol: 'LINK/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'UNI/USD': { symbol: 'UNI/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'LTC/USD': { symbol: 'LTC/USD', category: 'crypto', pip: 0.01, contractSize: 1, quoteCurrency: 'USD' },
  'BCH/USD': { symbol: 'BCH/USD', category: 'crypto', pip: 0.01, contractSize: 1, quoteCurrency: 'USD' },
  'ATOM/USD': { symbol: 'ATOM/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'FIL/USD': { symbol: 'FIL/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'XLM/USD': { symbol: 'XLM/USD', category: 'crypto', pip: 0.00001, contractSize: 1, quoteCurrency: 'USD' },
  'VET/USD': { symbol: 'VET/USD', category: 'crypto', pip: 0.00001, contractSize: 1, quoteCurrency: 'USD' },
  'TRX/USD': { symbol: 'TRX/USD', category: 'crypto', pip: 0.00001, contractSize: 1, quoteCurrency: 'USD' },
  'ALGO/USD': { symbol: 'ALGO/USD', category: 'crypto', pip: 0.0001, contractSize: 1, quoteCurrency: 'USD' },
  'XTZ/USD': { symbol: 'XTZ/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'EOS/USD': { symbol: 'EOS/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'THETA/USD': { symbol: 'THETA/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },

  // DeFi Cryptocurrencies
  'AAVE/USD': { symbol: 'AAVE/USD', category: 'crypto', pip: 0.01, contractSize: 1, quoteCurrency: 'USD' },
  'MKR/USD': { symbol: 'MKR/USD', category: 'crypto', pip: 0.1, contractSize: 1, quoteCurrency: 'USD' },
  'COMP/USD': { symbol: 'COMP/USD', category: 'crypto', pip: 0.01, contractSize: 1, quoteCurrency: 'USD' },
  'SUSHI/USD': { symbol: 'SUSHI/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'YFI/USD': { symbol: 'YFI/USD', category: 'crypto', pip: 1, contractSize: 1, quoteCurrency: 'USD' },
  'SNX/USD': { symbol: 'SNX/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'CRV/USD': { symbol: 'CRV/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'BAL/USD': { symbol: 'BAL/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  '1INCH/USD': { symbol: '1INCH/USD', category: 'crypto', pip: 0.0001, contractSize: 1, quoteCurrency: 'USD' },

  // Layer 1 & Layer 2 Cryptocurrencies
  'APT/USD': { symbol: 'APT/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'ARB/USD': { symbol: 'ARB/USD', category: 'crypto', pip: 0.0001, contractSize: 1, quoteCurrency: 'USD' },
  'OP/USD': { symbol: 'OP/USD', category: 'crypto', pip: 0.0001, contractSize: 1, quoteCurrency: 'USD' },
  'NEAR/USD': { symbol: 'NEAR/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'FTM/USD': { symbol: 'FTM/USD', category: 'crypto', pip: 0.0001, contractSize: 1, quoteCurrency: 'USD' },
  'HBAR/USD': { symbol: 'HBAR/USD', category: 'crypto', pip: 0.00001, contractSize: 1, quoteCurrency: 'USD' },
  'ICP/USD': { symbol: 'ICP/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'FLOW/USD': { symbol: 'FLOW/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'EGLD/USD': { symbol: 'EGLD/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },

  // Meme Cryptocurrencies
  'DOGE/USD': { symbol: 'DOGE/USD', category: 'crypto', pip: 0.00001, contractSize: 1, quoteCurrency: 'USD' },
  'SHIB/USD': { symbol: 'SHIB/USD', category: 'crypto', pip: 0.00000001, contractSize: 1, quoteCurrency: 'USD' },
  'PEPE/USD': { symbol: 'PEPE/USD', category: 'crypto', pip: 0.00000001, contractSize: 1, quoteCurrency: 'USD' },
  'FLOKI/USD': { symbol: 'FLOKI/USD', category: 'crypto', pip: 0.00000001, contractSize: 1, quoteCurrency: 'USD' },

  // Additional Popular Cryptocurrencies
  'LDO/USD': { symbol: 'LDO/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'SAND/USD': { symbol: 'SAND/USD', category: 'crypto', pip: 0.0001, contractSize: 1, quoteCurrency: 'USD' },
  'MANA/USD': { symbol: 'MANA/USD', category: 'crypto', pip: 0.0001, contractSize: 1, quoteCurrency: 'USD' },
  'AXS/USD': { symbol: 'AXS/USD', category: 'crypto', pip: 0.001, contractSize: 1, quoteCurrency: 'USD' },
  'CHZ/USD': { symbol: 'CHZ/USD', category: 'crypto', pip: 0.00001, contractSize: 1, quoteCurrency: 'USD' },
  'ENJ/USD': { symbol: 'ENJ/USD', category: 'crypto', pip: 0.0001, contractSize: 1, quoteCurrency: 'USD' },
  'GALA/USD': { symbol: 'GALA/USD', category: 'crypto', pip: 0.00001, contractSize: 1, quoteCurrency: 'USD' },
  'IMX/USD': { symbol: 'IMX/USD', category: 'crypto', pip: 0.0001, contractSize: 1, quoteCurrency: 'USD' },
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

  // Calculate pip movement (preserve sign for direction)
  const pipMovement = effectiveMovement / market.pip;

  let profitLoss = 0;
  let contractValue = 0;

  switch (market.category) {
    case 'forex':
      // OANDA Standard: 1 standard lot = 100,000 units
      // For USD quote pairs: 1 pip = $10 per standard lot
      // Formula: Pip Value = (1 pip / Quote Currency Exchange Rate) × Lot size in units
      contractValue = quantity * (market.contractSize || 100000);

      let pipValuePerLot: number;

      if (market.quoteCurrency === 'USD') {
        // For USD quote pairs (EUR/USD, GBP/USD, etc.): 1 pip = $10 per standard lot
        pipValuePerLot = market.pip * (market.contractSize || 100000);
      } else {
        // For non-USD quote pairs, convert to USD
        // Example: EUR/GBP - pip value in GBP, convert to USD
        const baseValue = market.pip * (market.contractSize || 100000);
        const rate = getCurrencyRate(market.quoteCurrency || 'USD');
        pipValuePerLot = baseValue * rate;
      }

      // Total P&L = pip movement × pip value per lot × position size in lots
      profitLoss = pipMovement * pipValuePerLot * quantity;
      break;

    case 'commodities':
      // Check if this is a precious metal (OANDA standard calculation)
      if (market.symbol.includes('GOLD') || market.symbol.includes('XAU') ||
          market.symbol.includes('SILVER') || market.symbol.includes('XAG') ||
          market.symbol.includes('PLATINUM') || market.symbol.includes('PALLADIUM')) {
        // OANDA Precious Metals: 1 lot = 100 ounces, 1 pip = 0.01
        // Formula: Profit/Loss = Pip Movement × Pip Value per Ounce × Total Ounces
        // Example: 422 pips × $0.01 per ounce × 1 ounce = $4.22 profit/loss
        contractValue = quantity * (market.contractSize || 100); // Total ounces
        const pipValuePerOunce = market.pip; // $0.01 per pip per ounce
        profitLoss = pipMovement * pipValuePerOunce * contractValue; // pip movement × pip value per ounce × total ounces
      } else {
        // Traditional commodities: (Price Movement) × (Contract Size) × (Position Size)
        contractValue = quantity * (market.contractSize || 1);
        profitLoss = effectiveMovement * contractValue;
      }
      break;

    case 'indices':
      // Indices: (Point Movement) × (Position Size) × (Point Value)
      const pointValue = market.tickValue || 1;
      profitLoss = effectiveMovement * quantity * pointValue;
      contractValue = quantity;
      break;

    case 'crypto':
      // Crypto: (Price Movement) × (Position Size)
      profitLoss = effectiveMovement * quantity;
      contractValue = quantity;
      break;

    default:
      // Fallback: Simple calculation
      profitLoss = effectiveMovement * quantity;
      contractValue = quantity;
  }

  // Calculate percentage return based on margin/investment
  let totalInvestment: number;

  if (market.category === 'forex') {
    // For forex, calculate based on margin (typically 1-2% of notional value)
    const notionalValue = entryPrice * contractValue;
    totalInvestment = notionalValue * 0.01; // Assume 1% margin requirement
  } else {
    // For other instruments, use full notional value
    totalInvestment = entryPrice * contractValue;
  }

  const percentage = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

  return {
    profitLoss: Math.round(profitLoss * 100) / 100, // Round to 2 decimal places
    pips: Math.round(Math.abs(pipMovement) * 100) / 100, // Always positive for display
    percentage: Math.round(percentage * 100) / 100,
    breakdown: {
      priceMovement: Math.round(priceMovement * 100000) / 100000, // 5 decimal places for forex
      pipMovement: Math.round(pipMovement * 100) / 100, // Preserve sign
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

  let positionSize = 0;
  let contractValue = 0;

  switch (market.category) {
    case 'forex':
      // OANDA standard calculation for position sizing
      const contractSize = market.contractSize || 100000;
      let pipValuePerLot: number;

      if (market.quoteCurrency === 'USD') {
        // For USD quote pairs: 1 pip = $10 per standard lot
        pipValuePerLot = market.pip * contractSize;
      } else {
        // For non-USD quote pairs, convert to USD
        const baseValue = market.pip * contractSize;
        const rate = getCurrencyRate(market.quoteCurrency || 'USD');
        pipValuePerLot = baseValue * rate;
      }

      // Position Size = Risk Amount / (Pip Risk × Pip Value per Lot)
      positionSize = riskAmount / (pipRisk * pipValuePerLot);
      contractValue = entryPrice * positionSize * contractSize;
      break;

    case 'commodities':
      // Check if this is a precious metal (OANDA standard)
      if (market.symbol.includes('GOLD') || market.symbol.includes('XAU') ||
          market.symbol.includes('SILVER') || market.symbol.includes('XAG') ||
          market.symbol.includes('PLATINUM') || market.symbol.includes('PALLADIUM')) {
        // OANDA precious metals: 1 lot = 100 ounces, pip-based calculation
        // Position Size = Risk Amount / (Pip Risk × Pip Value per Ounce × Contract Size)
        const pipRisk = priceRisk / market.pip;
        const pipValuePerOunce = market.pip; // $0.01 per pip per ounce
        const contractSize = market.contractSize || 100;
        positionSize = riskAmount / (pipRisk * pipValuePerOunce * contractSize);
        contractValue = entryPrice * positionSize * contractSize;
      } else {
        // Traditional commodities
        const commodityContractSize = market.contractSize || 1;
        const riskPerContract = priceRisk * commodityContractSize;

        positionSize = riskAmount / riskPerContract;
        contractValue = entryPrice * positionSize * commodityContractSize;
      }
      break;

    case 'indices':
      // For indices, calculate based on point value
      const pointValue = market.tickValue || 1;
      const riskPerUnit = priceRisk * pointValue;

      positionSize = riskAmount / riskPerUnit;
      contractValue = entryPrice * positionSize;
      break;

    case 'crypto':
      // For crypto, simple calculation
      positionSize = riskAmount / priceRisk;
      contractValue = entryPrice * positionSize;
      break;

    default:
      // Fallback calculation
      positionSize = riskAmount / priceRisk;
      contractValue = entryPrice * positionSize;
  }

  // Calculate margin requirement (varies by instrument)
  let marginPercentage = 0.01; // Default 1%
  if (market.category === 'forex') {
    marginPercentage = 0.01; // 1% for forex
  } else if (market.category === 'commodities') {
    marginPercentage = 0.05; // 5% for commodities
  } else if (market.category === 'indices') {
    marginPercentage = 0.02; // 2% for indices
  } else if (market.category === 'crypto') {
    marginPercentage = 0.1; // 10% for crypto
  }

  const marginRequired = contractValue * marginPercentage;

  return {
    positionSize: Math.round(positionSize * 100) / 100,
    riskAmount: Math.round(riskAmount * 100) / 100,
    pipRisk: Math.round(pipRisk * 100) / 100,
    lotSize: Math.round(positionSize * 100) / 100,
    contractValue: Math.round(contractValue * 100) / 100,
    marginRequired: Math.round(marginRequired * 100) / 100
  };
}

// Risk/Reward Calculator
export function calculateRiskReward(params: RiskRewardParams): RiskRewardResult {
  const { entryPrice, stopLossPrice, takeProfitPrice, positionSize, market } = params;

  // Calculate pip movements
  const riskPips = Math.abs(entryPrice - stopLossPrice) / market.pip;
  const rewardPips = Math.abs(takeProfitPrice - entryPrice) / market.pip;

  let riskAmount = 0;
  let rewardAmount = 0;

  switch (market.category) {
    case 'forex':
      // OANDA standard risk/reward calculation
      const contractSize = market.contractSize || 100000;
      let pipValuePerLot: number;

      if (market.quoteCurrency === 'USD') {
        // For USD quote pairs: 1 pip = $10 per standard lot
        pipValuePerLot = market.pip * contractSize;
      } else {
        // For non-USD quote pairs, convert to USD
        const baseValue = market.pip * contractSize;
        const rate = getCurrencyRate(market.quoteCurrency || 'USD');
        pipValuePerLot = baseValue * rate;
      }

      // Calculate total pip value for the position
      const totalPipValue = pipValuePerLot * positionSize;

      riskAmount = riskPips * totalPipValue;
      rewardAmount = rewardPips * totalPipValue;
      break;

    case 'commodities':
      // Check if this is a precious metal (OANDA standard)
      if (market.symbol.includes('GOLD') || market.symbol.includes('XAU') ||
          market.symbol.includes('SILVER') || market.symbol.includes('XAG') ||
          market.symbol.includes('PLATINUM') || market.symbol.includes('PALLADIUM')) {
        // OANDA precious metals: 1 lot = 100 ounces, pip-based calculation
        const contractSize = market.contractSize || 100;
        const riskPips = Math.abs(entryPrice - stopLossPrice) / market.pip;
        const rewardPips = Math.abs(takeProfitPrice - entryPrice) / market.pip;
        const pipValuePerOunce = market.pip; // $0.01 per pip per ounce
        const totalOunces = positionSize * contractSize;
        riskAmount = riskPips * pipValuePerOunce * totalOunces;
        rewardAmount = rewardPips * pipValuePerOunce * totalOunces;
      } else {
        // Traditional commodities
        const commodityContractSize = market.contractSize || 1;
        const riskPerContract = Math.abs(entryPrice - stopLossPrice) * commodityContractSize;
        const rewardPerContract = Math.abs(takeProfitPrice - entryPrice) * commodityContractSize;

        riskAmount = riskPerContract * positionSize;
        rewardAmount = rewardPerContract * positionSize;
      }
      break;

    case 'indices':
      // For indices
      const pointValue = market.tickValue || 1;
      riskAmount = Math.abs(entryPrice - stopLossPrice) * positionSize * pointValue;
      rewardAmount = Math.abs(takeProfitPrice - entryPrice) * positionSize * pointValue;
      break;

    case 'crypto':
      // For crypto
      riskAmount = Math.abs(entryPrice - stopLossPrice) * positionSize;
      rewardAmount = Math.abs(takeProfitPrice - entryPrice) * positionSize;
      break;

    default:
      // Fallback
      riskAmount = Math.abs(entryPrice - stopLossPrice) * positionSize;
      rewardAmount = Math.abs(takeProfitPrice - entryPrice) * positionSize;
  }

  // Calculate risk/reward ratio
  const riskRewardRatio = riskAmount > 0 ? rewardAmount / riskAmount : 0;

  // Calculate break-even win rate: Risk / (Risk + Reward)
  const breakEvenWinRate = (riskAmount + rewardAmount) > 0 ?
    (riskAmount / (riskAmount + rewardAmount)) * 100 : 0;

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

  let pipValue = 0;
  let contractSize = 0;

  switch (market.category) {
    case 'forex':
      contractSize = market.contractSize || 100000;

      // OANDA Formula: Pip Value = (1 pip / Quote Currency Exchange Rate) × Lot size in units
      let pipValuePerLot: number;

      if (market.quoteCurrency === 'USD') {
        // For USD quote pairs: 1 pip = $10 per standard lot (100,000 units)
        pipValuePerLot = market.pip * contractSize;
      } else {
        // For non-USD quote pairs, convert to USD
        const baseValue = market.pip * contractSize;
        const rate = getCurrencyRate(market.quoteCurrency || 'USD');
        pipValuePerLot = baseValue * rate;
      }

      // Total pip value for position = pip value per lot × position size in lots
      pipValue = pipValuePerLot * positionSize;
      break;

    case 'commodities':
      // Check if this is a precious metal (OANDA standard)
      if (market.symbol.includes('GOLD') || market.symbol.includes('XAU') ||
          market.symbol.includes('SILVER') || market.symbol.includes('XAG') ||
          market.symbol.includes('PLATINUM') || market.symbol.includes('PALLADIUM')) {
        // OANDA precious metals: 1 pip = 0.01, 1 lot = 100 ounces
        // Pip Value = Position Size (lots) × Contract Size (100 ounces) × Pip Size (0.01)
        // Example: 0.01 lots × 100 ounces × 0.01 = $0.01 per pip
        contractSize = market.contractSize || 100;
        const totalOunces = positionSize * contractSize;
        pipValue = totalOunces * market.pip; // total ounces × $0.01 = pip value
      } else {
        // Traditional commodities
        contractSize = market.contractSize || 1;
        pipValue = market.pip * positionSize * contractSize;
      }
      break;

    case 'indices':
      contractSize = 1; // Indices typically don't have contract sizes
      pipValue = market.pip * positionSize * (market.tickValue || 1);
      break;

    case 'crypto':
      contractSize = 1;
      pipValue = market.pip * positionSize;
      break;

    default:
      contractSize = market.contractSize || 1;
      pipValue = market.pip * positionSize * contractSize;
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

// Currency conversion rates (in a real app, these would come from an API)
const CURRENCY_RATES: Record<string, number> = {
  'USD': 1.0,
  'EUR': 1.08,
  'GBP': 1.27,
  'JPY': 0.0067,
  'CHF': 1.10,
  'CAD': 0.74,
  'AUD': 0.66,
  'NZD': 0.61,
  'SEK': 0.096,
  'NOK': 0.094,
  'DKK': 0.145,
  'PLN': 0.25,
  'HUF': 0.0027,
  'CZK': 0.044,
  'TRY': 0.031,
  'ZAR': 0.055,
  'MXN': 0.059,
  'SGD': 0.74,
  'HKD': 0.128
};

// Get conversion rate to USD
export function getCurrencyRate(currency: string): number {
  return CURRENCY_RATES[currency] || 1.0;
}

// Convert amount from one currency to USD
export function convertToUSD(amount: number, fromCurrency: string): number {
  const rate = getCurrencyRate(fromCurrency);
  return amount * rate;
}

// Validate trade setup for common errors
export function validateTradeSetup(
  entryPrice: number,
  stopLoss: number,
  takeProfit: number,
  tradeType: 'buy' | 'sell'
): string | null {
  if (tradeType === 'buy') {
    if (stopLoss >= entryPrice) {
      return 'For buy trades, stop loss must be below entry price';
    }
    if (takeProfit <= entryPrice) {
      return 'For buy trades, take profit must be above entry price';
    }
  } else {
    if (stopLoss <= entryPrice) {
      return 'For sell trades, stop loss must be above entry price';
    }
    if (takeProfit >= entryPrice) {
      return 'For sell trades, take profit must be below entry price';
    }
  }
  return null;
}

// Calculate margin requirement based on instrument type
export function calculateMarginRequirement(
  notionalValue: number,
  category: string,
  leverage?: number
): number {
  if (leverage) {
    return notionalValue / leverage;
  }

  // Default margin requirements by category
  switch (category) {
    case 'forex':
      return notionalValue * 0.01; // 1% (100:1 leverage)
    case 'commodities':
      return notionalValue * 0.05; // 5% (20:1 leverage)
    case 'indices':
      return notionalValue * 0.02; // 2% (50:1 leverage)
    case 'crypto':
      return notionalValue * 0.1; // 10% (10:1 leverage)
    default:
      return notionalValue * 0.1; // 10% default
  }
}
