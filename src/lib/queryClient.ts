import { QueryClient } from '@tanstack/react-query';

/**
 * Global React Query client configuration
 *
 * Configured with sensible defaults for the IRIS dashboard
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Cache management
      staleTime: 20000, // Data considered fresh for 20 seconds
      gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes (formerly cacheTime)

      // Error handling
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: true, // Refetch when component mounts

      // Prevent unnecessary network requests
      networkMode: 'online', // Only run queries when online
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      retryDelay: 1000,

      // Error handling
      networkMode: 'online',
    },
  },
});

/**
 * Helper to clear all IRIS-related queries
 * Useful when logging out or switching contexts
 */
export function clearIrisCache() {
  queryClient.removeQueries({ queryKey: ['iris'] });
}

/**
 * Helper to prefetch common queries
 * Can be called on app initialization or route changes
 */
export async function prefetchIrisData() {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

  // Prefetch overview (most important)
  await queryClient.prefetchQuery({
    queryKey: ['iris', 'overview'],
    queryFn: () =>
      fetch(`${API_BASE}/api/iris/evaluate`).then((res) => res.json()),
    staleTime: 20000,
  });

  // Prefetch projects list
  await queryClient.prefetchQuery({
    queryKey: ['iris', 'projects'],
    queryFn: () =>
      fetch(`${API_BASE}/api/iris/projects`).then((res) => res.json()),
    staleTime: 20000,
  });

  // Prefetch recent events
  await queryClient.prefetchQuery({
    queryKey: ['iris', 'events', 50],
    queryFn: () =>
      fetch(`${API_BASE}/api/iris/events?limit=50`).then((res) => res.json()),
    staleTime: 10000,
  });
}
