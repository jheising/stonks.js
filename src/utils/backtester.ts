import { DateTime } from "luxon";
// Utils functions for basic calculations
const Utils = {
    percentChange: (newValue: number, oldValue: number): number => {
        if (oldValue === 0) return 0;
        return ((newValue - oldValue) / oldValue) * 100;
    }
};

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

// INCLUDE IN CODE EDITOR TYPES
export interface StrategyFunctionResult {
    changeInShares?: number;
    price?: number;
    meta: Record<string, any>;
}

export interface StrategyHistory {
    strategyResult?: StrategyFunctionResult;
    portfolioSnapshot: PortfolioData;
    bar: Bar;
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

export interface BacktestResult {
    portfolioData: PortfolioData;
    history: Array<StrategyHistory>;
}

export async function backtest(props: { apiKey: string, apiSecret: string, symbol: string, startDate: string, endDate?: string, startingAmount: number, strategy: (data: StrategyFunctionData) => Promise<StrategyFunctionResult> }): Promise<BacktestResult> {
    const { apiKey, apiSecret, symbol, startDate, endDate, startingAmount } = props;

    const from = DateTime.fromISO(startDate);
    const until = endDate ? DateTime.fromISO(endDate) : DateTime.utc();

    const timeDelta = until.diff(from, ["hour", "minute"]).toObject();
    const timeframe = timeDelta!.hours! > 24 ? "1D" : "1Min";

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'APCA-API-KEY-ID': apiKey,
            'APCA-API-SECRET-KEY': apiSecret
        }
    };

    const response = await fetch(`https://data.alpaca.markets/v2/stocks/${symbol}/bars?timeframe=${timeframe}&limit=1000&feed=iex&sort=asc&start=${startDate}&end=${endDate}`, options)
    const data = await response.json();
    const bars = data.bars.map((bar: any) => ({
        timestamp: bar.t,
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v
    }));
    const firstBar = bars[0];
    const lastBar = bars[bars.length - 1];

    const strategyResults: Array<StrategyFunctionResult> = [];
    const history: Array<StrategyHistory> = [];
    const portfolioData: PortfolioData = {
        sharesOwned: 0,
        availableCash: startingAmount,
        startingCash: startingAmount,
        portfolioValue: startingAmount,
        portfolioPercentChange: 0,
        buyAndHoldPercentChange: Utils.percentChange(lastBar.close, firstBar.open)
    };

    for (let i = 0; i < bars.length; i++) {
        const bar = bars[i];
        const previousBar = bars[i - 1];
        const nextBar = bars[i + 1];
        const portfolioSnapshot = {...portfolioData};

        if (!bar || !previousBar || !nextBar) {
            history.push({
                bar: bar,
                strategyResult: undefined,
                portfolioSnapshot: portfolioSnapshot
            });
            continue;
        }

        const strategyData: StrategyFunctionData = {
            stepIndex: i,
            bars,
            currentBar: bar,
            previousBar: previousBar,
            nextBar: nextBar,
            strategyResults: strategyResults,
            previousStrategyResult: strategyResults[i - 1],
            currentPortfolio: portfolioData
        };

        const strategyResult = await props.strategy(strategyData);
        strategyResults.push(strategyResult);
        history.push({
            bar: bar,
            strategyResult: strategyResult,
            portfolioSnapshot: portfolioSnapshot
        });


        if (strategyResult.changeInShares && strategyResult.changeInShares !== 0) {
            portfolioData.sharesOwned += strategyResult.changeInShares;
            portfolioData.availableCash -= strategyResult.changeInShares * (strategyResult.price ?? nextBar.open);
        }
        else {
            strategyResult.price = undefined;
        }

        if (portfolioData.sharesOwned < 0) {
            throw new Error("Shares owned is negative");
        }

        if (portfolioData.availableCash < 0) {
            throw new Error("Available cash is negative");
        }

        portfolioData.portfolioValue = portfolioData.sharesOwned * (strategyResult.price ?? nextBar.open) + portfolioData.availableCash;
        portfolioData.portfolioPercentChange = Utils.percentChange(portfolioData.portfolioValue, portfolioData.startingCash);
    }

    return {
        portfolioData,
        history: history
    };
}