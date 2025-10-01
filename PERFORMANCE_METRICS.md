# Performance Metrics Guide

This document explains the advanced performance metrics now available in your backtesting system.

## Risk-Adjusted Returns

### Sharpe Ratio
- **What it measures**: Risk-adjusted returns (excess return per unit of volatility)
- **Formula**: (Strategy Return - Risk-Free Rate) / Strategy Volatility
- **Good values**: > 1.0 is good, > 2.0 is excellent
- **Interpretation**: Higher is better. Measures how much excess return you get for the extra volatility.

### Sortino Ratio
- **What it measures**: Like Sharpe Ratio but only considers downside volatility
- **Formula**: (Strategy Return - Risk-Free Rate) / Downside Volatility
- **Good values**: > 1.0 is good, > 2.0 is excellent
- **Interpretation**: Higher is better. More forgiving than Sharpe as it ignores upside volatility.

### Information Ratio
- **What it measures**: Excess return per unit of tracking error vs benchmark
- **Formula**: (Strategy Return - Market Return) / Tracking Error
- **Good values**: > 0.5 is good, > 1.0 is excellent
- **Interpretation**: Measures active management skill.

### Calmar Ratio
- **What it measures**: Annualized return divided by maximum drawdown
- **Formula**: Annualized Return / Maximum Drawdown
- **Good values**: > 1.0 is good, > 2.0 is excellent
- **Interpretation**: Higher is better. Rewards strategies with high returns and low drawdowns.

## Market Comparison

### Alpha
- **What it measures**: Excess return compared to what the market would predict
- **Formula**: Strategy Return - (Risk-Free Rate + Beta × (Market Return - Risk-Free Rate))
- **Good values**: Positive values indicate outperformance
- **Interpretation**: The "skill" component of returns after adjusting for market risk.

### Beta
- **What it measures**: Sensitivity to market movements
- **Formula**: Covariance(Strategy, Market) / Variance(Market)
- **Typical values**: 
  - β = 1: Moves with market
  - β > 1: More volatile than market
  - β < 1: Less volatile than market
- **Interpretation**: Risk measure relative to the overall market.

### Correlation
- **What it measures**: How closely strategy returns follow market returns
- **Range**: -1 to +1
- **Interpretation**: 
  - +1: Perfect positive correlation
  - 0: No correlation
  - -1: Perfect negative correlation
  - Lower correlation can indicate better diversification.

### Volatility
- **What it measures**: Annualized standard deviation of returns
- **Interpretation**: Higher values indicate more price swings. Compare strategy volatility to market volatility.

## Risk Metrics

### Maximum Drawdown
- **What it measures**: Largest peak-to-trough decline in portfolio value
- **Interpretation**: Shows the worst-case scenario loss. Lower is better.
- **Use**: Helps assess risk tolerance and position sizing.

## Trade Analysis

### Win Rate
- **What it measures**: Percentage of profitable trades
- **Formula**: Winning Trades / Total Trades
- **Good values**: > 50% is generally good, but depends on payoff ratio
- **Interpretation**: Higher isn't always better if average losses are much larger than average wins.

### Payoff Ratio
- **What it measures**: Average win divided by average loss
- **Formula**: Average Win / Average Loss
- **Good values**: > 1.0 means average wins are larger than average losses
- **Interpretation**: A strategy can be profitable with low win rate if payoff ratio is high enough.

### Average Win/Loss
- **What it measures**: Average percentage return per winning/losing trade
- **Interpretation**: Helps understand the risk/reward profile of individual trades.

## How to Use These Metrics

1. **Risk-Adjusted Returns**: Focus on Sharpe and Sortino ratios to understand if your returns justify the risk taken.

2. **Market Comparison**: Use Alpha and Beta to understand how your strategy performs relative to simply buying and holding the market.

3. **Risk Management**: Maximum drawdown helps you understand the worst-case scenario and size positions appropriately.

4. **Trade Quality**: Win rate and payoff ratio help you understand if your strategy has an edge and how to optimize entry/exit rules.

## Benchmark Comparisons

Compare your strategy against:
- **Buy and Hold**: Simple market exposure
- **Risk-Free Rate**: Currently set to 2% annually
- **Market Volatility**: How much risk you're taking vs the market

## Tips for Improvement

- **High Sharpe/Sortino**: Good risk-adjusted returns
- **Positive Alpha**: You're adding value beyond market exposure  
- **Low Correlation**: Good diversification benefits
- **Controlled Drawdown**: Sustainable risk levels
- **Balanced Win Rate & Payoff**: Consistent edge in the market
