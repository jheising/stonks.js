// LocalStorage keys
export const STORAGE_KEYS = {
  DATA_PROVIDER_SETTINGS: 'backtest_data_provider_settings',
  STRATEGY_CODE: 'backtest_strategy_code',
  START_DATE: 'backtest_start_date',
  END_DATE: 'backtest_end_date',
  STOCK_SYMBOL: 'backtest_stock_symbol',
  STARTING_AMOUNT: 'backtest_starting_amount',
  CODE_VERSIONS: 'backtest_code_versions',
  SHOW_INSTRUCTIONS: 'backtest_show_instructions',
  BAR_RESOLUTION_VALUE: 'backtest_bar_resolution_value',
  BAR_RESOLUTION_PERIOD: 'backtest_bar_resolution_period',
  BACKTEST_SETTINGS: 'backtest_settings',
} as const

// Bar resolution types
export const TIME_PERIODS = {
  MINUTE: 'minute',
  HOUR: 'hour', 
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month'
} as const

export type TimePeriod = typeof TIME_PERIODS[keyof typeof TIME_PERIODS]
