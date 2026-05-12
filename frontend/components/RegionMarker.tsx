/**
 * RegionMarker Component
 * 
 * Renders an individual map marker for a region with color coding based on risk level.
 * Displays a popup with region details when clicked.
 * Optimized with React.memo to prevent unnecessary re-renders (Requirement 20.3)
 * 
 * Validates: Requirements 4.3, 4.4, 4.5, 20.2
 * - 4.3: Display each region as a Map_Marker at correct coordinates
 * - 4.4: Color-code markers based on risk level
 * - 4.5: Display region details in popup on marker click
 * - 20.2: Optimize re-renders with React.memo
 */

'use client'

import { memo, useMemo } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Region } from '@/lib/types'
import { getRiskColor } from '@/lib/utils'

interface RegionMarkerProps {
  region: Region
}

/**
 * Create a custom colored marker icon based on risk level
 * Memoized to prevent recreation on every render
 */
function createColoredIcon(color: string): L.DivIcon {
  const colorMap: Record<string, string> = {
    green: '#22c55e',
    yellow: '#eab308',
    red: '#ef4444',
  }
  
  const hexColor = colorMap[color] || '#6b7280'
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
          fill="${hexColor}" 
          stroke="white" 
          stroke-width="1.5"
        />
        <circle cx="12" cy="9" r="2.5" fill="white" />
      </svg>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

function RegionMarkerComponent({ region }: RegionMarkerProps) {
  const color = getRiskColor(region.crop_risk)
  
  // Memoize icon creation to prevent recreation on every render (Requirement 20.3)
  const icon = useMemo(() => createColoredIcon(color), [color])
  
  // Memoize formatted date to prevent recalculation (Requirement 20.3)
  const formattedDate = useMemo(() => {
    return region.last_updated 
      ? new Date(region.last_updated).toLocaleDateString()
      : null
  }, [region.last_updated])
  
  return (
    <Marker
      position={[region.latitude, region.longitude]}
      icon={icon}
    >
      <Popup>
        <div className="p-2 min-w-[200px]">
          <h3 className="font-bold text-lg mb-2">{region.name}</h3>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Crop Risk:</span>
              <span 
                className={`text-sm font-semibold uppercase px-2 py-1 rounded ${
                  region.crop_risk === 'high' 
                    ? 'bg-red-100 text-red-800' 
                    : region.crop_risk === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {region.crop_risk}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Nutrition Risk:</span>
              <span 
                className={`text-sm font-semibold uppercase px-2 py-1 rounded ${
                  region.nutrition_risk === 'high' 
                    ? 'bg-red-100 text-red-800' 
                    : region.nutrition_risk === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {region.nutrition_risk}
              </span>
            </div>
            
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                <div>Lat: {region.latitude.toFixed(4)}</div>
                <div>Lng: {region.longitude.toFixed(4)}</div>
              </div>
            </div>
            
            {formattedDate && (
              <div className="text-xs text-gray-400 mt-1">
                Updated: {formattedDate}
              </div>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

// Export memoized component to prevent unnecessary re-renders (Requirement 20.2)
export default memo(RegionMarkerComponent)
