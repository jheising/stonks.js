import currency from "currency.js";
import type { BacktestResult } from "../types/backtesting";

// Generate and download CSV of backtest results
export const downloadCSV = (backtestResult: BacktestResult, stockSymbol: string) => {
    if (!backtestResult) return;

    // Create performance metrics summary
    const performanceMetricsRows = [
        ["PERFORMANCE METRICS SUMMARY"],
        [""],
        ["Risk-Adjusted Returns"],
        ["Sharpe Ratio", backtestResult.performanceMetrics.sharpeRatio.toFixed(4)],
        ["Sortino Ratio", isFinite(backtestResult.performanceMetrics.sortinoRatio) ? backtestResult.performanceMetrics.sortinoRatio.toFixed(4) : "Infinity"],
        ["Information Ratio", backtestResult.performanceMetrics.informationRatio.toFixed(4)],
        ["Calmar Ratio", backtestResult.performanceMetrics.calmarRatio.toFixed(4)],
        [""],
        ["Market Comparison"],
        ["Alpha (%)", (backtestResult.performanceMetrics.alpha * 100).toFixed(4)],
        ["Beta", backtestResult.performanceMetrics.beta.toFixed(4)],
        ["Correlation", backtestResult.performanceMetrics.correlation.toFixed(4)],
        ["Strategy Volatility (%)", (backtestResult.performanceMetrics.volatility * 100).toFixed(4)],
        ["Market Volatility (%)", (backtestResult.performanceMetrics.marketVolatility * 100).toFixed(4)],
        [""],
        ["Risk Metrics"],
        ["Maximum Drawdown ($)", backtestResult.performanceMetrics.maxDrawdown.toFixed(2)],
        ["Maximum Drawdown (%)", (backtestResult.performanceMetrics.maxDrawdownPercent * 100).toFixed(4)],
        [""],
        ["Trade Analysis"],
        ["Total Trades", backtestResult.performanceMetrics.totalTrades.toString()],
        ["Winning Trades", backtestResult.performanceMetrics.winningTrades.toString()],
        ["Losing Trades", backtestResult.performanceMetrics.losingTrades.toString()],
        ["Win Rate (%)", (backtestResult.performanceMetrics.winRate * 100).toFixed(2)],
        ["Payoff Ratio", isFinite(backtestResult.performanceMetrics.payoffRatio) ? backtestResult.performanceMetrics.payoffRatio.toFixed(4) : "Infinity"],
        ["Average Win (%)", (backtestResult.performanceMetrics.averageWin * 100).toFixed(4)],
        ["Average Loss (%)", (backtestResult.performanceMetrics.averageLoss * 100).toFixed(4)],
        [""],
        ["Basic Performance"],
        ["Starting Cash ($)", backtestResult.portfolioData.startingCash.toFixed(2)],
        ["Final Portfolio Value ($)", backtestResult.portfolioData.portfolioValue.toFixed(2)],
        ["Strategy Return (%)", (backtestResult.portfolioData.portfolioPercentChange * 100).toFixed(4)],
        ["Market Return (%)", (backtestResult.portfolioData.stockPercentChange * 100).toFixed(4)],
        [""],
        [""],
        ["DETAILED TRANSACTION DATA"]
    ];

    // CSV headers for transaction data
    const headers = ["Date", "Symbol", "Open", "High", "Low", "Close", "Volume", "Shares_Change", "Trade_Price", "Shares_Owned", "Cash", "Portfolio_Value", "Meta_Data"];

    // Convert transaction data to CSV rows
    const transactionRows = backtestResult.history.map(historyItem => {
        const bar = historyItem.bar;
        const strategyResult = historyItem.strategyResult;
        const portfolioSnapshot = historyItem.portfolioSnapshot;

        return [
            new Date(bar.timestamp).toLocaleDateString(),
            stockSymbol,
            currency(bar.open).format({ pattern: "!#", separator: "", decimal: ".", precision: 2 }),
            currency(bar.high).format({ pattern: "!#", separator: "", decimal: ".", precision: 2 }),
            currency(bar.low).format({ pattern: "!#", separator: "", decimal: ".", precision: 2 }),
            currency(bar.close).format({ pattern: "!#", separator: "", decimal: ".", precision: 2 }),
            bar.volume,
            strategyResult?.changeInShares || 0,
            strategyResult?.price ? currency(strategyResult.price).format({ pattern: "!#", separator: "", decimal: ".", precision: 2 }) : "",
            portfolioSnapshot.sharesOwned,
            currency(portfolioSnapshot.availableCash).format({ pattern: "!#", separator: "", decimal: ".", precision: 2 }),
            currency(portfolioSnapshot.portfolioValue).format({ pattern: "!#", separator: "", decimal: ".", precision: 2 }),
            strategyResult?.meta ? JSON.stringify(strategyResult.meta).replace(/"/g, '""') : ""
        ].join(",");
    });

    // Combine all rows
    const csvRows = [
        ...performanceMetricsRows.map(row => row.join(",")),
        headers.join(","), // Header row for transaction data
        ...transactionRows
    ];

    // Create CSV content
    const csvContent = csvRows.join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `backtest-${stockSymbol}-${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
