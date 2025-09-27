import type { Bar, BacktestMarketDataProps } from "../types/backtesting";

export abstract class StockDataProviderBase {
  static readonly name: string = "StockDataProviderBase";
  abstract getBars(props: BacktestMarketDataProps, abortSignal?: AbortSignal): Promise<Bar[]>;
  abstract renderSettings(initialSettings: Record<string, any>, onSettingsChange: (settings: Record<string, any>) => void): React.ReactNode;
  abstract get isConfigured(): { isValid: boolean, error?: string };
}