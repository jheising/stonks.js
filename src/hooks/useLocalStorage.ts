import { useState, useCallback } from 'react'

// Custom hook for localStorage with auto-save
export function useLocalStorage<T>(key: string, defaultValue: T, autoSave = true) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  })

  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      setValue((prev) => {
        const valueToStore = newValue instanceof Function ? newValue(prev) : newValue
        if (autoSave) {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
          setLastSaved(new Date())
        }
        return valueToStore
      })
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, autoSave])

  const clearStorage = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setValue(defaultValue)
      setLastSaved(null)
    } catch (error) {
      console.warn(`Error clearing localStorage key "${key}":`, error)
    }
  }, [key, defaultValue])

  return [value, setStoredValue, { lastSaved, clearStorage }] as const
}
