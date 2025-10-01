import React, { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";
import type { IChartApi, ISeriesApi, CandlestickData, LineData, UTCTimestamp } from "lightweight-charts";
import type { BacktestResult } from "../types/backtesting";
import { Eye, EyeOff } from "lucide-react";

interface PerformanceChartProps {
    backtestResult: BacktestResult;
}

interface SeriesToggle {
    candlestick: boolean;
    portfolioValue: boolean;
    cash: boolean;
    sharesOwned: boolean;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ backtestResult }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const portfolioValueSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
    const cashSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
    const sharesOwnedSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

    const [seriesVisible, setSeriesVisible] = useState<SeriesToggle>({
        candlestick: true,
        portfolioValue: true,
        cash: true,
        sharesOwned: true
    });

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Create chart
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { color: "#1a1d23" },
                textColor: "#d1d5db"
            },
            grid: {
                vertLines: { color: "#2b3139" },
                horzLines: { color: "#2b3139" }
            },
            width: chartContainerRef.current.clientWidth,
            height: 500,
            timeScale: {
                timeVisible: true,
                secondsVisible: false
            },
            rightPriceScale: {
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.2
                }
            },
            leftPriceScale: {
                visible: true,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.2
                }
            }
        });

        chartRef.current = chart;

        // Prepare data
        const candlestickData: CandlestickData[] = [];
        const portfolioValueData: LineData[] = [];
        const cashData: LineData[] = [];
        const sharesOwnedData: LineData[] = [];

        backtestResult.history.forEach(item => {
            const timestamp = (new Date(item.bar.timestamp).getTime() / 1000) as UTCTimestamp;

            candlestickData.push({
                time: timestamp,
                open: item.bar.open,
                high: item.bar.high,
                low: item.bar.low,
                close: item.bar.close
            });

            portfolioValueData.push({
                time: timestamp,
                value: item.portfolioSnapshot.portfolioValue
            });

            cashData.push({
                time: timestamp,
                value: item.portfolioSnapshot.availableCash
            });

            sharesOwnedData.push({
                time: timestamp,
                value: item.portfolioSnapshot.sharesOwned
            });
        });

        // Create candlestick series
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: "#2dd4bf",
            downColor: "#f9a8d4",
            borderVisible: false,
            wickUpColor: "#2dd4bf",
            wickDownColor: "#f9a8d4",
            priceScaleId: "right"
        });
        candlestickSeries.setData(candlestickData);
        candlestickSeriesRef.current = candlestickSeries;

        // Create portfolio value line series
        const portfolioValueSeries = chart.addSeries(LineSeries, {
            color: "#fbbf24",
            lineWidth: 2,
            title: "Portfolio Value",
            priceScaleId: "left"
        });
        portfolioValueSeries.setData(portfolioValueData);
        portfolioValueSeriesRef.current = portfolioValueSeries;

        // Create cash line series
        const cashSeries = chart.addSeries(LineSeries, {
            color: "#60a5fa",
            lineWidth: 2,
            title: "Cash",
            priceScaleId: "left"
        });
        cashSeries.setData(cashData);
        cashSeriesRef.current = cashSeries;

        // Create shares owned line series
        const sharesOwnedSeries = chart.addSeries(LineSeries, {
            color: "#c084fc",
            lineWidth: 2,
            title: "Shares Owned",
            priceScaleId: "left"
        });
        sharesOwnedSeries.setData(sharesOwnedData);
        sharesOwnedSeriesRef.current = sharesOwnedSeries;

        // Fit content
        chart.timeScale().fitContent();

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth
                });
            }
        };

        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
        };
    }, [backtestResult]);

    // Handle series visibility toggle
    useEffect(() => {
        if (!chartRef.current) return;

        // Handle candlestick series
        if (seriesVisible.candlestick && !candlestickSeriesRef.current) {
            const candlestickData: CandlestickData[] = backtestResult.history.map(item => ({
                time: (new Date(item.bar.timestamp).getTime() / 1000) as UTCTimestamp,
                open: item.bar.open,
                high: item.bar.high,
                low: item.bar.low,
                close: item.bar.close
            }));

            const candlestickSeries = chartRef.current.addSeries(CandlestickSeries, {
                upColor: "#2dd4bf",
                downColor: "#f9a8d4",
                borderVisible: false,
                wickUpColor: "#2dd4bf",
                wickDownColor: "#f9a8d4",
                priceScaleId: "right"
            });
            candlestickSeries.setData(candlestickData);
            candlestickSeriesRef.current = candlestickSeries;
        } else if (!seriesVisible.candlestick && candlestickSeriesRef.current) {
            chartRef.current.removeSeries(candlestickSeriesRef.current);
            candlestickSeriesRef.current = null;
        }

        // Handle portfolio value series
        if (seriesVisible.portfolioValue && !portfolioValueSeriesRef.current) {
            const portfolioValueData: LineData[] = backtestResult.history.map(item => ({
                time: (new Date(item.bar.timestamp).getTime() / 1000) as UTCTimestamp,
                value: item.portfolioSnapshot.portfolioValue
            }));

            const portfolioValueSeries = chartRef.current.addSeries(LineSeries, {
                color: "#fbbf24",
                lineWidth: 2,
                title: "Portfolio Value",
                priceScaleId: "left"
            });
            portfolioValueSeries.setData(portfolioValueData);
            portfolioValueSeriesRef.current = portfolioValueSeries;
        } else if (!seriesVisible.portfolioValue && portfolioValueSeriesRef.current) {
            chartRef.current.removeSeries(portfolioValueSeriesRef.current);
            portfolioValueSeriesRef.current = null;
        }

        // Handle cash series
        if (seriesVisible.cash && !cashSeriesRef.current) {
            const cashData: LineData[] = backtestResult.history.map(item => ({
                time: (new Date(item.bar.timestamp).getTime() / 1000) as UTCTimestamp,
                value: item.portfolioSnapshot.availableCash
            }));

            const cashSeries = chartRef.current.addSeries(LineSeries, {
                color: "#60a5fa",
                lineWidth: 2,
                title: "Cash",
                priceScaleId: "left"
            });
            cashSeries.setData(cashData);
            cashSeriesRef.current = cashSeries;
        } else if (!seriesVisible.cash && cashSeriesRef.current) {
            chartRef.current.removeSeries(cashSeriesRef.current);
            cashSeriesRef.current = null;
        }

        // Handle shares owned series
        if (seriesVisible.sharesOwned && !sharesOwnedSeriesRef.current) {
            const sharesOwnedData: LineData[] = backtestResult.history.map(item => ({
                time: (new Date(item.bar.timestamp).getTime() / 1000) as UTCTimestamp,
                value: item.portfolioSnapshot.sharesOwned
            }));

            const sharesOwnedSeries = chartRef.current.addSeries(LineSeries, {
                color: "#c084fc",
                lineWidth: 2,
                title: "Shares Owned",
                priceScaleId: "left"
            });
            sharesOwnedSeries.setData(sharesOwnedData);
            sharesOwnedSeriesRef.current = sharesOwnedSeries;
        } else if (!seriesVisible.sharesOwned && sharesOwnedSeriesRef.current) {
            chartRef.current.removeSeries(sharesOwnedSeriesRef.current);
            sharesOwnedSeriesRef.current = null;
        }
    }, [seriesVisible, backtestResult]);

    const toggleSeries = (series: keyof SeriesToggle) => {
        setSeriesVisible(prev => ({
            ...prev,
            [series]: !prev[series]
        }));
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => toggleSeries("candlestick")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors ${
                        seriesVisible.candlestick ? "bg-teal-400/20 text-teal-300" : "bg-tuna-600 text-tuna-400"
                    }`}
                >
                    {seriesVisible.candlestick ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>Candlestick</span>
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: "#2dd4bf" }}></div>
                </button>

                <button
                    onClick={() => toggleSeries("portfolioValue")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors ${
                        seriesVisible.portfolioValue ? "bg-yellow-400/20 text-yellow-400" : "bg-tuna-600 text-tuna-400"
                    }`}
                >
                    {seriesVisible.portfolioValue ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>Portfolio Value</span>
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: "#fbbf24" }}></div>
                </button>

                <button
                    onClick={() => toggleSeries("cash")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors ${
                        seriesVisible.cash ? "bg-blue-400/20 text-blue-400" : "bg-tuna-600 text-tuna-400"
                    }`}
                >
                    {seriesVisible.cash ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>Cash</span>
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: "#60a5fa" }}></div>
                </button>

                <button
                    onClick={() => toggleSeries("sharesOwned")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors ${
                        seriesVisible.sharesOwned ? "bg-purple-400/20 text-purple-400" : "bg-tuna-600 text-tuna-400"
                    }`}
                >
                    {seriesVisible.sharesOwned ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>Shares Owned</span>
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: "#c084fc" }}></div>
                </button>
            </div>

            <div ref={chartContainerRef} className="w-full rounded-lg overflow-hidden border border-tuna-600" />
        </div>
    );
};
