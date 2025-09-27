# 📈 stonks.js

A modern, web-based backtesting platform for stock trading strategies. Build, test, and analyze your trading algorithms with real market data from Alpaca Markets.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## 🚀 Features

### 📝 **Code Editor with Monaco**
- Full-featured TypeScript/JavaScript editor with syntax highlighting
- IntelliSense and auto-completion
- Built-in strategy templates and examples
- Real-time code validation
- **Enhanced error highlighting** with line-specific visual indicators
- **Precise error reporting** with line numbers and code context
- **Auto-clearing errors** when code changes or new backtests run

### 📊 **Real Market Data Integration**
- Connect to Alpaca Markets API for live stock data
- Support for both daily and minute-level data
- Automatic timeframe selection based on date range
- IEX data feed for reliable market information

### 🧮 **Advanced Backtesting Engine**
- Execute custom trading strategies on historical data
- Portfolio tracking with real-time value calculations
- Buy & Hold comparison benchmarking
- Detailed transaction history and metadata

### 📈 **Interactive Results Dashboard**
- Performance metrics and summary cards
- Color-coded portfolio value changes (green ↗️ / red ↘️)
- Detailed transaction table with expandable metadata
- Strategy vs Buy & Hold performance comparison
- CSV export functionality

### 💾 **Smart Persistence**
- Auto-save API credentials, parameters, and strategy code
- Version history for strategy iterations
- Local storage with timestamp tracking
- Resume work seamlessly across sessions

## 🛠️ Installation

### Prerequisites
- Node.js 20.19.0+ or 22+ (required by Vite React plugin)
- Yarn package manager
- Alpaca Markets account (free tier available)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stonks.js
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start development server**
   ```bash
   yarn dev
   ```

