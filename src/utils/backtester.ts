import { DateTime } from "luxon";
import type { 
    PortfolioData, 
    StrategyFunctionData, 
    StrategyFunctionResult, 
    StrategyHistory, 
    BacktestResult 
} from '../types/backtesting';

// Utils functions for basic calculations
const Utils = {
    percentChange: (newValue: number, oldValue: number): number => {
        if (oldValue === 0) return 0;
        return ((newValue - oldValue) / oldValue) * 100;
    }
};

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