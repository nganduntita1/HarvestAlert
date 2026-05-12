import { useState, useEffect, useCallback } from 'react'

/**
 * TypeScript interfaces for localStorage schemas
 */

// Onboarding state schema
export interface OnboardingState {
  completed: boolean
  lastShown: string // ISO timestamp
  version: string // for future migrations
}

// Hero section state schema
export interface HeroState {
  dismissed: boolean
  dismissedAt: string // ISO timestamp
}

// Help menu preferences schema
export interface HelpPreferences {
  showOnboarding: boolean
}

/**
 * Custom hook for managing state in localStorage with TypeScript support
 * 
 * @param key - The localStorage key
 * @param initialValue - The initial value if no stored value exists
 * @returns A tuple of [value, setValue] similar to useState
 * 
 * @example
 * const [hero, setHero] = useLocalStorage<HeroState>('harvestalert:hero', { dismissed: false, dismissedAt: '' })
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // If error also return initialValue
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value
        
        // Save state
        setStoredValue(valueToStore)
        
        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        // Handle localStorage errors gracefully
        if (error instanceof DOMException) {
          if (error.name === 'QuotaExceededError') {
            console.warn(
              `LocalStorage quota exceeded for key "${key}". Consider clearing old data.`
            )
          } else if (error.name === 'SecurityError') {
            console.warn(
              `LocalStorage access denied for key "${key}". This may occur in private browsing mode.`
            )
          } else {
            console.warn(`Error writing to localStorage key "${key}":`, error)
          }
        } else {
          console.warn(`Error writing to localStorage key "${key}":`, error)
        }
        
        // Still update React state even if localStorage fails
        const valueToStore =
          value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
      }
    },
    [key, storedValue]
  )

  // Listen for changes to this key from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue]
}

/**
 * Utility function to safely clear a localStorage key
 * 
 * @param key - The localStorage key to clear
 * @returns true if successful, false otherwise
 */
export function clearLocalStorageKey(key: string): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    window.localStorage.removeItem(key)
    return true
  } catch (error) {
    console.warn(`Error clearing localStorage key "${key}":`, error)
    return false
  }
}

/**
 * Utility function to safely read from localStorage without React state
 * 
 * @param key - The localStorage key
 * @param defaultValue - The default value if key doesn't exist
 * @returns The parsed value or defaultValue
 */
export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue
  }

  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error)
    return defaultValue
  }
}

/**
 * Utility function to safely write to localStorage without React state
 * 
 * @param key - The localStorage key
 * @param value - The value to store
 * @returns true if successful, false otherwise
 */
export function setLocalStorageItem<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === 'QuotaExceededError') {
        console.warn(
          `LocalStorage quota exceeded for key "${key}". Consider clearing old data.`
        )
      } else if (error.name === 'SecurityError') {
        console.warn(
          `LocalStorage access denied for key "${key}". This may occur in private browsing mode.`
        )
      }
    }
    console.warn(`Error writing to localStorage key "${key}":`, error)
    return false
  }
}
