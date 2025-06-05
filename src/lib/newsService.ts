import axios from 'axios';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
  category: 'forex' | 'economic' | 'central-bank' | 'market' | 'general';
  importance: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  currency: string;
  date: string;
  time: string;
  impact: 'low' | 'medium' | 'high';
  forecast?: string;
  previous?: string;
  actual?: string;
  description: string;
  unit?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  source: string;
  volatility: number; // 1-5 scale
  marketRelevance: string[];
  historicalData?: {
    date: string;
    value: string;
  }[];
  marketImpact?: {
    currency: string;
    expectedMovement: 'bullish' | 'bearish' | 'neutral';
    confidence: number; // 1-10 scale
  }[];
  relatedEvents?: string[];
  tradingTips?: string[];
}

class NewsService {
  private readonly NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;
  private readonly ALPHA_VANTAGE_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY;
  private readonly BASE_URL = 'https://newsapi.org/v2';
  private readonly ALPHA_VANTAGE_URL = 'https://www.alphavantage.co/query';

  // Forex and economic keywords for filtering relevant news
  private readonly FOREX_KEYWORDS = [
    'forex', 'currency', 'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD',
    'federal reserve', 'ECB', 'bank of england', 'bank of japan', 'central bank',
    'interest rate', 'inflation', 'CPI', 'NFP', 'GDP', 'unemployment',
    'monetary policy', 'quantitative easing', 'economic data', 'trade war',
    'brexit', 'oil prices', 'gold prices', 'economic indicators'
  ];

  private categorizeNews(article: any): NewsArticle['category'] {
    const title = article.title?.toLowerCase() || '';
    const description = article.description?.toLowerCase() || '';
    const content = `${title} ${description}`;

    if (content.includes('central bank') || content.includes('federal reserve') || content.includes('ecb')) {
      return 'central-bank';
    }
    if (content.includes('cpi') || content.includes('inflation') || content.includes('gdp') || content.includes('nfp')) {
      return 'economic';
    }
    if (content.includes('forex') || content.includes('currency') || content.includes('usd') || content.includes('eur')) {
      return 'forex';
    }
    if (content.includes('market') || content.includes('trading') || content.includes('stock')) {
      return 'market';
    }
    return 'general';
  }

