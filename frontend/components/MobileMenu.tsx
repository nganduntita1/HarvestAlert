'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'

/**
 * MobileMenu Component
 * 
 * Slide-in mobile navigation menu with:
 * - Slide-in animation from right with overlay backdrop
 * - Close button and outside-click detection
 * - ESC key handler to close menu
 * - Smooth CSS transforms (300ms animation)
 * - ARIA attributes for accessibility (role="dialog", aria-modal="true")
 * 
 * Requirements: 1.7, 9.2, 9.3, 9.4, 9.5, 13.5
 */

export interface NavLink {
  href: string
  label: string
  icon?: React.ReactNode
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  links: NavLink[]
  currentPath?: string
}

export default function MobileMenu({
  isOpen,
  onClose,
  links,
  currentPath = '',
}: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen, onClose])

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (isOpen) {
      // Add a small delay to prevent immediate closing when opening
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleOutsideClick)
      }, 100)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleOutsideClick)
      }
    }
  }, [isOpen, onClose])

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

  const isActive = (href: string) => {
    if (href === '/') {
      return currentPath === '/'
    }
    return currentPath.startsWith(href)
  }

  if (!isOpen) {
    return null
  }

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Mobile Menu Panel */}
      <div
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
        className="fixed top-0 right-0 bottom-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
            aria-label="Close menu"
          >
            <span className="sr-only">Close menu</span>
            {/* X Icon */}
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6" aria-label="Mobile navigation">
          <ul role="list" className="space-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isActive(link.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.icon && (
                    <span className="flex-shrink-0" aria-hidden="true">
                      {link.icon}
                    </span>
                  )}
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}
