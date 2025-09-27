import currency from 'currency.js';
import type { BacktestResult } from '../types/backtesting'

// Generate and download CSV of backtest results
export const downloadCSV = (backtestResult: BacktestResult, stockSymbol: string) => {
  if (!backtestResult) return
  
  // CSV headers
  const headers = [
    'Date',
    'Symbol', 
    'Open',
    'High',
    'Low',
    'Close',
    'Volume',
    'Shares_Change',
    'Trade_Price',
    'Shares_Owned',
    'Cash',
    'Portfolio_Value',
    'Meta_Data'
  ]
  
  // Convert data to CSV rows
  const csvRows = [
    headers.join(','), // Header row
    ...backtestResult.history.map((historyItem) => {
      const bar = historyItem.bar
      const strategyResult = historyItem.strategyResult
      const portfolioSnapshot = historyItem.portfolioSnapshot
      
      return [
        new Date(bar.timestamp).toLocaleDateString(),
        stockSymbol,
        currency(bar.open).format({ pattern: '!#', separator: '', decimal: '.', precision: 2 }),
        currency(bar.high).format({ pattern: '!#', separator: '', decimal: '.', precision: 2 }),
        currency(bar.low).format({ pattern: '!#', separator: '', decimal: '.', precision: 2 }),
        currency(bar.close).format({ pattern: '!#', separator: '', decimal: '.', precision: 2 }),
        bar.volume,
        strategyResult?.changeInShares || 0,
        strategyResult?.price ? currency(strategyResult.price).format({ pattern: '!#', separator: '', decimal: '.', precision: 2 }) : '',
        portfolioSnapshot.sharesOwned,
        currency(portfolioSnapshot.availableCash).format({ pattern: '!#', separator: '', decimal: '.', precision: 2 }),
        currency(portfolioSnapshot.portfolioValue).format({ pattern: '!#', separator: '', decimal: '.', precision: 2 }),
        strategyResult?.meta ? JSON.stringify(strategyResult.meta).replace(/"/g, '""') : ''
      ].join(',')
    })
  ]
  
  // Create CSV content
  const csvContent = csvRows.join('\n')
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `backtest-${stockSymbol}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
