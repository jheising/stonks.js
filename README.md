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
- Node.js 18+ and npm/yarn
- Alpaca Markets account (free tier available)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backtester
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
if (data.stepIndex === 0) {
  const sharesToBuy = Math.floor(1000 / data.currentBar.open);
  result.changeInShares = sharesToBuy;
  result.price = data.currentBar.open;
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
data.stepIndex        // Current time step (0-based)
data.currentBar       // Current price bar
data.previousBar      // Previous price bar  
data.nextBar          // Next price bar (for reference)
data.currentPortfolio // Portfolio state (shares, cash, value)
data.bars            // All historical bars
data.strategyResults // Previous strategy results
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
result.changeInShares = 10;           // Buy 10 shares (negative to sell)
result.price = data.currentBar.close; // Execution price (optional)
result.meta = { reason: "RSI signal" }; // Custom metadata (optional)
```

### Example Strategies

#### Moving Average Crossover
```javascript
// Calculate simple moving averages
const sma20 = data.bars.slice(-20).reduce((sum, bar) => sum + bar.close, 0) / 20;
const sma50 = data.bars.slice(-50).reduce((sum, bar) => sum + bar.close, 0) / 50;

if (data.stepIndex >= 50) { // Ensure we have enough data
  if (sma20 > sma50 && data.currentPortfolio.sharesOwned === 0) {
    // Buy signal
    const sharesToBuy = Math.floor(data.currentPortfolio.availableCash / data.currentBar.close);
    result.changeInShares = sharesToBuy;
    result.price = data.currentBar.close;
    result.meta = { signal: "buy", sma20, sma50 };
  } else if (sma20 < sma50 && data.currentPortfolio.sharesOwned > 0) {
    // Sell signal
    result.changeInShares = -data.currentPortfolio.sharesOwned;
    result.price = data.currentBar.close;
    result.meta = { signal: "sell", sma20, sma50 };
  }
}
```

#### RSI Strategy
```javascript
// Simple RSI implementation
if (data.stepIndex >= 14) {
  const gains = [];
  const losses = [];
  
  for (let i = 1; i <= 14; i++) {
    const change = data.bars[data.stepIndex - i + 1].close - data.bars[data.stepIndex - i].close;
    if (change > 0) gains.push(change);
    else losses.push(Math.abs(change));
  }
  
  const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / 14;
  const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / 14;
  const rsi = 100 - (100 / (1 + (avgGain / avgLoss)));
  
  if (rsi < 30 && data.currentPortfolio.sharesOwned === 0) {
    // Oversold - buy
    const sharesToBuy = Math.floor(data.currentPortfolio.availableCash / data.currentBar.close);
    result.changeInShares = sharesToBuy;
    result.meta = { rsi, signal: "oversold" };
  } else if (rsi > 70 && data.currentPortfolio.sharesOwned > 0) {
    // Overbought - sell
    result.changeInShares = -data.currentPortfolio.sharesOwned;
    result.meta = { rsi, signal: "overbought" };
  }
}
```

## 🏗️ Technical Architecture

### Frontend Stack
- **React 19** with TypeScript for type safety
- **Vite** for fast development and building
- **TailwindCSS** for modern, responsive styling
- **Monaco Editor** for advanced code editing experience
- **Luxon** for date/time handling

### Key Components
- `CodeEditor` - Monaco-based strategy editor with TypeScript support
- `BacktestParameters` - Form for configuring backtest settings
- `ResultsDisplay` - Interactive results dashboard with data visualization
- `ApiConfiguration` - Secure API credential management

### Data Flow
1. User writes strategy in Monaco editor
2. Code is validated and transpiled to executable JavaScript
3. Alpaca API fetches historical market data
4. Backtesting engine executes strategy against historical data
5. Results are displayed with interactive charts and tables

## 🔒 Security & Privacy

- **Local Storage**: All data stored locally in browser
- **No Server**: Pure client-side application
- **API Keys**: Stored securely in localStorage (consider using environment variables for production)
- **HTTPS Required**: Alpaca API requires secure connections

## 🚀 GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### **Automatic Deployment Setup**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **"GitHub Actions"**
   - The deployment will automatically trigger on the next push to `main`

3. **Access Your Demo**
   - Your app will be available at: `https://yourusername.github.io/backtester/`
   - GitHub will provide the exact URL in the Pages settings

### **Manual Local Testing**

Test the production build locally before deploying:

```bash
# Build for GitHub Pages
yarn build:github

# Preview the production build
yarn deploy:preview
```

### **Deployment Configuration**

The project includes:
- **Vite config** optimized for GitHub Pages with correct base paths
- **GitHub Actions workflow** (`.github/workflows/deploy.yml`) for automatic deployment
- **Production environment** handling for asset paths

### **Troubleshooting Deployment**

If deployment fails:
1. Check the **Actions** tab in your GitHub repository for error logs
2. Ensure your repository is public or you have GitHub Pro for private repo Pages
3. Verify the branch name is `main` (or update the workflow file)
4. Make sure GitHub Pages is enabled in repository settings
5. Verify `yarn.lock` is committed to the repository (required for GitHub Actions)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-strategy`)
3. Commit your changes (`git commit -m 'Add amazing strategy feature'`)
4. Push to the branch (`git push origin feature/amazing-strategy`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Alpaca Markets](https://alpaca.markets/) for providing market data API
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the excellent code editing experience
- [TailwindCSS](https://tailwindcss.com/) for beautiful, responsive styling

## 📞 Support

- 🐛 **Issues**: Report bugs via GitHub Issues
- 💡 **Feature Requests**: Submit via GitHub Discussions
- 📧 **Contact**: [Your contact information]

---

**Happy Trading! 📈💰**

> ⚠️ **Disclaimer**: This tool is for educational and research purposes only. Past performance does not guarantee future results. Always do your own research before making investment decisions.
