/**
 * Utility functions for HarvestAlert MVP
 * 
 * Provides helper functions for risk visualization and data aggregation
 */

import { Region, RiskLevel } from './types'

/**
 * Map risk level to display color
 * 
 * @param riskLevel - Risk level ("low", "medium", "high")
 * @returns Color name for display
 * 
 * Validates: Requirements 4.4, 5.4
 */
export function getRiskColor(riskLevel: RiskLevel): string {
  const colorMap: Record<RiskLevel, string> = {
    low: 'green',
    medium: 'yellow',
    high: 'red',
  }
  
  return colorMap[riskLevel]
}

/**
 * Get Tailwind CSS color class for risk level
 * 
 * @param riskLevel - Risk level ("low", "medium", "high")
 * @returns Tailwind CSS color class
 */
export function getRiskColorClass(riskLevel: RiskLevel): string {
  const colorClassMap: Record<RiskLevel, string> = {
    low: 'text-risk-low bg-green-100 border-green-300',
    medium: 'text-risk-medium bg-yellow-100 border-yellow-300',
    high: 'text-risk-high bg-red-100 border-red-300',
  }
  
  return colorClassMap[riskLevel]
}

/**
 * Aggregate region counts by risk level
 * 
 * @param regions - Array of regions with risk data
 * @returns Object with counts for each risk level
 * 
 * Validates: Requirements 5.2
 */
export function aggregateRegionCounts(regions: Region[]): {
  low: number
  medium: number
  high: number
  total: number
} {
  const counts = {
    low: 0,
    medium: 0,
    high: 0,
    total: regions.length,
  }
  
  for (const region of regions) {
    counts[region.crop_risk]++
  }
  
  return counts
}

/**
 * Format date string for display
 * 
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

/**
 * Format temperature for display
 * 
 * @param temperature - Temperature in Celsius
 * @returns Formatted temperature string
 */
export function formatTemperature(temperature: number): string {
  return `${temperature.toFixed(1)}°C`
}

/**
 * Format rainfall for display
 * 
 * @param rainfall - Rainfall in millimeters
 * @returns Formatted rainfall string
 */
export function formatRainfall(rainfall: number): string {
  return `${rainfall.toFixed(1)} mm`
}

/**
 * Format drought index for display
 * 
 * @param droughtIndex - Drought index (0-100)
 * @returns Formatted drought index string
 */
export function formatDroughtIndex(droughtIndex: number): string {
  return `${droughtIndex.toFixed(0)}/100`
}
