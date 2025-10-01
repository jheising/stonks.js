import type { StrategyHistory } from '../types/backtesting';

export interface PerformanceMetrics {
  // Risk-adjusted returns
  sharpeRatio: number;
  sortinoRatio: number;
  
  // Drawdown metrics
  maxDrawdown: number;
  maxDrawdownPercent: number;
  
  // Market comparison
  alpha: number;
  beta: number;
  
  // Trade analysis
  winRate: number;
  payoffRatio: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  
  // Additional metrics
  volatility: number;
  marketVolatility: number;
  correlation: number;
  informationRatio: number;
  calmarRatio: number;
}

/**
 * Calculate comprehensive performance metrics for a backtest result
 */
export function calculatePerformanceMetrics(
  history: StrategyHistory[],
  startingCash: number,
  riskFreeRate: number = 0.02 // 2% annual risk-free rate
): PerformanceMetrics {
  if (history.length < 2) {
    return getEmptyMetrics();
  }

  // Calculate daily returns for both strategy and market
  const strategyReturns = calculateDailyReturns(history, 'strategy');
  const marketReturns = calculateDailyReturns(history, 'market');
  
  // Calculate basic statistics
  const strategyVolatility = calculateVolatility(strategyReturns);
  const marketVolatility = calculateVolatility(marketReturns);
  const correlation = calculateCorrelation(strategyReturns, marketReturns);
  
  // Calculate risk-adjusted metrics
  const sharpeRatio = calculateSharpeRatio(strategyReturns, riskFreeRate, strategyVolatility);
  const sortinoRatio = calculateSortinoRatio(strategyReturns, riskFreeRate);
  
  // Calculate market comparison metrics
  const beta = calculateBeta(strategyReturns, marketReturns);
  const alpha = calculateAlpha(strategyReturns, marketReturns, beta, riskFreeRate);
  
  // Calculate drawdown metrics
  const { maxDrawdown, maxDrawdownPercent } = calculateMaxDrawdown(history, startingCash);
  
  // Calculate trade analysis metrics
  const tradeMetrics = calculateTradeMetrics(history);
  
  // Calculate additional metrics
  const informationRatio = calculateInformationRatio(strategyReturns, marketReturns);
  const calmarRatio = calculateCalmarRatio(strategyReturns, maxDrawdownPercent);

  return {
    sharpeRatio,
    sortinoRatio,
    maxDrawdown,
    maxDrawdownPercent,
    alpha,
    beta,
    ...tradeMetrics,
    volatility: strategyVolatility,
    marketVolatility,
    correlation,
    informationRatio,
    calmarRatio
  };
}

/**
 * Calculate daily returns for strategy or market
 */
function calculateDailyReturns(
  history: StrategyHistory[],
  type: 'strategy' | 'market'
): number[] {
  const returns: number[] = [];
  
  for (let i = 1; i < history.length; i++) {
    const current = history[i];
    const previous = history[i - 1];
    
    let dailyReturn: number;
    
    if (type === 'strategy') {
      const currentValue = current.portfolioSnapshot.portfolioValue;
      const previousValue = previous.portfolioSnapshot.portfolioValue;
      dailyReturn = (currentValue - previousValue) / previousValue;
    } else {
      // Market return
      const currentPrice = current.bar.close;
      const previousPrice = previous.bar.close;
      dailyReturn = (currentPrice - previousPrice) / previousPrice;
    }
    
    returns.push(dailyReturn);
  }
  
  return returns;
}

/**
 * Calculate annualized volatility (standard deviation of returns)
 */
function calculateVolatility(returns: number[]): number {
  if (returns.length === 0) return 0;
  
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const dailyVolatility = Math.sqrt(variance);
  
  // Annualize assuming 252 trading days per year
  return dailyVolatility * Math.sqrt(252);
}

/**
 * Calculate Sharpe Ratio (risk-adjusted return)
 */
function calculateSharpeRatio(returns: number[], riskFreeRate: number, volatility: number): number {
  if (returns.length === 0 || volatility === 0) return 0;
  
  const averageReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const annualizedReturn = averageReturn * 252; // Annualize
  
  const excessReturn = annualizedReturn - riskFreeRate;
  return excessReturn / volatility;
}

