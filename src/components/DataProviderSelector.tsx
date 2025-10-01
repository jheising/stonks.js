import React from "react";
import { AvailableProviders } from "../providers/AvailableProviders";

interface DataProviderSelectorProps {
    selectedProviderIndex: number;
    onProviderChange: (index: number) => void;
}

export const DataProviderSelector: React.FC<DataProviderSelectorProps> = ({ selectedProviderIndex, onProviderChange }) => {
    return (
        <div className="mb-4">
            <label htmlFor="dataProvider" className="block text-sm font-medium mb-2">
                Data Provider
            </label>
            <select
                id="dataProvider"
                value={selectedProviderIndex}
                onChange={e => onProviderChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-tuna-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-tuna-800"
            >
                {AvailableProviders.map((Provider, index) => (
                    <option key={index} value={index}>
                        {Provider.name}
                    </option>
                ))}
            </select>
            <p className="mt-1 text-xs text-tuna-500">Choose your market data provider</p>
        </div>
    );
};
