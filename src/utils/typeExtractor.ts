// Utility to extract type definitions for Monaco Editor
// This reads our actual TypeScript type files and converts them to Monaco-compatible declarations

// Import the raw content of our type files
// Note: We'll need to read these as text to parse them
import backtestingTypesRaw from '../types/backtesting.ts?raw';

/**
 * Extracts TypeScript interfaces from a source file and converts them to Monaco declarations
 */
function extractInterfacesToMonacoDeclarations(sourceCode: string): string {
  const lines = sourceCode.split('\n');
  const declarations: string[] = [];
  
  let currentInterface = '';
  let insideInterface = false;
  let braceCount = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip comments and empty lines
    if (trimmedLine.startsWith('//') || trimmedLine === '') {
      continue;
    }
    
    // Check if this line starts an interface
    if (trimmedLine.startsWith('export interface')) {
      insideInterface = true;
      braceCount = 0;
      currentInterface = trimmedLine.replace('export interface', 'declare interface');
      
      // Count opening braces in this line
      braceCount += (trimmedLine.match(/\{/g) || []).length;
      braceCount -= (trimmedLine.match(/\}/g) || []).length;
      
      continue;
    }
    
    if (insideInterface) {
      // Add the line to current interface
      currentInterface += '\n  ' + trimmedLine;
      
      // Count braces to know when interface ends
      braceCount += (trimmedLine.match(/\{/g) || []).length;
      braceCount -= (trimmedLine.match(/\}/g) || []).length;
      
      // Interface is complete when braces are balanced
      if (braceCount === 0) {
        declarations.push(currentInterface);
        currentInterface = '';
        insideInterface = false;
      }
    }
  }
  
  return declarations.join('\n\n');
}

/**
 * Generates Monaco-compatible type declarations from our backtesting types
 */
export function generateMonacoTypeDeclarations(): string {
  const backtestingDeclarations = extractInterfacesToMonacoDeclarations(backtestingTypesRaw);
  
  const globalDeclarations = `
// Available parameters for strategy function
declare const data: StrategyFunctionData;
declare const result: StrategyFunctionResult;
`;

  return backtestingDeclarations + '\n' + globalDeclarations;
}

/**
 * Gets all the interfaces that should be included in the code editor
 * Now includes all types from backtesting.ts without requiring comment markers
 */
export function getCodeEditorTypes(): string {
  // Simply use the existing generateMonacoTypeDeclarations function
  // which already extracts all interfaces from backtesting.ts
  return generateMonacoTypeDeclarations();
}