/**
 * Calculate Sortino Ratio (like Sharpe but only considers downside volatility)
 */
function calculateSortinoRatio(returns: number[], riskFreeRate: number): number {
  if (returns.length === 0) return 0;
  
  const averageReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const annualizedReturn = averageReturn * 252;
  
  // Calculate downside deviation (only negative returns)
  const negativeReturns = returns.filter(r => r < 0);
  if (negativeReturns.length === 0) return Infinity; // No downside risk
  
  const downsideVariance = negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / returns.length;
  const downsideVolatility = Math.sqrt(downsideVariance) * Math.sqrt(252);
  
  if (downsideVolatility === 0) return Infinity;
  
  const excessReturn = annualizedReturn - riskFreeRate;
  return excessReturn / downsideVolatility;
}

/**
 * Calculate Beta (correlation with market)
 */
function calculateBeta(strategyReturns: number[], marketReturns: number[]): number {
  if (strategyReturns.length !== marketReturns.length || strategyReturns.length === 0) return 0;
  
  const strategyMean = strategyReturns.reduce((sum, r) => sum + r, 0) / strategyReturns.length;
  const marketMean = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length;
  
  let covariance = 0;
  let marketVariance = 0;
  
  for (let i = 0; i < strategyReturns.length; i++) {
    const strategyDiff = strategyReturns[i] - strategyMean;
    const marketDiff = marketReturns[i] - marketMean;
    
    covariance += strategyDiff * marketDiff;
    marketVariance += marketDiff * marketDiff;
  }
  
  covariance /= strategyReturns.length;
  marketVariance /= marketReturns.length;
  
  return marketVariance === 0 ? 0 : covariance / marketVariance;
}

/**
 * Calculate Alpha (excess return compared to market)
 */
function calculateAlpha(
  strategyReturns: number[],
  marketReturns: number[],
  beta: number,
  riskFreeRate: number
): number {
  if (strategyReturns.length === 0 || marketReturns.length === 0) return 0;
  
  const strategyReturn = strategyReturns.reduce((sum, r) => sum + r, 0) / strategyReturns.length * 252;
  const marketReturn = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length * 252;
  
  // Alpha = Strategy Return - (Risk Free Rate + Beta * (Market Return - Risk Free Rate))
  return strategyReturn - (riskFreeRate + beta * (marketReturn - riskFreeRate));
}

/**
 * Calculate correlation between strategy and market returns
 */
function calculateCorrelation(strategyReturns: number[], marketReturns: number[]): number {
  if (strategyReturns.length !== marketReturns.length || strategyReturns.length === 0) return 0;
  
  const strategyMean = strategyReturns.reduce((sum, r) => sum + r, 0) / strategyReturns.length;
  const marketMean = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length;
  
  let covariance = 0;
  let strategyVariance = 0;
  let marketVariance = 0;
  
  for (let i = 0; i < strategyReturns.length; i++) {
    const strategyDiff = strategyReturns[i] - strategyMean;
    const marketDiff = marketReturns[i] - marketMean;
    
    covariance += strategyDiff * marketDiff;
    strategyVariance += strategyDiff * strategyDiff;
    marketVariance += marketDiff * marketDiff;
  }
  
  const denominator = Math.sqrt(strategyVariance * marketVariance);
  return denominator === 0 ? 0 : covariance / denominator;
}

/**
 * Calculate maximum drawdown
 */
function calculateMaxDrawdown(history: StrategyHistory[], startingCash: number): {
  maxDrawdown: number;
  maxDrawdownPercent: number;
} {
  if (history.length === 0) return { maxDrawdown: 0, maxDrawdownPercent: 0 };
  
  let peak = startingCash;
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;
  
  for (const item of history) {
    const currentValue = item.portfolioSnapshot.portfolioValue;
    
    if (currentValue > peak) {
      peak = currentValue;
    }
    
    const drawdown = peak - currentValue;
    const drawdownPercent = drawdown / peak;
    
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
      maxDrawdownPercent = drawdownPercent;
    }
  }
  
  return { maxDrawdown, maxDrawdownPercent };
}