4. **Get Alpaca API credentials**
   - Sign up at [Alpaca Markets](https://alpaca.markets/)
   - Generate paper trading API keys
   - Enter credentials in the app's API Configuration section

## 🎯 Quick Start

### 1. Configure API Access
- Open the API Configuration panel
- Enter your Alpaca API Key and Secret
- Credentials are automatically saved locally

### 2. Set Backtest Parameters
- **Stock Symbol**: Enter any valid ticker (e.g., AAPL, MSFT, TSLA)
- **Starting Amount**: Initial portfolio value (e.g., $10,000)
- **Date Range**: Select start and end dates for backtesting
- **Time Frame**: Automatically selected (1-minute for same-day, daily for longer periods)

### 3. Write Your Strategy
```javascript
// Example: Simple buy and hold strategy
if (data.dayNumber === 0) {
  const sharesToBuy = Math.floor(1000 / data.nextBar.open);
  result.changeInShares = sharesToBuy;
  result.price = data.nextBar.open; // Optional - defaults to nextBar.open if not specified
} else {
  // Hold for the rest of the period
  result.changeInShares = 0;
}
```

### 4. Run Backtest
- Click "Run Backtest" to execute your strategy
- View results in the interactive dashboard
- Export data to CSV for further analysis

## 📚 Strategy Development Guide

### Available Data Properties
```javascript
data.dayNumber        // Current day (0-based)
data.currentBar       // Current price bar
data.previousBar      // Previous price bar  
data.nextBar          // Next price bar (for reference)
data.currentPortfolio // Portfolio state (shares, cash, value)
data.history         // Array of previous strategy results and portfolio snapshots
```

### Bar Object Structure
```javascript
{
  timestamp: "2024-01-15T09:30:00Z",
  open: 150.25,
  high: 152.30,
  low: 149.80,
  close: 151.75,
  volume: 1234567
}
```

### Strategy Result Object
```javascript
// Modify the result object (don't return values)
result.changeInShares = 10;         // Buy 10 shares (negative to sell)
result.price = data.nextBar.open;   // Execution price (optional, defaults to nextBar.open)
result.meta = { reason: "RSI signal" }; // Custom metadata (optional)
```

### Example Strategies

#### Moving Average Crossover
```javascript
// Calculate simple moving averages using historical data
if (data.dayNumber >= 50) { // Ensure we have enough data
  // Get last 20 closing prices from history plus current bar
  const last20Closes = data.history.slice(-19).map(h => h.bar.close).concat([data.currentBar.close]);
  const last50Closes = data.history.slice(-49).map(h => h.bar.close).concat([data.currentBar.close]);
  
  const sma20 = last20Closes.reduce((sum, close) => sum + close, 0) / last20Closes.length;
  const sma50 = last50Closes.reduce((sum, close) => sum + close, 0) / last50Closes.length;

  if (sma20 > sma50 && data.currentPortfolio.sharesOwned === 0) {
    // Buy signal
    const sharesToBuy = Math.floor(data.currentPortfolio.availableCash / data.nextBar.open);
    result.changeInShares = sharesToBuy;
    result.price = data.nextBar.open;
    result.meta = { signal: "buy", sma20, sma50 };
  } else if (sma20 < sma50 && data.currentPortfolio.sharesOwned > 0) {
    // Sell signal
    result.changeInShares = -data.currentPortfolio.sharesOwned;
    result.price = data.nextBar.open;
    result.meta = { signal: "sell", sma20, sma50 };
  }
}
```

#### RSI Strategy
```javascript
// Simple RSI implementation using 14-period RSI
if (data.dayNumber >= 13) { // Need at least 14 data points (0-13)
  const gains = [];
  const losses = [];
  
  // Get the last 14 closing prices including current bar
  const recentBars = data.history.slice(-13).map(h => h.bar.close).concat([data.currentBar.close]);
  
  // Calculate price changes over the last 14 periods
  for (let i = 1; i < recentBars.length; i++) {
    const change = recentBars[i] - recentBars[i - 1];
    if (change > 0) {
      gains.push(change);
      losses.push(0);
    } else {
      gains.push(0);
      losses.push(Math.abs(change));
    }
  }
  
  const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / gains.length;
  const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / losses.length;
  const rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + (avgGain / avgLoss)));
  
  if (rsi < 30 && data.currentPortfolio.sharesOwned === 0) {
    // Oversold - buy
    const sharesToBuy = Math.floor(data.currentPortfolio.availableCash / data.nextBar.open);
    result.changeInShares = sharesToBuy;
    result.price = data.nextBar.open;
    result.meta = { rsi, signal: "oversold" };
  } else if (rsi > 70 && data.currentPortfolio.sharesOwned > 0) {
    // Overbought - sell
    result.changeInShares = -data.currentPortfolio.sharesOwned;
    result.price = data.nextBar.open;
    result.meta = { rsi, signal: "overbought" };
  }
}
```

## 🚨 Enhanced Error Handling

The platform includes sophisticated error handling to help debug strategy code:

### **Real-time Error Detection**
- **Syntax errors**: Caught during code compilation with exact line numbers
- **Runtime errors**: Captured during strategy execution with stack trace analysis
- **Type validation**: Monaco editor provides real-time TypeScript validation

### **Visual Error Indicators**
- **Line highlighting**: Red wavy underlines at error locations in Monaco editor
- **Margin indicators**: Red dots in editor gutter for quick error spotting
- **Hover tooltips**: Detailed error messages on hover
- **Auto-scroll**: Automatic navigation to error line when errors occur

### **Detailed Error Information**
- **Precise line numbers**: Accurate mapping from compiled code to source code
- **Code context**: 5-line context window showing surrounding code
- **Error categorization**: Syntax, runtime, or unknown error types
- **Column positions**: Exact character position where errors occur

### **Smart Error Clearing**
- **Auto-clear on edit**: Error highlights disappear when you start typing
- **Backtest reset**: Errors clear when running new backtests
- **Parameter changes**: Previous errors clear when modifying backtest settings

## 🏗️ Technical Architecture

### Frontend Stack
- **React 19** with TypeScript for type safety
- **Vite** for fast development and building
- **TailwindCSS** for modern, responsive styling
- **Monaco Editor** for advanced code editing experience
- **Luxon** for date/time handling

### Key Components
- `CodeEditor` - Monaco-based strategy editor with TypeScript support and error highlighting
- `BacktestParameters` - Form for configuring backtest settings
- `ResultsDisplay` - Interactive results dashboard with enhanced error display
- `ApiConfiguration` - Secure API credential management
- `TypeExtractor` - Dynamic type definition system that syncs TypeScript types with Monaco editor

### Data Flow
1. User writes strategy in Monaco editor with real-time TypeScript validation
2. Code is validated, enhanced with error tracking, and transpiled to executable JavaScript
3. Selected data provider fetches historical market data
4. Backtesting engine executes strategy with enhanced error capture
5. Results are displayed with interactive charts and detailed error reporting if needed

## 🏗️ Data Provider Architecture

The platform uses a modular data provider system that allows easy integration of different market data sources. This architecture separates data fetching logic from the core backtesting engine, making it simple to add support for new APIs.

### 📋 Provider Interface

All data providers must extend the `StockDataProviderBase` abstract class:

```typescript
export abstract class StockDataProviderBase {
  static readonly name: string = "ProviderName";
  
  // Fetch historical market data
  abstract getBars(
    props: BacktestMarketDataProps, 
    abortSignal?: AbortSignal
  ): Promise<Bar[]>;
  
  // Render provider-specific configuration UI
  abstract renderSettings(
    initialSettings: Record<string, any>, 
    onSettingsChange: (settings: Record<string, any>) => void
  ): React.ReactNode;
  
  // Validate provider configuration
  abstract get isConfigured(): { isValid: boolean, error?: string };
}
```

### 🔧 Required Implementation

#### **1. Data Fetching (`getBars`)**
- **Input**: `BacktestMarketDataProps` containing symbol, date range, and bar resolution
- **Output**: Array of `Bar` objects with OHLCV data
- **Features**: 
  - Support for abort signals (cancellation)
  - Handle pagination for large datasets
  - Convert data to standardized `Bar` format
  - Proper error handling and user-friendly messages

#### **2. Settings UI (`renderSettings`)**
- **Purpose**: Render provider-specific configuration (API keys, endpoints, etc.)
- **Input**: Initial settings and change callback
- **Output**: React component for configuration
- **Features**:
  - Real-time validation feedback
  - Secure credential handling
  - Auto-save functionality via callback

#### **3. Configuration Validation (`isConfigured`)**
- **Purpose**: Check if provider is ready to fetch data
- **Output**: Validation result with optional error message
- **Usage**: Enables/disables backtest functionality

### 📊 Data Format Standards

#### **Bar Object Structure**
```typescript
interface Bar {
  timestamp: string;    // ISO 8601 format
  open: number;        // Opening price
  high: number;        // Highest price
  low: number;         // Lowest price  
  close: number;       // Closing price
  volume: number;      // Trading volume
}
```

#### **Market Data Request**
```typescript
interface BacktestMarketDataProps {
  symbol: string;              // Stock ticker (e.g., "AAPL")
  startDate: string;           // ISO date string
  endDate?: string;            // Optional end date
  barResolutionValue: string;  // Resolution value (e.g., "1", "5")
  barResolutionPeriod: string; // Period type ("minute", "hour", "day", "week", "month")
}
```

### 🛠️ Creating a New Data Provider

#### **Step 1: Implement the Provider Class**

```typescript
// src/providers/YourDataProvider.tsx
import React, { useState, useEffect } from "react";
import { StockDataProviderBase } from "./StockDataProviderBase";
import type { Bar, BacktestMarketDataProps } from "../types/backtesting";

export class YourDataProvider extends StockDataProviderBase {
  static readonly name: string = "Your Provider";
  private settings?: { apiKey: string };

  async getBars(props: BacktestMarketDataProps, abortSignal?: AbortSignal): Promise<Bar[]> {
    const { symbol, startDate, endDate, barResolutionValue, barResolutionPeriod } = props;
    
    // Convert resolution to your API's format
    const timeframe = this.convertTimeframe(barResolutionValue, barResolutionPeriod);
    
    // Build API request
    const url = `https://your-api.com/v1/bars/${symbol}?timeframe=${timeframe}&start=${startDate}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.settings?.apiKey}`,
        'Accept': 'application/json'
      },
      signal: abortSignal
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Convert to standard Bar format
    return data.bars.map((bar: any) => ({
      timestamp: bar.timestamp,
      open: Number(bar.open),
      high: Number(bar.high),
      low: Number(bar.low),
      close: Number(bar.close),
      volume: Number(bar.volume)
    }));
  }

  get isConfigured(): { isValid: boolean, error?: string } {
    if (!this.settings?.apiKey) {
      return { isValid: false, error: "API key required" };
    }
    return { isValid: true };
  }

  renderSettings(initialSettings: Record<string, any>, onSettingsChange: (settings: Record<string, any>) => void): React.ReactNode {
    const [apiKey, setApiKey] = useState(initialSettings.apiKey ?? '');

    useEffect(() => {
      onSettingsChange({ apiKey });
      this.settings = { apiKey };
    }, [apiKey]);

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter your API key"
          />
        </div>
      </div>
    );
  }

  private convertTimeframe(value: string, period: string): string {
    // Convert standard resolution to your API's format
    const numValue = parseInt(value);
    switch (period) {
      case 'minute': return `${numValue}m`;
      case 'hour': return `${numValue}h`;
      case 'day': return `${numValue}d`;
      default: return '1d';
    }
  }
}
```

#### **Step 2: Register the Provider**

```typescript
// src/providers/AvailableProviders.ts
import { AlpacaDataProvider } from "./AlpacaDataProvider";
import { YourDataProvider } from "./YourDataProvider";

