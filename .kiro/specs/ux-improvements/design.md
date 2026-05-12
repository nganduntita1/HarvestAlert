# Design Document: UX Improvements

## Overview

This design document specifies the technical implementation for improving the user experience of the HarvestAlert MVP platform. The design focuses on adding navigation, contextual help, informational pages, and better visual organization to make the platform intuitive and accessible for humanitarian workers and decision makers.

### Goals

1. **Improved Navigation**: Add a persistent navigation bar with clear page structure
2. **User Guidance**: Provide contextual help through tooltips and onboarding hints
3. **Information Architecture**: Create dedicated About and How It Works pages
4. **Visual Clarity**: Enhance section organization with clear headings and legends
5. **Mobile Optimization**: Ensure responsive design works well on all devices
6. **Accessibility**: Meet WCAG AA standards for inclusive access

### Non-Goals

- Backend API changes (frontend-only feature)
- User authentication or personalization
- Advanced analytics or tracking
- Multi-language support (future enhancement)
- Custom theming or white-labeling

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React hooks + localStorage
- **Icons**: Heroicons or Lucide React
- **Testing**: Jest, React Testing Library, Playwright

## Architecture

### Component Hierarchy

```
RootLayout (app/layout.tsx)
├── Navigation (new)
│   ├── Logo
│   ├── NavLinks
│   ├── HelpMenu (new)
│   └── MobileMenu (new)
├── Dashboard Page (app/page.tsx - enhanced)
│   ├── HeroSection (new)
│   ├── SectionContainer (new wrapper)
│   │   ├── RiskSummaryCard (enhanced with tooltips)
│   │   ├── Map (with MapLegend)
│   │   └── TrendChart (enhanced with tooltips)
│   └── OnboardingHints (new)
├── About Page (new - app/about/page.tsx)
└── How It Works Page (new - app/how-it-works/page.tsx)
```

### Directory Structure

```
frontend/
├── app/
│   ├── layout.tsx (enhanced with Navigation)
│   ├── page.tsx (Dashboard - enhanced)
│   ├── about/
│   │   └── page.tsx (new)
│   ├── how-it-works/
│   │   └── page.tsx (new)
│   ├── components-demo/
│   │   └── page.tsx (hidden from nav, dev-only)
│   └── map-demo/
│       └── page.tsx (hidden from nav, dev-only)
├── components/
│   ├── Navigation.tsx (new)
│   ├── MobileMenu.tsx (new)
│   ├── HelpMenu.tsx (new)
│   ├── HeroSection.tsx (new)
│   ├── SectionContainer.tsx (new)
│   ├── MapLegend.tsx (new)
│   ├── Tooltip.tsx (new)
│   ├── OnboardingHints.tsx (new)
│   ├── RiskSummaryCard.tsx (enhanced)
│   └── [existing components...]
├── lib/
│   ├── hooks/
│   │   ├── useLocalStorage.ts (new)
│   │   ├── useOnboarding.ts (new)
│   │   └── useMobileMenu.ts (new)
│   └── constants.ts (new - colors, breakpoints, etc.)
└── __tests__/
    └── components/
        ├── navigation.test.tsx (new)
        ├── tooltip.test.tsx (new)
        ├── hero-section.test.tsx (new)
        └── [existing tests...]
```

## Components and Interfaces

### 1. Navigation Component

**Purpose**: Persistent header navigation across all pages

**Props Interface**:
```typescript
interface NavigationProps {
  className?: string
}
```

**State**:
```typescript
{
  isMobileMenuOpen: boolean
  isHelpMenuOpen: boolean
  currentPath: string
}
```

**Key Features**:
- Fixed position at top of viewport
- Responsive: desktop horizontal layout, mobile hamburger menu
- Active page highlighting
- Help menu dropdown
- Keyboard accessible

**Styling Approach**:
- Tailwind classes: `fixed top-0 w-full bg-white border-b shadow-sm z-50`
- Mobile breakpoint: `md:` prefix for desktop styles
- Focus indicators: `focus:ring-2 focus:ring-blue-500`

### 2. MobileMenu Component

**Purpose**: Collapsible navigation for mobile devices

