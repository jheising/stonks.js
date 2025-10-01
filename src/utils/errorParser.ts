// Enhanced error parsing for strategy execution errors

export interface ParsedError {
    message: string;
    lineNumber?: number;
    columnNumber?: number;
    originalError: Error;
    codeContext?: string;
    errorType: "syntax" | "runtime" | "unknown";
}

/**
 * Parses JavaScript errors and extracts line/column information
 */
export function parseStrategyError(error: Error, userCode: string): ParsedError {
    const errorMessage = error.message;
    const stack = error.stack || "";

    console.log("Parsing error:", { errorMessage, stack }); // Debug logging

    // Try to extract line number from various error formats
    let lineNumber: number | undefined;
    let columnNumber: number | undefined;
    let errorType: ParsedError["errorType"] = "unknown";

    // Common error patterns (ordered by specificity)
    const patterns = [
        // at strategyFunction (strategy.js:25:10:57) - three numbers format, use middle one
        /strategyFunction \(strategy\.js:\d+:(\d+):\d+\)/,
        // Function code:5:10 (most specific)
        /Function code:(\d+):(\d+)/,
        // at eval (eval at <anonymous> (:5:10))
        /eval.*?:(\d+):(\d+)/,
        // <anonymous>:5:10
        /<anonymous>:(\d+):(\d+)/,
        // SyntaxError: Unexpected token '}' at line 5 column 10
        /at line (\d+) column (\d+)/,
        // strategyFunction:5:10 (standard format)
        /strategyFunction:(\d+):(\d+)/,
        // Line 5
        /line (\d+)/i,
        // at line 5
        /at line (\d+)/i
    ];

    for (const pattern of patterns) {
        const match = stack.match(pattern) || errorMessage.match(pattern);
        if (match) {
            lineNumber = parseInt(match[1], 10);
            if (match[2]) {
                columnNumber = parseInt(match[2], 10);
            }
            console.log(`Pattern matched: ${pattern.source}, line: ${lineNumber}, column: ${columnNumber}`);
            break;
        }
    }

    // Adjust line number for wrapped code
    // Check if this came from the three-number format which uses actual source line numbers
    const isThreeNumberFormat = stack.includes("strategyFunction (strategy.js:") && stack.match(/:\d+:\d+:\d+\)/);

    if (isThreeNumberFormat) {
        // For three-number format, line numbers are already correct for the generated source
        // The actual wrapper structure from browser source is:
        // 1: (function anonymous(data
        // 2: ) {
        // 3:
        // 4: return (async function strategyFunction(data) {
        // 5:   const result = { meta: {} };
        // 6:   try {
        // 7:     // User code starts here (line numbers should match)
        // 8:     [first line of user code]
        const wrapperLinesOffset = 7; // Lines before user code starts
        if (lineNumber && lineNumber > wrapperLinesOffset) {
            lineNumber = lineNumber - wrapperLinesOffset;
        }
    } else {
        // For other formats, use the original offset
        const wrapperLinesOffset = 4; // Lines before user code starts in Function() wrapper
        if (lineNumber && lineNumber > wrapperLinesOffset) {
            lineNumber = lineNumber - wrapperLinesOffset;
        }
    }

    console.log(`After adjustment: line ${lineNumber}, column ${columnNumber}`); // Debug logging

    // Validate line number against actual user code
    const userCodeLines = userCode.split("\n");
    if (lineNumber && (lineNumber < 1 || lineNumber > userCodeLines.length)) {
        console.warn(`Invalid line number ${lineNumber}, user code has ${userCodeLines.length} lines`);
        // Invalid line number, reset to undefined
        lineNumber = undefined;
        columnNumber = undefined;
    } else if (lineNumber) {
        console.log(`Valid line number ${lineNumber} for user code with ${userCodeLines.length} lines`);
    }

    // Determine error type
    if (errorMessage.includes("SyntaxError") || errorMessage.includes("Unexpected token")) {
        errorType = "syntax";
    } else if (errorMessage.includes("ReferenceError") || errorMessage.includes("TypeError")) {
        errorType = "runtime";
    }

    // Get code context around the error line
    let codeContext: string | undefined;
    if (lineNumber) {
        const lines = userCode.split("\n");
        const errorLineIndex = lineNumber - 1;

        if (errorLineIndex >= 0 && errorLineIndex < lines.length) {
            const startLine = Math.max(0, errorLineIndex - 2);
            const endLine = Math.min(lines.length - 1, errorLineIndex + 2);

            const contextLines = [];
            for (let i = startLine; i <= endLine; i++) {
                const prefix = i === errorLineIndex ? "→ " : "  ";
                const lineNum = (i + 1).toString().padStart(3, " ");
                contextLines.push(`${prefix}${lineNum}: ${lines[i]}`);
            }
            codeContext = contextLines.join("\n");
        }
    }

    return {
        message: errorMessage,
        lineNumber,
        columnNumber,
        originalError: error,
        codeContext,
        errorType
    };
}

/**
 * Formats a parsed error for display
 */
export function formatErrorForDisplay(parsedError: ParsedError): string {
    let formatted = parsedError.message;

    if (parsedError.lineNumber) {
        formatted = `Line ${parsedError.lineNumber}: ${formatted}`;
        if (parsedError.columnNumber) {
            formatted = `Line ${parsedError.lineNumber}, Column ${parsedError.columnNumber}: ${parsedError.message}`;
        }
    }

    return formatted;
}
