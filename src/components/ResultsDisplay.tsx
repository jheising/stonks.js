import React, { useState, useEffect } from "react";
import currency from "currency.js";
import type { BacktestResult } from "../types/backtesting";
import type { ParsedError } from "../utils/errorParser";
import { downloadCSV } from "../utils/csvExport";
import { Pagination } from "./Pagination";
import { ColoredValue } from "./ColoredValue";
import { MetricCard } from "./MetricCard";
import { DateTime } from "luxon";
import { Download, X } from "lucide-react";

interface ResultsDisplayProps {
    backtestResult: BacktestResult | null;
    backtestSuccess: string | null;
    backtestError: string | null;
    parsedError: ParsedError | null;
    stockSymbol: string;
    onClearError: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
    backtestResult,
    // backtestSuccess,
    backtestError,
    parsedError,
    stockSymbol,
    onClearError
}) => {
    // Internal state management for pagination and metadata expansion
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [expandedMetaRows, setExpandedMetaRows] = useState<Set<number>>(new Set());

    // Reset pagination when backtest result changes
    useEffect(() => {
        setCurrentPage(1);
        setExpandedMetaRows(new Set()); // Also reset expanded meta rows for new results
    }, [backtestResult]);

    // Toggle meta data expansion for a specific row
    const toggleMetaExpansion = (rowIndex: number, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        const newExpanded = new Set(expandedMetaRows);
        if (newExpanded.has(rowIndex)) {
            newExpanded.delete(rowIndex);
        } else {
            newExpanded.add(rowIndex);
        }
        setExpandedMetaRows(newExpanded);
    };

    // Expand all meta fields that have data
    const expandAllMeta = () => {
        if (!backtestResult) return;

        const rowsWithMeta = new Set<number>();
        backtestResult.history.forEach((historyItem, index) => {
            if (historyItem.strategyResult?.meta && Object.keys(historyItem.strategyResult.meta).length > 0) {
                rowsWithMeta.add(index);
            }
        });
        setExpandedMetaRows(rowsWithMeta);
    };

    // Collapse all meta fields
    const collapseAllMeta = () => {
        setExpandedMetaRows(new Set());
    };

    // Handle page changes
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Handle page size changes
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1); // Reset to first page when page size changes
    };
    const handleDownloadCSV = () => {
        if (backtestResult) {
            downloadCSV(backtestResult, stockSymbol);
        }
    };

    // Calculate paginated data
    const totalItems = backtestResult?.history?.length || 0;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedHistory = backtestResult?.history?.slice(startIndex, endIndex) || [];

    return (
        <>
            {/* Success Display */}
            {/* {backtestSuccess && (
        <div className="bg-teal-50 border-teal-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-teal-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-teal-800">Backtest Complete</h3>
              <p className="text-sm text-teal-700 mt-1">{backtestSuccess}</p>
            </div>
            <button
              onClick={onClearSuccess}
              className="ml-auto text-teal-300 hover:text-teal-300 "
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )} */}

            {/* Results Section */}
            {backtestResult && (
                <div>
                    {/* Results Header with Timestamp */}
                    <div className="mb-6 pb-4 border-b border-tuna-600">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold">Backtest Results</h3>
                                <p className="text-sm text-tuna-400 mt-1">Run on {DateTime.fromISO(backtestResult.timestamp).toLocaleString(DateTime.DATETIME_FULL)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard title="Starting Total Portfolio Value">
                            ${backtestResult.portfolioData.startingCash.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </MetricCard>

                        <MetricCard title="Final Total Portfolio Value">{currency(backtestResult.portfolioData.portfolioValue).format()}</MetricCard>

                        <MetricCard title="Market Performance">
                            <ColoredValue
                                rule={{ type: "positive-negative", value: backtestResult.portfolioData.stockPercentChange }}
                                format={v => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(2)}%`}
                            />
                        </MetricCard>

                        <MetricCard title="Strategy Performance">
                            <ColoredValue
                                rule={{ type: "positive-negative", value: backtestResult.portfolioData.portfolioPercentChange }}
                                format={v => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(2)}%`}
                            />
                        </MetricCard>
                    </div>

                    {/* Performance Metrics */}
                    <div className="mt-6 mb-6 pb-4 border-b border-tuna-600">
                        <div>
                            <h3 className="text-lg font-semibold">Performance Analysis</h3>
                            <p className="text-sm text-tuna-400 mt-1">Advanced metrics comparing your strategy to market performance</p>
                        </div>
                    </div>

                    {/* Risk-Adjusted Returns */}
                    <div className="mb-6">
                        <h5 className="text-sm font-semibold text-tuna-300 mb-3 uppercase tracking-wider">Risk-Adjusted Returns</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard
                                title="Sharpe Ratio"
                                tooltip={
                                    <>
                                        <div>Measures risk-adjusted returns per unit of risk taken.</div>
                                        <div className="mt-2 text-teal-300 font-semibold">Excellent: &gt;2</div>
                                        <div className="text-teal-300 font-semibold">Good: &gt;1</div>
                                        <div className="text-yellow-300 font-semibold">Acceptable: 0-1</div>
                                        <div className="text-pink-300 font-semibold">Poor: &lt;0</div>
                                        <div className="mt-1 text-tuna-400">Higher is better</div>
                                    </>
                                }
                                footer="Higher is better"
                            >
                                <ColoredValue
                                    rule={{ type: "threshold", value: backtestResult.performanceMetrics.sharpeRatio, goodThreshold: 1, okThreshold: 0 }}
                                    format={v => v.toFixed(2)}
                                />
                            </MetricCard>

                            <MetricCard
                                title="Sortino Ratio"
                                tooltip={
                                    <>
                                        <div>Similar to Sharpe but only penalizes downside volatility.</div>
                                        <div className="mt-2 text-teal-300 font-semibold">Excellent: &gt;2</div>
                                        <div className="text-teal-300 font-semibold">Good: &gt;1</div>
                                        <div className="text-yellow-300 font-semibold">Acceptable: 0-1</div>
                                        <div className="text-pink-300 font-semibold">Poor: &lt;0</div>
                                        <div className="mt-1 text-tuna-400">Higher is better</div>
                                    </>
                                }
                                footer="Higher is better"
                            >
                                <ColoredValue
                                    rule={{ type: "threshold", value: backtestResult.performanceMetrics.sortinoRatio, goodThreshold: 1, okThreshold: 0 }}
                                    format={v => (isFinite(v) ? v.toFixed(2) : "∞")}
                                />
                            </MetricCard>

                            <MetricCard
                                title="Information Ratio"
                                tooltip={
                                    <>
                                        <div>Measures excess returns vs. buy-and-hold per unit of tracking error.</div>
                                        <div className="mt-2 text-teal-300 font-semibold">Excellent: &gt;1</div>
                                        <div className="text-teal-300 font-semibold">Good: &gt;0.5</div>
                                        <div className="text-yellow-300 font-semibold">Acceptable: 0-0.5</div>
                                        <div className="text-pink-300 font-semibold">Poor: &lt;0</div>
                                        <div className="mt-1 text-tuna-400">Higher is better</div>
                                    </>
                                }
                                footer="Higher is better"
                            >
                                <ColoredValue
                                    rule={{ type: "threshold", value: backtestResult.performanceMetrics.informationRatio, goodThreshold: 0.5, okThreshold: 0 }}
                                    format={v => v.toFixed(2)}
                                />
                            </MetricCard>

                            <MetricCard
                                title="Calmar Ratio"
                                tooltip={
                                    <>
                                        <div>Annual return divided by maximum drawdown.</div>
                                        <div className="mt-2 text-teal-300 font-semibold">Excellent: &gt;3</div>
                                        <div className="text-teal-300 font-semibold">Good: &gt;1</div>
                                        <div className="text-yellow-300 font-semibold">Acceptable: 0-1</div>
                                        <div className="text-pink-300 font-semibold">Poor: &lt;0</div>
                                        <div className="mt-1 text-tuna-400">Higher is better</div>
                                    </>
                                }
                                footer="Higher is better"
                            >
                                <ColoredValue
                                    rule={{ type: "threshold", value: backtestResult.performanceMetrics.calmarRatio, goodThreshold: 1, okThreshold: 0 }}
                                    format={v => v.toFixed(2)}
                                />
                            </MetricCard>
                        </div>
                    </div>

                    {/* Market Comparison */}
                    <div className="mb-6">
                        <h5 className="text-sm font-semibold text-tuna-300 mb-3 uppercase tracking-wider">Buy-and-Hold Comparison</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard
                                title="Alpha"
                                tooltip={
                                    <>
                                        <div>Risk-adjusted excess returns vs. buy-and-hold of the same security using CAPM.</div>
                                        <div className="mt-2 text-teal-300 font-semibold">Excellent: &gt;5% annually</div>
                                        <div className="text-teal-300 font-semibold">Good: &gt;0%</div>
                                        <div className="text-pink-300 font-semibold">Poor: &lt;0%</div>
                                        <div className="mt-1 text-tuna-400">Positive = skill-based outperformance</div>
                                        <div className="text-tuna-400 text-xs italic">Note: Compared to buy-and-hold, not a market index</div>
                                    </>
                                }
                                footer="Risk-adjusted excess return"
                            >
                                <ColoredValue
                                    rule={{ type: "positive-negative", value: backtestResult.performanceMetrics.alpha }}
                                    format={v => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(2)}%`}
                                />
                            </MetricCard>

                            <MetricCard
                                title="Beta"
                                tooltip={
                                    <>
                                        <div>Measures strategy volatility vs. buy-and-hold of the same security.</div>
                                        <div className="mt-2 text-teal-300 font-semibold">&lt;1 = less volatile than buy-and-hold</div>
                                        <div className="text-yellow-300 font-semibold">1.0 = same volatility as buy-and-hold</div>
                                        <div className="text-pink-300 font-semibold">&gt;1 = more volatile than buy-and-hold</div>
                                        <div className="mt-1 text-tuna-400">Lower beta = more stability</div>
                                    </>
                                }
                                footer="Volatility vs. buy-and-hold"
                            >
                                <ColoredValue
                                    rule={{
                                        type: "custom",
                                        value: backtestResult.performanceMetrics.beta,
                                        getColor: v => (Math.abs(v - 1) < 0.2 ? "text-yellow-300" : v > 1 ? "text-pink-300" : "text-teal-300")
                                    }}
                                    format={v => v.toFixed(2)}
                                />
                            </MetricCard>

                            <MetricCard
                                title="Correlation"
                                tooltip={
                                    <>
                                        <div>How closely your strategy follows buy-and-hold of the same security (-1 to 1).</div>
                                        <div className="mt-2 text-teal-300 font-semibold">Best: &lt;0.3 (independent strategy)</div>
                                        <div className="text-yellow-300 font-semibold">Moderate: 0.3-0.7</div>
                                        <div className="text-pink-300 font-semibold">Poor: &gt;0.7 (follows buy-and-hold closely)</div>
                                        <div className="mt-1 text-tuna-400">Lower = more independent from buy-and-hold</div>
                                    </>
                                }
                                footer="-1 to 1 scale"
                            >
                                <ColoredValue
                                    rule={{
                                        type: "custom",
                                        value: backtestResult.performanceMetrics.correlation,
                                        getColor: v => (Math.abs(v) > 0.7 ? "text-pink-300" : Math.abs(v) > 0.3 ? "text-yellow-300" : "text-teal-300")
                                    }}
                                    format={v => v.toFixed(2)}
                                />
                            </MetricCard>

                            <MetricCard
                                title="Volatility"
                                tooltip={
                                    <>
                                        <div>Standard deviation of returns. Measures price swings and uncertainty.</div>
                                        <div className="mt-2 text-teal-300 font-semibold">Lower than market = good</div>
                                        <div className="text-pink-300 font-semibold">Higher than market = more risk</div>
                                        <div className="mt-1 text-tuna-400">Market: {(backtestResult.performanceMetrics.marketVolatility * 100).toFixed(1)}%</div>
                                    </>
                                }
                                footer={`vs Market: ${(backtestResult.performanceMetrics.marketVolatility * 100).toFixed(1)}%`}
                            >
                                <ColoredValue
                                    rule={{
                                        type: "custom",
                                        value: backtestResult.performanceMetrics.volatility,
                                        getColor: v => (v < backtestResult.performanceMetrics.marketVolatility ? "text-teal-300" : "text-pink-300")
                                    }}
                                    format={v => `${(v * 100).toFixed(1)}%`}
                                />
                            </MetricCard>
                        </div>
                    </div>

                    {/* Risk Metrics */}
                    <div className="mb-6">
                        <h5 className="text-sm font-semibold text-tuna-300 mb-3 uppercase tracking-wider">Risk Metrics</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <MetricCard
                                title="Maximum Drawdown"
                                tooltip={
                                    <>
                                        <div>Largest peak-to-trough decline. Shows worst-case loss from a high point.</div>
                                        <div className="mt-2 text-teal-300 font-semibold">Good: &lt;10%</div>
                                        <div className="text-yellow-300 font-semibold">Acceptable: &lt;20%</div>
                                        <div className="text-pink-300 font-semibold">Concerning: &gt;20%</div>
                                        <div className="mt-1 text-tuna-400">Lower is better</div>
                                    </>
                                }
                                footer={`$${backtestResult.performanceMetrics.maxDrawdown.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            >
                                <ColoredValue
                                    rule={{
                                        type: "inverted-threshold",
                                        value: backtestResult.performanceMetrics.maxDrawdownPercent,
                                        goodThreshold: 0.1,
                                        okThreshold: 0.2
                                    }}
                                    format={v => `-${(v * 100).toFixed(2)}%`}
                                />
                            </MetricCard>
                        </div>
                    </div>

                    {/* Trade Analysis */}
                    {backtestResult.performanceMetrics.totalTrades > 0 && (
                        <div className="mb-6">
                            <h5 className="text-sm font-semibold text-tuna-300 mb-3 uppercase tracking-wider">Trade Analysis</h5>
                            <p className="text-xs text-tuna-400 mb-3 italic">
                                Note: Each sell transaction is analyzed using average cost basis. Unrealized positions (still holding) are not included.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <MetricCard
                                    title="Win Rate"
                                    footer={`${backtestResult.performanceMetrics.winningTrades}/${backtestResult.performanceMetrics.totalTrades} trades`}
                                    tooltip={
                                        <>
                                            <div>Percentage of trades that were profitable.</div>
                                            <div className="mt-2 text-teal-300 font-semibold">Good: &gt;60%</div>
                                            <div className="text-yellow-300 font-semibold">Acceptable: 40-60%</div>
                                            <div className="text-pink-300 font-semibold">Poor: &lt;40%</div>
                                            <div className="mt-1 text-tuna-400">Higher is better</div>
                                        </>
                                    }
                                >
                                    <ColoredValue
                                        rule={{ type: "threshold", value: backtestResult.performanceMetrics.winRate, goodThreshold: 0.6, okThreshold: 0.4 }}
                                        format={v => `${(v * 100).toFixed(1)}%`}
                                    />
                                </MetricCard>

                                <MetricCard
                                    title="Payoff Ratio"
                                    footer="Avg win / Avg loss"
                                    tooltip={
                                        <>
                                            <div>Average winning trade divided by average losing trade.</div>
                                            <div className="mt-2 text-teal-300 font-semibold">Excellent: &gt;2.0</div>
                                            <div className="text-teal-300 font-semibold">Good: &gt;1.5</div>
                                            <div className="text-yellow-300 font-semibold">Acceptable: 1.0-1.5</div>
                                            <div className="text-pink-300 font-semibold">Poor: &lt;1.0</div>
                                            <div className="mt-1 text-tuna-400">Higher is better</div>
                                        </>
                                    }
                                >
                                    <ColoredValue
                                        rule={{ type: "threshold", value: backtestResult.performanceMetrics.payoffRatio, goodThreshold: 1.5, okThreshold: 1 }}
                                        format={v => (isFinite(v) ? v.toFixed(2) : "∞")}
                                    />
                                </MetricCard>

                                <MetricCard title="Average Win" footer="Per winning trade">
                                    <span className="text-teal-300">+{(backtestResult.performanceMetrics.averageWin * 100).toFixed(2)}%</span>
                                </MetricCard>

                                <MetricCard title="Average Loss" footer="Per losing trade">
                                    <span className="text-pink-300">-{(backtestResult.performanceMetrics.averageLoss * 100).toFixed(2)}%</span>
                                </MetricCard>
                            </div>
                        </div>
                    )}

                    {/* Detailed Results Table */}
                    <div className="mt-6 bg-tuna-700 rounded-lg  overflow-hidden">
                        <div className="px-4 py-3 border-b">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="text-md font-semibold">Detailed Backtest Data</h4>
                                    <p className="text-sm text-tuna-400 mt-1">Bar data and strategy decisions for each time period</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleDownloadCSV}
                                        className="px-3 py-1 text-xs bg-teal-400 text-tuna-900 rounded hover:bg-teal-700 transition-colors flex items-center space-x-1 "
                                        type="button"
                                    >
                                        <Download className="w-3 h-3" />
                                        <span>Download CSV</span>
                                    </button>
                                    <button
                                        onClick={expandAllMeta}
                                        className="px-3 py-1 text-xs bg-teal-400 text-tuna-900 rounded hover:bg-teal-700 transition-colors "
                                        type="button"
                                    >
                                        Expand All Meta
                                    </button>
                                    <button onClick={collapseAllMeta} className="px-3 py-1 text-xs bg-tuna-600 rounded hover:bg-tuna-700 transition-colors " type="button">
                                        Collapse All Meta
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-tuna-400">
                                <thead className="bg-tuna-600 sticky top-0">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-bold  uppercase tracking-wider">Date</th>
                                        <th className="px-3 py-2 text-left text-xs font-bold  uppercase tracking-wider">Symbol</th>
                                        <th className="px-3 py-2 text-xs font-bold  uppercase tracking-wider text-right">Open</th>
                                        <th className="px-3 py-2 text-xs font-bold  uppercase tracking-wider text-right">High</th>
                                        <th className="px-3 py-2 text-xs font-bold  uppercase tracking-wider text-right">Low</th>
                                        <th className="px-3 py-2 text-xs font-bold  uppercase tracking-wider text-right">Close</th>
                                        <th className="px-3 py-2 text-xs font-bold  uppercase tracking-wider text-right">Volume</th>
                                        <th className="px-3 py-2 text-xs font-bold  uppercase tracking-wider text-right">Shares Owned</th>
                                        <th className="px-3 py-2 text-xs font-bold  uppercase tracking-wider text-right">Buy/Sell Shares</th>
                                        <th className="px-3 py-2 text-xs font-bold  uppercase tracking-wider text-right">Buy/Sell Price</th>
                                        <th className="px-3 py-2 text-xs font-bold  uppercase tracking-wider text-right">Cash</th>
                                        <th className="px-3 py-2 text-xs font-bold  uppercase tracking-wider text-right">Portfolio Value</th>
                                        <th className="px-3 py-2 text-xs font-bold  uppercase tracking-wider text-center">Meta</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-tuna-600">
                                    {paginatedHistory.map((historyItem, index) => {
                                        const globalIndex = startIndex + index; // Global index for meta expansion
                                        const bar = historyItem.bar;
                                        const strategyResult = historyItem.strategyResult;
                                        const portfolioSnapshot = historyItem.portfolioSnapshot;
                                        return (
                                            <React.Fragment key={globalIndex}>
                                                <tr key={globalIndex}>
                                                    <td className="px-3 py-2 whitespace-nowrap font-medium text-sm tracking-tight">
                                                        {DateTime.fromISO(bar.timestamp).toLocaleString(DateTime.DATETIME_SHORT)}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap font-medium text-sm">{stockSymbol}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-right tracking-wider">{currency(bar.open).format()}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-right tracking-wider">{currency(bar.high).format()}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-right tracking-wider">{currency(bar.low).format()}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-right tracking-wider">{currency(bar.close).format()}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-right tracking-wider">{bar.volume.toLocaleString()}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-right tracking-wider">
                                                        {portfolioSnapshot.sharesOwned.toLocaleString()}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-right tracking-wider">
                                                        {strategyResult?.changeInShares !== undefined && strategyResult.changeInShares !== 0 ? (
                                                            <ColoredValue
                                                                rule={{ type: "positive-negative", value: strategyResult.changeInShares }}
                                                                format={v => `${v > 0 ? "+" : ""}${v}`}
                                                            />
                                                        ) : (
                                                            <span className="text-tuna-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium tracking-wider">
                                                        {strategyResult?.price !== undefined ? currency(strategyResult.price).format() : <span className="text-tuna-400">-</span>}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium tracking-wider">
                                                        <span>{currency(portfolioSnapshot.availableCash).format()}</span>
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium tracking-wider">
                                                        {(() => {
                                                            // Get previous portfolio value for comparison
                                                            const previousPortfolioValue =
                                                                index > 0 ? backtestResult.history[index - 1].portfolioSnapshot.portfolioValue : portfolioSnapshot.portfolioValue;
                                                            const currentPortfolioValue = portfolioSnapshot.portfolioValue;
                                                            const change = currentPortfolioValue - previousPortfolioValue;

                                                            return index > 0 ? (
                                                                <ColoredValue
                                                                    rule={{ type: "positive-negative", value: change }}
                                                                    format={() => currency(portfolioSnapshot.portfolioValue).format()}
                                                                />
                                                            ) : (
                                                                <span>{currency(portfolioSnapshot.portfolioValue).format()}</span>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                                                        {strategyResult?.meta && Object.keys(strategyResult.meta).length > 0 ? (
                                                            <button
                                                                onClick={e => toggleMetaExpansion(globalIndex, e)}
                                                                className="text-teal-300 hover:text-teal-800 font-medium "
                                                                type="button"
                                                            >
                                                                {expandedMetaRows.has(globalIndex) ? "−" : "+"}
                                                            </button>
                                                        ) : (
                                                            <span className="text-tuna-400">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                                {expandedMetaRows.has(globalIndex) && strategyResult?.meta && (
                                                    <tr>
                                                        <td colSpan={12} className="px-3 py-2">
                                                            <div className="p-3">
                                                                <h5 className="text-sm font-medium mb-2">Meta Data:</h5>
                                                                <pre className="text-xs whitespace-pre-wrap p-2">{JSON.stringify(strategyResult.meta, null, 2)}</pre>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <Pagination currentPage={currentPage} totalItems={totalItems} pageSize={pageSize} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} />
                    </div>
                </div>
            )}

            {/* Error Display */}
            {backtestError && (
                <div className="bg-pink-50 border-pink-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-pink-300 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L10 11.414l1.293-1.293a1 1 0 001.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <div className="flex-grow">
                            <h3 className="text-sm font-medium text-pink-800">
                                Strategy Error
                                {parsedError?.errorType && <span className="ml-2 px-2 py-0.5 text-xs bg-pink-100 text-pink-300 rounded">{parsedError.errorType}</span>}
                            </h3>

                            {/* Enhanced error message */}
                            <div className="mt-2">
                                {parsedError?.lineNumber ? (
                                    <p className="text-sm text-pink-700">
                                        <span className="font-semibold">Line {parsedError.lineNumber}</span>
                                        {parsedError.columnNumber && <span>, Column {parsedError.columnNumber}</span>}: {parsedError.message}
                                    </p>
                                ) : (
                                    <p className="text-sm text-pink-700">{backtestError}</p>
                                )}
                            </div>

                            {/* Code context */}
                            {parsedError?.codeContext && (
                                <div className="mt-3">
                                    <h4 className="text-xs font-medium text-pink-800 mb-2">Code Context:</h4>
                                    <pre className="text-xs text-pink-700 bg-pink-100 p-2 rounded overflow-x-auto whitespace-pre">{parsedError.codeContext}</pre>
                                </div>
                            )}
                        </div>
                        <button onClick={onClearError} className="ml-3 text-pink-300 hover:text-pink-300  flex-shrink-0">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
