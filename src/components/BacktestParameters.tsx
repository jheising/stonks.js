import React from "react";
import { TIME_PERIODS } from "../constants/storage";
import type { BacktestSettings } from "../types/backtesting";
import { Check, AlertTriangle } from "lucide-react";

interface BacktestParametersProps {
    settings: BacktestSettings;
    onSettingsChange: (settings: Partial<BacktestSettings>) => void;
    onClearMessages: () => void;
    parameterError?: string | null;
}

export const BacktestParameters: React.FC<BacktestParametersProps> = ({ settings, onSettingsChange, onClearMessages, parameterError }) => {
    const { stockSymbol, startingAmount, startDate, endDate, barResolutionValue, barResolutionPeriod } = settings;
    const isReady = stockSymbol && startDate && startingAmount && parseFloat(startingAmount) > 0;

    const handleChange = (key: keyof BacktestSettings, value: string) => {
        onSettingsChange({ [key]: value });
        onClearMessages();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="text-xs text-tuna-400">
                    {isReady && (
                        <span className="flex items-center space-x-1 text-tuna-900 bg-teal-400 px-2 py-1 rounded-full">
                            <Check className="w-3 h-3" />
                            <span>Ready to backtest</span>
                        </span>
                    )}
                    {!isReady && (
                        <span className="flex items-center space-x-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Missing parameters</span>
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                {/* Stock Symbol */}
                <div>
                    <label htmlFor="stockSymbol" className="block text-sm font-medium mb-2">
                        Symbol <span className="text-pink-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="stockSymbol"
                        value={stockSymbol}
                        onChange={e => handleChange("stockSymbol", e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 border border-tuna-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="e.g., AAPL, ETH/USD"
                        maxLength={21}
                        pattern="[A-Z]{1,10}(\/[A-Z]{3,10})?"
                        required
                    />
                </div>

                {/* Starting Amount */}
                <div>
                    <label htmlFor="startingAmount" className="block text-sm font-medium  mb-2">
                        Starting Amount <span className="text-pink-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            id="startingAmount"
                            value={startingAmount}
                            onChange={e => handleChange("startingAmount", e.target.value)}
                            className="w-full pl-7 pr-3 py-2 border border-tuna-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                    <label htmlFor="startDate" className="block text-sm font-medium  mb-2">
                        Start Date <span className="text-pink-500">*</span>
                    </label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={e => handleChange("startDate", e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                        className="w-full px-3 py-2 border border-tuna-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                    />
                </div>

                {/* End Date */}
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium  mb-2">
                        End Date <span className="text-tuna-400 text-xs">(optional)</span>
                    </label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={e => handleChange("endDate", e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                        className="w-full px-3 py-2 border border-tuna-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    {startDate && endDate && new Date(endDate) < new Date(startDate) && <p className="mt-1 text-xs text-amber-600">End date should be after start date</p>}
                </div>

                {/* Bar Resolution */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Bar Resolution <span className="text-tuna-400 text-xs">(optional)</span>
                    </label>
                    <div className="flex space-x-2">
                        <input
                            type="number"
                            id="barResolutionValue"
                            value={barResolutionValue}
                            onChange={e => {
                                const value = e.target.value;
                                if (value === "" || (parseInt(value) > 0 && parseInt(value) <= 999)) {
                                    handleChange("barResolutionValue", value);
                                }
                            }}
                            className="w-20 px-3 py-2 border border-tuna-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="1"
                            min="1"
                            max="999"
                        />
                        <select
                            id="barResolutionPeriod"
                            value={barResolutionPeriod}
                            onChange={e => handleChange("barResolutionPeriod", e.target.value)}
                            className="flex-1 px-3 py-2 border border-tuna-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value={TIME_PERIODS.MINUTE}>minute{barResolutionValue !== "1" ? "s" : ""}</option>
                            <option value={TIME_PERIODS.HOUR}>hour{barResolutionValue !== "1" ? "s" : ""}</option>
                            <option value={TIME_PERIODS.DAY}>day{barResolutionValue !== "1" ? "s" : ""}</option>
                            <option value={TIME_PERIODS.WEEK}>week{barResolutionValue !== "1" ? "s" : ""}</option>
                            <option value={TIME_PERIODS.MONTH}>month{barResolutionValue !== "1" ? "s" : ""}</option>
                        </select>
                    </div>
                    <p className="mt-1 text-xs text-tuna-400">Data frequency for bars (default: 1 day)</p>
                </div>
            </div>

            {parameterError && (
                <div className="mb-4 p-3 bg-pink-50 border border-pink-200 rounded-md">
                    <p className="text-pink-700 text-sm">{parameterError}</p>
                </div>
            )}

            <ul className="text-xs list-disc list-inside text-tuna-400">
                <li>Dates are considered to be in the US Eastern Timezone.</li>
                <li>Dates are exclusive meaning that the backtest will always have one previous and one next day to compare to.</li>
                <li>Stock prices are adjusted for splits.</li>
            </ul>
        </div>
    );
};
