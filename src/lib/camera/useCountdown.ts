'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CountdownDuration } from '@/types'

interface UseCountdownResult {
  count: number
  isRunning: boolean
  start: () => void
  cancel: () => void
}

/**
 * Custom hook for managing a countdown timer.
 * Calls onComplete when count reaches 0.
 * Escape key cancels the countdown.
 */
export function useCountdown(
  duration: CountdownDuration,
  onComplete: () => void,
): UseCountdownResult {
  const [count, setCount] = useState<number>(duration)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef(onComplete)

  // Keep onComplete ref up to date without restarting the interval
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const cancel = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
    setCount(duration)
  }, [duration])

  const start = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    setCount(duration)
    setIsRunning(true)

    let remaining = duration

    intervalRef.current = setInterval(() => {
      remaining -= 1
      setCount(remaining)

      if (remaining <= 0) {
        clearInterval(intervalRef.current!)
        intervalRef.current = null
        setIsRunning(false)
        setCount(duration)
        onCompleteRef.current()
      }
    }, 1000)
  }, [duration])

  // Escape key cancels countdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRunning) {
        cancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRunning, cancel])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return { count, isRunning, start, cancel }
}
