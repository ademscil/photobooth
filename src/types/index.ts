/**
 * Core domain types for the Photobooth application.
 * All types are shared across lib/, store/, and components/.
 */

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------

/** Identifies a layout template for the final composition. */
export type TemplateId = 'single' | 'double' | 'grid' | 'strip' | 'filmstrip' | 'polaroid' | 'collage3' | 'custom'

/**
 * A single photo slot within a template, using normalised 0–1 coordinates
 * relative to the canvas dimensions.
 */
export interface TemplateSlot {
  /** Normalised x position (0 = left edge). */
  x: number
  /** Normalised y position (0 = top edge). */
  y: number
  /** Normalised width (1 = full canvas width). */
  width: number
  /** Normalised height (1 = full canvas height). */
  height: number
}

/** Full definition of a layout template. */
export interface Template {
  id: TemplateId
  name: string
  /** Number of shots required to fill this template. */
  shotCount: 1 | 2 | 3 | 4
  /** Canvas aspect ratio expressed as width / height. */
  canvasAspectRatio: number
  slots: TemplateSlot[]
  /** Normalised padding between slots (applied uniformly). */
  padding: number
}

/** Custom template configuration uploaded by user */
export interface CustomTemplate {
  /** User-provided name for this custom template */
  name: string
  /** Background image data URL (PNG/JPEG) */
  backgroundImage?: string
  /** Overlay image data URL (PNG with transparency) */
  overlayImage?: string
  /** Number of photo slots */
  shotCount: 1 | 2 | 4
  /** Canvas dimensions in pixels */
  canvasWidth: number
  canvasHeight: number
  /** Photo slot positions */
  slots: TemplateSlot[]
}

// ---------------------------------------------------------------------------
// Filter
// ---------------------------------------------------------------------------

/** Identifies a visual filter preset. */
export type FilterId = 'normal' | 'grayscale' | 'bw' | 'sepia' | 'vintage'

/** Full definition of a filter preset. */
export interface FilterDefinition {
  id: FilterId
  name: string
  /** CSS filter string used for live preview. */
  cssFilter: string
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

/** Countdown duration options in seconds. */
export type CountdownDuration = 3 | 5 | 10

/**
 * Lifecycle status of a photobooth session.
 *
 * - `idle`       — no session active, landing or setup screen
 * - `requesting` — camera permission being requested
 * - `capturing`  — countdown + capture in progress
 * - `reviewing`  — all shots captured, review/export screen
 * - `exporting`  — export render in progress
 */
export type SessionStatus =
  | 'idle'
  | 'requesting'
  | 'capturing'
  | 'reviewing'
  | 'exporting'

// ---------------------------------------------------------------------------
// Captured frame
// ---------------------------------------------------------------------------

/** A single captured photo frame stored in session state. */
export interface CapturedFrame {
  /** Raw pixel data from the canvas at capture time. */
  imageData: ImageData
  /** Unix timestamp (ms) when the frame was captured. */
  timestamp: number
  /** Filter that was active at capture time. */
  filter: FilterId
}

// ---------------------------------------------------------------------------
// Frame style
// ---------------------------------------------------------------------------

/** Decorative frame style drawn over the composition canvas. */
export type FrameStyle = 'none' | 'classic' | 'film' | 'polaroid' | 'modern' | 'vintage'

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------

/** Options passed to the canvas composition engine. */
export interface CompositionOptions {
  template: TemplateId
  filter: FilterId
  /** Whether to draw a frame border around the composition. */
  frameEnabled: boolean
  /** Optional text label rendered at the bottom of the composition. */
  labelText: string
  /**
   * Scale factor for the output canvas.
   * Use 1 for on-screen preview, 2 for export quality.
   */
  scale: number
  /** Custom template configuration (only used when template === 'custom') */
  customTemplate?: CustomTemplate
  /** Decorative frame style drawn over the composition */
  frameStyle?: FrameStyle
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/** Image format for export. */
export type ExportFormat = 'png' | 'jpeg'

/** JPEG quality level for export. */
export type ExportQuality = 'low' | 'medium' | 'high'

/** Options passed to the export utility. */
export interface ExportOptions {
  format: ExportFormat
  quality: ExportQuality
  filename: string
}

// ---------------------------------------------------------------------------
// Camera errors
// ---------------------------------------------------------------------------

/**
 * Discriminated union of all camera error states.
 * Each variant maps to a specific error UI component.
 */
export type CameraError =
  | { type: 'permission-denied' }
  | { type: 'permission-dismissed' }
  | { type: 'no-device' }
  | { type: 'device-in-use' }
  /** Device was physically disconnected after the stream was active. */
  | { type: 'device-disconnected' }
  | { type: 'not-supported' }
  /** Page is served over HTTP — camera requires a secure context. */
  | { type: 'insecure-context' }
  | { type: 'stream-interrupted' }
  | { type: 'unknown'; message: string }
