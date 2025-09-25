// Default strategy code
export const DEFAULT_STRATEGY = `// Buy $1000 worth of shares on the first bar
if (data.stepIndex === 0) {
  const sharesToBuy: number = Math.floor(1000 / data.currentBar.open);
  return {
    changeInShares: sharesToBuy,
    price: data.currentBar.open
  } as StrategyFunctionResult;
}

// Hold for the rest of the period
return {
  changeInShares: 0
} as StrategyFunctionResult;`
