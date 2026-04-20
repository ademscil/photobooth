'use client'

import { useEffect, useRef, useState } from 'react'

interface SessionTimerProps {
  /** Duration in minutes */
  durationMinutes: number
  /** Current session number (1 or 2) */
  sessionNumber: number
  /** Total sessions */
  totalSessions: number
  /** Called when timer reaches zero */
  onTimeUp: () => void
  /** Whether timer is running */
  isRunning: boolean
}

export function SessionTimer({
  durationMinutes,
  sessionNumber,
  totalSessions,
  onTimeUp,
  isRunning,
}: SessionTimerProps) {
  const totalSeconds = durationMinutes * 60
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const calledRef = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setSecondsLeft(totalSeconds)
      calledRef.current = false
    }, 0)
    return () => clearTimeout(t)
  }, [totalSeconds, sessionNumber])

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          if (!calledRef.current) {
            calledRef.current = true
            onTimeUp()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, onTimeUp])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const progress = secondsLeft / totalSeconds
  const isWarning = secondsLeft <= 60
  const isDanger = secondsLeft <= 30

  const circumference = 2 * Math.PI * 20 // r=20
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors ${
      isDanger ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950' :
      isWarning ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950' :
      'border-border bg-muted/50'
    }`}>
      {/* Circular progress */}
      <div className="relative h-12 w-12 shrink-0">
        <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-border opacity-30" />
          <circle
            cx="24" cy="24" r="20" fill="none" strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${
              isDanger ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-brand-primary'
            }`}
            stroke="currentColor"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-bold tabular-nums ${
            isDanger ? 'text-red-600 dark:text-red-400' :
            isWarning ? 'text-amber-600 dark:text-amber-400' :
            'text-foreground'
          }`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-foreground">
          Sesi {sessionNumber} / {totalSessions}
        </span>
        <span className={`text-xs ${
          isDanger ? 'font-semibold text-red-600 dark:text-red-400' :
          isWarning ? 'font-medium text-amber-600 dark:text-amber-400' :
          'text-muted-foreground'
        }`}>
          {isDanger ? '⚠️ Waktu hampir habis!' :
           isWarning ? 'Segera selesaikan sesi' :
           'Waktu tersisa'}
        </span>
      </div>

      {/* Screen reader announcement */}
      <div aria-live="polite" className="sr-only">
        {isDanger && `Peringatan: waktu tersisa ${secondsLeft} detik`}
      </div>
    </div>
  )
}
