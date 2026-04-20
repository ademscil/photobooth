'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSessionStore } from '@/store/sessionStore'
import { usePaymentStore, type PricingPackage } from '@/store/paymentStore'
import { useCamera } from '@/lib/camera/useCamera'
import { useDevices } from '@/lib/camera/useDevices'
import { useCountdown } from '@/lib/camera/useCountdown'
import { captureFrame } from '@/lib/camera/capture'
import { ErrorBoundary } from '@/components/errors/ErrorBoundary'
import { PermissionGate } from '@/components/permission/PermissionGate'
import { CountdownOverlay } from '@/components/booth/CountdownOverlay'
import { FlashOverlay } from '@/components/booth/FlashOverlay'
import { ShotProgress } from '@/components/booth/ShotProgress'
import { CaptureButton } from '@/components/booth/CaptureButton'
import { RetakeButton } from '@/components/booth/RetakeButton'
import { ControlPanel } from '@/components/booth/ControlPanel'
import { SessionTimer } from '@/components/booth/SessionTimer'
import { ReviewCanvas } from '@/components/review/ReviewCanvas'
import { CustomizePanel } from '@/components/review/CustomizePanel'
import { ExportPanel } from '@/components/review/ExportPanel'
import { PrintOrderPanel } from '@/components/review/PrintOrderPanel'
import { QRDownload } from '@/components/review/QRDownload'
import { PricingScreen } from '@/components/payment/PricingScreen'
import { PaymentModal } from '@/components/payment/PaymentModal'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getCssFilterString } from '@/lib/filters/cssFilters'
import { generateSessionDownloadUrl } from '@/lib/export/downloadLink'

type AppPhase =
  | 'pricing'       // user selects package
  | 'payment'       // QRIS payment
  | 'capturing'     // active photo session
  | 'reviewing'     // review + download
  | 'session-done'  // session complete, can start next session

