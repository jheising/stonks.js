import React from 'react'

interface ApiConfigurationProps {
  apiKey: string
  apiSecret: string
  onApiKeyChange: (value: string) => void
  onApiSecretChange: (value: string) => void
  isCollapsed: boolean
  onToggleCollapsed: () => void
}

export const ApiConfiguration: React.FC<ApiConfigurationProps> = ({
  apiKey,
  apiSecret,
  onApiKeyChange,
  onApiSecretChange,
  isCollapsed,
  onToggleCollapsed
}) => {
  const hasCredentials = apiKey && apiSecret

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <button
        type="button"
        onClick={onToggleCollapsed}
        className="w-full p-6 pb-3 text-left cursor-pointer hover:bg-gray-50 transition-colors duration-200 outline-none"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-semibold text-gray-800">
              Alpaca API Configuration
            </h2>
            {hasCredentials && (
              <span className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Configured</span>
              </span>
            )}
            {!hasCredentials && (
              <span className="flex items-center space-x-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Required</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <span>{isCollapsed ? 'Show' : 'Hide'}</span>
            <svg
              className={`w-4 h-4 transform transition-transform duration-200 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </button>

      <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-48 opacity-100'}`}>
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                API Key {apiKey && <span className="text-green-600 text-xs">✓ Saved</span>}
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your Alpaca API Key"
                required
              />
            </div>
            <div>
              <label htmlFor="apiSecret" className="block text-sm font-medium text-gray-700 mb-2">
                API Secret {apiSecret && <span className="text-green-600 text-xs">✓ Saved</span>}
              </label>
              <input
                type="password"
                id="apiSecret"
                value={apiSecret}
                onChange={(e) => onApiSecretChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your Alpaca API Secret"
                required
              />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>API credentials are stored securely in your browser's local storage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
