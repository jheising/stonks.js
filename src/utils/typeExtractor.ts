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
 * (marked with "INCLUDE IN CODE EDITOR TYPES" comment)
 */
export function getCodeEditorTypes(): string {
  const lines = backtestingTypesRaw.split('\n');
  const interfaceBlocks: string[] = [];
  
  let currentBlock = '';
  let shouldInclude = false;
  let insideInterface = false;
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Check for the include marker
    if (trimmedLine.includes('INCLUDE IN CODE EDITOR TYPES')) {
      shouldInclude = true;
      continue;
    }
    
    // Check if this line starts an interface
    if (trimmedLine.startsWith('export interface') && shouldInclude) {
      insideInterface = true;
      braceCount = 0;
      currentBlock = line.replace('export interface', 'declare interface');
      
      // Count opening braces in this line
      braceCount += (trimmedLine.match(/\{/g) || []).length;
      braceCount -= (trimmedLine.match(/\}/g) || []).length;
      
      continue;
    }
    
    if (insideInterface && shouldInclude) {
      // Add the line to current block
      currentBlock += '\n' + line;
      
      // Count braces to know when interface ends
      braceCount += (trimmedLine.match(/\{/g) || []).length;
      braceCount -= (trimmedLine.match(/\}/g) || []).length;
      
      // Interface is complete when braces are balanced
      if (braceCount === 0) {
        interfaceBlocks.push(currentBlock);
        currentBlock = '';
        insideInterface = false;
        shouldInclude = false; // Reset for next interface
      }
    }
  }
  
  const globalDeclarations = `
// Available parameters for strategy function
declare const data: StrategyFunctionData;
declare const result: StrategyFunctionResult;
`;

  return interfaceBlocks.join('\n\n') + '\n' + globalDeclarations;
}
