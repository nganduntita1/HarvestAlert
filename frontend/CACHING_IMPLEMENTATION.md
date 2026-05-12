# Browser Caching Implementation for HarvestAlert MVP

## Overview

This document describes the browser caching implementation for API responses in the HarvestAlert MVP frontend application.

**Task:** 19.1 - Implement browser caching for API responses  
**Requirements:** 17.1, 17.2  
**Status:** ✅ Complete

## Implementation Details

### Cache Strategy

The caching implementation uses `localStorage` to store API responses with timestamps. The strategy follows these principles:

1. **Cache-First for Valid Data**: If cached data exists and is not expired (< 5 minutes old), return it immediately without making an API call
2. **API-First for Expired Data**: If cached data is expired, attempt to fetch fresh data from the API
3. **Stale Cache Fallback**: If the API call fails and stale cached data exists, return the stale data as a fallback (offline support)
4. **5-Minute Expiration**: Cached data expires after 5 minutes

### Files Modified

#### `frontend/lib/api.ts`

Added the following caching functionality:

**Constants:**
- `CACHE_EXPIRATION_MS`: 5 minutes (300,000 ms)

**Internal Functions:**
- `isBrowser()`: Checks if code is running in browser environment
- `getCachedData<T>(key)`: Retrieves valid (non-expired) cached data
- `getStaleCache<T>(key)`: Retrieves cached data regardless of expiration (for offline fallback)
- `setCachedData<T>(key, data)`: Stores data in cache with timestamp
- `clearCachedData(key)`: Removes cached data for a specific key

**Exported Functions:**
- `getCacheTimestamp(key)`: Returns timestamp when data was cached
- `hasCachedData(key)`: Checks if valid cache exists
- `clearAllCaches()`: Clears all HarvestAlert caches

**Modified API Functions:**
- `fetchRegions()`: Now uses caching with 5-minute expiration
- `fetchClimate()`: Now uses caching with 5-minute expiration

### Cache Keys

The implementation uses namespaced cache keys:
- `harvestalert:regions` - For region data
- `harvestalert:climate` - For climate data

### Cache Entry Structure

```typescript
interface CacheEntry<T> {
  data: T
  timestamp: number
}
```

### Behavior Examples

#### Scenario 1: First Load
1. User loads dashboard
2. No cache exists
3. API call is made
4. Response is cached with current timestamp
5. Data is displayed

#### Scenario 2: Subsequent Load (Within 5 Minutes)
1. User reloads dashboard
2. Valid cache exists (< 5 minutes old)
3. Cached data is returned immediately
4. No API call is made
5. Data is displayed instantly

#### Scenario 3: Expired Cache (After 5 Minutes)
1. User loads dashboard after 6 minutes
2. Cache exists but is expired
3. API call is made
4. Fresh data is cached
5. Data is displayed

#### Scenario 4: Network Failure with Stale Cache
1. User loads dashboard while offline
2. Cache exists but is expired
3. API call fails (network error)
4. Stale cached data is returned as fallback
5. Console warning is logged
6. Data is displayed with stale data

#### Scenario 5: Network Failure without Cache
1. User loads dashboard while offline
2. No cache exists
3. API call fails (network error)
4. Error is thrown
5. Error message is displayed to user

## Testing

### Test File: `frontend/__tests__/api-cache.test.ts`

Comprehensive test suite covering:

**fetchRegions caching:**
- ✅ Caches successful API responses
- ✅ Returns cached data on subsequent calls within expiration
- ✅ Falls back to cached data when API fails
- ✅ Falls back to stale cache when API fails and cache is expired
- ✅ Throws error when API fails and no cache exists
- ✅ Expires cache after 5 minutes

**fetchClimate caching:**
- ✅ Caches successful API responses
- ✅ Falls back to cached data when API fails

**Cache utility functions:**
- ✅ clearAllCaches removes all cached data
- ✅ getCacheTimestamp returns null for non-existent cache
- ✅ hasCachedData returns false for non-existent cache

All tests pass successfully.

## Benefits

1. **Improved Performance**: Eliminates unnecessary API calls for recently fetched data
2. **Reduced Bandwidth**: Minimizes data transfer, important for low-bandwidth environments
3. **Offline Support**: Provides graceful degradation when network is unavailable
4. **Better User Experience**: Faster page loads and instant data display

## Future Enhancements

Potential improvements for future iterations:

1. **Cache Invalidation API**: Add ability to manually invalidate cache when data changes
2. **Configurable Expiration**: Allow different expiration times for different data types
3. **Cache Size Management**: Implement LRU eviction when localStorage is full
4. **Service Worker Integration**: Use Service Worker for more robust offline support
5. **Cache Versioning**: Add version numbers to handle API schema changes

## Usage Example

```typescript
import { fetchRegions, clearAllCaches, hasCachedData } from '@/lib/api'

// Fetch regions (uses cache if available)
const regions = await fetchRegions()

// Check if cached data exists
if (hasCachedData('harvestalert:regions')) {
  console.log('Using cached data')
}

// Clear all caches (e.g., on logout)
clearAllCaches()
```

## Validation

✅ Requirements 17.1: Cache region data with timestamp - **Implemented**  
✅ Requirements 17.2: Implement cache expiration (5 minutes) - **Implemented**  
✅ All tests passing  
✅ Build successful  
✅ TypeScript compilation successful  
✅ ESLint validation passed

## Notes

- The implementation is SSR-safe (checks for browser environment before accessing localStorage)
- Errors in cache operations fail silently to prevent breaking the application
- Console warnings are logged when using stale cached data
- The `predictRisk()` function is intentionally not cached as it's a POST request with dynamic parameters
