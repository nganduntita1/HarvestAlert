/**
 * RiskSummaryCard Component
 * 
 * Displays aggregated risk information showing count of regions by risk level.
 * Uses color coding consistent with map markers (green/yellow/red).
 * Optimized with React.memo to prevent unnecessary re-renders (Requirement 20.3)
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 20.2, 20.3
 * - 5.1: Display risk summary cards showing aggregated risk information
 * - 5.2: Show count of regions at each risk level
 * - 5.3: Update summary cards when region data is refreshed
 * - 5.4: Use color coding consistent with map markers
 * - 20.2: Optimize re-renders with React.memo
 * - 20.3: Optimize re-renders with useMemo
 */

import { memo, useMemo } from 'react'
import { Region, RiskLevel } from '@/lib/types'
import { aggregateRegionCounts } from '@/lib/utils'

interface RiskSummaryCardProps {
  regions: Region[]
}

interface RiskCardItemProps {
  level: RiskLevel
  count: number
  label: string
}

// Memoize RiskCardItem to prevent unnecessary re-renders (Requirement 20.2)
const RiskCardItem = memo(function RiskCardItem({ level, count, label }: RiskCardItemProps) {
  // Color mapping based on risk level
  const colorClasses = {
    low: 'bg-green-100 border-green-300 text-green-800',
    medium: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    high: 'bg-red-100 border-red-300 text-red-800',
  }
  
  const iconColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600',
  }
  
  return (
    <div className={`border-2 rounded-lg p-4 ${colorClasses[level]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold mt-1">{count}</p>
          <p className="text-xs mt-1">
            {count === 1 ? 'region' : 'regions'}
          </p>
        </div>
        
        {/* Risk level icon */}
        <div className={`${iconColors[level]}`}>
          {level === 'low' && (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {level === 'medium' && (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {level === 'high' && (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
})

function RiskSummaryCardComponent({ regions }: RiskSummaryCardProps) {
  // Aggregate counts by risk level
  // Memoized to prevent recalculation on every render (Requirement 20.3)
  const counts = useMemo(() => aggregateRegionCounts(regions), [regions])
  
  // Handle empty region list
  if (regions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">No regions available</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Risk Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RiskCardItem level="high" count={counts.high} label="High Risk" />
        <RiskCardItem level="medium" count={counts.medium} label="Medium Risk" />
        <RiskCardItem level="low" count={counts.low} label="Low Risk" />
      </div>
      
      <div className="text-sm text-gray-600 text-center">
        Total: {counts.total} {counts.total === 1 ? 'region' : 'regions'}
      </div>
    </div>
  )
}

// Export memoized component to prevent unnecessary re-renders (Requirement 20.2)
export default memo(RiskSummaryCardComponent)
