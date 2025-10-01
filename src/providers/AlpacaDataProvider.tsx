import { DateTime } from "luxon";
import type { Bar, BacktestMarketDataProps } from "../types/backtesting";
import { StockDataProviderBase } from "./StockDataProviderBase";
import { ApiConfiguration } from "../components/ApiConfiguration";
import { useEffect, useState } from "react";

export class AlpacaDataProvider extends StockDataProviderBase {
    private settings?: { apiKey: string; apiSecret: string };

    static readonly name: string = "Alpaca";

    private async getAlpacaBars(props: BacktestMarketDataProps, pageToken?: string, abortSignal?: AbortSignal): Promise<Bar[]> {
        const { symbol, startDate, endDate, barResolutionValue, barResolutionPeriod } = props;

        // Convert bar resolution to Alpaca timeframe format
        const timeframe = this.getAlpacaTimeframe(barResolutionValue, barResolutionPeriod);

        let url = `https://data.alpaca.markets/v2/stocks/${symbol}/bars?timeframe=${timeframe}&limit=1000&feed=iex&sort=asc&start=${startDate}&adjustment=split`;

        if (endDate) {
            const end = DateTime.fromISO(endDate, { zone: "America/New_York" }).endOf("day").toUTC().toISO();
            url += `&end=${end}`;
        }

        if (pageToken) {
            url += `&page_token=${pageToken}`;
        }

        const response = await fetch(url, {
            method: "GET",
            headers: {
                accept: "application/json",
                "APCA-API-KEY-ID": this.settings?.apiKey ?? "",
                "APCA-API-SECRET-KEY": this.settings?.apiSecret ?? ""
            },
            signal: abortSignal
        });

        if (response.status === 401) {
            throw new Error("Invalid API credentials");
        } else if (response.status !== 200) {
            throw new Error("Failed to get bars");
        }

        const data = await response.json();

        if (!data.bars) {
            return [];
        }

        const currentBars = data.bars.map((bar: any) => ({
            timestamp: DateTime.fromISO(bar.t).setZone("America/New_York").toISO(),
            open: Number(bar.o),
            high: Number(bar.h),
            low: Number(bar.l),
            close: Number(bar.c),
            volume: Number(bar.v)
        }));

        if (data.next_page_token) {
            const nextBars = await this.getAlpacaBars(props, data.next_page_token, abortSignal);
            return [...currentBars, ...nextBars];
        }

        return currentBars;
    }

    async getBars(props: BacktestMarketDataProps, abortSignal?: AbortSignal): Promise<Bar[]> {
        return this.getAlpacaBars(props, undefined, abortSignal);
    }

    get isConfigured(): { isValid: boolean; error?: string } {
        return { isValid: !!this.settings?.apiKey && !!this.settings?.apiSecret };
    }

    private getAlpacaTimeframe(value: string, period: string): string {
        const numValue = parseInt(value);

        switch (period) {
            case "minute":
                return `${numValue}Min`;
            case "hour":
                return `${numValue}Hour`;
            case "day":
                return `${numValue}Day`;
            case "week":
                return `${numValue}Week`;
            case "month":
                return `${numValue}Month`;
            default:
                return "1Day"; // Default fallback
        }
    }

    renderSettings(initialSettings: Record<string, any>, onSettingsChange: (settings: Record<string, any>) => void): React.ReactNode {
        const [apiKey, setApiKey] = useState(initialSettings.apiKey ?? "");
        const [apiSecret, setApiSecret] = useState(initialSettings.apiSecret ?? "");

        useEffect(() => {
            onSettingsChange({ apiKey, apiSecret });
            this.settings = { apiKey, apiSecret };
        }, [apiKey, apiSecret]);

        return <ApiConfiguration apiKey={apiKey} apiSecret={apiSecret} onApiKeyChange={setApiKey} onApiSecretChange={setApiSecret} />;
    }
}
