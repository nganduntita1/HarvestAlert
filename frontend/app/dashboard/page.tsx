/**
 * Dashboard Page (/dashboard)
 *
 * Educational, guided dashboard for first-time and returning users.
 * Includes a situation summary, contextual section descriptions,
 * map legend, and plain-English guidance throughout.
 */

'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Region } from '@/lib/types'
import { fetchRegions, getCacheTimestamp } from '@/lib/api'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import RiskSummaryCard from '@/components/RiskSummaryCard'
import OfflineIndicator from '@/components/OfflineIndicator'

const Map = dynamic(() => import('@/components/Map'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
})

const TrendChart = dynamic(() => import('@/components/TrendChart'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
})

// ─── Situation Summary Banner ────────────────────────────────────────────────

function SituationBanner({ regions }: { regions: Region[] }) {
  const high = regions.filter((r) => r.crop_risk === 'high' || r.nutrition_risk === 'high')
  const medium = regions.filter(
    (r) =>
      (r.crop_risk === 'medium' || r.nutrition_risk === 'medium') &&
      r.crop_risk !== 'high' &&
      r.nutrition_risk !== 'high'
  )

  if (high.length === 0 && medium.length === 0) {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 px-5 py-4 flex items-start gap-3">
        <span className="text-green-500 text-xl mt-0.5" aria-hidden="true">✅</span>
        <div>
          <p className="font-semibold text-green-800">All regions are currently at low risk.</p>
          <p className="text-sm text-green-700 mt-0.5">
            Conditions across all monitored regions are within normal seasonal ranges. Continue
            routine monitoring.
          </p>
        </div>
      </div>
    )
  }

  if (high.length > 0) {
    const names = high.map((r) => r.name).join(', ')
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 px-5 py-4 flex items-start gap-3">
        <span className="text-red-500 text-xl mt-0.5" aria-hidden="true">🚨</span>
        <div>
          <p className="font-semibold text-red-800">
            {high.length === 1
              ? `1 region requires immediate attention: ${names}.`
              : `${high.length} regions require immediate attention: ${names}.`}
          </p>
          <p className="text-sm text-red-700 mt-0.5">
            High-risk regions show climate conditions strongly associated with crop failure and
            elevated malnutrition. Review the map and trend data below, then consider activating
            early-response protocols.
          </p>
          {medium.length > 0 && (
            <p className="text-sm text-red-700 mt-1">
              Additionally, {medium.length} {medium.length === 1 ? 'region is' : 'regions are'} at
              medium risk and should be monitored closely.
            </p>
          )}
        </div>
      </div>
    )
  }

  const names = medium.map((r) => r.name).join(', ')
  return (
    <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-5 py-4 flex items-start gap-3">
      <span className="text-yellow-500 text-xl mt-0.5" aria-hidden="true">⚠️</span>
      <div>
        <p className="font-semibold text-yellow-800">
          {medium.length === 1
            ? `1 region is showing elevated risk: ${names}.`
            : `${medium.length} regions are showing elevated risk: ${names}.`}
        </p>
        <p className="text-sm text-yellow-700 mt-0.5">
          Medium-risk regions are experiencing deteriorating conditions. Early preparedness
          actions — such as pre-positioning supplies — are recommended.
        </p>
      </div>
    </div>
  )
}

// ─── Map Legend ───────────────────────────────────────────────────────────────

function MapLegend() {
  return (
    <div className="flex flex-wrap gap-4 text-sm">
      {[
        { color: 'bg-green-500', label: 'Low Risk', desc: 'Normal conditions' },
        { color: 'bg-yellow-400', label: 'Medium Risk', desc: 'Monitor closely' },
        { color: 'bg-red-500', label: 'High Risk', desc: 'Immediate attention' },
      ].map(({ color, label, desc }) => (
        <div key={label} className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${color}`} aria-hidden="true" />
          <span className="font-medium text-gray-700">{label}</span>
          <span className="text-gray-500">— {desc}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
  aside,
}: {
  title: string
  description: string
  children: React.ReactNode
  aside?: React.ReactNode
}) {
  return (
    <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        {aside && <div className="flex-shrink-0">{aside}</div>}
      </div>
      {children}
    </section>
  )
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isShowingCachedData, setIsShowingCachedData] = useState<boolean>(false)
  const [cacheTimestamp, setCacheTimestamp] = useState<number | null>(null)

  const loadRegions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const cacheKey = 'harvestalert:regions'
      const beforeTimestamp = getCacheTimestamp(cacheKey)
      const data = await fetchRegions()
      const afterTimestamp = getCacheTimestamp(cacheKey)
      const usingCache = beforeTimestamp !== null && beforeTimestamp === afterTimestamp

      setRegions(data)
      setIsShowingCachedData(usingCache)
      setCacheTimestamp(afterTimestamp)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load region data. Please try again.'
      setError(errorMessage)
      setIsShowingCachedData(false)
      setCacheTimestamp(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRegions()
  }, [loadRegions])

  useEffect(() => {
    const handleOnline = () => loadRegions()
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [loadRegions])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const currentTimestamp = useMemo(() => new Date().toLocaleString(), [regions])

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Page header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Live climate &amp; nutrition risk overview across monitored regions
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Loading region data…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="max-w-2xl mx-auto">
            <ErrorMessage message={error} onRetry={loadRegions} />
          </div>
        )}

        {/* Data loaded */}
        {!loading && !error && regions.length > 0 && (
          <>
            <OfflineIndicator
              isShowingCachedData={isShowingCachedData}
              lastUpdated={cacheTimestamp}
              onRefresh={loadRegions}
            />

            {/* 1 — Situation summary */}
            <SituationBanner regions={regions} />

            {/* 2 — Risk Summary */}
            <Section
              title="Risk Summary"
              description="A count of how many regions are at each risk level right now. High-risk regions need the most urgent attention."
            >
              <RiskSummaryCard regions={regions} />

              {/* Guidance callout */}
              <div className="mt-2 rounded-md bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium text-red-700">High risk</span> — Conditions strongly
                  indicate crop failure or acute malnutrition. Immediate intervention planning is
                  advised.
                </p>
                <p>
                  <span className="font-medium text-yellow-700">Medium risk</span> — Conditions are
                  deteriorating. Pre-position supplies and increase monitoring frequency.
                </p>
                <p>
                  <span className="font-medium text-green-700">Low risk</span> — Conditions are
                  within normal seasonal ranges. Routine monitoring is sufficient.
                </p>
              </div>
            </Section>

            {/* 3 — Map */}
            <Section
              title="Regional Risk Map"
              description="Each marker represents a monitored region. Click a marker to see its name and current risk level. Use the legend below to interpret the colours."
              aside={
                <Link
                  href="/how-it-works"
                  className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                >
                  How are risk levels calculated? →
                </Link>
              }
            >
              <MapLegend />
              <div className="h-[520px] rounded-md overflow-hidden border border-gray-200">
                <Map regions={regions} />
              </div>
            </Section>

            {/* 4 — Trends */}
            <Section
              title="Risk Trends"
              description="These charts show how climate conditions have changed over the past 7 days for each region. A rising drought index or falling rainfall line is an early warning sign — even before the risk level changes."
            >
              <TrendChart regions={regions} />
            </Section>

            {/* Footer */}
            <div className="text-center text-xs text-gray-400 pb-4">
              Data last fetched: {currentTimestamp} ·{' '}
              <Link href="/how-it-works" className="hover:underline">
                Learn how predictions work
              </Link>
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && !error && regions.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No regions available</h3>
              <p className="mt-2 text-gray-600">
                No region data is currently available. Please check back later.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
