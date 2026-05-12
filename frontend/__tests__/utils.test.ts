/**
 * Unit tests for utility functions
 * 
 * Tests the risk-to-color mapping and region aggregation functions
 */

import { getRiskColor, aggregateRegionCounts } from '@/lib/utils'
import { Region } from '@/lib/types'

describe('getRiskColor', () => {
  it('maps low risk to green', () => {
    expect(getRiskColor('low')).toBe('green')
  })

  it('maps medium risk to yellow', () => {
    expect(getRiskColor('medium')).toBe('yellow')
  })

  it('maps high risk to red', () => {
    expect(getRiskColor('high')).toBe('red')
  })
})

describe('aggregateRegionCounts', () => {
  it('counts regions by risk level correctly', () => {
    const regions: Region[] = [
      {
        id: 1,
        name: 'Region A',
        latitude: 0,
        longitude: 0,
        crop_risk: 'high',
        nutrition_risk: 'high',
        last_updated: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        name: 'Region B',
        latitude: 0,
        longitude: 0,
        crop_risk: 'high',
        nutrition_risk: 'medium',
        last_updated: '2024-01-01T00:00:00Z',
      },
      {
        id: 3,
        name: 'Region C',
        latitude: 0,
        longitude: 0,
        crop_risk: 'medium',
        nutrition_risk: 'low',
        last_updated: '2024-01-01T00:00:00Z',
      },
      {
        id: 4,
        name: 'Region D',
        latitude: 0,
        longitude: 0,
        crop_risk: 'low',
        nutrition_risk: 'low',
        last_updated: '2024-01-01T00:00:00Z',
      },
    ]

    const counts = aggregateRegionCounts(regions)

    expect(counts.high).toBe(2)
    expect(counts.medium).toBe(1)
    expect(counts.low).toBe(1)
    expect(counts.total).toBe(4)
  })

  it('handles empty array', () => {
    const counts = aggregateRegionCounts([])

    expect(counts.high).toBe(0)
    expect(counts.medium).toBe(0)
    expect(counts.low).toBe(0)
    expect(counts.total).toBe(0)
  })

  it('counts sum equals total', () => {
    const regions: Region[] = [
      {
        id: 1,
        name: 'Region A',
        latitude: 0,
        longitude: 0,
        crop_risk: 'low',
        nutrition_risk: 'low',
        last_updated: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        name: 'Region B',
        latitude: 0,
        longitude: 0,
        crop_risk: 'medium',
        nutrition_risk: 'medium',
        last_updated: '2024-01-01T00:00:00Z',
      },
    ]

    const counts = aggregateRegionCounts(regions)

    expect(counts.low + counts.medium + counts.high).toBe(counts.total)
  })
})
