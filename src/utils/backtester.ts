import { DateTime } from 'luxon';
import type {
    PortfolioData,
    StrategyFunctionData,
    StrategyFunctionResult,
    StrategyHistory,
    BacktestResult
} from '../types/backtesting';
import { MathUtils } from './MathUtils';

export async function backtest(props: { apiKey: string, apiSecret: string, symbol: string, startDate: string, endDate?: string, startingAmount: number, strategy: (data: StrategyFunctionData) => Promise<StrategyFunctionResult> }): Promise<BacktestResult> {
    const { apiKey, apiSecret, symbol, startDate, endDate, startingAmount } = props;

    const start = DateTime.fromISO(startDate, { zone: 'America/New_York' }).startOf('day').toUTC().toISO();

    let url = `https://data.alpaca.markets/v2/stocks/${symbol}/bars?timeframe=1D&limit=1000&feed=iex&sort=asc&start=${start}`;

    if (endDate) {
        const end = DateTime.fromISO(endDate, { zone: 'America/New_York' }).endOf('day').toUTC().toISO();
        url += `&end=${end}`;
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'APCA-API-KEY-ID': apiKey,
            'APCA-API-SECRET-KEY': apiSecret
        }
    });

    const data = await response.json();
    const bars = data.bars.map((bar: any) => ({
        timestamp: DateTime.fromISO(bar.t).setZone('America/New_York').toLocaleString(DateTime.DATE_SHORT),
        open: Number(bar.o),
        high: Number(bar.h),
        low: Number(bar.l),
        close: Number(bar.c),
        volume: Number(bar.v)
    }));

    const history: Array<StrategyHistory> = [];
    const portfolioData: PortfolioData = {
        sharesOwned: 0,
        availableCash: startingAmount,
        startingCash: startingAmount,
        portfolioValue: startingAmount,
        portfolioPercentChange: 0,
        stockPercentChange: 0
    };

    for (let i = 0; i < bars.length; i++) {
        const bar = bars[i];
        const previousBar = bars[i - 1];
        const nextBar = bars[i + 1];
        const portfolioSnapshot = { ...portfolioData };

        if (!bar || !previousBar || !nextBar) {
            continue;
        }

        const strategyData: StrategyFunctionData = {
            dayNumber: history.length,
            currentBar: bar,
            previousBar: previousBar,
            nextBar: nextBar,
            currentPortfolio: portfolioData,
            history: history
        };

        const strategyResult = await props.strategy(strategyData);
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
        portfolioData.portfolioPercentChange = MathUtils.percentChange(portfolioData.portfolioValue, portfolioData.startingCash);
        portfolioData.stockPercentChange = MathUtils.percentChange(nextBar.open, history[0].bar.open);
    }

    return {
        portfolioData,
        history: history
    };
}