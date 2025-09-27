import currency from 'currency.js';

export const MathUtils = {
  percentChange: (newValue: number, oldValue: number): number => {
    if (oldValue === 0) return 0;
    // Use native JavaScript for percentage calculations to preserve full precision
    // Currency.js is designed for currency values and rounds to 2 decimal places,
    // which truncates percentage precision
    return ((newValue - oldValue) / oldValue) * 100;
  },

  // Helper function to create currency objects with consistent precision
  currency: (value: number | string) => currency(value),

  // Helper for precise addition
  add: (a: number, b: number): number => currency(a).add(b).value,

  // Helper for precise subtraction
  subtract: (a: number, b: number): number => currency(a).subtract(b).value,

  // Helper for precise multiplication
  multiply: (a: number, b: number): number => currency(a).multiply(b).value,

  // Helper for precise division
  divide: (a: number, b: number): number => currency(a).divide(b).value
}