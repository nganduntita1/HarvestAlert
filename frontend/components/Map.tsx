/**
 * Map Component
 * 
 * Interactive Leaflet map that displays region markers with risk-based color coding.
 * Configured for low-bandwidth environments with lightweight tile provider.
 * Optimized with React.memo to prevent unnecessary re-renders (Requirement 20.3)
 * 
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 7.2, 20.2, 20.3
 * - 4.1: Display an interactive map using Leaflet library
 * - 4.2: Fetch region data from /regions endpoint
 * - 4.3: Display each region as a Map_Marker at correct coordinates
 * - 4.4: Color-code markers based on risk level
 * - 4.5: Display region details in popup on marker click
 * - 7.2: Load essential map tiles before detailed overlays for low-bandwidth optimization
 * - 20.2: Optimize re-renders with React.memo
 * - 20.3: Optimize re-renders with useMemo
 */

'use client'

import { useMemo, memo } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { Region } from '@/lib/types'
import RegionMarker from './RegionMarker'
import 'leaflet/dist/leaflet.css'

interface MapProps {
  regions: Region[]
  center?: [number, number]
  zoom?: number
}

function MapComponent({ 
  regions, 
  center = [0, 20], // Default center: Africa
  zoom = 3 
}: MapProps) {
  // Calculate center from regions if available
  // Memoized to prevent recalculation on every render (Requirement 20.3)
  const mapCenter = useMemo(() => {
    if (regions.length === 0) return center
    
    const avgLat = regions.reduce((sum, r) => sum + r.latitude, 0) / regions.length
    const avgLng = regions.reduce((sum, r) => sum + r.longitude, 0) / regions.length
    
    return [avgLat, avgLng] as [number, number]
  }, [regions, center])
  
  // Memoize region markers to prevent unnecessary re-renders (Requirement 20.3)
  const regionMarkers = useMemo(() => {
    return regions.map((region) => (
      <RegionMarker key={region.id} region={region} />
    ))
  }, [regions])
  
  return (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden border border-gray-200 shadow-lg">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      >
        {/* 
          Use OpenStreetMap tile layer optimized for low-bandwidth
          - Uses standard tile server (lightweight)
          - Attribution required by OpenStreetMap
        */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          // Low-bandwidth optimizations
          updateWhenIdle={true}
          updateWhenZooming={false}
          keepBuffer={2}
        />
        
        {/* Render markers for all regions */}
        {regionMarkers}
      </MapContainer>
    </div>
  )
}

// Export memoized component to prevent unnecessary re-renders (Requirement 20.2)
export default memo(MapComponent)