**Props Interface**:
```typescript
interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  links: NavLink[]
}

interface NavLink {
  href: string
  label: string
  icon?: React.ReactNode
}
```

**Key Features**:
- Slide-in animation from right
- Overlay backdrop
- Close on outside click or ESC key
- Smooth CSS transitions

**Animation**:
```css
/* Tailwind classes */
transform: translateX(100%) /* closed */
transform: translateX(0) /* open */
transition: transform 300ms ease-in-out
```

### 3. HelpMenu Component

**Purpose**: Dropdown menu for help resources

**Props Interface**:
```typescript
interface HelpMenuProps {
  isOpen: boolean
  onClose: () => void
  onShowOnboarding: () => void
}
```

**Menu Items**:
- How It Works (link)
- About (link)
- Show Onboarding Again (action)
- Contact Support (external link)

### 4. HeroSection Component

**Purpose**: Introductory section explaining platform purpose

**Props Interface**:
```typescript
interface HeroSectionProps {
  onDismiss?: () => void
  isDismissible?: boolean
}
```

**State**:
```typescript
{
  isDismissed: boolean // from localStorage
}
```

**Content**:
- Headline: "Early Warning for Food Security Crises"
- Description: Brief explanation of platform purpose
- Target users: Humanitarian workers, field coordinators
- CTA button: "Learn How It Works" → /how-it-works

**Styling**:
- Background: gradient or subtle pattern
- Padding: generous spacing for prominence
- Dismissible: X button in top-right corner

### 5. SectionContainer Component

**Purpose**: Reusable wrapper for dashboard sections

**Props Interface**:
```typescript
interface SectionContainerProps {
  title: string
  description?: string
  helpText?: string
  children: React.ReactNode
  className?: string
}
```

**Features**:
- Consistent padding and spacing
- White background with subtle shadow
- Optional help icon with tooltip
- Responsive margins

**Styling**:
```typescript
className="bg-white rounded-lg shadow-sm p-6 space-y-4"
```

### 6. MapLegend Component

**Purpose**: Explain map color coding

**Props Interface**:
```typescript
interface MapLegendProps {
  position?: 'top' | 'bottom' | 'overlay'
  className?: string
}
```

**Content**:
```typescript
const legendItems = [
  { color: 'risk-low', label: 'Low Risk', description: 'Favorable conditions' },
  { color: 'risk-medium', label: 'Medium Risk', description: 'Monitor closely' },
  { color: 'risk-high', label: 'High Risk', description: 'Immediate attention needed' }
]
```

**Styling**:
- Horizontal layout on desktop, vertical on mobile
- Color swatches matching map markers
- Clear text labels

### 7. Tooltip Component

**Purpose**: Contextual help popups

**Props Interface**:
```typescript
interface TooltipProps {
  content: string | React.ReactNode
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  trigger?: 'hover' | 'click' | 'focus'
}
```

**Implementation**:
- Portal rendering for proper z-index
- Keyboard accessible (focus trigger)
- Auto-positioning to stay in viewport
- ARIA attributes for screen readers

**Accessibility**:
```typescript
<button
  aria-label="Help information"
  aria-describedby="tooltip-content"
  onFocus={showTooltip}
  onBlur={hideTooltip}
>
  <InfoIcon />
</button>
```

### 8. OnboardingHints Component

**Purpose**: First-time user guidance

**Props Interface**:
```typescript
interface OnboardingHintsProps {
  hints: OnboardingHint[]
  onComplete: () => void
}

interface OnboardingHint {
  id: string
  target: string // CSS selector
  content: string
  position: 'top' | 'bottom' | 'left' | 'right'
}
```

**State Management**:
```typescript
{
  currentHintIndex: number
  isComplete: boolean // stored in localStorage
}
```

**Features**:
- Sequential hints with "Next" button
- Skip all option
- Highlight target elements
- Persist completion state

## Data Models

### LocalStorage Schema

