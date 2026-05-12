/**
 * OfflineIndicator Component
 * 
 * Displays a badge when showing cached/offline data and shows the "Last updated" timestamp.
 * Provides visual feedback to users about data freshness and connectivity status.
 * 
 * Validates: Requirements 17.3, 17.4
 * - 17.3: Indicate to users when displaying cached versus live data
 * - 17.4: Refresh cached data when connectivity is restored
 */

interface OfflineIndicatorProps {
  /** Whether the currently displayed data is from cache */
  isShowingCachedData: boolean
  /** Timestamp when the data was last updated (cached) */
  lastUpdated: number | null
  /** Callback to refresh data when user clicks refresh button */
  onRefresh?: () => void
}

export default function OfflineIndicator({
  isShowingCachedData,
  lastUpdated,
  onRefresh,
}: OfflineIndicatorProps) {
  // Don't show anything if we're showing live data
  if (!isShowingCachedData || !lastUpdated) {
    return null
  }

  // Format the timestamp to a readable string
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) {
      return 'just now'
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    }
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {/* Offline icon */}
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Message and timestamp */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Cached Data
              </span>
            </div>
            <p className="mt-1 text-sm text-yellow-700">
              Showing cached data from your last visit.
            </p>
            <p className="mt-1 text-xs text-yellow-600">
              Last updated: {formatTimestamp(lastUpdated)}
            </p>
          </div>
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex-shrink-0 ml-3 inline-flex items-center px-3 py-1.5 border border-yellow-300 shadow-sm text-xs font-medium rounded text-yellow-700 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            aria-label="Refresh data"
          >
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        )}
      </div>
    </div>
  )
}
