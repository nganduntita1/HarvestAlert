/**
 * Component Demo Page
 * 
 * Visual test page to verify UI components render correctly.
 * This page demonstrates all three components from Task 9.
 */

'use client'

import { useState } from 'react'
import ErrorMessage from '@/components/ErrorMessage'
import LoadingSpinner from '@/components/LoadingSpinner'
import RiskSummaryCard from '@/components/RiskSummaryCard'
import { Region } from '@/lib/types'

export default function ComponentsDemo() {
  const [showError, setShowError] = useState(true)
  const [showLoading, setShowLoading] = useState(true)
  
  // Sample region data for RiskSummaryCard
  const sampleRegions: Region[] = [
    {
      id: 1,
      name: 'Sahel Region',
      latitude: 14.5,
      longitude: -14.5,
      crop_risk: 'high',
      nutrition_risk: 'high',
      last_updated: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'East Africa Highlands',
      latitude: -1.3,
      longitude: 36.8,
      crop_risk: 'high',
      nutrition_risk: 'medium',
      last_updated: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'Southern Africa Plains',
      latitude: -25.7,
      longitude: 28.2,
      crop_risk: 'medium',
      nutrition_risk: 'medium',
      last_updated: new Date().toISOString(),
    },
    {
      id: 4,
      name: 'West Africa Coast',
      latitude: 6.5,
      longitude: 3.4,
      crop_risk: 'low',
      nutrition_risk: 'low',
      last_updated: new Date().toISOString(),
    },
  ]
  
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Component Demo</h1>
          <p className="text-gray-600">Visual test for Task 9 components</p>
        </div>
        
        {/* LoadingSpinner Demo */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">LoadingSpinner Component</h2>
            <button
              onClick={() => setShowLoading(!showLoading)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {showLoading ? 'Hide' : 'Show'}
            </button>
          </div>
          {showLoading && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg">
              <LoadingSpinner />
            </div>
          )}
        </section>
        
        {/* ErrorMessage Demo */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">ErrorMessage Component</h2>
            <button
              onClick={() => setShowError(!showError)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {showError ? 'Hide' : 'Show'}
            </button>
          </div>
          {showError && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">With Retry Button:</h3>
                <ErrorMessage
                  message="Failed to fetch region data. Please check your connection and try again."
                  onRetry={() => alert('Retry clicked!')}
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Without Retry Button:</h3>
                <ErrorMessage
                  message="Invalid data format received from server."
                />
              </div>
            </div>
          )}
        </section>
        
        {/* RiskSummaryCard Demo */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">RiskSummaryCard Component</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">With Sample Data:</h3>
              <RiskSummaryCard regions={sampleRegions} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Empty State:</h3>
              <RiskSummaryCard regions={[]} />
            </div>
          </div>
        </section>
        
        {/* Component Info */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2 text-blue-900">Task 9 Completion</h2>
          <ul className="list-disc list-inside space-y-1 text-blue-800">
            <li>✓ Task 9.1: LoadingSpinner component created</li>
            <li>✓ Task 9.2: ErrorMessage component created</li>
            <li>✓ Task 9.3: RiskSummaryCard component created</li>
            <li>○ Task 9.4: Unit tests (OPTIONAL - skipped as requested)</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