```typescript
// Onboarding state
interface OnboardingState {
  completed: boolean
  lastShown: string // ISO timestamp
  version: string // for future migrations
}
// Key: 'harvestalert:onboarding'

// Hero section state
interface HeroState {
  dismissed: boolean
  dismissedAt: string // ISO timestamp
}
// Key: 'harvestalert:hero'

// Help menu preferences
interface HelpPreferences {
  showOnboarding: boolean
}
// Key: 'harvestalert:help-prefs'
```

### Navigation State

```typescript
interface NavigationState {
  currentPath: string
  isMobileMenuOpen: boolean
  isHelpMenuOpen: boolean
}
```

### Page Routes

```typescript
const routes = {
  dashboard: '/',
  about: '/about',
  howItWorks: '/how-it-works',
  // Hidden from navigation
  componentsDemo: '/components-demo',
  mapDemo: '/map-demo'
}
```

## Error Handling

### Component Error Boundaries

Wrap each major section in error boundaries to prevent full page crashes:

```typescript
<ErrorBoundary fallback={<SectionError />}>
  <SectionContainer title="Risk Summary">
    <RiskSummaryCard regions={regions} />
  </SectionContainer>
</ErrorBoundary>
```

### LocalStorage Errors

Handle quota exceeded and access denied errors:

```typescript
function safeSetLocalStorage(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === 'QuotaExceededError') {
        console.warn('LocalStorage quota exceeded')
      } else if (error.name === 'SecurityError') {
        console.warn('LocalStorage access denied (private browsing?)')
      }
    }
    return false
  }
}
```

### Navigation Errors

Handle invalid routes and missing pages:

```typescript
// In Next.js app/not-found.tsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2">Page not found</p>
        <Link href="/" className="mt-4 btn-primary">
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}
```

### Tooltip Positioning Errors

Fallback positioning when target element is near viewport edge:

```typescript
function calculateTooltipPosition(
  targetRect: DOMRect,
  tooltipRect: DOMRect,
  preferredPosition: Position
): Position {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  }
  
  // Check if preferred position fits
  if (fitsInViewport(targetRect, tooltipRect, preferredPosition, viewport)) {
    return preferredPosition
  }
  
  // Try alternative positions
  const alternatives: Position[] = ['top', 'bottom', 'left', 'right']
  for (const position of alternatives) {
    if (fitsInViewport(targetRect, tooltipRect, position, viewport)) {
      return position
    }
  }
  
  // Fallback to top
  return 'top'
}
```

## Testing Strategy

### Testing Approach

This feature is **NOT suitable for property-based testing** because:
1. It's primarily UI rendering and layout (best tested with snapshot/visual regression tests)
2. User interactions are event-driven, not pure functions
3. Browser APIs (localStorage, navigation) involve side effects
4. Responsive design is best tested with viewport-based tests
5. Accessibility requires specialized tools (axe, WAVE)

**Testing Strategy**:
- **Unit Tests**: Component rendering, state management, utility functions
- **Integration Tests**: Component interactions, navigation flow, localStorage
- **E2E Tests**: Full user journeys, responsive behavior, accessibility
- **Visual Regression**: Snapshot tests for layout consistency

### Unit Tests

**Navigation Component**:
```typescript
describe('Navigation', () => {
  it('renders all navigation links', () => {
    render(<Navigation />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('How It Works')).toBeInTheDocument()
  })
  
  it('highlights active page', () => {
    render(<Navigation />)
    const dashboardLink = screen.getByText('Dashboard')
    expect(dashboardLink).toHaveClass('text-blue-600')
  })
  
  it('opens mobile menu on hamburger click', () => {
    render(<Navigation />)
    const hamburger = screen.getByLabelText('Open menu')
    fireEvent.click(hamburger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
```

**Tooltip Component**:
```typescript
describe('Tooltip', () => {
  it('shows tooltip on hover', async () => {
    render(
      <Tooltip content="Help text">
        <button>Hover me</button>
      </Tooltip>
    )
    const button = screen.getByText('Hover me')
    fireEvent.mouseEnter(button)
    await waitFor(() => {
      expect(screen.getByText('Help text')).toBeVisible()
    })
  })
  
  it('is keyboard accessible', () => {
    render(
      <Tooltip content="Help text">
        <button>Focus me</button>
      </Tooltip>
    )
    const button = screen.getByText('Focus me')
    button.focus()
    expect(screen.getByText('Help text')).toBeVisible()
  })
})
```

