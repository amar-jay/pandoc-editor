import { useRef, useCallback } from 'react'

/**
 * Hook to throttle function calls for performance optimization
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(func: T, delay: number): T {
  const lastRun = useRef(Date.now())

  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        func(...args)
        lastRun.current = Date.now()
      }
    }) as T,
    [func, delay]
  )
}

/**
 * Hook to debounce function calls for performance optimization
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(func: T, delay: number): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => func(...args), delay)
    }) as T,
    [func, delay]
  )
}
