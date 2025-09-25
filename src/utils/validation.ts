// Validate backtest parameters
export const validateParameters = (
  startDate: string,
  stockSymbol: string,
  startingAmount: string,
  endDate?: string
) => {
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

// Validate code syntax
export const validateCode = (code: string) => {
  try {
    // For TypeScript, we'll do a more basic validation since we can't easily
    // compile TS in the browser without additional setup

    // Check for basic syntax issues that would prevent JS execution
    // Remove TypeScript-specific syntax for validation
    const jsCode = code
      .replace(/:\s*\w+(\[\])?(\s*\|\s*\w+(\[\])?)*(?=\s*[=,;)])/g, '') // Remove type annotations
      .replace(/interface\s+\w+\s*{[^}]*}/g, '') // Remove interface declarations
      .replace(/type\s+\w+\s*=\s*[^;]+;/g, '') // Remove type aliases
      .replace(/export\s*{\s*[^}]*}/g, '') // Remove export statements
      .replace(/import\s*{[^}]*}\s*from\s*['"][^'"]*['"];?/g, '') // Remove import statements

    // Try to parse the cleaned JavaScript
    new Function(jsCode)
    return { isValid: true, error: null }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Syntax error'
    }
  }
}
