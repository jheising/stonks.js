// Default strategy code
export const DEFAULT_STRATEGY = `// Buy $1000 worth of shares on the first bar
if (data.stepIndex === 0) {
  const sharesToBuy: number = Math.floor(1000 / data.currentBar.open);
  result.changeInShares = sharesToBuy;
  result.price = data.currentBar.open;
} else {
  // Hold for the rest of the period
  result.changeInShares = 0;
}`
