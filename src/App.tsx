import { useState, useRef, useMemo, useCallback } from "react";
import { backtest } from "./utils/backtester";
import { parseStrategyError, type ParsedError } from "./utils/errorParser";
import { createUserCodeWrapper, validateCode } from "./utils/codeCompiler";
import type { StrategyFunctionData, StrategyFunctionResult, BacktestResult } from "./types/backtesting";

// Components
import { BacktestParameters, CodeEditor, ResultsDisplay, VersionModal, DataProviderSelector } from "./components";

// Hooks and utilities
import { useLocalStorage } from "./hooks/useLocalStorage";
import { saveCodeVersion } from "./utils/codeVersions";
import { validateParameters } from "./utils/validation";

// Constants
import { STORAGE_KEYS, TIME_PERIODS } from "./constants/storage";
import { DEFAULT_STRATEGY } from "./constants/defaultStrategy";

// Types
import type { CodeVersion } from "./types";
import type { StockDataProviderBase } from "./providers/StockDataProviderBase";
import type { BacktestSettings } from "./types/backtesting";
import { AvailableProviders } from "./providers/AvailableProviders";
import { CollapseableBox } from "./components/CollapseableBox";

function App() {
    const [code, setCode, { lastSaved: codeSaved }] = useLocalStorage(STORAGE_KEYS.STRATEGY_CODE, DEFAULT_STRATEGY);

    // Data provider management
    const [selectedProviderIndex, setSelectedProviderIndex] = useLocalStorage(STORAGE_KEYS.SELECTED_DATA_PROVIDER, 0);
    const dataProvider = useRef<StockDataProviderBase>(new AvailableProviders[selectedProviderIndex]());
    const [dataProviderSettings, setDataProviderSettings] = useLocalStorage(`${STORAGE_KEYS.DATA_PROVIDER_SETTINGS}:${dataProvider.current.constructor.name}`, {});

    // Handle provider switching
    const handleProviderChange = useCallback(
        (newIndex: number) => {
            if (newIndex !== selectedProviderIndex && newIndex < AvailableProviders.length) {
                setSelectedProviderIndex(newIndex);
                // Create new provider instance
                dataProvider.current = new AvailableProviders[newIndex]();
                // Load settings for the new provider
                const newProviderSettings = localStorage.getItem(`${STORAGE_KEYS.DATA_PROVIDER_SETTINGS}:${dataProvider.current.constructor.name}`);
                setDataProviderSettings(newProviderSettings ? JSON.parse(newProviderSettings) : {});
            }
        },
        [selectedProviderIndex, setSelectedProviderIndex, setDataProviderSettings]
    );

    // Backtest settings - consolidated object approach
    const [backtestSettings, setBacktestSettings] = useLocalStorage<BacktestSettings>(STORAGE_KEYS.BACKTEST_SETTINGS, {
        stockSymbol: "",
        startingAmount: "10000",
        startDate: "",
        endDate: "",
        barResolutionValue: "1",
        barResolutionPeriod: TIME_PERIODS.DAY
    });

    // Helper function to update backtest settings
    const updateBacktestSettings = useCallback(
        (updates: Partial<BacktestSettings>) => {
            setBacktestSettings(prev => ({ ...prev, ...updates }));
        },
        [setBacktestSettings]
    );

    // Loading and error states
    const [isRunning, setIsRunning] = useState(false);
    const [backtestError, setBacktestError] = useState<string | null>(null);
    const [parsedError, setParsedError] = useState<ParsedError | null>(null);
    const [backtestSuccess, setBacktestSuccess] = useState<string | null>(null);
    const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);

    // Monaco validation state
    const [hasMonacoErrors, setHasMonacoErrors] = useState(false);
    const [monacoError, setMonacoError] = useState<{ line: number; column: number; message: string } | null>(null);

    // Abort controller for cancelling running backtests
    const abortControllerRef = useRef<AbortController | null>(null);
    const [showVersionModal, setShowVersionModal] = useState(false);

    // Code editor maximize state
    const [isCodeEditorMaximized, setIsCodeEditorMaximized] = useState(false);

    // Clear messages when form inputs change (but keep results visible)
    const clearMessages = useCallback(() => {
        if (backtestError || backtestSuccess || parsedError) {
            setBacktestError(null);
            setParsedError(null);
            setBacktestSuccess(null);
            // Note: We intentionally keep backtestResult so the table stays visible
        }
    }, [backtestError, backtestSuccess, parsedError]);

    // Load a specific code version
    const loadCodeVersion = useCallback(
        (version: CodeVersion) => {
            setCode(version.code);
            setShowVersionModal(false);
        },
        [setCode]
    );

    // Toggle code editor maximize state
    const toggleCodeEditorMaximize = useCallback(() => {
        setIsCodeEditorMaximized(!isCodeEditorMaximized);
    }, [isCodeEditorMaximized]);

    const handleEditorChange = useCallback(
        (value: string | undefined) => {
            setCode(value || "");
            clearMessages();
        },
        [setCode, clearMessages]
    );

    // Handle Monaco validation changes
    const handleValidationChange = useCallback((hasErrors: boolean, firstError?: { line: number; column: number; message: string }) => {
        setHasMonacoErrors(hasErrors);
        setMonacoError(firstError || null);
    }, []);

    // Handle clearing errors from ResultsDisplay
    const handleClearError = useCallback(() => {
        setBacktestError(null);
        setParsedError(null);
    }, []);

    // Handle closing version modal
    const handleCloseVersionModal = useCallback(() => {
        setShowVersionModal(false);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // If already running, cancel the current backtest
        if (isRunning && abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsRunning(false);
            setBacktestError("Backtest was cancelled by user");
            abortControllerRef.current = null;
            return;
        }

        // Clear any previous messages
        setBacktestError(null);
        setParsedError(null);
        setBacktestSuccess(null);
        setBacktestResult(null);

        // Validate backtest settings
        const { isValid: areParametersValid, error: parameterError } = validateParameters(backtestSettings);
        if (!areParametersValid) {
            setBacktestError(parameterError);
            return;
        }

        // Create new AbortController for this backtest
        abortControllerRef.current = new AbortController();
        setIsRunning(true);

        try {
            const actualEndDate = backtestSettings.endDate || new Date().toISOString();

            console.log("Starting Backtest:", {
                symbol: backtestSettings.stockSymbol.toUpperCase(),
                startDate: backtestSettings.startDate,
                endDate: actualEndDate,
                startingAmount: `$${parseFloat(backtestSettings.startingAmount).toLocaleString()}`,
                codeLength: code.length
            });

            // Create strategy function from user code
            const createStrategy = () => {
                try {
                    // Use enhanced wrapper for better error tracking
                    const wrappedCode = createUserCodeWrapper(code);

                    return new Function("data", wrappedCode);
                } catch (error) {
                    const parsed = parseStrategyError(error as Error, code);
                    setParsedError(parsed);
                    throw new Error(`Strategy code error: ${error instanceof Error ? error.message : "Unknown error"}`);
                }
            };

            const strategy = createStrategy();

            // Run the backtest
            const result = await backtest({
                dataProvider: dataProvider.current,
                symbol: backtestSettings.stockSymbol.toUpperCase(),
                startDate: backtestSettings.startDate,
                endDate: actualEndDate,
                startingAmount: parseFloat(backtestSettings.startingAmount),
                barResolutionValue: backtestSettings.barResolutionValue,
                barResolutionPeriod: backtestSettings.barResolutionPeriod,
                strategy: strategy as (data: StrategyFunctionData) => Promise<StrategyFunctionResult>,
                abortSignal: abortControllerRef.current.signal
            });

            setBacktestResult(result);
            setBacktestSuccess(
                `Backtest completed successfully for ${backtestSettings.stockSymbol.toUpperCase()} from ${backtestSettings.startDate} to ${actualEndDate.split("T")[0]}.`
            );

            // Save code version only after successful backtest
            saveCodeVersion(code);
        } catch (error) {
            console.error("Backtest failed:", error);

            if (error instanceof Error) {
                // Handle abort errors differently
                if (error.name === "AbortError" || error.message.includes("cancelled")) {
                    setBacktestError("Backtest was cancelled by user");
                } else {
                    // Parse the error for enhanced display
                    const parsed = parseStrategyError(error, code);
                    setParsedError(parsed);
                    setBacktestError(error.message);
                }
            } else {
                setBacktestError("An unexpected error occurred during backtesting");
            }
        } finally {
            setIsRunning(false);
            abortControllerRef.current = null;
        }
    };

    // Removed unused function: getLastSaveTime
    const { isValid: isDataProviderConfigured } = dataProvider.current.isConfigured;
    const { isValid: isCodeValidCompilation } = useMemo(() => validateCode(code), [code]);
    const isCodeValid = isCodeValidCompilation && !hasMonacoErrors; // Code is valid only if both compilation and Monaco validation pass
    const { isValid: areParametersValid, error: parameterError } = useMemo(() => validateParameters(backtestSettings), [backtestSettings]);

    // Create combined error info, prioritizing Monaco errors for real-time feedback
    const combinedErrorInfo = useMemo(() => {
        if (hasMonacoErrors && monacoError) {
            return {
                message: monacoError.message,
                lineNumber: monacoError.line,
                columnNumber: monacoError.column,
                originalError: new Error(monacoError.message),
                errorType: "syntax" as const
            };
        }
        return parsedError;
    }, [hasMonacoErrors, monacoError, parsedError]);

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header with Logo */}
                <div className="flex flex-col items-center mb-8">
                    <img src={`${import.meta.env.BASE_URL}stonks-logo.png`} alt="stonks.js logo" className="w-32 h-32" />
                    <p className="text-tuna-400 text-center mt-2">Modern web-based backtesting platform</p>
                </div>

                <div className="space-y-6">
                    {/* Data Provider Configuration Section */}
                    <CollapseableBox
                        title="Data Provider Configuration"
                        saveState={true}
                        saveStateKey={"API_CONFIGURATION_BOX"}
                        forceOpen={!dataProvider.current.isConfigured.isValid}
                    >
                        <DataProviderSelector selectedProviderIndex={selectedProviderIndex} onProviderChange={handleProviderChange} />
                        {dataProvider.current.renderSettings(dataProviderSettings, setDataProviderSettings)}
                    </CollapseableBox>

                    {/* Backtest Parameters Section */}
                    <CollapseableBox title="Backtest Parameters" saveState={true} saveStateKey={"BACKTEST_PARAMETERS_BOX"}>
                        <BacktestParameters settings={backtestSettings} onSettingsChange={updateBacktestSettings} onClearMessages={clearMessages} parameterError={parameterError} />
                    </CollapseableBox>

                    {/* Code Editor Section */}
                    <CollapseableBox title="Strategy Code" saveState={true} saveStateKey={"CODE_EDITOR_BOX"} forceOpen={!isCodeValid}>
                        <CodeEditor
                            code={code}
                            onCodeChange={handleEditorChange}
                            onShowVersionModal={() => setShowVersionModal(true)}
                            codeSaved={codeSaved}
                            isCodeValid={isCodeValid}
                            errorInfo={combinedErrorInfo}
                            onValidationChange={handleValidationChange}
                            isMaximized={isCodeEditorMaximized}
                            onToggleMaximize={toggleCodeEditorMaximize}
                        />
                    </CollapseableBox>

                    {/* Submit Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={handleSubmit}
                            disabled={!isCodeValid || !areParametersValid || !isDataProviderConfigured}
                            className="px-8 py-3 bg-teal-400 text-tuna-900 uppercase font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:bg-tuna-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 "
                        >
                            {isRunning && (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            )}
                            <span>{isRunning ? "Cancel Backtest" : "Run Backtest"}</span>
                        </button>
                    </div>

                    {/* Results Display */}
                    {(backtestResult || backtestError || parsedError) && (
                        <CollapseableBox title="Results" forceOpen={true}>
                            <ResultsDisplay
                                backtestResult={backtestResult}
                                backtestSuccess={backtestSuccess}
                                backtestError={backtestError}
                                parsedError={parsedError}
                                stockSymbol={backtestResult?.symbol ?? backtestSettings.stockSymbol}
                                onClearError={handleClearError}
                            />
                        </CollapseableBox>
                    )}
                </div>

                {/* Version Modal */}
                <VersionModal show={showVersionModal} onClose={handleCloseVersionModal} onLoadVersion={loadCodeVersion} />

                {/* Attribution Footer */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-tuna-400">
                        Made with ❤️ by{" "}
                        <a href="https://github.com/jheising" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 transition-colors">
                            jheising
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default App;