export const AvailableProviders = [
  AlpacaDataProvider,
  YourDataProvider  // Add your provider here
] as const;
```

#### **Step 3: Test Your Provider**

1. **Start the development server**: `yarn dev`
2. **Select your provider** from the dropdown in the UI
3. **Configure credentials** in the settings panel
4. **Run a backtest** to verify data fetching works correctly

### 🔍 Built-in Providers

#### **Alpaca Markets Provider**
- **Features**: Real-time and historical stock data via IEX feed
- **Requirements**: Free Alpaca account with paper trading API keys
- **Supported Resolutions**: 1min to 1month bars
- **Rate Limits**: 200 requests/minute for free accounts
- **Data Coverage**: US equities, extensive historical data

### 💡 Provider Development Tips

#### **Error Handling Best Practices**
```typescript
// Provide user-friendly error messages
if (response.status === 401) {
  throw new Error('Invalid API credentials. Please check your API key.');
}
if (response.status === 429) {
  throw new Error('Rate limit exceeded. Please wait before trying again.');
}
if (response.status === 404) {
  throw new Error(`Symbol '${symbol}' not found. Please verify the ticker symbol.`);
}
```

#### **Pagination Support**
```typescript
// Handle large datasets with pagination
async getBars(props: BacktestMarketDataProps, abortSignal?: AbortSignal): Promise<Bar[]> {
  let allBars: Bar[] = [];
  let nextPageToken: string | undefined;
  
  do {
    const response = await this.fetchPage(props, nextPageToken, abortSignal);
    allBars.push(...response.bars);
    nextPageToken = response.nextPageToken;
  } while (nextPageToken);
  
  return allBars;
}
```

#### **Timezone Handling**
```typescript
// Ensure consistent timezone handling
import { DateTime } from "luxon";

