export const MathUtils = {
  percentChange: (newValue: number, oldValue: number): number => {
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }
}