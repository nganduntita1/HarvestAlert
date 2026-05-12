/**
 * Unit tests for TrendChart component
 * 
 * Tests the trend visualization component including:
 * - Region selection
 * - Data loading and display
 * - Error handling
 * - Empty states
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TrendChart from '@/components/TrendChart'
import { Region, TrendDataPoint } from '@/lib/types'
import * as api from '@/lib/api'

// Mock the API module
jest.mock('@/lib/api')

// Mock recharts to avoid rendering issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

describe('TrendChart', () => {
  const mockRegions: Region[] = [
    {
      id: 1,
      name: 'Sahel Region',
      latitude: 14.5,
      longitude: -14.5,
      crop_risk: 'high',
      nutrition_risk: 'high',
      last_updated: '2024-01-15T10:30:00',
    },
    {
      id: 2,
      name: 'East Africa Highlands',
      latitude: -1.3,
      longitude: 36.8,
      crop_risk: 'medium',
      nutrition_risk: 'medium',
      last_updated: '2024-01-15T10:30:00',
    },
  ]

  const mockTrendData: TrendDataPoint[] = [
    {
      recorded_at: '2024-01-10T10:00:00',
      temperature: 32.5,
      rainfall: 55.0,
      drought_index: 65.2,
      crop_risk: 'medium',
      nutrition_risk: 'medium',
    },
    {
      recorded_at: '2024-01-11T10:00:00',
      temperature: 35.0,
      rainfall: 45.0,
      drought_index: 72.5,
      crop_risk: 'high',
      nutrition_risk: 'high',
    },
    {
      recorded_at: '2024-01-12T10:00:00',
      temperature: 33.0,
      rainfall: 50.0,
      drought_index: 68.0,
      crop_risk: 'medium',
      nutrition_risk: 'medium',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with region selector', () => {
    ;(api.fetchRegionTrends as jest.Mock).mockResolvedValue(mockTrendData)

    render(<TrendChart regions={mockRegions} />)

    expect(screen.getByText('Risk Trends Over Time')).toBeInTheDocument()
    expect(screen.getByLabelText('Select Region:')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('displays all regions in the selector', () => {
    ;(api.fetchRegionTrends as jest.Mock).mockResolvedValue(mockTrendData)

    render(<TrendChart regions={mockRegions} />)

    const select = screen.getByRole('combobox')
    expect(select).toHaveTextContent('Sahel Region')
    expect(select).toHaveTextContent('East Africa Highlands')
  })

  it('loads and displays trend data for the first region by default', async () => {
    ;(api.fetchRegionTrends as jest.Mock).mockResolvedValue(mockTrendData)

    render(<TrendChart regions={mockRegions} />)

    await waitFor(() => {
      expect(api.fetchRegionTrends).toHaveBeenCalledWith(1)
    })

    await waitFor(() => {
      expect(screen.getByText(/Showing 3 data points/i)).toBeInTheDocument()
    })
  })

  it('loads trend data when region selection changes', async () => {
    ;(api.fetchRegionTrends as jest.Mock).mockResolvedValue(mockTrendData)

    render(<TrendChart regions={mockRegions} />)

    // Wait for initial load
    await waitFor(() => {
      expect(api.fetchRegionTrends).toHaveBeenCalledWith(1)
    })

    // Change region selection
    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, '2')

    // Should load data for new region
    await waitFor(() => {
      expect(api.fetchRegionTrends).toHaveBeenCalledWith(2)
    })
  })

  it('displays loading spinner while fetching data', async () => {
    let resolvePromise: (value: TrendDataPoint[]) => void
    const promise = new Promise<TrendDataPoint[]>((resolve) => {
      resolvePromise = resolve
    })
    
    ;(api.fetchRegionTrends as jest.Mock).mockReturnValue(promise)

    render(<TrendChart regions={mockRegions} />)

    // Should show loading spinner initially
    expect(screen.getByRole('status')).toBeInTheDocument()

    // Resolve the promise
    resolvePromise!(mockTrendData)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  it('displays error message when data fetch fails', async () => {
    const errorMessage = 'Failed to load trend data'
    ;(api.fetchRegionTrends as jest.Mock).mockRejectedValue(new Error(errorMessage))

    render(<TrendChart regions={mockRegions} />)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('allows retry after error', async () => {
    ;(api.fetchRegionTrends as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockTrendData)

    render(<TrendChart regions={mockRegions} />)

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    // Clear the mock and set up for success
    ;(api.fetchRegionTrends as jest.Mock).mockClear()
    ;(api.fetchRegionTrends as jest.Mock).mockResolvedValue(mockTrendData)

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /retry/i })
    await userEvent.click(retryButton)

    // Should successfully load data on retry
    await waitFor(() => {
      expect(screen.getByText(/Showing 3 data points/i)).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('displays empty state when no regions are provided', () => {
    render(<TrendChart regions={[]} />)

    expect(screen.getByText('Risk Trends')).toBeInTheDocument()
    expect(screen.getByText('No regions available for trend visualization.')).toBeInTheDocument()
  })

  it('displays empty state when no trend data is available', async () => {
    ;(api.fetchRegionTrends as jest.Mock).mockResolvedValue([])

    render(<TrendChart regions={mockRegions} />)

    await waitFor(() => {
      expect(screen.getByText('No trend data available for this region.')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('renders chart components when data is loaded', async () => {
    ;(api.fetchRegionTrends as jest.Mock).mockResolvedValue(mockTrendData)

    render(<TrendChart regions={mockRegions} />)

    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })
})