export default function BoothPage() {
  const store = useSessionStore()
  const payment = usePaymentStore()
  const camera = useCamera(store.selectedDeviceId)
  const { devices, refresh: refreshDevices } = useDevices()

  const [phase, setPhase] = useState<AppPhase>('pricing')
  const [isFlashing, setIsFlashing] = useState(false)
  const [timerRunning, setTimerRunning] = useState(false)
  const [pendingPackage, setPendingPackage] = useState<PricingPackage | null>(null)
  const [sessionDownloadId, setSessionDownloadId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Sync camera state
  useEffect(() => { store.setCameraError(camera.error) }, [camera.error]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { store.setStream(camera.stream) }, [camera.stream]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { store.setAvailableDevices(devices.map((d) => d.raw)) }, [devices]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (devices.length > 0 && !store.selectedDeviceId) {
      store.setSelectedDeviceId(devices[0].deviceId)
    }
  }, [devices]) // eslint-disable-line react-hooks/exhaustive-deps

  const isReviewing = phase === 'reviewing'
  const videoElRef = useRef<HTMLVideoElement | null>(null)

  const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoElRef.current = el
    camera.setVideoElement(el)
  }, [camera.setVideoElement]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const video = videoElRef.current
    if (!video || !camera.stream) return
    if (video.srcObject !== camera.stream) {
      video.srcObject = camera.stream
      video.play()?.catch(() => {})
    }
  }, [camera.stream])

  const doCapture = useCallback(() => {
    const videoEl = videoElRef.current
    if (!videoEl) return
    setIsFlashing(true)
    setTimeout(() => setIsFlashing(false), 150)
    try {
      const imageData = captureFrame(videoEl, store.filter, store.isMirrored)
      store.captureFrame({ imageData, timestamp: Date.now(), filter: store.filter })
    } catch (err) {
      console.error('[BoothPage] Capture failed:', err)
    }
  }, [store.filter, store.isMirrored]) // eslint-disable-line react-hooks/exhaustive-deps

  const { count, isRunning, start: startCountdown, cancel: cancelCountdown } = useCountdown(
    store.countdown, doCapture,
  )

  const prevCapturedLength = useRef(store.capturedFrames.length)
  useEffect(() => {
    const newLength = store.capturedFrames.length
    if (newLength <= prevCapturedLength.current) { prevCapturedLength.current = newLength; return }
    prevCapturedLength.current = newLength
    if (newLength >= store.totalShots) {
      store.finishCapture()
      const compositionOptions = {
        template: store.template,
        filter: store.filter,
        frameEnabled: store.frameEnabled,
        labelText: store.labelText,
        customTemplate: store.customTemplate ?? undefined,
        frameStyle: store.frameStyle,
      }
      setTimeout(() => {
        setIsUploading(true)
        setUploadProgress('Menyiapkan foto...')
      }, 0)
      generateSessionDownloadUrl(
        store.capturedFrames,
        compositionOptions,
        (step) => setUploadProgress(step),
      ).then((url) => {
        const id = url.split('/').pop() ?? null
        setIsUploading(false)
        setUploadProgress(null)
        setTimeout(() => { setPhase('reviewing'); setSessionDownloadId(id) }, 0)
      }).catch(() => {
        setIsUploading(false)
        setUploadProgress(null)
        setTimeout(() => setPhase('reviewing'), 0)
      })
    } else {
      setTimeout(() => startCountdown(), 500)
    }
  }, [store.capturedFrames.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCaptureClick = useCallback(() => {
    if (store.status !== 'capturing') store.startCapture()
    startCountdown()
  }, [store.status, startCountdown]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetake = useCallback(() => {
    cancelCountdown()
    store.retakeLastFrame()
    setTimeout(() => startCountdown(), 300)
  }, [cancelCountdown, startCountdown]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRequestPermission = useCallback(async () => {
    refreshDevices()
    await camera.start()
  }, [refreshDevices]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = useCallback(async () => {
    camera.clearError()
    refreshDevices()
    await camera.start()
  }, [refreshDevices]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { return () => { camera.stop() } }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Pricing & payment flow ---

  const handleSelectPackage = (pkg: PricingPackage, method: import('@/store/paymentStore').PaymentMethod) => {
    payment.setSelectedPackage(pkg)
    payment.setPaymentMethod(method)
    setPendingPackage(pkg)
    setPhase('payment')
  }

  // Start timer only once camera becomes active during capturing phase
  useEffect(() => {
    if (phase === 'capturing' && camera.status === 'active' && !timerRunning) {
      setTimeout(() => setTimerRunning(true), 0)
    }
    if (phase !== 'capturing') {
      setTimeout(() => setTimerRunning(false), 0)
    }
  }, [camera.status, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePaymentSuccess = useCallback(async () => {
    setPhase('capturing')
    store.resetSession()
    refreshDevices()
    await camera.start()
  }, [refreshDevices]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePaymentCancel = () => {
    payment.reset()
    setPendingPackage(null)
    setPhase('pricing')
  }

  // Session timer expired
  const handleTimeUp = useCallback(() => {
    setTimerRunning(false)
    cancelCountdown()
    if (store.capturedFrames.length > 0) {
      store.finishCapture()
      setPhase('reviewing')
    } else {
      setPhase('session-done')
    }
  }, [cancelCountdown]) // eslint-disable-line react-hooks/exhaustive-deps

  // After download — record session result and check limits
  const handleSessionComplete = useCallback(() => {
    const pkg = payment.selectedPackage
    if (!pkg) return

    const sessionNumber = payment.sessionsCompleted + 1
    const canDownload = sessionNumber <= pkg.templateCount

    payment.addSessionResult({
      sessionNumber,
      templateId: store.template,
      templateName: store.template,
      canDownload,
    })

    const sessionsLeft = pkg.sessionCount - sessionNumber

    if (sessionsLeft > 0) {
      setPhase('session-done')
    } else {
      // All sessions used
      payment.reset()
      store.resetSession()
      camera.stop()
      setPhase('pricing')
    }
  }, [payment.sessionsCompleted, payment.selectedPackage, store.template]) // eslint-disable-line react-hooks/exhaustive-deps

  // Start next session
  const handleStartNextSession = useCallback(async () => {
    store.resetSession()
    setPhase('capturing')
    await camera.start()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartOver = useCallback(() => {
    cancelCountdown()
    payment.reset()
    store.resetSession()
    camera.stop()
    setPhase('pricing')
  }, [cancelCountdown]) // eslint-disable-line react-hooks/exhaustive-deps

  const cssFilter = getCssFilterString(store.filter)
  const pkg = payment.selectedPackage ?? pendingPackage
  const sessionNumber = payment.sessionsCompleted + 1

  // Check if current session can download (based on package templateCount)
  const canDownloadThisSession = pkg && sessionNumber <= pkg.templateCount

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col bg-background">
        <Header showStartOver={phase !== 'pricing'} onStartOver={handleStartOver} />

        <main className="flex flex-1 flex-col">

          {/* ── PRICING ── */}
          {phase === 'pricing' && (
            <PricingScreen onSelectPackage={handleSelectPackage} />
          )}

          {/* ── PAYMENT ── */}
          {phase === 'payment' && (
            <div className="flex flex-1 items-center justify-center p-6">
              <div className="text-center text-muted-foreground">
                <p>Memproses pembayaran...</p>
              </div>
              <PaymentModal
                onPaymentSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </div>
          )}

          {/* ── SESSION DONE (between sessions) ── */}
          {phase === 'session-done' && (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Sesi {payment.sessionsCompleted} Selesai!</h2>
                <p className="mt-2 text-muted-foreground">
                  Kamu masih punya <strong>{(pkg?.sessionCount ?? 2) - payment.sessionsCompleted} sesi</strong> tersisa.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartNextSession}
                className="rounded-xl bg-brand-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              >
                Mulai Sesi Berikutnya →
              </button>
            </div>
          )}

          {/* ── REVIEW ── */}
          {isReviewing && (
            <div className="flex flex-1 flex-col gap-4 p-4 md:flex-row md:gap-6 md:p-6">
              <div className="flex flex-1 items-start justify-center">
                <ReviewCanvas
                  frames={store.capturedFrames}
                  templateId={store.template}
                  filterId={store.filter}
                  frameEnabled={store.frameEnabled}
                  labelText={store.labelText}
                  customTemplate={store.customTemplate}
                  frameStyle={store.frameStyle}
                />
              </div>
              <div className="flex w-full flex-col gap-4 md:w-72 md:shrink-0">
                <CustomizePanel
                  frameEnabled={store.frameEnabled}
                  onFrameToggle={store.setFrameEnabled}
                  labelText={store.labelText}
                  onLabelChange={store.setLabelText}
                  filter={store.filter}
                  onFilterChange={store.setFilter}
                  frameStyle={store.frameStyle}
                  onFrameStyleChange={store.setFrameStyle}
                />
                <PrintOrderPanel
                  frames={store.capturedFrames}
                  templateId={store.template}
                  sessionIndex={payment.sessionsCompleted}
                />
                <ExportPanel
                  frames={store.capturedFrames}
                  compositionOptions={{
                    template: store.template,
                    filter: store.filter,
                    frameEnabled: store.frameEnabled,
                    labelText: store.labelText,
                    customTemplate: store.customTemplate ?? undefined,
                    frameStyle: store.frameStyle,
                  }}
                  onStartOver={handleSessionComplete}
                />
                {(sessionDownloadId || isUploading) && (
                  <QRDownload
                    sessionId={sessionDownloadId ?? ''}
                    uploadProgress={uploadProgress}
                    isUploading={isUploading}
                  />
                )}
              </div>
            </div>
          )}

          {/* ── CAPTURE WORKSPACE ── */}
          {phase === 'capturing' && (
            <PermissionGate
              cameraError={camera.error}
              status={camera.status}
              onRequestPermission={handleRequestPermission}
              onRetry={handleRetry}
            >
              <div className="flex flex-1 flex-col gap-4 p-4 md:flex-row md:gap-6 md:p-6">
                {/* Camera preview */}
                <div className="flex flex-1 flex-col gap-3">
                  {/* Session timer */}
                  {pkg && (
                    <SessionTimer
                      durationMinutes={pkg.sessionDuration}
                      sessionNumber={sessionNumber}
                      totalSessions={pkg.sessionCount}
                      onTimeUp={handleTimeUp}
                      isRunning={timerRunning}
                    />
                  )}

                  <figure
                    className="relative w-full overflow-hidden rounded-xl bg-neutral-900"
                    style={{ aspectRatio: '4/3', maxWidth: '640px', maxHeight: '50vh' }}
                    aria-label="Live camera preview"
                  >
                    {!camera.isReady && (
                      <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-neutral-900">
                        <div className="flex flex-col items-center gap-3 text-neutral-500">
                          <svg className="h-12 w-12 animate-pulse" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                          </svg>
                          <span className="text-sm">Starting camera…</span>
                        </div>
                      </div>
                    )}
                    <video
                      ref={setVideoRef}
                      aria-label="Live camera preview"
                      autoPlay playsInline muted
                      className={`h-full w-full object-cover transition-opacity duration-300 ${camera.isReady ? 'opacity-100' : 'opacity-0'} ${store.isMirrored ? 'scale-x-[-1]' : ''}`}
                      style={{ filter: cssFilter }}
                    />
                    <figcaption className="sr-only">Live camera preview{store.filter !== 'normal' ? `, ${store.filter} filter` : ''}</figcaption>
                    <CountdownOverlay count={count} isRunning={isRunning} />
                    <FlashOverlay isFlashing={isFlashing} />
                  </figure>
                </div>

                {/* Controls */}
                <div className="flex w-full flex-col gap-4 md:w-72 md:shrink-0">
                  {/* Download info banner */}
                  {pkg && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                      📦 Paket <strong>{pkg.name}</strong> · Sesi {sessionNumber}/{pkg.sessionCount} ·{' '}
                      {canDownloadThisSession ? '✓ Sesi ini bisa didownload' : 'Sesi ini soft file saja'}
                    </div>
                  )}

                  <ControlPanel
                    template={store.template}
                    onTemplateChange={store.setTemplate}
                    filter={store.filter}
                    onFilterChange={store.setFilter}
                    countdown={store.countdown}
                    onCountdownChange={store.setCountdown}
                    devices={devices}
                    selectedDeviceId={store.selectedDeviceId}
                    onDeviceSelect={store.setSelectedDeviceId}
                    frameStyle={store.frameStyle}
                    onFrameStyleChange={store.setFrameStyle}
                    disabled={isRunning}
                  />

                  <ShotProgress currentShot={store.currentShot} totalShots={store.totalShots} />

                  <div className="flex items-center justify-center gap-4">
                    <CaptureButton
                      onCapture={handleCaptureClick}
                      disabled={!camera.isReady}
                      isCountingDown={isRunning}
                    />
                    <RetakeButton
                      onRetake={handleRetake}
                      disabled={isRunning}
                      capturedCount={store.capturedFrames.length}
                    />
                  </div>
                </div>
              </div>
            </PermissionGate>
          )}
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  )
}