// Convert to market timezone (e.g., Eastern for US markets)
const marketTime = DateTime.fromISO(bar.timestamp)
  .setZone('America/New_York')
  .toISO();
```

#### **Caching Considerations**
```typescript
// Consider implementing caching for frequently requested data
private cache = new Map<string, { data: Bar[], timestamp: number }>();

private getCacheKey(props: BacktestMarketDataProps): string {
  return `${props.symbol}-${props.startDate}-${props.endDate}-${props.barResolutionValue}${props.barResolutionPeriod}`;
}
```

### 🚀 Advanced Features

#### **Custom Timeframe Support**
Some providers may support custom timeframes not available in the standard resolution options. You can extend the UI by modifying the `BacktestParameters` component to include provider-specific options.

#### **Real-time Data Integration**
While the current architecture focuses on historical backtesting, providers can be extended to support real-time data feeds for live strategy monitoring.

#### **Multiple Asset Classes**
The `Bar` interface can be extended to support additional asset classes (forex, crypto, commodities) by adding provider-specific metadata fields.

## 🔒 Security & Privacy

- **Local Storage**: All data stored locally in browser
- **No Server**: Pure client-side application
- **API Keys**: Stored securely in localStorage with auto-complete prevention
- **HTTPS Required**: Alpaca API requires secure connections
- **Browser Security**: API credential fields prevent password manager save prompts

## 🚀 Building for Production

Build the project for production deployment:

```bash
# Standard production build
yarn build

# Build for GitHub Pages (if deploying to GitHub Pages)
yarn build:github

# Build for root path deployment (custom domains)
yarn build:github-root

# Preview the production build locally
yarn deploy:preview
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-strategy`)
3. Commit your changes (`git commit -m 'Add amazing strategy feature'`)
4. Push to the branch (`git push origin feature/amazing-strategy`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Alpaca Markets](https://alpaca.markets/) for providing market data API
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the excellent code editing experience
- [TailwindCSS](https://tailwindcss.com/) for beautiful, responsive styling

## 📞 Support

- 🐛 **Issues**: Report bugs via GitHub Issues
- 💡 **Feature Requests**: Submit via GitHub Discussions
- 📧 **Contact**: Create an issue on GitHub for support

---

**Happy Trading! 📈💰**

> ⚠️ **Disclaimer**: This tool is for educational and research purposes only. Past performance does not guarantee future results. Always do your own research before making investment decisions.
