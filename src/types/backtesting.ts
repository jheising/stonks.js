export interface Bar {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PortfolioData {
  sharesOwned: number;
  availableCash: number;
  startingCash: number;
  portfolioValue: number;
  portfolioPercentChange: number;
  stockPercentChange: number;
}

export interface StrategyFunctionResult {
  changeInShares?: number;
  price?: number;
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
}

export interface BacktestResult {
  portfolioData: PortfolioData;
  history: Array<StrategyHistory>;
}
