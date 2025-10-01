import React, { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { formatSaveTime } from "../utils/dateFormat";
import { getCodeEditorTypes } from "../utils/typeExtractor";
import type { ParsedError } from "../utils/errorParser";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../constants/storage";
import { Check, Maximize2, Minimize2, XCircle, CheckCircle, Info } from "lucide-react";

interface CodeEditorProps {
    code: string;
    onCodeChange: (value: string | undefined) => void;
    onShowVersionModal: () => void;
    codeSaved: Date | null;
    isCodeValid: boolean;
    errorInfo?: ParsedError | null;
    onValidationChange?: (hasMonacoErrors: boolean, firstError?: { line: number; column: number; message: string }) => void;
    isMaximized?: boolean;
    onToggleMaximize?: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
    code,
    onCodeChange,
    onShowVersionModal,
    codeSaved,
    isCodeValid,
    errorInfo,
    onValidationChange,
    isMaximized = false,
    onToggleMaximize
}) => {
    // Internal state management for instructions toggle
    const [showInstructions, setShowInstructions] = useLocalStorage(STORAGE_KEYS.SHOW_INSTRUCTIONS, true);
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const decorationsRef = useRef<any>(null);

    // Handle Monaco editor validation
    const handleMonacoValidation = (markers: any[]) => {
        if (!onValidationChange) return;

        // Filter to only syntax/semantic errors (not warnings or info)
        const errors = markers.filter(marker => marker.severity === 8); // Monaco MarkerSeverity.Error = 8

        if (errors.length > 0) {
            const firstError = errors[0];
            onValidationChange(true, {
                line: firstError.startLineNumber,
                column: firstError.startColumn,
                message: firstError.message
            });
        } else {
            onValidationChange(false);
        }
    };

    // Clear error decorations
    const clearErrorDecorations = () => {
        if (decorationsRef.current) {
            decorationsRef.current.clear();
            decorationsRef.current = null;
        }
    };

    // Clear errors when code changes
    useEffect(() => {
        clearErrorDecorations();
    }, [code]);

    // Clear errors when no error info is present
    useEffect(() => {
        if (!errorInfo) {
            clearErrorDecorations();
        }
    }, [errorInfo]);

    // Handle error highlighting
    useEffect(() => {
        if (editorRef.current && monacoRef.current && errorInfo?.lineNumber) {
            const editor = editorRef.current;
            const monaco = monacoRef.current;

            // Clear previous decorations
            const model = editor.getModel();
            if (model) {
                // Validate line number against model
                const lineCount = model.getLineCount();
                const line = errorInfo.lineNumber;

                // Only proceed if line number is valid
                if (line < 1 || line > lineCount) {
                    console.warn(`Invalid line number ${line}, model has ${lineCount} lines`);
                    return;
                }

                // Clear previous decorations using our stored references
                clearErrorDecorations();

                // Add new error decoration
                const lineContent = model.getLineContent(line);
                const startColumn = Math.max(1, Math.min(errorInfo.columnNumber || 1, lineContent.length + 1));
                const endColumn = Math.min(lineContent.length + 1, startColumn + Math.max(1, lineContent.length - startColumn + 1));

                try {
                    const newDecorations = [
                        {
                            range: new monaco.Range(line, startColumn, line, endColumn),
                            options: {
                                isWholeLine: false,
                                className: "monaco-error-highlight",
                                glyphMarginClassName: "monaco-error-glyph",
                                minimap: {
                                    color: "#ff0000",
                                    position: monaco.editor.MinimapPosition.Inline
                                },
                                overviewRuler: {
                                    color: "#ff0000",
                                    position: monaco.editor.OverviewRulerLane.Full
                                },
                                marginClassName: "monaco-error-margin",
                                hoverMessage: {
                                    value: `**Error:** ${errorInfo.message}`
                                }
                            }
                        }
                    ];

                    decorationsRef.current = editor.createDecorationsCollection(newDecorations);

                    // Scroll to error line
                    editor.revealLineInCenter(line);
                } catch (error) {
                    console.error("Error creating Monaco decorations:", error);
                }
            }
        }
    }, [errorInfo]);

    // Container component with conditional fullscreen styling
    const Container = isMaximized ? "div" : React.Fragment;
    const containerProps = isMaximized
        ? {
              className: "fixed inset-0 z-50 bg-tuna-800 flex flex-col p-6",
              style: { zIndex: 9999 }
          }
        : {};

    const content = (
        <div className={isMaximized ? "flex flex-col h-full" : ""}>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setShowInstructions(!showInstructions)}
                        className="px-3 py-1 text-sm bg-tuna-100 text-tuna-700 rounded-md hover:bg-tuna-200 transition-colors "
                        type="button"
                    >
                        {showInstructions ? "Hide" : "Show"} Instructions
                    </button>
                    <button onClick={onShowVersionModal} className="px-3 py-1 text-sm bg-teal-400 text-tuna-900 rounded-md hover:bg-teal-700 transition-colors " type="button">
                        Load Version
                    </button>
                    {onToggleMaximize && (
                        <button
                            onClick={onToggleMaximize}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-1"
                            type="button"
                            title={isMaximized ? "Minimize Editor" : "Maximize Editor"}
                        >
                            {isMaximized ? (
                                <>
                                    <Minimize2 className="w-4 h-4" />
                                    <span>Minimize</span>
                                </>
                            ) : (
                                <>
                                    <Maximize2 className="w-4 h-4" />
                                    <span>Maximize</span>
                                </>
                            )}
                        </button>
                    )}
                    <div className="text-xs text-tuna-500">
                        {codeSaved && (
                            <span className="flex items-center space-x-1">
                                <Check className="w-3 h-3 text-teal-500" />
                                <span>Saved {formatSaveTime(codeSaved)}</span>
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        {isCodeValid ? (
                            <span className="flex items-center text-teal-400">
                                <CheckCircle className="w-5 h-5 mr-1" />
                                Valid Syntax
                            </span>
                        ) : (
                            <span className="flex items-center text-pink-600">
                                <XCircle className="w-5 h-5 mr-1" />
                                Syntax Error
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Instructions Section */}
            {showInstructions && (
                <div className="mb-4 bg-tuna-900 border border-teal-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold mb-2">Strategy Code Instructions</h3>
                    <div className="text-sm space-y-2">
                        <p>
                            <strong>Available Data:</strong> Use the <code className="bg-tuna-600 px-1 rounded">data</code> parameter to access:
                        </p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>
                                <code className="bg-tuna-600 px-1 rounded">data.currentBar</code> - Current price bar (open, high, low, close, volume)
                            </li>
                            <li>
                                <code className="bg-tuna-600 px-1 rounded">data.previousBar</code> - Previous price bar
                            </li>
                            <li>
                                <code className="bg-tuna-600 px-1 rounded">data.nextBar</code> - Next price bar (for reference)
                            </li>
                            <li>
                                <code className="bg-tuna-600 px-1 rounded">data.currentPortfolio</code> - Portfolio state (shares, cash, value)
                            </li>
                            <li>
                                <code className="bg-tuna-600 px-1 rounded">data.dayNumber</code> - Current day number (0-based)
                            </li>
                            <li>
                                <code className="bg-tuna-600 px-1 rounded">data.scratchpad</code> - Persistent storage for custom data between days
                            </li>
                        </ul>
                        <p>
                            <strong>Return Object:</strong> Use the <code className="bg-tuna-600 px-1 rounded">result</code> object to make trades:
                        </p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>
                                <code className="bg-tuna-600 px-1 rounded">result.changeInShares = 10</code> - Buy 10 shares (negative to sell)
                            </li>
                            <li>
                                <code className="bg-tuna-600 px-1 rounded">result.price = data.currentBar.close</code> - Execution price (will use next next bar open price if not
                                set)
                            </li>
                            <li>
                                <code className="bg-tuna-600 px-1 rounded">result.meta = {'{reason: "RSI oversold"}'}</code> - Strategy metadata
                            </li>
                        </ul>
                        <p>
                            <strong>Scratchpad Usage:</strong> Store and retrieve custom data across trading days:
                        </p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>
                                <code className="bg-tuna-600 px-1 rounded">data.scratchpad.myValue = 42</code> - Store any data (numbers, objects, arrays)
                            </li>
                            <li>
                                <code className="bg-tuna-600 px-1 rounded">const stored = data.scratchpad.myValue || 0</code> - Retrieve with fallback
                            </li>
                            <li>
                                <code className="bg-tuna-600 px-1 rounded">data.scratchpad.prices = data.scratchpad.prices || []</code> - Initialize arrays
                            </li>
                            <li>
                                <code className="bg-tuna-600 px-1 rounded">data.scratchpad.prices.push(data.currentBar.close)</code> - Track price history
                            </li>
                        </ul>
                        <p className="text-xs mt-3">
                            <strong>Examples:</strong>
                        </p>
                        <div className="text-xs bg-tuna-800 p-2 rounded mt-1 font-mono">
                            <div>
                                <code>// Simple moving average using scratchpad</code>
                            </div>
                            <div>
                                <code>data.scratchpad.prices = data.scratchpad.prices || [];</code>
                            </div>
                            <div>
                                <code>data.scratchpad.prices.push(data.currentBar.close);</code>
                            </div>
                            <div>
                                <code>if (data.scratchpad.prices.length &gt; 20) data.scratchpad.prices.shift();</code>
                            </div>
                            <div>
                                <code>const avg = data.scratchpad.prices.reduce((a,b) =&gt; a+b) / data.scratchpad.prices.length;</code>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`border border-tuna-300 rounded-md overflow-hidden relative ${isMaximized ? "flex-1" : ""}`} style={{ zIndex: 1 }}>
                <Editor
                    height={isMaximized ? "100%" : "500px"}
                    defaultLanguage="typescript"
                    defaultPath="strategy.ts"
                    value={code}
                    onChange={onCodeChange}
                    onValidate={handleMonacoValidation}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "Roboto Mono, monospace",
                        tabSize: 2,
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        lineNumbers: "on",
                        renderLineHighlight: "all",
                        selectOnLineNumbers: true,
                        // Add padding to top and bottom
                        padding: {
                            top: 16,
                            bottom: 16
                        },
                        // TypeScript specific options
                        quickSuggestions: true,
                        suggestOnTriggerCharacters: true,
                        acceptSuggestionOnEnter: "on",
                        tabCompletion: "on",
                        wordBasedSuggestions: "matchingDocuments",
                        // Hover functionality
                        hover: {
                            enabled: true,
                            delay: 100,
                            sticky: true
                        },
                        // Ensure hover widgets appear above other content
                        fixedOverflowWidgets: true
                    }}
                    beforeMount={monaco => {
                        // Disable JavaScript validation to prevent conflicts
                        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                            noSemanticValidation: true,
                            noSyntaxValidation: false
                        });

                        // Configure TypeScript compiler options with built-in libs
                        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                            target: monaco.languages.typescript.ScriptTarget.ES2020,
                            lib: ["ES2020", "DOM"],
                            allowNonTsExtensions: true,
                            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                            module: monaco.languages.typescript.ModuleKind.ESNext,
                            noEmit: true,
                            esModuleInterop: true,
                            allowSyntheticDefaultImports: true,
                            strict: false,
                            allowJs: true,
                            checkJs: false,
                            skipLibCheck: true
                        });

                        // Enable TypeScript diagnostics
                        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                            noSemanticValidation: false,
                            noSyntaxValidation: false,
                            noSuggestionDiagnostics: false
                        });

                        // Add the default ES2020 lib manually to ensure Math, console, etc. work
                        monaco.languages.typescript.typescriptDefaults.addExtraLib(
                            `/// <reference no-default-lib="true"/>
/// <reference lib="es2020" />
/// <reference lib="dom" />`,
                            "ts:lib/es2020.d.ts"
                        );

                        // Add type definitions extracted from our actual TypeScript files
                        const extraLibs = getCodeEditorTypes();

                        monaco.languages.typescript.typescriptDefaults.addExtraLib(extraLibs, "ts:filename/globals.d.ts");
                    }}
                    onMount={(editor, monaco) => {
                        // Store references for error highlighting
                        editorRef.current = editor;
                        monacoRef.current = monaco;

                        // Set the model language to TypeScript explicitly
                        const model = editor.getModel();
                        if (model) {
                            monaco.editor.setModelLanguage(model, "typescript");
                        }
                    }}
                />
            </div>
            {!isMaximized && (
                <div className="text-xs text-tuna-500 mt-3">
                    <div className="flex items-center space-x-1">
                        <Info className="w-3 h-3" />
                        <span>Your strategy code is stored securely in your browser's local storage</span>
                    </div>
                </div>
            )}
        </div>
    );

    return <Container {...containerProps}>{content}</Container>;
};
