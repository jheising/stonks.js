import React from 'react'
import type { BacktestResult } from '../utils/backtester'
import { downloadCSV } from '../utils/csvExport'

interface ResultsDisplayProps {
  backtestResult: BacktestResult | null
  backtestSuccess: string | null
  backtestError: string | null
  stockSymbol: string
  expandedMetaRows: Set<number>
  onToggleMetaExpansion: (rowIndex: number, event: React.MouseEvent) => void
  onExpandAllMeta: () => void
  onCollapseAllMeta: () => void
  onClearSuccess: () => void
  onClearError: () => void
  onClearResult: () => void
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  backtestResult,
  // backtestSuccess,
  backtestError,
  stockSymbol,
  expandedMetaRows,
  onToggleMetaExpansion,
  onExpandAllMeta,
  onCollapseAllMeta,
  // onClearSuccess,
  onClearError,
  onClearResult
}) => {
  const handleDownloadCSV = () => {
    if (backtestResult) {
      downloadCSV(backtestResult, stockSymbol)
    }
  }

  return (
    <>
      {/* Success Display */}
      {/* {backtestSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-green-800">Backtest Complete</h3>
              <p className="text-sm text-green-700 mt-1">{backtestSuccess}</p>
            </div>
            <button
              onClick={onClearSuccess}
              className="ml-auto text-green-400 hover:text-green-600 cursor-pointer"
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-blue-800">Backtest Results</h3>
            <button
              onClick={onClearResult}
              className="text-blue-400 hover:text-blue-600 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="text-sm text-gray-500 mb-1">Final Portfolio Value</div>
              <div className="text-2xl font-bold text-gray-900">
                ${backtestResult.portfolioData.portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="text-sm text-gray-500 mb-1">Strategy Return</div>
              <div className={`text-2xl font-bold ${backtestResult.portfolioData.portfolioPercentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {backtestResult.portfolioData.portfolioPercentChange >= 0 ? '+' : ''}{backtestResult.portfolioData.portfolioPercentChange.toFixed(2)}%
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="text-sm text-gray-500 mb-1">Buy & Hold Return</div>
              <div className={`text-2xl font-bold ${backtestResult.portfolioData.buyAndHoldPercentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {backtestResult.portfolioData.buyAndHoldPercentChange >= 0 ? '+' : ''}{backtestResult.portfolioData.buyAndHoldPercentChange.toFixed(2)}%
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="text-sm text-gray-500 mb-1">Shares Owned</div>
              <div className="text-xl font-semibold text-gray-900">
                {backtestResult.portfolioData.sharesOwned.toLocaleString('en-US', { maximumFractionDigits: 4 })}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="text-sm text-gray-500 mb-1">Available Cash</div>
              <div className="text-xl font-semibold text-gray-900">
                ${backtestResult.portfolioData.availableCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="text-sm text-gray-500 mb-1">Starting Amount</div>
              <div className="text-xl font-semibold text-gray-900">
                ${backtestResult.portfolioData.startingCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Performance Comparison */}
          <div className="mt-6 bg-white rounded-lg p-4 border border-blue-100">
            <h4 className="text-md font-semibold text-gray-800 mb-3">Performance Comparison</h4>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Strategy vs Buy & Hold:</span>
              <span className={`font-semibold ${backtestResult.portfolioData.portfolioPercentChange >= backtestResult.portfolioData.buyAndHoldPercentChange
                  ? 'text-green-600'
                  : 'text-red-600'
                }`}>
                {backtestResult.portfolioData.portfolioPercentChange >= backtestResult.portfolioData.buyAndHoldPercentChange ? '+' : ''}
                {(backtestResult.portfolioData.portfolioPercentChange - backtestResult.portfolioData.buyAndHoldPercentChange).toFixed(2)}%
                {backtestResult.portfolioData.portfolioPercentChange >= backtestResult.portfolioData.buyAndHoldPercentChange ? ' outperformance' : ' underperformance'}
              </span>
            </div>
          </div>

          {/* Detailed Results Table */}
          <div className="mt-6 bg-white rounded-lg border border-blue-100 overflow-hidden">
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-md font-semibold text-blue-800">Detailed Backtest Data</h4>
                  <p className="text-sm text-blue-600 mt-1">Bar data and strategy decisions for each time period</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleDownloadCSV}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center space-x-1 cursor-pointer"
                    type="button"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Download CSV</span>
                  </button>
                  <button
                    onClick={onExpandAllMeta}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
                    type="button"
                  >
                    Expand All Meta
                  </button>
                  <button
                    onClick={onCollapseAllMeta}
                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors cursor-pointer"
                    type="button"
                  >
                    Collapse All Meta
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Open</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">High</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Low</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Close</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Volume</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Buy/Sell Shares</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Buy/Sell Price</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Shares Owned</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Cash</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Portfolio Value</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Meta</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {backtestResult.history.map((historyItem, index) => {
                    const bar = historyItem.bar;
                    const strategyResult = historyItem.strategyResult;
                    const portfolioSnapshot = historyItem.portfolioSnapshot;
                    return (
                      <>
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {new Date(bar.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                           {stockSymbol}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                            ${bar.open.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                            ${bar.high.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                            ${bar.low.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                            ${bar.close.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                            {bar.volume.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                            {strategyResult?.changeInShares !== undefined && strategyResult.changeInShares !== 0 ? (
                              <span className={strategyResult.changeInShares > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                {strategyResult.changeInShares > 0 ? '+' : ''}{strategyResult.changeInShares}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                            {strategyResult?.price !== undefined ? `$${strategyResult.price.toFixed(2)}` : '-'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium text-right">
                            {portfolioSnapshot.sharesOwned.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium text-right">
                            <span className="text-gray-900">${portfolioSnapshot.availableCash.toFixed(2)}</span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium text-right">
                           <span className="text-gray-900">${portfolioSnapshot.portfolioValue.toFixed(2)}</span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                            {strategyResult?.meta && Object.keys(strategyResult.meta).length > 0 ? (
                              <button
                                onClick={(e) => onToggleMetaExpansion(index, e)}
                                className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                                type="button"
                              >
                                {expandedMetaRows.has(index) ? '−' : '+'}
                              </button>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                        {expandedMetaRows.has(index) && strategyResult?.meta && (
                          <tr className="bg-blue-50">
                            <td colSpan={12} className="px-3 py-2">
                              <div className="bg-white rounded border p-3">
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Meta Data:</h5>
                                <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-2 rounded">
                                  {JSON.stringify(strategyResult.meta, null, 2)}
                                </pre>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {backtestError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L10 11.414l1.293-1.293a1 1 0 001.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Backtest Error</h3>
              <p className="text-sm text-red-700 mt-1">{backtestError}</p>
            </div>
            <button
              onClick={onClearError}
              className="ml-auto text-red-400 hover:text-red-600 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
