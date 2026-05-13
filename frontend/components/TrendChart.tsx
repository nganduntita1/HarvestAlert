'use client'

/**
 * TrendChart Component
 *
 * Redesigned for mobile-first layout:
 * - Responsive chart height (shorter on mobile)
 * - No overlapping axis labels
 * - Region selector styled as pill tabs on desktop, dropdown on mobile
 * - Clean card-per-region layout with risk badge
 * - Tooltip shows all data cleanly
 */

import { useState, useEffect, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Region, TrendDataPoint, RiskLevel } from '@/lib/types'
import { fetchRegionTrends } from '@/lib/api'
import LoadingSpinner from './LoadingSpinner'

interface TrendChartProps {
  regions: Region[]
  initialRegionId?: number
}

function riskToNumber(risk: RiskLevel): number {
  return risk === 'high' ? 3 : risk === 'medium' ? 2 : 1
}

function numberToRisk(n: number): string {
  return n === 3 ? 'High' : n === 2 ? 'Medium' : 'Low'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function riskColor(risk: RiskLevel) {
  return risk === 'high' ? 'bg-red-100 text-red-700 border-red-200'
    : risk === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
    : 'bg-green-100 text-green-700 border-green-200'
}

function riskDot(risk: RiskLevel) {
  return risk === 'high' ? 'bg-red-500' : risk === 'medium' ? 'bg-yellow-400' : 'bg-green-500'
}

export default function TrendChart({ regions, initialRegionId }: TrendChartProps) {
  const [selectedId, setSelectedId] = useState<number | null>(
    initialRegionId ?? (regions[0]?.id ?? null)
  )
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedId === null) return
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchRegionTrends(selectedId)
        if (!cancelled) setTrendData(data)
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load trend data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [selectedId])

  const chartData = useMemo(
    () =>
      trendData.map((p) => ({
        date: formatDate(p.recorded_at),
        fullDate: p.recorded_at,
        cropRisk: riskToNumber(p.crop_risk),
        nutritionRisk: riskToNumber(p.nutrition_risk),
        temperature: p.temperature,
        rainfall: p.rainfall,
        droughtIndex: p.drought_index,
      })),
    [trendData]
  )

  const selectedRegion = regions.find((r) => r.id === selectedId)

  if (regions.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-4">No regions available for trend visualization.</p>
    )
  }

  return (
    <div className="space-y-4">

      {/* Region selector — scrollable pill list */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {regions.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedId(r.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              r.id === selectedId
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                r.id === selectedId ? 'bg-white' : riskDot(r.crop_risk as RiskLevel)
              }`}
              aria-hidden="true"
            />
            {r.name}
          </button>
        ))}
      </div>

      {/* Selected region info bar */}
      {selectedRegion && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold text-gray-800">{selectedRegion.name}</span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${riskColor(selectedRegion.crop_risk as RiskLevel)}`}
          >
            Crop: {selectedRegion.crop_risk}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${riskColor(selectedRegion.nutrition_risk as RiskLevel)}`}
          >
            Nutrition: {selectedRegion.nutrition_risk}
          </span>
        </div>
      )}

      {/* Chart area */}
      {loading && (
        <div className="flex justify-center items-center h-48">
          <LoadingSpinner />
        </div>
      )}

      {error && !loading && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error} —{' '}
          <button
            onClick={() => setSelectedId(selectedId)}
            className="underline font-medium"
          >
            retry
          </button>
        </div>
      )}

      {!loading && !error && chartData.length > 0 && (
        <>
          {/* Legend */}
          <div className="flex gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-0.5 bg-red-500 inline-block rounded" />
              Crop Risk
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-0.5 bg-orange-400 inline-block rounded" />
              Nutrition Risk
            </span>
          </div>

          {/* Responsive chart — taller on desktop, compact on mobile */}
          <div className="w-full h-48 sm:h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  domain={[0.5, 3.5]}
                  ticks={[1, 2, 3]}
                  tickFormatter={numberToRisk}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs space-y-1 min-w-[160px]">
                        <p className="font-semibold text-gray-800 mb-1">{formatDate(d.fullDate)}</p>
                        <p className="text-red-600">
                          Crop Risk:{' '}
                          <span className="font-medium">{numberToRisk(d.cropRisk)}</span>
                        </p>
                        <p className="text-orange-500">
                          Nutrition Risk:{' '}
                          <span className="font-medium">{numberToRisk(d.nutritionRisk)}</span>
                        </p>
                        <div className="border-t border-gray-100 pt-1 mt-1 text-gray-500 space-y-0.5">
                          <p>🌡️ {d.temperature.toFixed(1)}°C</p>
                          <p>🌧️ {d.rainfall.toFixed(1)} mm</p>
                          <p>🏜️ Drought: {d.droughtIndex.toFixed(1)}</p>
                        </div>
                      </div>
                    )
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cropRisk"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  name="Crop Risk"
                />
                <Line
                  type="monotone"
                  dataKey="nutritionRisk"
                  stroke="#fb923c"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#fb923c', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  name="Nutrition Risk"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-gray-400 text-right">
            Last {chartData.length} days · Click a region above to compare
          </p>
        </>
      )}

      {!loading && !error && chartData.length === 0 && (
        <p className="text-gray-500 text-sm py-8 text-center">
          No trend data available for this region.
        </p>
      )}
    </div>
  )
}
