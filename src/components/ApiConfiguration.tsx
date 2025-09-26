import React from 'react'

interface ApiConfigurationProps {
  apiKey: string
  apiSecret: string
  onApiKeyChange: (value: string) => void
  onApiSecretChange: (value: string) => void
}

export const ApiConfiguration: React.FC<ApiConfigurationProps> = ({
  apiKey,
  apiSecret,
  onApiKeyChange,
  onApiSecretChange
}) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
            API Key <span className="text-red-500">*</span> {apiKey && <span className="text-green-600 text-xs">✓ Saved</span>}
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your Alpaca API Key"
            autoComplete="current-password"
            required
          />
        </div>
        <div>
          <label htmlFor="apiSecret" className="block text-sm font-medium text-gray-700 mb-2">
            API Secret <span className="text-red-500">*</span> {apiSecret && <span className="text-green-600 text-xs">✓ Saved</span>}
          </label>
          <input
            type="password"
            value={apiSecret}
            onChange={(e) => onApiSecretChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your Alpaca API Secret"
            autoComplete="current-password"
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
  )
}