**HeroSection Component**:
```typescript
describe('HeroSection', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  
  it('renders hero content', () => {
    render(<HeroSection />)
    expect(screen.getByText(/Early Warning/i)).toBeInTheDocument()
  })
  
  it('dismisses and saves to localStorage', () => {
    render(<HeroSection isDismissible />)
    const dismissButton = screen.getByLabelText('Dismiss')
    fireEvent.click(dismissButton)
    
    expect(screen.queryByText(/Early Warning/i)).not.toBeInTheDocument()
    expect(localStorage.getItem('harvestalert:hero')).toBeTruthy()
  })
  
  it('stays dismissed on remount', () => {
    localStorage.setItem('harvestalert:hero', JSON.stringify({ dismissed: true }))
    render(<HeroSection isDismissible />)
    expect(screen.queryByText(/Early Warning/i)).not.toBeInTheDocument()
  })
})
```

**useLocalStorage Hook**:
```typescript
describe('useLocalStorage', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    expect(result.current[0]).toBe('default')
  })
  
  it('persists value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    act(() => {
      result.current[1]('new value')
    })
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new value'))
  })
  
  it('handles localStorage errors gracefully', () => {
    // Mock quota exceeded error
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError')
    })
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    act(() => {
      result.current[1]('new value')
    })
    // Should not throw, should log warning
    expect(result.current[0]).toBe('new value') // State still updates
  })
})
```

### Integration Tests

**Navigation Flow**:
```typescript
describe('Navigation Flow', () => {
  it('navigates between pages', async () => {
    render(<App />)
    
    // Start on dashboard
    expect(screen.getByText('Regional Risk Map')).toBeInTheDocument()
    
    // Navigate to About
    fireEvent.click(screen.getByText('About'))
    await waitFor(() => {
      expect(screen.getByText(/platform's mission/i)).toBeInTheDocument()
    })
    
    // Navigate to How It Works
    fireEvent.click(screen.getByText('How It Works'))
    await waitFor(() => {
      expect(screen.getByText(/prediction methodology/i)).toBeInTheDocument()
    })
  })
})
```

**Onboarding Flow**:
```typescript
describe('Onboarding Flow', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  
  it('shows hints on first visit', () => {
    render(<Dashboard />)
    expect(screen.getByText(/Click markers for details/i)).toBeInTheDocument()
  })
  
  it('progresses through hints', () => {
    render(<Dashboard />)
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)
    expect(screen.getByText(/Colors correspond to risk levels/i)).toBeInTheDocument()
  })
  
  it('completes and persists state', () => {
    render(<Dashboard />)
    const skipButton = screen.getByText('Skip')
    fireEvent.click(skipButton)
    
    expect(localStorage.getItem('harvestalert:onboarding')).toBeTruthy()
    
    // Remount - should not show hints
    render(<Dashboard />)
    expect(screen.queryByText(/Click markers/i)).not.toBeInTheDocument()
  })
})
```

### E2E Tests (Playwright)

**Responsive Navigation**:
```typescript
test.describe('Responsive Navigation', () => {
  test('desktop navigation', async ({ page }) => {
    await page.goto('/')
    await page.setViewportSize({ width: 1280, height: 720 })
    
    // Desktop nav should be visible
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('About')).toBeVisible()
    
    // Hamburger should not be visible
    await expect(page.getByLabel('Open menu')).not.toBeVisible()
  })
  
  test('mobile navigation', async ({ page }) => {
    await page.goto('/')
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Desktop nav should be hidden
    await expect(page.getByText('Dashboard')).not.toBeVisible()
    
    // Hamburger should be visible
    await expect(page.getByLabel('Open menu')).toBeVisible()
    
    // Open mobile menu
    await page.getByLabel('Open menu').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    
    // Navigate
    await page.getByText('About').click()
    await expect(page).toHaveURL('/about')
  })
})
```

