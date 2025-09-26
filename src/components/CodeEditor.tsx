import React from 'react'
import Editor from '@monaco-editor/react'
import { formatSaveTime } from '../utils/dateFormat'
import { getCodeEditorTypes } from '../utils/typeExtractor'

interface CodeEditorProps {
  code: string
  onCodeChange: (value: string | undefined) => void
  showInstructions: boolean
  onToggleInstructions: () => void
  onShowVersionModal: () => void
  codeSaved: Date | null
  isCodeValid: boolean
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onCodeChange,
  showInstructions,
  onToggleInstructions,
  onShowVersionModal,
  codeSaved,
  isCodeValid
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Strategy Code
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleInstructions}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
            type="button"
          >
            {showInstructions ? 'Hide' : 'Show'} Instructions
          </button>
          <button
            onClick={onShowVersionModal}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors cursor-pointer"
            type="button"
          >
            Load Version
          </button>
          <div className="text-xs text-gray-500">
            {codeSaved && (
              <span className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Saved {formatSaveTime(codeSaved)}</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isCodeValid ? (
              <span className="flex items-center text-green-600">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Valid Syntax
              </span>
            ) : (
              <span className="flex items-center text-red-600">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Syntax Error
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Instructions Section */}
      {showInstructions && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Strategy Code Instructions</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>Available Data:</strong> Use the <code className="bg-blue-100 px-1 rounded">data</code> parameter to access:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><code className="bg-blue-100 px-1 rounded">data.currentBar</code> - Current price bar (open, high, low, close, volume)</li>
              <li><code className="bg-blue-100 px-1 rounded">data.previousBar</code> - Previous price bar</li>
              <li><code className="bg-blue-100 px-1 rounded">data.nextBar</code> - Next price bar (for reference)</li>
              <li><code className="bg-blue-100 px-1 rounded">data.currentPortfolio</code> - Portfolio state (shares, cash, value)</li>
              <li><code className="bg-blue-100 px-1 rounded">data.stepIndex</code> - Current time step (0-based)</li>
            </ul>
            <p><strong>Return Object:</strong> Use the <code className="bg-blue-100 px-1 rounded">result</code> object to make trades:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><code className="bg-blue-100 px-1 rounded">result.changeInShares = 10</code> - Buy 10 shares (negative to sell)</li>
              <li><code className="bg-blue-100 px-1 rounded">result.price = data.currentBar.close</code> - Execution price (will use next next bar open price if not set)</li>
              <li><code className="bg-blue-100 px-1 rounded">result.meta = {'{reason: "RSI oversold"}'}</code> - Strategy metadata</li>
            </ul>
            <p className="text-xs text-blue-600 mt-3">
              <strong>Example:</strong> <code className="bg-blue-100 px-1 rounded">if (data.stepIndex === 0) result.changeInShares = 100</code> - Buy 100 shares on first bar
            </p>
          </div>
        </div>
      )}

      <div className="border border-gray-300 rounded-md overflow-hidden relative" style={{ zIndex: 1 }}>
        <Editor
          height="500px"
          defaultLanguage="typescript"
          defaultPath="strategy.ts"
          value={code}
          onChange={onCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            tabSize: 2,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            selectOnLineNumbers: true,
            // Add padding to top and bottom
            padding: {
              top: 16,
              bottom: 16
            },
            // TypeScript specific options
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
            wordBasedSuggestions: 'matchingDocuments',
            // Hover functionality
            hover: {
              enabled: true,
              delay: 100,
              sticky: true
            },
            // Ensure hover widgets appear above other content
            fixedOverflowWidgets: true
          }}
          beforeMount={(monaco) => {
            // Disable JavaScript validation to prevent conflicts
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
              noSemanticValidation: true,
              noSyntaxValidation: false
            });

            // Configure TypeScript compiler options with built-in libs
            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
              target: monaco.languages.typescript.ScriptTarget.ES2020,
              lib: ['ES2020', 'DOM'],
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
              'ts:lib/es2020.d.ts'
            );

            // Add type definitions extracted from our actual TypeScript files
            const extraLibs = getCodeEditorTypes();

            monaco.languages.typescript.typescriptDefaults.addExtraLib(
              extraLibs,
              'ts:filename/globals.d.ts'
            );
          }}
          onMount={(editor, monaco) => {
            // Set the model language to TypeScript explicitly
            const model = editor.getModel();
            if (model) {
              monaco.editor.setModelLanguage(model, 'typescript');
            }
          }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-3">
        <div className="flex items-center space-x-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>Your strategy code is stored securely in your browser's local storage</span>
        </div>
      </div>
    </div>
  )
}
