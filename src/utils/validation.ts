import type { BacktestSettings } from '../types/backtesting'

// Validate backtest parameters
export const validateParameters = (settings: BacktestSettings) => {
  const { startDate, stockSymbol, startingAmount, endDate } = settings
  if (!startDate) {
    return { isValid: false, error: 'Start date is required' }
  }

  if (!stockSymbol) {
    return { isValid: false, error: 'Stock symbol is required' }
  }

  // Validate stock symbol format (basic validation)
  const symbolPattern = /^[A-Z]{1,5}$/
  if (!symbolPattern.test(stockSymbol.toUpperCase())) {
    return { isValid: false, error: 'Stock symbol must be 1-5 letters (e.g., AAPL, TSLA)' }
  }

  if (!startingAmount || parseFloat(startingAmount) <= 0) {
    return { isValid: false, error: 'Starting investment amount must be greater than $0' }
  }

  const amount = parseFloat(startingAmount)
  if (isNaN(amount)) {
    return { isValid: false, error: 'Starting investment amount must be a valid number' }
  }

  if (amount > 1000000) {
    return { isValid: false, error: 'Starting investment amount cannot exceed $1,000,000' }
  }

  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()
  const today = new Date()

  if (start > today) {
    return { isValid: false, error: 'Start date cannot be in the future' }
  }

  if (endDate && end > today) {
    return { isValid: false, error: 'End date cannot be in the future' }
  }

  if (endDate && start > end) {
    return { isValid: false, error: 'Start date must be before end date' }
  }

  return { isValid: true, error: null }
}
