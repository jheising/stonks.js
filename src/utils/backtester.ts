// Removed unused import: DateTime from luxon
import currency from 'currency.js';
import type {
    PortfolioData,
    StrategyFunctionData,
    StrategyFunctionResult,
    StrategyHistory,
    BacktestResult
} from '../types/backtesting';
import { MathUtils } from './MathUtils';
import type { StockDataProviderBase } from '../providers/StockDataProviderBase';

export async function backtest(props: { dataProvider: StockDataProviderBase, symbol: string, startDate: string, endDate?: string, startingAmount: number, barResolutionValue: string, barResolutionPeriod: string, strategy: (data: StrategyFunctionData) => Promise<StrategyFunctionResult>, abortSignal?: AbortSignal }): Promise<BacktestResult> {
    const { dataProvider, symbol, startDate, endDate, startingAmount, barResolutionValue, barResolutionPeriod, abortSignal } = props;

    // Check if cancelled before starting
    if (abortSignal?.aborted) {
        throw new Error('Backtest was cancelled');
    }

    const bars = await dataProvider.getBars({
        symbol,
        startDate,
        endDate,
        barResolutionValue,
        barResolutionPeriod
    }, abortSignal);

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
        // Check for cancellation periodically
        if (abortSignal?.aborted) {
            throw new Error('Backtest was cancelled');
        }

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
            
            // Use currency.js for precise cash calculation
            const tradePrice = strategyResult.price ?? nextBar.open;
            const tradeCost = currency(strategyResult.changeInShares).multiply(tradePrice);
            portfolioData.availableCash = currency(portfolioData.availableCash).subtract(tradeCost).value;
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

        // Use currency.js for precise portfolio value calculation
        const stockValue = currency(portfolioData.sharesOwned).multiply(strategyResult.price ?? nextBar.open);
        portfolioData.portfolioValue = stockValue.add(portfolioData.availableCash).value;
        portfolioData.portfolioPercentChange = MathUtils.percentChange(portfolioData.portfolioValue, portfolioData.startingCash);
        portfolioData.stockPercentChange = MathUtils.percentChange(nextBar.open, history[0].bar.open);
    }

    return {
        portfolioData,
        history: history,
        timestamp: new Date().toISOString()
    };
}