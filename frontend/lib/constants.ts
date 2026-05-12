/**
 * Shared constants for the HarvestAlert application
 * Includes color palette, spacing scale, breakpoints, and typography definitions
 */

// Color Palette
export const colors = {
  // Brand colors
  primary: '#2563eb', // blue-600
  primaryHover: '#1d4ed8', // blue-700
  
  // Risk level colors (matching map markers)
  riskLow: '#22c55e', // green-500
  riskMedium: '#eab308', // yellow-500
  riskHigh: '#ef4444', // red-500
  
  // Neutral colors
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray600: '#4b5563',
  gray900: '#111827',
  
  // Semantic colors
  success: '#10b981', // green-500
  warning: '#f59e0b', // amber-500
  error: '#ef4444', // red-500
  info: '#3b82f6', // blue-500
} as const

// Spacing Scale
export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
} as const

// Breakpoints (matching Tailwind defaults)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// Breakpoint values in pixels for JavaScript usage
export const breakpointValues = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// Typography definitions (Tailwind class names)
export const typography = {
  // Headings
  h1: 'text-3xl font-bold', // 30px
  h2: 'text-2xl font-semibold', // 24px
  h3: 'text-xl font-semibold', // 20px
  
  // Body text
  body: 'text-base', // 16px
  bodySmall: 'text-sm', // 14px
  caption: 'text-xs', // 12px
  
  // Font weights
  normal: 'font-normal', // 400
  medium: 'font-medium', // 500
  semibold: 'font-semibold', // 600
  bold: 'font-bold', // 700
} as const

// LocalStorage keys
export const STORAGE_KEYS = {
  ONBOARDING: 'harvestalert:onboarding',
  HERO: 'harvestalert:hero',
  HELP_PREFS: 'harvestalert:help-prefs',
} as const

// Navigation routes
export const routes = {
  dashboard: '/',
  about: '/about',
  howItWorks: '/how-it-works',
  // Hidden from navigation
  componentsDemo: '/components-demo',
  mapDemo: '/map-demo',
} as const

// Animation durations (in milliseconds)
export const animations = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const

// Z-index layers
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
} as const
