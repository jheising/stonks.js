// Default strategy code
export const DEFAULT_STRATEGY = `// Buy $1000 worth of shares on the first day

// We're telling the backtester to use the next bar's open price to buy or sell at. This is the default behavior if not specified.
result.price = data.nextBar.open;

if (data.dayNumber === 0) {
  const sharesToBuy = Math.floor(1000 / result.price);
  result.changeInShares = sharesToBuy;
} else {
  // Hold for the rest of the period
  result.changeInShares = 0;
}`
