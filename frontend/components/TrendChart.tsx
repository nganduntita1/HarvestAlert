/**
 * TrendChart Component
 * 
 * Displays historical risk trend data for a selected region using a line chart.
 * Shows risk levels over time with color-coded lines for crop and nutrition risk.
 * 
 * Validates: Requirements 18.1, 18.2, 18.3, 18.4
 * - 18.1: Display a simple chart showing risk levels over time
 * - 18.2: Show trends for at least the most recent 7 data points
 * - 18.3: Use a line or bar chart format
 * - 18.4: Allow users to select which region's trends to view
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Region, TrendDataPoint, RiskLevel } from '@/lib/types'
import { fetchRegionTrends } from '@/lib/api'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

interface TrendChartProps {
  regions: Region[]
  initialRegionId?: number
}

/**
 * Convert risk level to numeric value for charting
 * low = 1, medium = 2, high = 3
 */
function riskToNumber(risk: RiskLevel): number {
  switch (risk) {
    case 'low':
      return 1
    case 'medium':
      return 2
    case 'high':
      return 3
    default:
      return 0
  }
}

/**
 * Format date for display on X-axis
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Format risk level for tooltip display
 */
function formatRiskLevel(value: number): string {
  switch (value) {
    case 1:
      return 'Low'
    case 2:
      return 'Medium'
    case 3:
      return 'High'
    default:
      return 'Unknown'
  }
}

export default function TrendChart({ regions, initialRegionId }: TrendChartProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(
    initialRegionId || (regions.length > 0 ? regions[0].id : null)
  )
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch trend data when selected region changes
  useEffect(() => {
    if (selectedRegionId === null) return

    const loadTrendData = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await fetchRegionTrends(selectedRegionId)
        setTrendData(data)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load trend data'
        setError(errorMessage)
        console.error('Error loading trend data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTrendData()
  }, [selectedRegionId])

  // Transform trend data for recharts
  const chartData = useMemo(() => {
    return trendData.map((point) => ({
      date: formatDate(point.recorded_at),
      fullDate: point.recorded_at,
      cropRisk: riskToNumber(point.crop_risk),
      nutritionRisk: riskToNumber(point.nutrition_risk),
      temperature: point.temperature,
      rainfall: point.rainfall,
      droughtIndex: point.drought_index,
    }))
  }, [trendData])

  // Get selected region name
  const selectedRegion = regions.find((r) => r.id === selectedRegionId)

  // Handle region selection change
  const handleRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = parseInt(event.target.value, 10)
    setSelectedRegionId(regionId)
  }

  // Handle retry
  const handleRetry = () => {
    if (selectedRegionId !== null) {
      setError(null)
      // Trigger re-fetch by updating state
      setSelectedRegionId(selectedRegionId)
    }
  }

  if (regions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Risk Trends</h2>
        <p className="text-gray-600">No regions available for trend visualization.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Risk Trends Over Time</h2>
        
        {/* Region selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="region-select" className="text-sm font-medium text-gray-700">
            Select Region:
          </label>
          <select
            id="region-select"
            value={selectedRegionId || ''}
            onChange={handleRegionChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <ErrorMessage message={error} onRetry={handleRetry} />
      )}

      {/* Chart */}
      {!loading && !error && chartData.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Showing {chartData.length} data points for {selectedRegion?.name}
          </p>
          
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                label={{ value: 'Date', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                domain={[0, 3]}
                ticks={[1, 2, 3]}
                tickFormatter={formatRiskLevel}
                label={{ value: 'Risk Level', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                        <p className="font-semibold text-sm mb-2">
                          {formatDate(data.fullDate)}
                        </p>
                        <p className="text-sm text-red-600">
                          Crop Risk: {formatRiskLevel(data.cropRisk)}
                        </p>
                        <p className="text-sm text-orange-600">
                          Nutrition Risk: {formatRiskLevel(data.nutritionRisk)}
                        </p>
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-600">
                            Temp: {data.temperature.toFixed(1)}°C
                          </p>
                          <p className="text-xs text-gray-600">
                            Rainfall: {data.rainfall.toFixed(1)}mm
                          </p>
                          <p className="text-xs text-gray-600">
                            Drought Index: {data.droughtIndex.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cropRisk"
                stroke="#ef4444"
                strokeWidth={2}
                name="Crop Risk"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="nutritionRisk"
                stroke="#f97316"
                strokeWidth={2}
                name="Nutrition Risk"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && chartData.length === 0 && (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">No trend data available for this region.</p>
        </div>
      )}
    </div>
  )
}
