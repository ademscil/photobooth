/**
 * Core domain types for the Photobooth application.
 */

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------

export type TemplateId =
  | 'single'
  | 'double'
  | 'grid'
  | 'strip'
  | 'filmstrip'
  | 'polaroid'
  | 'collage3'
  | 'custom'

export interface TemplateSlot {
  x: number
  y: number
  width: number
  height: number
}

export interface Template {
  id: TemplateId
  name: string
  shotCount: 1 | 2 | 3 | 4
  canvasAspectRatio: number
  slots: TemplateSlot[]
  padding: number
}

export interface CustomTemplate {
  name: string
  backgroundImage?: string
  overlayImage?: string
  shotCount: 1 | 2 | 3 | 4
  canvasWidth: number
  canvasHeight: number
  slots: TemplateSlot[]
}

// ---------------------------------------------------------------------------
// Filter
// ---------------------------------------------------------------------------

export type FilterId = 'normal' | 'grayscale' | 'bw' | 'sepia' | 'vintage'

export interface FilterDefinition {
  id: FilterId
  name: string
  cssFilter: string
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export type CountdownDuration = 3 | 5 | 10

export type SessionStatus =
  | 'idle'
  | 'requesting'
  | 'capturing'
  | 'reviewing'
  | 'exporting'

// ---------------------------------------------------------------------------
// Captured frame
// ---------------------------------------------------------------------------

export interface CapturedFrame {
  imageData: ImageData
  timestamp: number
  filter: FilterId
}

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------

export type FrameStyle = 'none' | 'classic' | 'floral' | 'minimal' | 'dark'

export interface CompositionOptions {
  template: TemplateId
  filter: FilterId
  frameEnabled: boolean
  labelText: string
  scale: number
  customTemplate?: CustomTemplate
  frameStyle?: FrameStyle
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export type ExportFormat = 'png' | 'jpeg'
export type ExportQuality = 'low' | 'medium' | 'high'

export interface ExportOptions {
  format: ExportFormat
  quality: ExportQuality
  filename: string
}

// ---------------------------------------------------------------------------
// Camera errors
// ---------------------------------------------------------------------------

export type CameraError =
  | { type: 'permission-denied' }
  | { type: 'permission-dismissed' }
  | { type: 'no-device' }
  | { type: 'device-in-use' }
  | { type: 'device-disconnected' }
  | { type: 'not-supported' }
  | { type: 'insecure-context' }
  | { type: 'stream-interrupted' }
  | { type: 'unknown'; message: string }