**Accessibility**:
```typescript
test.describe('Accessibility', () => {
  test('keyboard navigation', async ({ page }) => {
    await page.goto('/')
    
    // Tab through navigation
    await page.keyboard.press('Tab')
    await expect(page.getByText('Dashboard')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.getByText('About')).toBeFocused()
    
    // Activate with Enter
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL('/about')
  })
  
  test('tooltip keyboard access', async ({ page }) => {
    await page.goto('/')
    
    // Tab to help icon
    const helpIcon = page.getByLabel('Help information')
    await helpIcon.focus()
    
    // Tooltip should appear
    await expect(page.getByText(/criteria for high risk/i)).toBeVisible()
  })
  
  test('screen reader labels', async ({ page }) => {
    await page.goto('/')
    
    // Check ARIA labels
    await expect(page.getByLabel('Main navigation')).toBeVisible()
    await expect(page.getByLabel('Open menu')).toHaveAttribute('aria-label')
    await expect(page.getByLabel('Help information')).toHaveAttribute('aria-describedby')
  })
})
```

### Visual Regression Tests

```typescript
test.describe('Visual Regression', () => {
  test('dashboard layout', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveScreenshot('dashboard.png')
  })
  
  test('mobile menu open', async ({ page }) => {
    await page.goto('/')
    await page.setViewportSize({ width: 375, height: 667 })
    await page.getByLabel('Open menu').click()
    await expect(page).toHaveScreenshot('mobile-menu-open.png')
  })
  
  test('tooltip display', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Help information').first().hover()
    await expect(page).toHaveScreenshot('tooltip-visible.png')
  })
})
```

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage for components and hooks
- **Integration Tests**: All user flows and state management
- **E2E Tests**: Critical paths (navigation, onboarding, responsive)
- **Accessibility**: 100% WCAG AA compliance (automated + manual)

### Testing Tools

- **Jest**: Unit test runner
- **React Testing Library**: Component testing
- **Playwright**: E2E and visual regression
- **axe-core**: Accessibility testing
- **MSW**: API mocking (if needed)

## Implementation Plan

### Phase 1: Core Components (Week 1)

1. Create Navigation component
2. Create MobileMenu component
3. Create HelpMenu component
4. Create SectionContainer component
5. Update RootLayout to include Navigation
6. Add useLocalStorage hook

### Phase 2: Dashboard Enhancements (Week 1-2)

1. Create HeroSection component
2. Create MapLegend component
3. Create Tooltip component
4. Enhance RiskSummaryCard with tooltips
5. Wrap dashboard sections in SectionContainer
6. Add section descriptions

### Phase 3: New Pages (Week 2)

1. Create About page
2. Create How It Works page
3. Add page content and styling
4. Ensure responsive design

### Phase 4: Onboarding (Week 2-3)

1. Create OnboardingHints component
2. Create useOnboarding hook
3. Integrate with Dashboard
4. Add "Show Again" functionality in Help menu

### Phase 5: Demo Page Management (Week 3)

1. Add environment detection
2. Hide demo pages from navigation
3. Add robots meta tags
4. Implement redirects for production

### Phase 6: Testing & Polish (Week 3-4)

1. Write unit tests for all new components
2. Write integration tests for flows
3. Write E2E tests for critical paths
4. Run accessibility audit
5. Fix issues and optimize performance

## Accessibility Considerations

### WCAG AA Compliance

**Color Contrast**:
- Text: minimum 4.5:1 ratio
- Large text: minimum 3:1 ratio
- Interactive elements: minimum 3:1 ratio

**Keyboard Navigation**:
- All interactive elements focusable
- Logical tab order
- Visible focus indicators
- Escape key closes modals/menus

**Screen Readers**:
- Semantic HTML (nav, main, section, article)
- ARIA labels for icons
- ARIA descriptions for tooltips
- ARIA live regions for dynamic content

**Implementation Examples**:

