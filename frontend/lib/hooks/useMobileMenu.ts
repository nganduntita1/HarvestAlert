'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * useMobileMenu Hook
 * 
 * Manages mobile menu state with:
 * - Open/close state management
 * - Body scroll locking when menu is open
 * - ESC key handler to close menu
 * - Outside click detection (handled by component)
 * 
 * Requirements: 9.2, 9.3, 9.5
 */

interface UseMobileMenuOptions {
  onClose?: () => void
}

interface UseMobileMenuReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export function useMobileMenu(
  initialState: boolean = false,
  options: UseMobileMenuOptions = {}
): UseMobileMenuReturn {
  const [isOpen, setIsOpen] = useState(initialState)

  const close = useCallback(() => {
    setIsOpen(false)
    options.onClose?.()
  }, [options])

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  // Handle body scroll locking
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY
      
      // Lock body scroll
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'

      return () => {
        // Restore body scroll
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        
        // Restore scroll position
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        close()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen, close])

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}
