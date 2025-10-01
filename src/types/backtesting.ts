export interface Bar {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PortfolioData {
  // The amount of shares currently owned.
  sharesOwned: number;
  // The amount of cash available to the portfolio.
  availableCash: number;
  // The amount of cash the portfolio started with.
  startingCash: number;
  // The current value of the portfolio: cash + sharesOwned * current price
  portfolioValue: number;
  // The percent change of the portfolio value from the starting cash.
  portfolioPercentChange: number;
  // The percent change of the current stock price from the starting price.
  stockPercentChange: number;
}

export interface StrategyFunctionResult {
  // Amount of shares to buy or sell. A positive number means buy, a negative number means sell. If not set, the strategy will hold the position.
  changeInShares?: number;
  // Price at which the shares were bought or sold. If not set, the strategy will use the next bar's open price.
  price?: number;
  // Anything put here will be included in the backtesting results as well as the CSV export
  meta: Record<string, any>;
}

export interface StrategyHistory {
  strategyResult: StrategyFunctionResult;
  portfolioSnapshot: PortfolioData;
  bar: Bar;
}

export interface StrategyFunctionData {
  // Zero-based index of the current day
  dayNumber: number;
  currentBar: Bar;
  previousBar: Bar;
  nextBar: Bar;
  currentPortfolio: PortfolioData;
  history: StrategyHistory[];
  // Persistent storage for custom data between executions of the strategy
  scratchpad: Record<string, any>;
}

export interface PerformanceMetrics {
  // Risk-adjusted returns
  sharpeRatio: number;
  sortinoRatio: number;
  
  // Drawdown metrics
  maxDrawdown: number;
  maxDrawdownPercent: number;
  
  // Market comparison
  alpha: number;
  beta: number;
  
  // Trade analysis
  winRate: number;
  payoffRatio: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  
  // Additional metrics
  volatility: number;
  marketVolatility: number;
  correlation: number;
  informationRatio: number;
  calmarRatio: number;
}

export interface BacktestResult {
  portfolioData: PortfolioData;
  history: Array<StrategyHistory>;
  performanceMetrics: PerformanceMetrics;
   // ISO string of when the backtest was run
  timestamp: string;
}

export interface BacktestMarketDataProps {
  symbol: string;
  startDate: string;
  endDate?: string;
  barResolutionValue: string;
  barResolutionPeriod: string;
}

export interface BacktestSettings {
  stockSymbol: string;
  startingAmount: string;
  startDate: string;
  endDate: string;
  barResolutionValue: string;
  barResolutionPeriod: string;
}
