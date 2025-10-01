import React from "react";
import { Info } from "lucide-react";

interface ApiConfigurationProps {
    apiKey: string;
    apiSecret: string;
    onApiKeyChange: (value: string) => void;
    onApiSecretChange: (value: string) => void;
}

export const ApiConfiguration: React.FC<ApiConfigurationProps> = ({ apiKey, apiSecret, onApiKeyChange, onApiSecretChange }) => {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium  mb-2">
                        API Key <span className="text-pink-500">*</span>
                    </label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={e => onApiKeyChange(e.target.value)}
                        className="w-full px-3 py-2 border border-tuna-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Enter your Alpaca API Key"
                        autoComplete="current-password"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="apiSecret" className="block text-sm font-medium  mb-2">
                        API Secret <span className="text-pink-500">*</span>
                    </label>
                    <input
                        type="password"
                        value={apiSecret}
                        onChange={e => onApiSecretChange(e.target.value)}
                        className="w-full px-3 py-2 border border-tuna-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Enter your Alpaca API Secret"
                        autoComplete="current-password"
                        required
                    />
                </div>
            </div>
            <div className="text-xs text-tuna-400">
                <div className="flex items-center space-x-1">
                    <Info className="w-3 h-3" />
                    <span>API credentials are stored securely in your browser's local storage</span>
                </div>
            </div>
        </div>
    );
};
