/**
 * Browser capability detection utilities.
 * All functions are safe to call during SSR (return false when window is undefined).
 */

/**
 * Returns true if the browser supports `navigator.mediaDevices.getUserMedia`.
 */
export function isGetUserMediaSupported(): boolean {
  if (typeof navigator === 'undefined') return false
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

/**
 * Returns true if the current page is served in a secure context
 * (HTTPS or localhost). Camera access requires a secure context.
 */
export function isSecureContext(): boolean {
  if (typeof window === 'undefined') return false
  return window.isSecureContext
}

/**
 * Returns a human-readable browser name for use in error messages.
 * Falls back to "your browser" when detection is not possible.
 */
export function getBrowserName(): string {
  if (typeof navigator === 'undefined') return 'your browser'
  const ua = navigator.userAgent

  if (ua.includes('Edg/')) return 'Microsoft Edge'
  if (ua.includes('Chrome/') && !ua.includes('Chromium/')) return 'Google Chrome'
  if (ua.includes('Firefox/')) return 'Mozilla Firefox'
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari'
  if (ua.includes('Chromium/')) return 'Chromium'

  return 'your browser'
}

/**
 * Returns true if the browser is likely a mobile device.
 * Used to adjust default mirror behaviour (mobile front camera = mirror on).
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}
