'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { buildConstraints, mapGetUserMediaError } from './constraints'
import type { CameraError } from '@/types'

export type CameraStatus = 'idle' | 'requesting' | 'active' | 'error' | 'stopped'

interface UseCameraResult {
  /** Callback ref — attach this to the <video> element via ref={camera.setVideoElement} */
  setVideoElement: (el: HTMLVideoElement | null) => void
  status: CameraStatus
  stream: MediaStream | null
  error: CameraError | null
  /** True when the video element is producing frames and ready to capture */
  isReady: boolean
  start: () => Promise<void>
  stop: () => void
  clearError: () => void
}

export function useCamera(selectedDeviceId: string | null): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mountedRef = useRef(true)
  const cleanupListenersRef = useRef<(() => void) | null>(null)

  const [status, setStatus] = useState<CameraStatus>('idle')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<CameraError | null>(null)
  const [isReady, setIsReady] = useState(false)

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (mountedRef.current) {
      setStream(null)
      setIsReady(false)
    }
  }, [])

  /** Attach stream to video element and set up readiness listeners */
  const attachStreamToVideo = useCallback((video: HTMLVideoElement, s: MediaStream) => {
    // Clean up previous listeners
    if (cleanupListenersRef.current) {
      cleanupListenersRef.current()
      cleanupListenersRef.current = null
    }

    video.srcObject = s
    video.play()?.catch(() => {})

    const handleReady = () => { if (mountedRef.current) setIsReady(true) }
    const handleWaiting = () => { if (mountedRef.current) setIsReady(false) }

    video.addEventListener('canplay', handleReady)
    video.addEventListener('loadeddata', handleReady)
    video.addEventListener('playing', handleReady)
    video.addEventListener('waiting', handleWaiting)

    // If already has data (stream was active before video element mounted), mark ready immediately
    if (video.readyState >= 2) {
      setTimeout(() => { if (mountedRef.current) setIsReady(true) }, 0)
    }

    cleanupListenersRef.current = () => {
      video.removeEventListener('canplay', handleReady)
      video.removeEventListener('loadeddata', handleReady)
      video.removeEventListener('playing', handleReady)
      video.removeEventListener('waiting', handleWaiting)
    }

    cleanupListenersRef.current = () => {
      video.removeEventListener('canplay', handleReady)
      video.removeEventListener('loadeddata', handleReady)
      video.removeEventListener('playing', handleReady)
      video.removeEventListener('waiting', handleWaiting)
    }
  }, [])

  /**
   * Callback ref for the <video> element.
   * Called by React when the element mounts or unmounts.
   */
  const setVideoElement = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el
    if (el && streamRef.current) {
      attachStreamToVideo(el, streamRef.current)
    }
    if (!el && cleanupListenersRef.current) {
      cleanupListenersRef.current()
      cleanupListenersRef.current = null
    }
  }, [attachStreamToVideo])

  const start = useCallback(async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setError({ type: 'not-supported' })
      setStatus('error')
      return
    }
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setError({ type: 'insecure-context' })
      setStatus('error')
      return
    }

    stopStream()
    setStatus('requesting')
    setError(null)
    setIsReady(false)

    try {
      const constraints = buildConstraints(selectedDeviceId)
      const newStream = await navigator.mediaDevices.getUserMedia(constraints)

      if (!mountedRef.current) {
        newStream.getTracks().forEach((t) => t.stop())
        return
      }

      streamRef.current = newStream

      // Attach to video element if already mounted
      if (videoRef.current) {
        attachStreamToVideo(videoRef.current, newStream)
      }

      // Detect device disconnection
      newStream.getVideoTracks().forEach((track) => {
        track.addEventListener('ended', () => {
          if (mountedRef.current) {
            setError({ type: 'device-disconnected' })
            setStatus('error')
            setIsReady(false)
          }
        })
      })

      setStream(newStream)
      setStatus('active')
    } catch (err) {
      if (mountedRef.current) {
        setError(mapGetUserMediaError(err))
        setStatus('error')
      }
    }
  }, [selectedDeviceId, stopStream, attachStreamToVideo])

  const stop = useCallback(() => {
    stopStream()
    if (mountedRef.current) setStatus('stopped')
  }, [stopStream])

  const clearError = useCallback(() => {
    setError(null)
    setStatus('idle')
  }, [])

  // Re-start when device changes while active
  const prevDeviceIdRef = useRef<string | null>(selectedDeviceId)
  useEffect(() => {
    if (prevDeviceIdRef.current !== selectedDeviceId && status === 'active') {
      prevDeviceIdRef.current = selectedDeviceId
      start()
    } else {
      prevDeviceIdRef.current = selectedDeviceId
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeviceId])

  // Re-attach stream when stream state changes (e.g. video element already mounted)
  useEffect(() => {
    if (!stream || !videoRef.current) return
    if (videoRef.current.srcObject !== stream) {
      attachStreamToVideo(videoRef.current, stream)
    }
  }, [stream, attachStreamToVideo])

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (cleanupListenersRef.current) cleanupListenersRef.current()
      stopStream()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { setVideoElement, status, stream, error, isReady, start, stop, clearError }
}
