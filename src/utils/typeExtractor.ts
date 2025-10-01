// Utility to provide type definitions for Monaco Editor
// This uses our raw TypeScript definitions directly

// Import the raw content of our type files
import backtestingTypesRaw from '../types/backtesting.ts?raw';

/**
 * Generates Monaco-compatible type declarations from our backtesting types
 */
export function generateMonacoTypeDeclarations(): string {
  // Convert 'export interface' to 'declare interface' for Monaco
  const backtestingDeclarations = backtestingTypesRaw.replace(/export interface/g, 'declare interface');
  
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