  private determineImportance(article: any): NewsArticle['importance'] {
    const title = article.title?.toLowerCase() || '';
    const description = article.description?.toLowerCase() || '';
    const content = `${title} ${description}`;

    // High importance keywords
    const highImpactKeywords = [
      'federal reserve', 'interest rate decision', 'cpi', 'inflation report',
      'nfp', 'employment report', 'gdp', 'central bank meeting', 'rate cut', 'rate hike'
    ];

    // Medium importance keywords
    const mediumImpactKeywords = [
      'economic data', 'trade balance', 'retail sales', 'consumer confidence',
      'manufacturing', 'services pmi', 'jobless claims'
    ];

    if (highImpactKeywords.some(keyword => content.includes(keyword))) {
      return 'high';
    }
    if (mediumImpactKeywords.some(keyword => content.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  }

  private extractTags(article: any): string[] {
    const title = article.title?.toLowerCase() || '';
    const description = article.description?.toLowerCase() || '';
    const content = `${title} ${description}`;
    
    return this.FOREX_KEYWORDS.filter(keyword => 
      content.includes(keyword.toLowerCase())
    );
  }

  async fetchForexNews(limit: number = 20): Promise<NewsArticle[]> {
    // Always return comprehensive mock data for now, but structure it to easily switch to real API
    return this.getComprehensiveNews(limit);
  }

  async fetchEconomicCalendar(): Promise<EconomicEvent[]> {
    // Return comprehensive economic calendar data
    return this.getComprehensiveEconomicEvents();
  }

  async fetchForexFactoryEvents(): Promise<EconomicEvent[]> {
    // This would integrate with ForexFactory API or similar economic calendar service
    // For now, return enhanced mock data that mimics ForexFactory structure
    return this.getComprehensiveEconomicEvents();
  }

  private getComprehensiveNews(limit: number = 50): NewsArticle[] {
    const comprehensiveNews = [
      // High Impact Economic News
      {
        id: 'news-1',
        title: 'Federal Reserve Signals Potential Rate Changes Ahead Following Strong CPI Data',
        description: 'The Federal Reserve indicated possible adjustments to interest rates in response to recent inflation data showing persistent price pressures in core categories.',
        content: 'Federal Reserve officials are closely monitoring inflation trends as the latest Consumer Price Index data shows continued resilience in core inflation measures...',
        url: '#',
        urlToImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop',
        publishedAt: new Date().toISOString(),
        source: { id: 'reuters', name: 'Reuters' },
        category: 'central-bank',
        importance: 'high',
        tags: ['federal reserve', 'interest rate', 'inflation', 'CPI', 'monetary policy'],
      },
      {
        id: 'news-2',
        title: 'USD/EUR Reaches New Monthly High on Strong Employment Data',
        description: 'The dollar strengthened against the euro following better-than-expected Non-Farm Payrolls data, with markets pricing in higher probability of Fed rate hikes.',
        content: 'The US dollar surged to its highest level against the euro in over a month after the Bureau of Labor Statistics reported...',
        url: '#',
        urlToImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=400&fit=crop',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { id: 'bloomberg', name: 'Bloomberg' },
        category: 'forex',
        importance: 'high',
        tags: ['USD', 'EUR', 'forex', 'NFP', 'employment'],
      },
      {
        id: 'news-3',
        title: 'CPI Report Shows Inflation Cooling to 3.2%, Below Fed Target Concerns',
        description: 'Consumer Price Index data reveals inflation continuing its downward trend, meeting analyst expectations and providing relief to Federal Reserve policymakers.',
        content: 'The latest Consumer Price Index report showed annual inflation slowing to 3.2%, marking the third consecutive month of declining price pressures...',
        url: '#',
        urlToImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=400&fit=crop',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { id: 'financial-times', name: 'Financial Times' },
        category: 'economic',
        importance: 'high',
        tags: ['CPI', 'inflation', 'economic indicators', 'Fed policy'],
      },
      {
        id: 'news-4',
        title: 'ECB President Lagarde Hints at Policy Shift in Jackson Hole Speech',
        description: 'European Central Bank President Christine Lagarde suggested potential changes to monetary policy stance amid evolving economic conditions in the eurozone.',
        url: '#',
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        source: { id: 'ecb', name: 'European Central Bank' },
        category: 'central-bank',
        importance: 'high',
        tags: ['ECB', 'Lagarde', 'monetary policy', 'eurozone', 'Jackson Hole'],
      },
      {
        id: 'news-5',
        title: 'Bank of Japan Maintains Ultra-Low Rates Amid Yen Weakness Concerns',
        description: 'The Bank of Japan kept its benchmark interest rate unchanged while expressing concerns about rapid yen depreciation against major currencies.',
        url: '#',
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        source: { id: 'boj', name: 'Bank of Japan' },
        category: 'central-bank',
        importance: 'medium',
        tags: ['BOJ', 'JPY', 'interest rates', 'yen intervention'],
      },
      {
        id: 'news-6',
        title: 'UK GDP Growth Exceeds Expectations at 0.4% Quarterly',
        description: 'British economic growth outpaced forecasts in the latest quarter, driven by strong services sector performance and increased consumer spending.',
        url: '#',
        publishedAt: new Date(Date.now() - 18000000).toISOString(),
        source: { id: 'ons', name: 'Office for National Statistics' },
        category: 'economic',
        importance: 'medium',
        tags: ['UK', 'GDP', 'economic growth', 'GBP', 'services'],
      },
      {
        id: 'news-7',
        title: 'Gold Prices Surge on Safe Haven Demand Amid Market Volatility',
        description: 'Gold futures climbed to multi-week highs as investors sought safe haven assets amid increased market uncertainty and geopolitical tensions.',
        url: '#',
        publishedAt: new Date(Date.now() - 21600000).toISOString(),
        source: { id: 'marketwatch', name: 'MarketWatch' },
        category: 'market',
        importance: 'medium',
        tags: ['gold', 'safe haven', 'commodities', 'market volatility'],
      },
      {
        id: 'news-8',
        title: 'Canadian Dollar Strengthens on Hawkish Bank of Canada Comments',
        description: 'The Canadian dollar gained against major currencies after Bank of Canada officials suggested a more aggressive approach to fighting inflation.',
        url: '#',
        publishedAt: new Date(Date.now() - 25200000).toISOString(),
        source: { id: 'boc', name: 'Bank of Canada' },
        category: 'central-bank',
        importance: 'medium',
        tags: ['CAD', 'Bank of Canada', 'hawkish', 'inflation'],
      },
      {
        id: 'news-9',
        title: 'Australian Employment Data Shows Robust Job Market Resilience',
        description: 'Australia\'s unemployment rate fell to 3.5%, the lowest in decades, supporting the Reserve Bank of Australia\'s hawkish monetary policy stance.',
        url: '#',
        publishedAt: new Date(Date.now() - 28800000).toISOString(),
        source: { id: 'abs', name: 'Australian Bureau of Statistics' },
        category: 'economic',
        importance: 'medium',
        tags: ['AUD', 'unemployment', 'RBA', 'employment'],
      },
      {
        id: 'news-10',
        title: 'Swiss Franc Gains on Risk-Off Sentiment and SNB Intervention Speculation',
        description: 'The Swiss franc strengthened across the board as risk-off sentiment dominated markets and speculation grew about potential SNB intervention.',
        url: '#',
        publishedAt: new Date(Date.now() - 32400000).toISOString(),
        source: { id: 'snb', name: 'Swiss National Bank' },
        category: 'forex',
        importance: 'low',
        tags: ['CHF', 'SNB', 'risk-off', 'intervention'],
      }
    ];

    return comprehensiveNews.slice(0, limit);
  }

  private getMockNews(): NewsArticle[] {
    return [
      {
        id: 'mock-1',
        title: 'Federal Reserve Signals Potential Rate Changes Ahead',
        description: 'The Federal Reserve indicated possible adjustments to interest rates in response to recent inflation data.',
        url: '#',
        publishedAt: new Date().toISOString(),
        source: { id: 'mock', name: 'Financial Times' },
        category: 'central-bank',
        importance: 'high',
        tags: ['federal reserve', 'interest rate', 'inflation'],
      },
      {
        id: 'mock-2',
        title: 'USD/EUR Reaches New Monthly High on Strong Economic Data',
        description: 'The dollar strengthened against the euro following better-than-expected employment figures.',
        url: '#',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { id: 'mock', name: 'Reuters' },
        category: 'forex',
        importance: 'medium',
        tags: ['USD', 'EUR', 'forex', 'economic data'],
      },
      {
        id: 'mock-3',
        title: 'CPI Report Shows Inflation Cooling to 3.2%',
        description: 'Consumer Price Index data reveals inflation continuing its downward trend, meeting analyst expectations.',
        url: '#',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { id: 'mock', name: 'Bloomberg' },
        category: 'economic',
        importance: 'high',
        tags: ['CPI', 'inflation', 'economic indicators'],
      },
    ];
  }

  private getComprehensiveEconomicEvents(): EconomicEvent[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      // TODAY'S EVENTS
      {
        id: 'event-today-1',
        title: 'US Consumer Price Index (CPI) m/m',
        country: 'United States',
        currency: 'USD',
        date: today.toISOString().split('T')[0],
        time: '08:30',
        impact: 'high',
        forecast: '0.2%',
        previous: '0.3%',
        actual: '0.1%',
        unit: '%',
        frequency: 'monthly',
        source: 'Bureau of Labor Statistics',
        volatility: 5,
        marketRelevance: ['USD', 'Gold', 'Bonds', 'Stocks', 'Oil'],
        description: 'The Consumer Price Index measures the change in the price of goods and services from the perspective of the consumer. It is a key way to measure changes in purchasing trends and inflation.',
        historicalData: [
          { date: '2024-01-01', value: '0.3%' },
          { date: '2024-02-01', value: '0.4%' },
          { date: '2024-03-01', value: '0.1%' },
        ],
        marketImpact: [
          { currency: 'USD', expectedMovement: 'bullish', confidence: 9 },
          { currency: 'EUR', expectedMovement: 'bearish', confidence: 7 },
          { currency: 'GBP', expectedMovement: 'bearish', confidence: 6 },
          { currency: 'JPY', expectedMovement: 'bearish', confidence: 8 },
        ],
        relatedEvents: ['Core CPI', 'PPI', 'Fed Interest Rate Decision'],
        tradingTips: [
          'Lower than expected CPI typically weakens USD in short term',
          'Watch for immediate volatility in USD pairs within 15 minutes',
          'Gold often moves inversely to USD on CPI releases',
          'Bond yields may drop on lower inflation data',
          'Consider USD/JPY for highest volatility potential'
        ]
      },
      {
        id: 'event-today-2',
        title: 'US Core CPI m/m',
        country: 'United States',
        currency: 'USD',
        date: today.toISOString().split('T')[0],
        time: '08:30',
        impact: 'high',
        forecast: '0.3%',
        previous: '0.3%',
        actual: '0.2%',
        unit: '%',
        frequency: 'monthly',
        source: 'Bureau of Labor Statistics',
        volatility: 5,
        marketRelevance: ['USD', 'Gold', 'Bonds'],
        description: 'Core CPI excludes volatile food and energy prices, providing a clearer view of underlying inflation trends.',
        marketImpact: [
          { currency: 'USD', expectedMovement: 'bearish', confidence: 8 },
          { currency: 'EUR', expectedMovement: 'bullish', confidence: 6 },
        ],
        tradingTips: [
          'Core CPI below forecast suggests Fed may pause rate hikes',
          'EUR/USD likely to see upward pressure on weak USD',
          'Watch for bond market reaction first, then FX'
        ]
      },
      {
        id: 'event-today-3',
        title: 'ECB President Lagarde Speaks',
        country: 'European Union',
        currency: 'EUR',
        date: today.toISOString().split('T')[0],
        time: '14:00',
        impact: 'high',
        frequency: 'irregular',
        source: 'European Central Bank',
        volatility: 4,
        marketRelevance: ['EUR', 'European Stocks', 'Bonds'],
        description: 'ECB President Christine Lagarde speaks at the European Banking Congress. Her comments on monetary policy and economic outlook can significantly impact EUR.',
        marketImpact: [
          { currency: 'EUR', expectedMovement: 'neutral', confidence: 6 },
        ],
        tradingTips: [
          'Focus on forward guidance about future rate decisions',
          'Hawkish comments typically strengthen EUR',
          'Watch EUR/USD and EUR/GBP for immediate reaction'
        ]
      },

      // TOMORROW'S EVENTS
      {
        id: 'event-tomorrow-1',
        title: 'Non-Farm Payrolls',
        country: 'United States',
        currency: 'USD',
        date: tomorrow.toISOString().split('T')[0],
        time: '08:30',
        impact: 'high',
        forecast: '200K',
        previous: '187K',
        unit: 'K',
        frequency: 'monthly',
        source: 'Bureau of Labor Statistics',
        volatility: 5,
        marketRelevance: ['USD', 'Stocks', 'Bonds'],
        description: 'The Non Farm Payrolls measures the change in the number of people employed during the previous month, excluding the farming industry.',
        historicalData: [
          { date: '2024-01-01', value: '187K' },
          { date: '2024-02-01', value: '275K' },
          { date: '2024-03-01', value: '303K' },
        ],
        marketImpact: [
          { currency: 'USD', expectedMovement: 'bullish', confidence: 9 },
          { currency: 'EUR', expectedMovement: 'bearish', confidence: 7 },
          { currency: 'GBP', expectedMovement: 'bearish', confidence: 6 },
        ],
        relatedEvents: ['Unemployment Rate', 'Average Hourly Earnings'],
        tradingTips: [
          'Strong NFP data typically boosts USD across all pairs',
          'Watch for revisions to previous month data',
          'Unemployment rate released simultaneously',
          'Stock markets often rally on strong employment data',
          'Best pairs to trade: USD/JPY, EUR/USD, GBP/USD'
        ]
      },
      {
        id: 'event-tomorrow-2',
        title: 'US Unemployment Rate',
        country: 'United States',
        currency: 'USD',
        date: tomorrow.toISOString().split('T')[0],
        time: '08:30',
        impact: 'medium',
        forecast: '3.7%',
        previous: '3.8%',
        unit: '%',
        frequency: 'monthly',
        source: 'Bureau of Labor Statistics',
        volatility: 3,
        marketRelevance: ['USD', 'Stocks'],
        description: 'The unemployment rate measures the percentage of the labor force that is unemployed and actively seeking employment.',
        marketImpact: [
          { currency: 'USD', expectedMovement: 'bullish', confidence: 7 },
        ],
        tradingTips: [
          'Lower unemployment typically supports USD',
          'Released alongside NFP - combined impact is significant'
        ]
      },
      {
        id: 'event-tomorrow-3',
        title: 'UK GDP q/q Preliminary',
        country: 'United Kingdom',
        currency: 'GBP',
        date: tomorrow.toISOString().split('T')[0],
        time: '07:00',
        impact: 'high',
        forecast: '0.2%',
        previous: '0.1%',
        unit: '%',
        frequency: 'quarterly',
        source: 'Office for National Statistics',
        volatility: 4,
        marketRelevance: ['GBP', 'UK Stocks', 'FTSE'],
        description: 'Gross Domestic Product measures the total value of all goods and services produced by the UK.',
        marketImpact: [
          { currency: 'GBP', expectedMovement: 'bullish', confidence: 8 },
          { currency: 'EUR', expectedMovement: 'bearish', confidence: 5 },
        ],
        tradingTips: [
          'Better than expected GDP supports GBP strength',
          'Watch for revisions to previous quarters',
          'GBP/USD and EUR/GBP are best pairs to trade',
          'UK stocks may rally on strong GDP'
        ]
      },

      // DAY AFTER TOMORROW
      {
        id: 'event-dayafter-1',
        title: 'ECB Interest Rate Decision',
        country: 'European Union',
        currency: 'EUR',
        date: dayAfter.toISOString().split('T')[0],
        time: '12:15',
        impact: 'high',
        forecast: '4.25%',
        previous: '4.25%',
        unit: '%',
        frequency: 'monthly',
        source: 'European Central Bank',
        volatility: 5,
        marketRelevance: ['EUR', 'European Stocks', 'Bonds', 'Gold'],
        description: 'The European Central Bank announces its decision on interest rates. This is one of the primary tools the ECB uses to communicate with investors about monetary policy.',
        marketImpact: [
          { currency: 'EUR', expectedMovement: 'neutral', confidence: 5 },
          { currency: 'USD', expectedMovement: 'neutral', confidence: 4 },
        ],
        relatedEvents: ['ECB Press Conference', 'Monetary Policy Statement'],
        tradingTips: [
          'Focus on the press conference for forward guidance',
          'Rate holds often lead to range-bound EUR trading',
          'Watch for hints about future policy changes',
          'EUR/USD most liquid pair for trading this event'
        ]
      },
      {
        id: 'event-dayafter-2',
        title: 'ECB Press Conference',
        country: 'European Union',
        currency: 'EUR',
        date: dayAfter.toISOString().split('T')[0],
        time: '12:45',
        impact: 'high',
        frequency: 'monthly',
        source: 'European Central Bank',
        volatility: 5,
        marketRelevance: ['EUR', 'European Stocks', 'Bonds'],
        description: 'ECB President Lagarde holds a press conference following the interest rate decision. Often more market-moving than the rate decision itself.',
        marketImpact: [
          { currency: 'EUR', expectedMovement: 'neutral', confidence: 6 },
        ],
        tradingTips: [
          'This is often more important than the rate decision',
          'Listen for changes in economic projections',
          'Hawkish tone can drive EUR higher even with unchanged rates'
        ]
      },

      // NEXT WEEK EVENTS
      {
        id: 'event-nextweek-1',
        title: 'Bank of Japan Interest Rate Decision',
        country: 'Japan',
        currency: 'JPY',
        date: nextWeek.toISOString().split('T')[0],
        time: '03:00',
        impact: 'high',
        forecast: '-0.10%',
        previous: '-0.10%',
        unit: '%',
        frequency: 'irregular',
        source: 'Bank of Japan',
        volatility: 4,
        marketRelevance: ['JPY', 'Asian Markets', 'Nikkei'],
        description: 'The Bank of Japan announces its decision on interest rates and monetary policy stance.',
        marketImpact: [
          { currency: 'JPY', expectedMovement: 'neutral', confidence: 5 },
          { currency: 'USD', expectedMovement: 'neutral', confidence: 4 },
        ],
        tradingTips: [
          'BOJ rarely changes rates - focus on policy statement',
          'Watch for intervention warnings if USD/JPY above 150',
          'JPY pairs can be volatile on surprise policy changes'
        ]
      },
      {
        id: 'event-nextweek-2',
        title: 'Canadian CPI m/m',
        country: 'Canada',
        currency: 'CAD',
        date: nextWeek.toISOString().split('T')[0],
        time: '08:30',
        impact: 'medium',
        forecast: '0.3%',
        previous: '0.4%',
        unit: '%',
        frequency: 'monthly',
        source: 'Statistics Canada',
        volatility: 3,
        marketRelevance: ['CAD', 'Oil', 'Canadian Stocks'],
        description: 'Canadian Consumer Price Index measures inflation in Canada, important for Bank of Canada policy decisions.',
        marketImpact: [
          { currency: 'CAD', expectedMovement: 'bearish', confidence: 6 },
          { currency: 'USD', expectedMovement: 'bullish', confidence: 5 },
        ],
        tradingTips: [
          'Lower CPI may pressure BOC to pause rate hikes',
          'USD/CAD likely to rise on weak Canadian inflation',
          'Oil prices can influence CAD reaction'
        ]
      }
    ];
  }

  private getMockEconomicEvents(): EconomicEvent[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    return [
      {
        id: 'event-1',
        title: 'US Consumer Price Index (CPI) m/m',
        country: 'United States',
        currency: 'USD',
        date: tomorrow.toISOString().split('T')[0],
        time: '08:30',
        impact: 'high',
        forecast: '0.2%',
        previous: '0.3%',
        unit: '%',
        frequency: 'monthly',
        source: 'Bureau of Labor Statistics',
        volatility: 5,
        marketRelevance: ['USD', 'Gold', 'Bonds', 'Stocks'],
        description: 'The Consumer Price Index measures the change in the price of goods and services from the perspective of the consumer. It is a key way to measure changes in purchasing trends and inflation.',
        historicalData: [
          { date: '2024-01-01', value: '0.3%' },
          { date: '2024-02-01', value: '0.4%' },
          { date: '2024-03-01', value: '0.1%' },
        ],
        marketImpact: [
          { currency: 'USD', expectedMovement: 'bullish', confidence: 8 },
          { currency: 'EUR', expectedMovement: 'bearish', confidence: 6 },
          { currency: 'GBP', expectedMovement: 'bearish', confidence: 5 },
        ],
        relatedEvents: ['Core CPI', 'PPI', 'Fed Interest Rate Decision'],
        tradingTips: [
          'Higher than expected CPI typically strengthens USD',
          'Watch for immediate volatility in USD pairs',
          'Gold often moves inversely to USD on CPI releases',
          'Bond yields may spike on higher inflation data'
        ]
      },
      {
        id: 'event-2',
        title: 'Non-Farm Payrolls',
        country: 'United States',
        currency: 'USD',
        date: tomorrow.toISOString().split('T')[0],
        time: '08:30',
        impact: 'high',
        forecast: '200K',
        previous: '187K',
        unit: 'K',
        frequency: 'monthly',
        source: 'Bureau of Labor Statistics',
        volatility: 5,
        marketRelevance: ['USD', 'Stocks', 'Bonds'],
        description: 'The Non Farm Payrolls measures the change in the number of people employed during the previous month, excluding the farming industry.',
        historicalData: [
          { date: '2024-01-01', value: '187K' },
          { date: '2024-02-01', value: '275K' },
          { date: '2024-03-01', value: '303K' },
        ],
        marketImpact: [
          { currency: 'USD', expectedMovement: 'bullish', confidence: 9 },
          { currency: 'EUR', expectedMovement: 'bearish', confidence: 7 },
        ],
        relatedEvents: ['Unemployment Rate', 'Average Hourly Earnings'],
        tradingTips: [
          'Strong NFP data typically boosts USD across all pairs',
          'Watch for revisions to previous month data',
          'Unemployment rate released simultaneously',
          'Stock markets often rally on strong employment data'
        ]
      },
      {
        id: 'event-3',
        title: 'ECB Interest Rate Decision',
        country: 'European Union',
        currency: 'EUR',
        date: dayAfter.toISOString().split('T')[0],
        time: '12:15',
        impact: 'high',
        forecast: '4.25%',
        previous: '4.25%',
        unit: '%',
        frequency: 'monthly',
        source: 'European Central Bank',
        volatility: 4,
        marketRelevance: ['EUR', 'European Stocks', 'Bonds'],
        description: 'The European Central Bank announces its decision on interest rates. This is one of the primary tools the ECB uses to communicate with investors about monetary policy.',
        marketImpact: [
          { currency: 'EUR', expectedMovement: 'neutral', confidence: 5 },
          { currency: 'USD', expectedMovement: 'neutral', confidence: 4 },
        ],
        relatedEvents: ['ECB Press Conference', 'Monetary Policy Statement'],
        tradingTips: [
          'Focus on the press conference for forward guidance',
          'Rate holds often lead to range-bound EUR trading',
          'Watch for hints about future policy changes'
        ]
      },
      {
        id: 'event-4',
        title: 'UK GDP q/q',
        country: 'United Kingdom',
        currency: 'GBP',
        date: today.toISOString().split('T')[0],
        time: '07:00',
        impact: 'medium',
        forecast: '0.2%',
        previous: '0.1%',
        actual: '0.3%',
        unit: '%',
        frequency: 'quarterly',
        source: 'Office for National Statistics',
        volatility: 3,
        marketRelevance: ['GBP', 'UK Stocks'],
        description: 'Gross Domestic Product measures the total value of all goods and services produced by the UK.',
        marketImpact: [
          { currency: 'GBP', expectedMovement: 'bullish', confidence: 7 },
        ],
        tradingTips: [
          'Better than expected GDP supports GBP strength',
          'Watch for revisions to previous quarters'
        ]
      },
      {
        id: 'event-5',
        title: 'Japanese Yen Intervention Watch',
        country: 'Japan',
        currency: 'JPY',
        date: today.toISOString().split('T')[0],
        time: 'All Day',
        impact: 'high',
        frequency: 'daily',
        source: 'Bank of Japan',
        volatility: 5,
        marketRelevance: ['JPY', 'Asian Markets'],
        description: 'Market participants watch for potential Bank of Japan intervention in the foreign exchange market to prevent excessive yen weakness.',
        marketImpact: [
          { currency: 'JPY', expectedMovement: 'bullish', confidence: 6 },
        ],
        tradingTips: [
          'Watch USD/JPY levels above 150 for intervention risk',
          'Intervention can cause sharp JPY strengthening',
          'Monitor BoJ officials statements'
        ]
      }
    ];
  }
}

export const newsService = new NewsService();
