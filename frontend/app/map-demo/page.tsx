/**
 * Map Demo Page
 * 
 * Visual test page to verify Map and RegionMarker components render correctly.
 * This page demonstrates the map components from Task 10.
 */

'use client'

import { useState } from 'react'
import dynamicImport from 'next/dynamic'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Region } from '@/lib/types'

// Dynamically import Map component to avoid SSR issues with Leaflet
const Map = dynamicImport(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
})

export default function MapDemo() {
  // Sample region data for map
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
    {
      id: 5,
      name: 'Central Africa Forest',
      latitude: 0.0,
      longitude: 25.0,
      crop_risk: 'medium',
      nutrition_risk: 'low',
      last_updated: new Date().toISOString(),
    },
  ]
  
  const [regions] = useState<Region[]>(sampleRegions)
  const [showMap, setShowMap] = useState(true)
  
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Map Component Demo</h1>
          <p className="text-gray-600">Visual test for Task 10 map components</p>
        </div>
        
        {/* Map Demo */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Interactive Map with Region Markers</h2>
            <button
              onClick={() => setShowMap(!showMap)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
          
          {showMap && (
            <div className="h-[600px]">
              <Map regions={regions} />
            </div>
          )}
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
            <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
              <li>Click on any marker to view region details</li>
              <li>Markers are color-coded: 🔴 Red = High Risk, 🟡 Yellow = Medium Risk, 🟢 Green = Low Risk</li>
              <li>Use mouse wheel to zoom in/out</li>
              <li>Click and drag to pan the map</li>
            </ul>
          </div>
        </section>
        
        {/* Region List */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Region Data</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Region
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coordinates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crop Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nutrition Risk
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {regions.map((region) => (
                  <tr key={region.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {region.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {region.latitude.toFixed(2)}, {region.longitude.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          region.crop_risk === 'high'
                            ? 'bg-red-100 text-red-800'
                            : region.crop_risk === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {region.crop_risk}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          region.nutrition_risk === 'high'
                            ? 'bg-red-100 text-red-800'
                            : region.nutrition_risk === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {region.nutrition_risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        
        {/* Empty State Demo */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Empty State</h2>
          <p className="text-gray-600 mb-4">Map with no regions:</p>
          <div className="h-[400px]">
            <Map regions={[]} />
          </div>
        </section>
        
        {/* Component Info */}
        <section className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2 text-green-900">Task 10 Completion</h2>
          <ul className="list-disc list-inside space-y-1 text-green-800">
            <li>✓ Task 10.1: RegionMarker component created</li>
            <li>✓ Task 10.2: Map component created</li>
            <li>✓ Task 10.3: Component tests written (OPTIONAL)</li>
          </ul>
          <div className="mt-4 pt-4 border-t border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">Features Implemented:</h3>
            <ul className="list-disc list-inside space-y-1 text-green-800 text-sm">
              <li>Interactive Leaflet map with OpenStreetMap tiles</li>
              <li>Color-coded markers based on risk level (green/yellow/red)</li>
              <li>Popup displays on marker click with region details</li>
              <li>Low-bandwidth optimization (lightweight tile provider)</li>
              <li>Automatic center calculation from region coordinates</li>
              <li>Responsive design with proper styling</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  )
}
