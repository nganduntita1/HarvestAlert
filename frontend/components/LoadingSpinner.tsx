/**
 * LoadingSpinner Component
 * 
 * Displays an animated spinner during data loading states.
 * Used throughout the application to indicate async operations.
 * 
 * Validates: Requirement 6.4 - Frontend shall handle API responses with appropriate loading states
 */

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8" role="status" aria-label="Loading">
      <div className="relative w-16 h-16">
        {/* Spinning circle */}
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  )
}
