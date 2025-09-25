import { useState, useEffect } from 'react'
import { backtest, type StrategyFunctionData, type StrategyFunctionResult, type BacktestResult } from './utils/backtester'

// Components
import { ApiConfiguration, BacktestParameters, CodeEditor, ResultsDisplay, VersionModal } from './components'

// Hooks and utilities
import { useLocalStorage } from './hooks/useLocalStorage'
import { saveCodeVersion } from './utils/codeVersions'
import { validateParameters, validateCode } from './utils/validation'
import { formatSaveTime } from './utils/dateFormat'

// Constants
import { STORAGE_KEYS } from './constants/storage'
import { DEFAULT_STRATEGY } from './constants/defaultStrategy'

// Types
import type { CodeVersion } from './types'

function App() {
  const [apiKey, setApiKey, { lastSaved: apiKeySaved }] = useLocalStorage(STORAGE_KEYS.API_KEY, '')
  const [apiSecret, setApiSecret, { lastSaved: apiSecretSaved }] = useLocalStorage(STORAGE_KEYS.API_SECRET, '')
  const [code, setCode, { lastSaved: codeSaved }] = useLocalStorage(STORAGE_KEYS.STRATEGY_CODE, DEFAULT_STRATEGY)

  // Backtest parameters
  const [startDate, setStartDate] = useLocalStorage(STORAGE_KEYS.START_DATE, '')
  const [endDate, setEndDate] = useLocalStorage(STORAGE_KEYS.END_DATE, '')
  const [stockSymbol, setStockSymbol] = useLocalStorage(STORAGE_KEYS.STOCK_SYMBOL, '')
  const [startingAmount, setStartingAmount] = useLocalStorage(STORAGE_KEYS.STARTING_AMOUNT, '10000')

  // Loading and error states
  const [isRunning, setIsRunning] = useState(false)
  const [backtestError, setBacktestError] = useState<string | null>(null)
  const [backtestSuccess, setBacktestSuccess] = useState<string | null>(null)
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null)
  const [expandedMetaRows, setExpandedMetaRows] = useState<Set<number>>(new Set())
  const [showVersionModal, setShowVersionModal] = useState(false)
  const [showInstructions, setShowInstructions] = useLocalStorage(STORAGE_KEYS.SHOW_INSTRUCTIONS, true)

  // Collapsible API section - default to expanded if credentials are missing
  const [isApiSectionCollapsed, setIsApiSectionCollapsed] = useState(() => {
    return !!(apiKey && apiSecret) // Collapsed if both credentials exist
  })

  // Auto-expand when credentials are cleared
  useEffect(() => {
    if (!apiKey && !apiSecret && isApiSectionCollapsed) {
      setIsApiSectionCollapsed(false)
    }
  }, [apiKey, apiSecret, isApiSectionCollapsed])

  // Clear messages when form inputs change
  const clearMessages = () => {
    if (backtestError || backtestSuccess || backtestResult) {
      setBacktestError(null)
      setBacktestSuccess(null)
      setBacktestResult(null)
      setExpandedMetaRows(new Set())
    }
  }

  // Toggle meta data expansion for a specific row
  const toggleMetaExpansion = (rowIndex: number, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    const newExpanded = new Set(expandedMetaRows)
    if (newExpanded.has(rowIndex)) {
      newExpanded.delete(rowIndex)
    } else {
      newExpanded.add(rowIndex)
    }
    setExpandedMetaRows(newExpanded)
  }

  // Expand all meta fields that have data
  const expandAllMeta = () => {
    if (!backtestResult) return
    
    const rowsWithMeta = new Set<number>()
    backtestResult.history.forEach((historyItem, index) => {
      if (historyItem.strategyResult?.meta && Object.keys(historyItem.strategyResult.meta).length > 0) {
        rowsWithMeta.add(index)
      }
    })
    setExpandedMetaRows(rowsWithMeta)
  }

  // Collapse all meta fields
  const collapseAllMeta = () => {
    setExpandedMetaRows(new Set())
  }

  // Load a specific code version
  const loadCodeVersion = (version: CodeVersion) => {
    setCode(version.code)
    setShowVersionModal(false)
  }

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '')
    clearMessages()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear any previous messages
    setBacktestError(null)
    setBacktestSuccess(null)
    setBacktestResult(null)

    // Validate required fields
    if (!startDate) {
      setBacktestError('Start date is required for backtesting')
      return
    }

    if (!stockSymbol) {
      setBacktestError('Stock symbol is required for backtesting')
      return
    }

    if (!startingAmount || parseFloat(startingAmount) <= 0) {
      setBacktestError('Starting investment amount must be greater than $0')
      return
    }

    if (!apiKey || !apiSecret) {
      setBacktestError('API credentials are required for backtesting')
      return
    }

    setIsRunning(true)

    try {
      const actualEndDate = endDate || new Date().toISOString();

      console.log('Starting Backtest:', {
        symbol: stockSymbol.toUpperCase(),
        startDate,
        endDate: actualEndDate,
        startingAmount: `$${parseFloat(startingAmount).toLocaleString()}`,
        codeLength: code.length
      })

      // Create strategy function from user code
      const createStrategy = () => {
        try {
          // Convert TypeScript-like code to executable JavaScript
          let executableCode = code

          // Remove TypeScript-specific syntax for basic execution
          executableCode = executableCode
            .replace(/: (Bar|StrategyFunctionData|StrategyFunctionResult|PortfolioData)\b/g, '')
            .replace(/interface\s+\w+\s*\{[^}]*\}/g, '')
            .replace(/export\s+/g, '')
            .replace(/import\s+.*?from\s+['"][^'"]*['"];?\s*/g, '')

          // Wrap the code in an async function that returns the result
          const wrappedCode = `
            return (async function(data) {
             const result = {
              meta: {}
             };
              ${executableCode}
              return result;
            })(data);
          `

          return new Function('data', wrappedCode)
        } catch (error) {
          throw new Error(`Strategy code error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      const strategy = createStrategy()

      // Run the backtest
      const result = await backtest({
        apiKey,
        apiSecret,
        symbol: stockSymbol.toUpperCase(),
        startDate,
        endDate: actualEndDate,
        startingAmount: parseFloat(startingAmount),
        strategy: strategy as (data: StrategyFunctionData) => Promise<StrategyFunctionResult>
      })

      setBacktestResult(result)
      setBacktestSuccess(`Backtest completed successfully for ${stockSymbol.toUpperCase()} from ${startDate} to ${actualEndDate.split('T')[0]}.`)

      // Save code version only after successful backtest
      saveCodeVersion(code)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      setBacktestError(errorMessage)
      console.error('Backtest error:', error)
    } finally {
      setIsRunning(false)
    }
  }

  // Get the most recent save time
  const getLastSaveTime = () => {
    const times = [apiKeySaved, apiSecretSaved, codeSaved].filter(Boolean) as Date[]
    return times.length > 0 ? new Date(Math.max(...times.map(t => t.getTime()))) : null
  }

  const { isValid: isCodeValid } = validateCode(code)
  const { isValid: areParametersValid, error: parameterError } = validateParameters(
    startDate,
    stockSymbol,
    startingAmount,
    endDate
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Stock Backtesting Tool
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Auto-saved {formatSaveTime(getLastSaveTime())}</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* API Configuration Section */}
          <ApiConfiguration
            apiKey={apiKey}
            apiSecret={apiSecret}
            onApiKeyChange={setApiKey}
            onApiSecretChange={setApiSecret}
            isCollapsed={isApiSectionCollapsed}
            onToggleCollapsed={() => setIsApiSectionCollapsed(!isApiSectionCollapsed)}
          />

          {/* Backtest Parameters Section */}
          <BacktestParameters
            stockSymbol={stockSymbol}
            startingAmount={startingAmount}
            startDate={startDate}
            endDate={endDate}
            onStockSymbolChange={setStockSymbol}
            onStartingAmountChange={setStartingAmount}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onClearMessages={clearMessages}
            parameterError={parameterError}
          />

          {/* Code Editor Section */}
          <CodeEditor
            code={code}
            onCodeChange={handleEditorChange}
            showInstructions={showInstructions}
            onToggleInstructions={() => setShowInstructions(!showInstructions)}
            onShowVersionModal={() => setShowVersionModal(true)}
            codeSaved={codeSaved}
            isCodeValid={isCodeValid}
          />

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={!isCodeValid || !areParametersValid || isRunning}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 cursor-pointer"
            >
              {isRunning && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{isRunning ? 'Running Backtest...' : 'Run Backtest'}</span>
            </button>
          </div>

          {/* Results Display */}
          <ResultsDisplay
            backtestResult={backtestResult}
            backtestSuccess={backtestSuccess}
            backtestError={backtestError}
            stockSymbol={stockSymbol}
            expandedMetaRows={expandedMetaRows}
            onToggleMetaExpansion={toggleMetaExpansion}
            onExpandAllMeta={expandAllMeta}
            onCollapseAllMeta={collapseAllMeta}
            onClearSuccess={() => {
              setBacktestSuccess(null)
              setBacktestResult(null)
            }}
            onClearError={() => setBacktestError(null)}
            onClearResult={() => setBacktestResult(null)}
          />
        </form>

        {/* Version Modal */}
        <VersionModal
          show={showVersionModal}
          onClose={() => setShowVersionModal(false)}
          onLoadVersion={loadCodeVersion}
        />
      </div>
    </div>
  )
}

export default App
