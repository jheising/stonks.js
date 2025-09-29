
/**
 * Creates a better error wrapper that preserves line numbers
 */

export function createUserCodeWrapper(userCode: string): string {
  // Add line mapping comments to help with error tracking
  const lines = userCode.split('\n');
  const mappedCode = lines.map((line, index) => {
    return `${line} ${line.trim() ? `//# sourceURL=strategy.js:${index + 1}` : ''}`;
  }).join('\n');

  return `
return (async function strategyFunction(data) {
  const result = { meta: {} };
  try {
    // User code starts here (line numbers should match)
${mappedCode.split('\n').map(line => `    ${line}`).join('\n')}
    return result;
  } catch (err) {
    // Preserve original error with better context
    const error = new Error(err.message);
    error.name = err.name;
    error.stack = err.stack;
    throw error;
  }
})(data);
  `;
}

export function createStrategyFunction(userCode: string): Function {
  const wrappedCode = createUserCodeWrapper(userCode);
  return new Function('data', wrappedCode);
}

export function validateCode(code: string): { isValid: boolean, error: string | null } {
  try {
    createStrategyFunction(code);
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error instanceof Error ? error.message : 'Syntax error' };
  }
}
