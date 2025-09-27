import { useState, useRef } from 'react'
import { backtest } from './utils/backtester'
import { parseStrategyError, createEnhancedStrategyWrapper, type ParsedError } from './utils/errorParser'
import type { StrategyFunctionData, StrategyFunctionResult, BacktestResult } from './types/backtesting'

// Components
import { BacktestParameters, CodeEditor, ResultsDisplay, VersionModal } from './components'

// Hooks and utilities
import { useLocalStorage } from './hooks/useLocalStorage'
import { saveCodeVersion } from './utils/codeVersions'
import { validateParameters, validateCode } from './utils/validation'

// Constants
import { STORAGE_KEYS } from './constants/storage'
import { DEFAULT_STRATEGY } from './constants/defaultStrategy'

// Types
import type { CodeVersion } from './types'
import type { StockDataProviderBase } from './providers/StockDataProviderBase'
import { AvailableProviders } from './providers/AvailableProviders'
import { CollapseableBox } from './components/CollapseableBox'

function App() {
  const [code, setCode, { lastSaved: codeSaved }] = useLocalStorage(STORAGE_KEYS.STRATEGY_CODE, DEFAULT_STRATEGY)
  const dataProvider = useRef<StockDataProviderBase>(new AvailableProviders[0]());
  const [dataProviderSettings, setDataProviderSettings] = useLocalStorage(`${STORAGE_KEYS.DATA_PROVIDER_SETTINGS}:${dataProvider.current.constructor.name}`, {});

  // Backtest parameters
  const [startDate, setStartDate] = useLocalStorage(STORAGE_KEYS.START_DATE, '')
  const [endDate, setEndDate] = useLocalStorage(STORAGE_KEYS.END_DATE, '')
  const [stockSymbol, setStockSymbol] = useLocalStorage(STORAGE_KEYS.STOCK_SYMBOL, '')
  const [startingAmount, setStartingAmount] = useLocalStorage(STORAGE_KEYS.STARTING_AMOUNT, '10000')

  // Loading and error states
  const [isRunning, setIsRunning] = useState(false)
  const [backtestError, setBacktestError] = useState<string | null>(null)
  const [parsedError, setParsedError] = useState<ParsedError | null>(null)
  const [backtestSuccess, setBacktestSuccess] = useState<string | null>(null)
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null)
  const [expandedMetaRows, setExpandedMetaRows] = useState<Set<number>>(new Set())
  const [showVersionModal, setShowVersionModal] = useState(false)
  const [showInstructions, setShowInstructions] = useLocalStorage(STORAGE_KEYS.SHOW_INSTRUCTIONS, true)

  // Clear messages when form inputs change
  const clearMessages = () => {
    if (backtestError || backtestSuccess || backtestResult || parsedError) {
      setBacktestError(null)
      setParsedError(null)
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
    setParsedError(null)
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

          // Use enhanced wrapper for better error tracking
          const wrappedCode = createEnhancedStrategyWrapper(executableCode)

          return new Function('data', wrappedCode)
        } catch (error) {
          const parsed = parseStrategyError(error as Error, code)
          setParsedError(parsed)
          throw new Error(`Strategy code error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      const strategy = createStrategy()

      // Run the backtest
      const result = await backtest({
        dataProvider: dataProvider.current,
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

      // Parse the error for enhanced display
      if (error instanceof Error) {
        const parsed = parseStrategyError(error, code)
        setParsedError(parsed)
      }

      setBacktestError(errorMessage)
      console.error('Backtest error:', error)
    } finally {
      setIsRunning(false)
    }
  }

  // Get the most recent save time
  const getLastSaveTime = () => {
    const times = [codeSaved].filter(Boolean) as Date[]
    return times.length > 0 ? new Date(Math.max(...times.map(t => t.getTime()))) : null
  }

  const { isValid: isDataProviderConfigured } = dataProvider.current.isConfigured;
  const { isValid: isCodeValid } = validateCode(code)
  const { isValid: areParametersValid, error: parameterError } = validateParameters(
    startDate,
    stockSymbol,
    startingAmount,
    endDate
  )

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">
            Stock Backtesting Tool
          </h1>
        </div> */}

        <div className="space-y-6">
          {/* API Configuration Section */}
          <CollapseableBox title="Data Provider Configuration" saveState={true} saveStateKey={"API_CONFIGURATION_BOX"} forceOpen={!dataProvider.current.isConfigured.isValid}>
            {dataProvider.current.renderSettings(dataProviderSettings, setDataProviderSettings)}
          </CollapseableBox>

          {/* Backtest Parameters Section */}
          <CollapseableBox title="Backtest Parameters" saveState={true} saveStateKey={"BACKTEST_PARAMETERS_BOX"}>
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
          </CollapseableBox>

          {/* Code Editor Section */}
          <CollapseableBox title="Strategy Code" saveState={true} saveStateKey={"CODE_EDITOR_BOX"} forceOpen={!isCodeValid}>
            <CodeEditor
              code={code}
              onCodeChange={handleEditorChange}
              showInstructions={showInstructions}
              onToggleInstructions={() => setShowInstructions(!showInstructions)}
              onShowVersionModal={() => setShowVersionModal(true)}
              codeSaved={codeSaved}
              isCodeValid={isCodeValid}
              errorInfo={parsedError}
            />
          </CollapseableBox>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={!isCodeValid || !areParametersValid || !isDataProviderConfigured || isRunning}
              className="px-8 py-3 bg-teal-400 text-tuna-900 uppercase font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:bg-tuna-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 cursor-pointer"
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
          <CollapseableBox title="Results" saveState={true} saveStateKey={"RESULTS_DISPLAY_BOX"}>
            <ResultsDisplay
              backtestResult={backtestResult}
              backtestSuccess={backtestSuccess}
              backtestError={backtestError}
              parsedError={parsedError}
              stockSymbol={stockSymbol}
              expandedMetaRows={expandedMetaRows}
              onToggleMetaExpansion={toggleMetaExpansion}
              onExpandAllMeta={expandAllMeta}
              onCollapseAllMeta={collapseAllMeta}
              onClearSuccess={() => {
                setBacktestSuccess(null)
                setBacktestResult(null)
              }}
              onClearError={() => {
                setBacktestError(null)
                setParsedError(null)
              }}
              onClearResult={() => setBacktestResult(null)}
            />
          </CollapseableBox>
        </div>

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
