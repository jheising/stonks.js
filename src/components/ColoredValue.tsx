import React from 'react'

export type ColorRule = 
  | { type: 'positive-negative'; value: number }
  | { type: 'threshold'; value: number; goodThreshold: number; okThreshold?: number }
  | { type: 'inverted-threshold'; value: number; goodThreshold: number; okThreshold?: number }
  | { type: 'range'; value: number; goodRange: [number, number]; okRange?: [number, number] }
  | { type: 'custom'; value: number; getColor: (value: number) => string }

interface ColoredValueProps {
  rule: ColorRule
  format?: (value: number) => string
  className?: string
}

export const ColoredValue: React.FC<ColoredValueProps> = ({ rule, format, className = '' }) => {
  const getColor = (): string => {
    switch (rule.type) {
      case 'positive-negative':
        // Green for positive, red for negative, yellow for zero
        if (rule.value > 0) return 'text-teal-300'
        if (rule.value < 0) return 'text-pink-300'
        return 'text-yellow-300'
      
      case 'threshold':
        // Higher is better
        if (rule.value >= rule.goodThreshold) return 'text-teal-300'
        if (rule.okThreshold !== undefined && rule.value >= rule.okThreshold) return 'text-yellow-300'
        return 'text-pink-300'
      
      case 'inverted-threshold':
        // Lower is better
        if (rule.value <= rule.goodThreshold) return 'text-teal-300'
        if (rule.okThreshold !== undefined && rule.value <= rule.okThreshold) return 'text-yellow-300'
        return 'text-pink-300'
      
      case 'range':
        // Value should be within a specific range
        const [goodMin, goodMax] = rule.goodRange
        if (rule.value >= goodMin && rule.value <= goodMax) return 'text-teal-300'
        
        if (rule.okRange) {
          const [okMin, okMax] = rule.okRange
          if (rule.value >= okMin && rule.value <= okMax) return 'text-yellow-300'
        }
        return 'text-pink-300'
      
      case 'custom':
        return rule.getColor(rule.value)
      
      default:
        return ''
    }
  }

  const formattedValue = format ? format(rule.value) : rule.value.toString()
  const colorClass = getColor()

  return <span className={`${colorClass} ${className}`}>{formattedValue}</span>
}

