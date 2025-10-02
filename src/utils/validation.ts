import type { BacktestSettings } from "../types/backtesting";

// Validate backtest parameters
export const validateParameters = (settings: BacktestSettings) => {
    const { startDate, stockSymbol, startingAmount, endDate } = settings;
    if (!startDate) {
        return { isValid: false, error: "Start date is required" };
    }

    if (!stockSymbol) {
        return { isValid: false, error: "Symbol is required" };
    }

    // Validate stock/crypto symbol format (basic validation)
    // Supports traditional stock symbols (AAPL, TSLA) and crypto pairs (ETH/USD, BTC/USDT)
    const symbolPattern = /^[A-Z]{1,10}(\/[A-Z]{3,10})?$/;
    if (!symbolPattern.test(stockSymbol.toUpperCase())) {
        return { isValid: false, error: "Symbol must be 1-10 letters (e.g., AAPL, TSLA) or a crypto pair (e.g., ETH/USD, BTC/USDT)" };
    }

    if (!startingAmount || parseFloat(startingAmount) <= 0) {
        return { isValid: false, error: "Starting investment amount must be greater than $0" };
    }

    const amount = parseFloat(startingAmount);
    if (isNaN(amount)) {
        return { isValid: false, error: "Starting investment amount must be a valid number" };
    }

    if (amount > 1000000) {
        return { isValid: false, error: "Starting investment amount cannot exceed $1,000,000" };
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const today = new Date();

    if (start > today) {
        return { isValid: false, error: "Start date cannot be in the future" };
    }

    if (endDate && end > today) {
        return { isValid: false, error: "End date cannot be in the future" };
    }

    if (endDate && start > end) {
        return { isValid: false, error: "Start date must be before end date" };
    }

    return { isValid: true, error: null };
};