```typescript
// Navigation
<nav aria-label="Main navigation">
  <ul role="list">
    <li>
      <Link href="/" aria-current={isActive ? 'page' : undefined}>
        Dashboard
      </Link>
    </li>
  </ul>
</nav>

// Tooltip
<button
  aria-label="Help information"
  aria-describedby="tooltip-1"
  aria-expanded={isOpen}
>
  <InfoIcon aria-hidden="true" />
</button>
<div id="tooltip-1" role="tooltip" aria-live="polite">
  {content}
</div>

// Mobile Menu
<button
  aria-label="Open menu"
  aria-expanded={isOpen}
  aria-controls="mobile-menu"
>
  <MenuIcon aria-hidden="true" />
</button>
<div id="mobile-menu" role="dialog" aria-modal="true">
  {/* menu content */}
</div>
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy load non-critical components
const OnboardingHints = dynamic(() => import('@/components/OnboardingHints'), {
  ssr: false
})

const HelpMenu = dynamic(() => import('@/components/HelpMenu'), {
  ssr: false
})
```

### Bundle Size

- Navigation: ~5KB
- Tooltip: ~2KB
- HeroSection: ~3KB
- Total new code: ~15KB (gzipped)

### Rendering Performance

- Use React.memo for static components
- Debounce tooltip positioning calculations
- Use CSS transforms for animations (GPU-accelerated)
- Avoid layout thrashing in mobile menu

### Metrics

- Navigation render: <100ms
- Tooltip show: <50ms
- Mobile menu animation: 300ms (smooth)
- Page navigation: <200ms (client-side)

## Security Considerations

### XSS Prevention

- Sanitize any user-generated content (if added in future)
- Use React's built-in XSS protection
- Avoid dangerouslySetInnerHTML

### LocalStorage

- Store only non-sensitive data
- Validate data on read
- Handle quota exceeded gracefully

### External Links

```typescript
// Safe external links
<a
  href="https://example.com"
  target="_blank"
  rel="noopener noreferrer"
>
  External Link
</a>
```

## Deployment Considerations

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SHOW_DEMO_PAGES=true  # development only
NEXT_PUBLIC_CONTACT_EMAIL=support@harvestalert.org
```

### Build Configuration

```typescript
// next.config.js
const nextConfig = {
  // Redirect demo pages in production
  async redirects() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/components-demo',
          destination: '/',
          permanent: false
        },
        {
          source: '/map-demo',
          destination: '/',
          permanent: false
        }
      ]
    }
    return []
  }
}
```

### Robots.txt

```
User-agent: *
Disallow: /components-demo
Disallow: /map-demo
```

## Future Enhancements

1. **User Preferences**: Save theme, language, and display preferences
2. **Advanced Onboarding**: Interactive tutorial with step-by-step guidance
3. **Search Functionality**: Search across pages and help content
4. **Breadcrumbs**: Show navigation path on deep pages
5. **Keyboard Shortcuts**: Power user shortcuts for common actions
6. **Analytics**: Track feature usage and user journeys
7. **Feedback Widget**: In-app feedback collection
8. **Multi-language**: i18n support for international users

## Appendix

### Color Palette

```typescript
const colors = {
  // Brand
  primary: '#2563eb', // blue-600
  primaryHover: '#1d4ed8', // blue-700
  
  // Risk levels
  riskLow: '#22c55e', // green-500
  riskMedium: '#eab308', // yellow-500
  riskHigh: '#ef4444', // red-500
  
  // Neutrals
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray600: '#4b5563',
  gray900: '#111827',
  
  // Semantic
  success: '#10b981', // green-500
  warning: '#f59e0b', // amber-500
  error: '#ef4444', // red-500
  info: '#3b82f6' // blue-500
}
```

### Spacing Scale

```typescript
const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem'  // 64px
}
```

### Breakpoints

```typescript
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}
```

### Typography

```typescript
const typography = {
  // Headings
  h1: 'text-3xl font-bold', // 30px
  h2: 'text-2xl font-semibold', // 24px
  h3: 'text-xl font-semibold', // 20px
  
  // Body
  body: 'text-base', // 16px
  bodySmall: 'text-sm', // 14px
  caption: 'text-xs', // 12px
  
  // Weights
  normal: 'font-normal', // 400
  medium: 'font-medium', // 500
  semibold: 'font-semibold', // 600
  bold: 'font-bold' // 700
}
```

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Status**: Ready for Review
