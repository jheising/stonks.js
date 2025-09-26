// Backtesting Types

// INCLUDE IN CODE EDITOR TYPES
export interface Bar {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// INCLUDE IN CODE EDITOR TYPES
export interface PortfolioData {
  sharesOwned: number;
  availableCash: number;
  startingCash: number;
  portfolioValue: number;
  portfolioPercentChange: number;
  buyAndHoldPercentChange: number;
}

// INCLUDE IN CODE EDITOR TYPES
export interface StrategyFunctionResult {
  changeInShares?: number;
  price?: number;
  meta: Record<string, any>;
}

// INCLUDE IN CODE EDITOR TYPES
export interface StrategyFunctionData {
  // Zero-based index of the current step
  stepIndex: number;
  bars: Bar[];
  currentBar: Bar;
  previousBar: Bar;
  nextBar: Bar;
  currentPortfolio: PortfolioData;
  strategyResults: StrategyFunctionResult[];
  previousStrategyResult?: StrategyFunctionResult;
}

export interface StrategyHistory {
  strategyResult?: StrategyFunctionResult;
  portfolioSnapshot: PortfolioData;
  bar: Bar;
}

export interface BacktestResult {
  portfolioData: PortfolioData;
  history: Array<StrategyHistory>;
}
