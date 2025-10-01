// Interface for code version
export interface CodeVersion {
    id: string;
    code: string;
    timestamp: number;
    description: string;
}

// Re-export backtesting types
export type {
    Bar,
    PortfolioData,
    StrategyFunctionResult,
    StrategyHistory,
    StrategyFunctionData,
    BacktestResult,
    PerformanceMetrics,
    BacktestMarketDataProps,
    BacktestSettings
} from "./backtesting";
