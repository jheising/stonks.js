# ColoredValue Component

A reusable React component for displaying values with conditional color coding based on various rules.

## Usage

```tsx
import { ColoredValue } from './components/ColoredValue'
```

## Rule Types

### 1. Positive-Negative
Colors values based on whether they're positive (green), negative (red), or zero (yellow).

```tsx
<ColoredValue 
  rule={{ type: 'positive-negative', value: percentChange }}
  format={(v) => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(2)}%`}
/>
```

### 2. Threshold (Higher is Better)
Colors based on thresholds where higher values are better.

```tsx
<ColoredValue 
  rule={{ 
    type: 'threshold', 
    value: sharpeRatio, 
    goodThreshold: 1,      // Green if >= 1
    okThreshold: 0         // Yellow if >= 0, Red otherwise
  }}
  format={(v) => v.toFixed(2)}
/>
```

### 3. Inverted Threshold (Lower is Better)
Colors based on thresholds where lower values are better.

```tsx
<ColoredValue 
  rule={{ 
    type: 'inverted-threshold', 
    value: expense, 
    goodThreshold: 100,    // Green if <= 100
    okThreshold: 200       // Yellow if <= 200, Red otherwise
  }}
  format={(v) => `$${v.toFixed(2)}`}
/>
```

### 4. Range
Colors based on whether value falls within specified ranges.

```tsx
<ColoredValue 
  rule={{ 
    type: 'range', 
    value: beta, 
    goodRange: [0.8, 1.2],           // Green if within this range
    okRange: [0.5, 1.5]              // Yellow if within this range
  }}
  format={(v) => v.toFixed(2)}
/>
```

### 5. Custom
Allows custom color logic for complex scenarios.

```tsx
<ColoredValue 
  rule={{ 
    type: 'custom', 
    value: beta,
    getColor: (v) => {
      if (Math.abs(v - 1) < 0.2) return 'text-yellow-300'
      if (v > 1) return 'text-pink-300'
      return 'text-teal-300'
    }
  }}
  format={(v) => v.toFixed(2)}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `rule` | `ColorRule` | Yes | The coloring rule to apply |
| `format` | `(value: number) => string` | No | Function to format the displayed value |
| `className` | `string` | No | Additional CSS classes to apply |

## Color Classes

The component uses these Tailwind color classes:
- `text-teal-300` - Green (good/positive)
- `text-yellow-300` - Yellow (okay/neutral)
- `text-pink-300` - Red (bad/negative)

## Examples from the App

### Market Performance
```tsx
<ColoredValue 
  rule={{ type: 'positive-negative', value: portfolioPercentChange }}
  format={(v) => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(2)}%`}
/>
```

### Sharpe Ratio
```tsx
<ColoredValue 
  rule={{ type: 'threshold', value: sharpeRatio, goodThreshold: 1, okThreshold: 0 }}
  format={(v) => v.toFixed(2)}
/>
```

### Beta (Custom Logic)
```tsx
<ColoredValue 
  rule={{ 
    type: 'custom', 
    value: beta,
    getColor: (v) => Math.abs(v - 1) < 0.2 ? 'text-yellow-300' : v > 1 ? 'text-pink-300' : 'text-teal-300'
  }}
  format={(v) => v.toFixed(2)}
/>
```

### Buy/Sell Shares in Table
```tsx
<ColoredValue 
  rule={{ type: 'positive-negative', value: changeInShares }}
  format={(v) => `${v > 0 ? '+' : ''}${v}`}
/>
```