/**
 * Calculate trade-related metrics
 */
function calculateTradeMetrics(history: StrategyHistory[]): {
  winRate: number;
  payoffRatio: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
} {
  const trades: number[] = [];
  let isInTrade = false;
  let totalBuyCost = 0;
  let totalSellValue = 0;
  let sharesInTrade = 0;

  for (let i = 0; i < history.length; i++) {
    const item = history[i];
    const prevSharesOwned = i > 0 ? history[i - 1].portfolioSnapshot.sharesOwned : 0;
    const currentSharesOwned = item.portfolioSnapshot.sharesOwned;
    const result = item.strategyResult;

    const sharesChanged = result.changeInShares || 0;
    
    // Start of a new trade
    if (!isInTrade && sharesChanged > 0) {
      isInTrade = true;
      totalBuyCost = 0;
      totalSellValue = 0;
      sharesInTrade = 0;
    }

    if (isInTrade) {
      const price = result.price || item.bar.close;
      if (sharesChanged > 0) { // Buy
        totalBuyCost += sharesChanged * price;
        sharesInTrade += sharesChanged;
      } else if (sharesChanged < 0) { // Sell
        totalSellValue += Math.abs(sharesChanged) * price;
      }

      // End of the trade (all shares that were part of this trade cycle are sold)
      if (currentSharesOwned === 0 && prevSharesOwned > 0) {
        if (totalBuyCost > 0) {
            const profit = totalSellValue - totalBuyCost;
            const tradeReturn = profit / totalBuyCost;
            trades.push(tradeReturn);
        }
        
        // Reset for next trade
        isInTrade = false;
      }
    }
  }
  
  if (trades.length === 0) {
    return {
      winRate: 0,
      payoffRatio: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      averageWin: 0,
      averageLoss: 0
    };
  }
  
  const winningTrades = trades.filter(t => t > 0);
  const losingTrades = trades.filter(t => t < 0);
  
  const averageWin = winningTrades.length > 0 
    ? winningTrades.reduce((sum, t) => sum + t, 0) / winningTrades.length 
    : 0;
  
  const averageLoss = losingTrades.length > 0 
    ? Math.abs(losingTrades.reduce((sum, t) => sum + t, 0) / losingTrades.length)
    : 0;
  
  const winRate = winningTrades.length / trades.length;
  const payoffRatio = averageLoss === 0 ? Infinity : averageWin / averageLoss;
  
  return {
    winRate,
    payoffRatio,
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    averageWin,
    averageLoss
  };
}

/**
 * Calculate Information Ratio (excess return per unit of tracking error)
 */
function calculateInformationRatio(strategyReturns: number[], marketReturns: number[]): number {
  if (strategyReturns.length !== marketReturns.length || strategyReturns.length === 0) return 0;
  
  const excessReturns = strategyReturns.map((sr, i) => sr - marketReturns[i]);
  const averageExcessReturn = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length;
  
  if (excessReturns.length === 0) return 0;
  
  const trackingError = calculateVolatility(excessReturns);
  
  return trackingError === 0 ? 0 : (averageExcessReturn * 252) / trackingError;
}

/**
 * Calculate Calmar Ratio (annualized return / max drawdown)
 */
function calculateCalmarRatio(returns: number[], maxDrawdownPercent: number): number {
  if (returns.length === 0 || maxDrawdownPercent === 0) return 0;
  
  const averageReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const annualizedReturn = averageReturn * 252;
  
  return annualizedReturn / maxDrawdownPercent;
}

/**
 * Return empty metrics for edge cases
 */
function getEmptyMetrics(): PerformanceMetrics {
  return {
    sharpeRatio: 0,
    sortinoRatio: 0,
    maxDrawdown: 0,
    maxDrawdownPercent: 0,
    alpha: 0,
    beta: 0,
    winRate: 0,
    payoffRatio: 0,
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    averageWin: 0,
    averageLoss: 0,
    volatility: 0,
    marketVolatility: 0,
    correlation: 0,
    informationRatio: 0,
    calmarRatio: 0
  };
}
