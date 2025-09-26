import React from 'react'

interface BacktestParametersProps {
  stockSymbol: string
  startingAmount: string
  startDate: string
  endDate: string
  onStockSymbolChange: (value: string) => void
  onStartingAmountChange: (value: string) => void
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onClearMessages: () => void
  parameterError?: string | null
}

export const BacktestParameters: React.FC<BacktestParametersProps> = ({
  stockSymbol,
  startingAmount,
  startDate,
  endDate,
  onStockSymbolChange,
  onStartingAmountChange,
  onStartDateChange,
  onEndDateChange,
  onClearMessages,
  parameterError
}) => {
  const isReady = stockSymbol && startDate && startingAmount && parseFloat(startingAmount) > 0

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs text-gray-500">
          {isReady && (
            <span className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Ready to backtest</span>
            </span>
          )}
          {!isReady && (
            <span className="flex items-center space-x-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Missing parameters</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Stock Symbol */}
        <div>
          <label htmlFor="stockSymbol" className="block text-sm font-medium text-gray-700 mb-2">
            Stock Symbol <span className="text-red-500">*</span>
            {stockSymbol && <span className="text-green-600 text-xs ml-2">✓ Saved</span>}
          </label>
          <input
            type="text"
            id="stockSymbol"
            value={stockSymbol}
            onChange={(e) => {
              onStockSymbolChange(e.target.value.toUpperCase())
              onClearMessages()
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., AAPL"
            maxLength={5}
            pattern="[A-Z]{1,5}"
            required
          />
        </div>

        {/* Starting Amount */}
        <div>
          <label htmlFor="startingAmount" className="block text-sm font-medium text-gray-700 mb-2">
            Starting Amount <span className="text-red-500">*</span>
            {startingAmount && parseFloat(startingAmount) > 0 && <span className="text-green-600 text-xs ml-2">✓ Saved</span>}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="startingAmount"
              value={startingAmount}
              onChange={(e) => {
                onStartingAmountChange(e.target.value)
                onClearMessages()
              }}
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="10000"
              min="0.01"
              max="1000000"
              step="0.01"
              required
            />
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
            Start Date <span className="text-red-500">*</span>
            {startDate && <span className="text-green-600 text-xs ml-2">✓ Saved</span>}
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => {
              onStartDateChange(e.target.value)
              onClearMessages()
            }}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
            End Date <span className="text-gray-400 text-xs">(optional)</span>
            {endDate && <span className="text-green-600 text-xs ml-2">✓ Saved</span>}
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => {
              onEndDateChange(e.target.value)
              onClearMessages()
            }}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {startDate && endDate && new Date(endDate) < new Date(startDate) && (
            <p className="mt-1 text-xs text-amber-600">End date should be after start date</p>
          )}
        </div>
      </div>

      {parameterError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{parameterError}</p>
        </div>
      )}

      <ul className="text-xs text-gray-500 list-disc list-inside">
        <li>
          Dates are considered to be in the US Eastern Timezone.
        </li>
        <li>
          Dates are exclusive meaning that the backtest will always have one previous and one next day to compare to.
        </li>
      </ul>
    </div>
  )
}
