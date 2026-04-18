# Photobooth Web Application — Design Document

**Version:** 1.1.0  
**Status:** Revised  
**Date:** 2026-04-18  
**Depends on:** requirements.md v1.1.0  

---

## 1. Architecture Overview

The application is a **client-side-only Next.js application** with no backend. All camera access, image processing, composition, and export happen entirely in the browser using native Web APIs.

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser (Client)                       │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────────────┐ │
│  │  Next.js App │   │   Zustand    │   │   Canvas API    │ │
│  │  (React UI)  │◄──│   Session    │   │   Composer      │ │
│  │              │   │   Store      │   │   & Exporter    │ │
│  └──────┬───────┘   └──────────────┘   └─────────────────┘ │
│         │                                                   │
│  ┌──────▼──────────────────────────────────────────────┐    │
│  │                   Core Modules                      │    │
│  │  camera device mgmt  │  live preview               │    │
│  │  capture flow        │  composition/export         │    │
│  │  filters             │  UI state & error state     │    │
│  └──────────────────────────────────────────────────────┘   │
│         │                                                   │
│  ┌──────▼──────────────────────────────────────────────┐    │
│  │         navigator.mediaDevices (Browser API)        │    │
│  │  enumerateDevices()  │  getUserMedia(constraints)   │    │
│  │  devicechange event  │  MediaStream track lifecycle │    │
│  └──────────────────────────────────────────────────────┘   │
│         │                                                   │
│  ┌──────▼──────────────────────────────────────────────┐    │
│  │              OS / Hardware Layer                    │    │
│  │  Built-in webcam  │  USB webcam                    │    │
│  │  HDMI capture card │  DSLR as webcam-compatible*   │    │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  * DSLR/mirrorless supported only when OS exposes them      │
│    as a standard videoinput device. No SDK tethering.       │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

- **Next.js App Router** with client components for all interactive UI. No server components needed for MVP since there is no data fetching or SSR requirement.
- **Zustand** for session state — lightweight, no boilerplate, easy to reset between sessions.
- **CSS filters** for live preview performance; **Canvas pixel manipulation** for export accuracy.
- **No backend** in MVP. All data stays in memory and is discarded when the session ends or the page is closed.
- **Camera access is entirely browser-mediated** via `navigator.mediaDevices`. The application has no knowledge of or access to the underlying hardware beyond what the browser exposes as `videoinput` devices. No vendor SDKs, native bridges, or OS-level drivers are used.

---

## 2. Folder Structure

```
photobooth/
├── .github/
│   └── workflows/
│       ├── ci.yml                  # Lint, typecheck, test, build
│       └── preview.yml             # Optional Vercel preview deploy
├── public/
│   ├── favicon.ico
│   └── og-image.png               # Open Graph placeholder
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout, fonts, metadata
│   │   ├── page.tsx                # Landing screen
│   │   ├── booth/
│   │   │   └── page.tsx            # Capture workspace
│   │   └── globals.css             # Tailwind base + custom CSS vars
│   │
│   ├── components/                 # UI components
│   │   ├── ui/                     # shadcn/ui primitives (Button, Slider, etc.)
│   │   ├── booth/
│   │   │   ├── CameraPreview.tsx       # <video> element + CSS filter overlay
│   │   │   ├── CameraDevicePicker.tsx  # Device selector dropdown (NEW)
│   │   │   ├── CountdownOverlay.tsx
│   │   │   ├── ShotProgress.tsx
│   │   │   ├── CaptureButton.tsx
│   │   │   ├── ControlPanel.tsx    # Template / filter / countdown selectors
│   │   │   ├── TemplateSelector.tsx
│   │   │   ├── FilterSelector.tsx
│   │   │   ├── CountdownSelector.tsx
│   │   │   └── RetakeButton.tsx
│   │   ├── review/
│   │   │   ├── ReviewCanvas.tsx    # Final composition preview
│   │   │   ├── ExportPanel.tsx     # Download controls
│   │   │   └── CustomizePanel.tsx  # Frame, text options
│   │   ├── permission/
│   │   │   ├── PermissionRequest.tsx
│   │   │   └── PermissionDenied.tsx
│   │   ├── errors/
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── NoCameraError.tsx
│   │   │   ├── UnsupportedBrowser.tsx
│   │   │   ├── StreamInterrupted.tsx
│   │   │   └── DeviceDisconnected.tsx  # Device removed mid-session (NEW)
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   │
│   ├── lib/                        # Core non-UI modules
│   │   ├── camera/
│   │   │   ├── useCamera.ts        # Custom hook: stream lifecycle
│   │   │   ├── useDevices.ts       # Custom hook: enumerate devices
│   │   │   └── constraints.ts      # MediaStreamConstraints builder
│   │   ├── filters/
│   │   │   ├── filterDefinitions.ts  # Filter preset registry
│   │   │   ├── cssFilters.ts         # CSS filter string generator
│   │   │   └── canvasFilters.ts      # Canvas pixel manipulation for export
│   │   ├── composition/
│   │   │   ├── templates.ts          # Template layout definitions
│   │   │   ├── composer.ts           # Canvas composition engine
│   │   │   └── decorations.ts        # Frame border + text rendering
│   │   ├── export/
│   │   │   ├── exporter.ts           # PNG/JPEG export logic
│   │   │   └── filename.ts           # Timestamped filename generator
│   │   └── utils/
│   │       ├── browser.ts            # Browser capability detection
│   │       └── canvas.ts             # Canvas utility helpers
│   │
│   ├── store/
│   │   └── sessionStore.ts         # Zustand session state
│   │
│   └── types/
│       └── index.ts                # Shared TypeScript types
│
├── tests/
│   ├── unit/
│   │   ├── filters/
│   │   │   ├── cssFilters.test.ts
│   │   │   └── canvasFilters.test.ts
│   │   ├── composition/
│   │   │   ├── templates.test.ts
│   │   │   └── composer.test.ts
│   │   └── export/
│   │       ├── exporter.test.ts
│   │       └── filename.test.ts
│   └── components/
│       ├── CameraPreview.test.tsx
│       ├── CameraDevicePicker.test.tsx
│       ├── PermissionDenied.test.tsx
│       └── ErrorBoundary.test.tsx
│
├── .editorconfig
├── .env.example
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## 3. Key Modules and Responsibilities

### 3.1 `lib/camera/`

| File | Responsibility |
|---|---|
| `useCamera.ts` | Custom React hook managing the full stream lifecycle: request, start, stop, error handling, device switching. Stops the previous stream before starting a new one when the device changes. |
| `useDevices.ts` | Enumerates available `videoinput` devices via `enumerateDevices()`; listens for `devicechange` events and refreshes the list; resolves generic labels before permission and real labels after |
| `constraints.ts` | Builds `MediaStreamConstraints` objects based on selected `deviceId`, resolution preference, and facing mode. Falls back to `{ video: true }` if no deviceId is selected. |

**`useCamera` state machine:**

```
IDLE → REQUESTING → ACTIVE → STOPPED
                 ↘ ERROR
ACTIVE → ERROR (stream interrupted / device disconnected)
ERROR → REQUESTING (retry / device switch)
ACTIVE → REQUESTING (device switch — stops old stream first)
```

**Device switching flow:**

```
User selects new device from picker
        │
        ▼
sessionStore.setSelectedDeviceId(newDeviceId)
        │
        ▼
useCamera detects deviceId change
        │
        ▼
stopStream(currentStream)  ← stops all tracks on old stream
        │
        ▼
getUserMedia({ video: { deviceId: { exact: newDeviceId } } })
        │
        ├─ [Success] → update stream ref → video.srcObject = newStream
        └─ [Error]   → setCameraError(mapped error)
```

### 3.2 `lib/filters/`

| File | Responsibility |
|---|---|
| `filterDefinitions.ts` | Registry of all filter presets with ID, display name, CSS filter string, and canvas manipulation function reference |
| `cssFilters.ts` | Generates CSS `filter` property strings for live preview; includes brightness/contrast adjustments |
| `canvasFilters.ts` | Applies pixel-level manipulation to `ImageData` for export-accurate filter rendering |

### 3.3 `lib/composition/`

| File | Responsibility |
|---|---|
| `templates.ts` | Defines layout geometry for each template: slot positions, dimensions, padding, aspect ratios |
| `composer.ts` | Orchestrates canvas drawing: background, photo slots, filters, decorations |
| `decorations.ts` | Renders optional frame border and text label onto the canvas |

### 3.4 `lib/export/`

| File | Responsibility |
|---|---|
| `exporter.ts` | Renders final composition at 2× scale, converts canvas to Blob, triggers browser download |
| `filename.ts` | Generates timestamped filenames in format `photobooth-YYYY-MM-DD-HHmmss.{ext}` |

### 3.5 `store/sessionStore.ts`

Zustand store managing the entire session lifecycle:

```typescript
interface SessionState {
  // Configuration
  template: TemplateId
  filter: FilterId
  countdown: CountdownDuration
  frameEnabled: boolean
  labelText: string

  // Capture state
  status: SessionStatus  // 'idle' | 'requesting' | 'capturing' | 'reviewing' | 'exporting'
  currentShot: number
  totalShots: number
  capturedFrames: ImageData[]

  // Camera
  stream: MediaStream | null
  selectedDeviceId: string | null   // persisted in sessionStorage (survives soft nav, not hard refresh)
  availableDevices: MediaDeviceInfo[]
  isMirrored: boolean               // true for front-facing, false default for external cameras
  cameraError: CameraError | null

  // Actions
  setTemplate: (id: TemplateId) => void
  setFilter: (id: FilterId) => void
  setCountdown: (duration: CountdownDuration) => void
  setSelectedDeviceId: (id: string | null) => void
  setAvailableDevices: (devices: MediaDeviceInfo[]) => void
  setMirrored: (mirrored: boolean) => void
  startSession: () => void
  captureFrame: (frame: ImageData) => void
  retakeLastFrame: () => void
  resetSession: () => void
  setStream: (stream: MediaStream | null) => void
  setCameraError: (error: CameraError | null) => void
}
```

The `selectedDeviceId` is persisted to `sessionStorage` (not `localStorage`) so it survives client-side navigation within the session but is cleared when the tab is closed, preserving the privacy-first default.

---

## 4. Screen and Navigation Flow

```
Landing Page (/)
     │
     ▼ [Start Photobooth]
Permission Request Screen
     │
     ├─ [Denied] ──► Permission Denied Error Screen
     │                    │
     │                    └─ [Try Again / Instructions] ──► Permission Request
     │
     └─ [Granted] ──► Camera Device Picker (if multiple devices found)
                           │
                           └─ [Device selected / single device auto-selected]
                                 │
                                 ▼
                           Camera Readiness Check
                                 │
                                 ├─ [Not ready] ──► StreamInterrupted / NoCameraError
                                 │
                                 └─ [Ready] ──► Capture Workspace (/booth)
                                                     │
                                                     ├─ [Capture shots 1..N]
                                                     │       │
                                                     │       └─ [Retake] ──► re-capture current shot
                                                     │
                                                     └─ [All shots captured] ──► Review Screen
                                                                 │
                                                                 ├─ [Download PNG]
                                                                 ├─ [Download JPEG]
                                                                 └─ [Start Over] ──► Landing Page
```

---

## 5. Capture Flow

```
User clicks "Start Capture"
        │
        ▼
[Countdown starts — N seconds]
  - CountdownOverlay renders animated number
  - aria-live region announces each second
        │
        ▼ [Countdown reaches 0]
[Flash effect plays — white overlay, 150ms]
        │
        ▼
[captureFrame() called]
  - drawImage(videoElement, canvas) at full resolution
  - Apply canvas filter if not 'normal'
  - Store ImageData in sessionStore.capturedFrames[]
        │
        ▼
[ShotProgress updates — "Shot 2 of 4"]
        │
        ├─ [More shots remaining] ──► short pause (500ms) ──► next countdown
        │
        └─ [All shots done] ──► navigate to Review Screen
```

**Frame capture implementation:**

```typescript
function captureFrame(videoEl: HTMLVideoElement, filter: FilterId, mirrored: boolean): ImageData {
  const canvas = document.createElement('canvas')
  canvas.width = videoEl.videoWidth
  canvas.height = videoEl.videoHeight
  const ctx = canvas.getContext('2d')!
  // Mirror only when enabled (front-facing cameras default on, external cameras default off)
  if (mirrored) {
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
  }
  ctx.drawImage(videoEl, 0, 0)
  // Apply canvas filter for non-normal filters
  if (filter !== 'normal') {
    applyCanvasFilter(ctx, filter, canvas.width, canvas.height)
  }
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}
```

---

## 6. Filter Flow

### Live Preview (CSS-based)

```
User selects filter
        │
        ▼
sessionStore.setFilter(filterId)
        │
        ▼
CameraPreview re-renders
  - style={{ filter: getCssFilterString(filterId, brightness, contrast) }}
  - No stream interruption
  - No canvas operations
```

**CSS filter strings:**

| Filter | CSS Value |
|---|---|
| normal | `none` |
| grayscale | `grayscale(100%)` |
| bw | `grayscale(100%) contrast(150%) brightness(110%)` |
| sepia | `sepia(80%)` |
| vintage | `sepia(40%) contrast(90%) brightness(95%) saturate(85%)` |

### Export (Canvas pixel manipulation)

For export accuracy, CSS filters are re-implemented as canvas `ImageData` operations:

```
composer.ts calls applyCanvasFilter(ctx, filterId)
        │
        ▼
getImageData() → pixel array manipulation → putImageData()
```

This ensures the exported PNG matches exactly what the user saw in preview.

---

## 7. Composition Flow

```
Review Screen mounts
        │
        ▼
composer.compose(frames, template, filter, options) called
        │
        ▼
[Create offscreen canvas at 2× export resolution]
        │
        ▼
[Draw background — white or custom color]
        │
        ▼
[For each slot in template.slots:]
  - Calculate destination rect (x, y, w, h) with padding
  - putImageData(frames[i]) into temp canvas
  - drawImage(tempCanvas, destX, destY, destW, destH)
  - Apply canvas filter to slot region
        │
        ▼
[Draw decorations if enabled:]
  - Frame border: strokeRect() with configured color/width
  - Label text: fillText() at bottom with configured font/size
        │
        ▼
[Return canvas element for preview + export]
```

### Template Layout Definitions

```typescript
interface TemplateSlot {
  x: number      // 0–1 normalized
  y: number      // 0–1 normalized
  width: number  // 0–1 normalized
  height: number // 0–1 normalized
}

interface Template {
  id: TemplateId
  name: string
  shotCount: 1 | 2 | 4
  canvasAspectRatio: number  // width / height
  slots: TemplateSlot[]
  padding: number  // normalized padding between slots
}
```

| Template | Canvas Ratio | Slots |
|---|---|---|
| single | 3:4 | 1 centered slot |
| double | 3:5 | 2 stacked vertically |
| grid | 1:1 | 4 in 2×2 grid |
| strip | 1:3.5 | 4 stacked vertically (classic strip) |

---

## 8. Export Flow

```
User clicks "Download PNG" or "Download JPEG"
        │
        ▼
sessionStore.status = 'exporting'
ExportPanel shows loading spinner
        │
        ▼
exporter.export(composedCanvas, format, quality)
        │
        ▼
[canvas.toBlob(callback, mimeType, quality)]
        │
        ├─ [Success]
        │     ▼
        │  URL.createObjectURL(blob)
        │  Create <a> element, set href + download attribute
        │  Programmatically click <a>
        │  URL.revokeObjectURL() after download
        │  sessionStore.status = 'reviewing'
        │
        └─ [Failure]
              ▼
           sessionStore.status = 'reviewing'
           Show error toast with retry option
```

---

## 9. Permission and Error State Strategy

### Permission States

```typescript
type CameraError =
  | { type: 'permission-denied' }
  | { type: 'permission-dismissed' }
  | { type: 'no-device' }
  | { type: 'device-in-use' }
  | { type: 'device-disconnected' }   // device removed after stream was active
  | { type: 'not-supported' }
  | { type: 'insecure-context' }
  | { type: 'stream-interrupted' }
  | { type: 'unknown'; message: string }
```

### Error → UI Mapping

| Error Type | Screen Component | Recovery Action |
|---|---|---|
| `permission-denied` | `PermissionDenied` | Instructions to unblock + retry button |
| `permission-dismissed` | `PermissionRequest` | Re-show permission request |
| `no-device` | `NoCameraError` | Refresh page / check device / external camera setup guide |
| `device-in-use` | `NoCameraError` | Close other apps + retry |
| `device-disconnected` | `StreamInterrupted` | Reconnect device + retry button |
| `not-supported` | `UnsupportedBrowser` | List of supported browsers |
| `insecure-context` | `UnsupportedBrowser` | HTTPS warning |
| `stream-interrupted` | `StreamInterrupted` | Reconnect button |
| `unknown` | `ErrorBoundary` fallback | Refresh page |

### `getUserMedia` Error Mapping

```typescript
function mapGetUserMediaError(err: unknown): CameraError {
  if (!(err instanceof Error)) return { type: 'unknown', message: String(err) }
  switch (err.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return { type: 'permission-denied' }
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return { type: 'no-device' }
    case 'NotReadableError':
    case 'TrackStartError':
      return { type: 'device-in-use' }
    case 'OverconstrainedError':
      return { type: 'unknown', message: err.message }
    default:
      return { type: 'unknown', message: err.message }
  }
}
```

### Stream Interruption Detection

After a stream becomes active, the application monitors for unexpected track endings:

```typescript
stream.getVideoTracks().forEach(track => {
  track.addEventListener('ended', () => {
    // Track ended unexpectedly — device was disconnected or revoked
    setCameraError({ type: 'device-disconnected' })
  })
})
```

This covers the case where a USB camera or HDMI capture card is physically unplugged mid-session.

---

## 10. Responsive Strategy

### Breakpoints (Tailwind defaults)

| Breakpoint | Width | Layout Strategy |
|---|---|---|
| `sm` | 640px | Mobile: single column, controls below preview |
| `md` | 768px | Tablet: controls in side panel |
| `lg` | 1024px | Desktop: full side panel, larger preview |
| `xl` | 1280px | Wide desktop: max-width container |

### Capture Workspace Layout

**Mobile (< 768px):**
```
┌─────────────────────┐
│   Camera Preview    │  ← full width, 4:3 aspect
├─────────────────────┤
│  [Camera Picker ▼]  │  ← device selector dropdown
├─────────────────────┤
│  Shot Progress      │
├─────────────────────┤
│  [Capture Button]   │  ← large touch target
├─────────────────────┤
│  ▼ Options          │  ← collapsible accordion
│  Template | Filter  │
│  Countdown          │
└─────────────────────┘
```

**Desktop (≥ 1024px):**
```
┌──────────────────────────┬──────────────────┐
│                          │  Camera [▼ pick] │
│    Camera Preview        │  Template        │
│                          │  Filter          │
│                          │  Countdown       │
│                          │──────────────────│
│                          │  Shot Progress   │
│                          │  [Capture]       │
│                          │  [Retake]        │
└──────────────────────────┴──────────────────┘
```

### Video Preview Sizing

The `<video>` element uses `object-fit: cover` within a container that maintains the selected template's aspect ratio using the `aspect-ratio` CSS property. This prevents distortion across all screen sizes.

---

## 11. Accessibility Strategy

### Focus Management

- On navigation to the capture workspace, focus is moved to the first interactive control (template selector or capture button).
- On error screen mount, focus is moved to the error heading.
- Modal/overlay elements trap focus using a focus trap utility.

### Live Regions

```tsx
// Countdown announcements
<div aria-live="assertive" aria-atomic="true" className="sr-only">
  {isCountingDown ? `${countdown}` : ''}
</div>

// Shot progress
<div aria-live="polite" className="sr-only">
  {`Shot ${currentShot} of ${totalShots} captured`}
</div>

// Export status
<div aria-live="polite" className="sr-only">
  {exportStatus === 'exporting' ? 'Exporting photo, please wait' : ''}
  {exportStatus === 'done' ? 'Photo downloaded successfully' : ''}
</div>
```

### Keyboard Navigation

| Key | Action |
|---|---|
| `Space` / `Enter` | Trigger capture button |
| `Escape` | Cancel countdown / close overlay |
| `Tab` | Navigate between controls |
| `Arrow keys` | Navigate filter/template options |

### Semantic HTML

- `<main>` wraps the primary content area
- `<nav>` for any navigation elements
- `<button>` for all interactive controls (never `<div onClick>`)
- `<figure>` + `<figcaption>` for the camera preview
- Headings follow a logical `h1 → h2 → h3` hierarchy

---

## 12. State Management Design

### Session Store Shape

```
sessionStore
├── config
│   ├── template: TemplateId
│   ├── filter: FilterId
│   ├── countdown: 3 | 5 | 10
│   ├── frameEnabled: boolean
│   └── labelText: string
├── capture
│   ├── status: SessionStatus
│   ├── currentShot: number
│   ├── totalShots: number
│   └── capturedFrames: ImageData[]
└── camera
    ├── stream: MediaStream | null
    ├── selectedDeviceId: string | null
    ├── availableDevices: MediaDeviceInfo[]
    └── cameraError: CameraError | null
```

### Why Zustand over React Context

- No provider nesting required
- Selective subscriptions prevent unnecessary re-renders of the video preview
- Simple `resetSession()` action clears all state atomically
- Easy to test store logic in isolation

---

## 13. Component Architecture

### Component Hierarchy (Capture Workspace)

```
BoothPage
├── ErrorBoundary
│   └── CameraProvider (useCamera + useDevices hook context)
│       ├── PermissionGate
│       │   ├── PermissionRequest
│       │   └── [children when granted]
│       │       ├── CameraDevicePicker      ← NEW: device selector
│       │       ├── CameraPreview
│       │       │   └── CountdownOverlay
│       │       ├── ShotProgress
│       │       └── ControlPanel
│       │           ├── TemplateSelector
│       │           ├── FilterSelector
│       │           ├── CountdownSelector
│       │           ├── CaptureButton       ← disabled when camera not ready
│       │           └── RetakeButton
└── [when status === 'reviewing']
    └── ReviewScreen
        ├── ReviewCanvas
        ├── CustomizePanel
        └── ExportPanel
```

### `CameraDevicePicker` Component

```tsx
// Renders a <select> or custom dropdown of available videoinput devices
// Props:
//   devices: MediaDeviceInfo[]
//   selectedDeviceId: string | null
//   onSelect: (deviceId: string) => void
//   disabled: boolean  // true during active capture sequence

// Behaviour:
// - Shows "No cameras found" with help link when devices is empty
// - Shows generic labels ("Camera 1") before permission, real labels after
// - Triggers device switch via onSelect → useCamera re-initialises stream
// - Hidden (single device) or visible (multiple devices)
```

---

## 14. Camera Device Support Strategy

### Supported Device Categories

| Category | How it reaches the browser | Notes |
|---|---|---|
| Built-in laptop/desktop webcam | OS exposes directly as UVC device | Always available; no setup required |
| USB webcam | OS exposes via UVC driver | Plug-and-play on all major OSes |
| HDMI capture card | OS exposes capture card as video input | Works with any camera connected via HDMI |
| DSLR/mirrorless (webcam mode) | Camera manufacturer utility or UVC firmware | Requires user setup; see below |
| DSLR/mirrorless (tethered) | Vendor SDK (Canon EDSDK, Nikon SDK, gPhoto2) | **Not supported in MVP** |

### DSLR/Mirrorless as Webcam-Compatible Source

Many modern DSLR and mirrorless cameras can be used with this application **without any special integration**, provided the user configures them as a webcam-compatible source first:

- **Canon:** EOS Webcam Utility (Windows/macOS)
- **Sony:** Imaging Edge Webcam (Windows/macOS)
- **Nikon:** Webcam Utility (Windows/macOS)
- **Fujifilm:** X Webcam (Windows/macOS)
- **Any camera:** HDMI output → HDMI capture card (e.g., Elgato Cam Link, Magewell) → USB to computer

Once configured, the camera appears in `navigator.mediaDevices.enumerateDevices()` as a standard `videoinput` device and is fully supported by this application.

### Browser Limitations

- The browser can only access devices that the OS has exposed as video input sources.
- Device labels are empty strings until the user grants camera permission (browser privacy protection).
- `enumerateDevices()` returns all `videoinput` devices but cannot distinguish between device types (webcam vs DSLR vs capture card) — all are treated equally.
- On iOS Safari, only the front camera is accessible on some devices; rear camera access depends on iOS version.
- The browser has no access to camera settings (ISO, aperture, shutter speed) regardless of device type.

### Why Direct DSLR Tethering is Excluded from MVP

Direct tethering requires communicating with the camera body over USB using vendor-specific protocols (PTP/MTP extensions). This is not possible from a browser sandbox for the following reasons:

1. **No browser API for USB PTP/MTP** — `navigator.usb` (WebUSB) could theoretically be used, but vendor camera protocols are not publicly documented and require reverse engineering or licensed SDKs.
2. **Vendor SDK licensing** — Canon EDSDK, Nikon SDK, and similar require NDA agreements and are not suitable for open-source distribution.
3. **Platform dependency** — Tethering libraries (gPhoto2, libgphoto2) are native C libraries requiring OS-level installation, incompatible with a browser-only deployment model.
4. **Complexity vs value** — The vast majority of photobooth use cases are served by webcam-mode cameras or HDMI capture. Full tethering adds significant complexity for a narrow use case.

### Tradeoff: Browser Camera Source Support vs Full DSLR Tethered Desktop Architecture

| Dimension | Browser `getUserMedia` (MVP) | Native DSLR Tethering (Phase 2+) |
|---|---|---|
| **Deployment** | Any browser, any OS, zero install | Requires Electron/Tauri or native app |
| **Camera support** | All webcam-compatible sources | Full DSLR body control (ISO, AF, shutter) |
| **Image quality** | Up to 1080p video frame | Full RAW/JPEG from camera sensor |
| **Setup for end user** | Zero (built-in/USB) or minimal (DSLR webcam mode) | Camera utility or native app install required |
| **Open-source viability** | Fully open, no SDK licensing | Vendor SDK licensing restrictions |
| **Maintenance burden** | Low — standard Web APIs | High — per-vendor SDK, OS-specific |
| **MVP fit** | ✅ Correct scope | ❌ Over-engineered for MVP |

**Decision:** Browser `getUserMedia` is the correct foundation for the MVP. DSLR tethering is a valid Phase 2 track for a native desktop companion app (Electron/Tauri), documented separately.

---

## 15. Technology Decisions and Tradeoffs

### 14.1 Canvas API vs CSS-Only Composition

| Approach | Pros | Cons |
|---|---|---|
| **Canvas API** (chosen) | Pixel-perfect export, filter accuracy, arbitrary layout, high-res output | More complex code, requires offscreen canvas management |
| CSS-only | Simpler code, GPU-accelerated | Cannot export to image file, no pixel-level filter control, layout limited to CSS capabilities |

**Decision:** Canvas API is required for export. CSS filters are used for live preview performance, with Canvas as the export path.

### 14.2 Fully Client-Side vs Optional Backend

| Approach | Pros | Cons |
|---|---|---|
| **Client-side only** (chosen for MVP) | Privacy-first, no infra cost, instant deploy, no auth needed | No persistence, no sharing URLs, no cloud gallery |
| Backend (Phase 2) | Enables sharing, gallery, analytics, print | Adds infra complexity, cost, privacy considerations |

**Decision:** MVP is fully client-side. Backend features are explicitly Phase 2.

### 14.3 Local Session State vs Persisted Sessions

| Approach | Pros | Cons |
|---|---|---|
| **In-memory only** (chosen for MVP) | Privacy-first, no storage permissions, simple | Photos lost on refresh/close |
| localStorage / IndexedDB | Survives refresh, better UX | Privacy concerns, storage limits, serialization complexity for ImageData |

**Decision:** In-memory only for MVP. Persistence is a Phase 2 opt-in feature.

### 14.4 Real-Time Filters vs Post-Capture Filters

| Approach | Pros | Cons |
|---|---|---|
| **Real-time CSS preview + post-capture canvas** (chosen) | Best performance, no stream interruption, accurate export | Two implementations of same filter (CSS + canvas) |
| Real-time canvas rendering | Single implementation | High CPU usage, potential frame drops, complex video-to-canvas pipeline |
| Post-capture only | Simplest implementation | User cannot preview filter before capture |

**Decision:** CSS for live preview (performance), Canvas for export (accuracy). Filter definitions are centralized so both implementations stay in sync.

### 14.5 Zustand vs React Context

| Approach | Pros | Cons |
|---|---|---|
| **Zustand** (chosen) | Minimal boilerplate, selective subscriptions, easy reset, testable | Additional dependency |
| React Context | Zero dependencies, built-in | Re-render propagation issues, verbose for complex state, harder to reset atomically |

**Decision:** Zustand. The selective subscription model is critical for preventing the video preview from re-rendering on every state change.

---

## 16. CI/CD Pipeline Design

### GitHub Actions Workflow (`.github/workflows/ci.yml`)

```yaml
# Triggers: push to main, all PRs
jobs:
  lint:       # eslint --max-warnings 0
  typecheck:  # tsc --noEmit
  test:       # vitest run --coverage
  build:      # next build
```

All four jobs run in parallel. PRs require all checks to pass before merge.

### Deployment

- **Platform:** Vercel (recommended)
- **Build command:** `next build`
- **Output directory:** `.next`
- **Environment variables:** None required for MVP (see `.env.example`)
- **HTTPS:** Enforced by Vercel by default — satisfies `REQ-SEC-01`

---

## 17. TypeScript Types Reference

```typescript
// Core domain types
type TemplateId = 'single' | 'double' | 'grid' | 'strip'
type FilterId = 'normal' | 'grayscale' | 'bw' | 'sepia' | 'vintage'
type CountdownDuration = 3 | 5 | 10
type SessionStatus = 'idle' | 'requesting' | 'capturing' | 'reviewing' | 'exporting'
type ExportFormat = 'png' | 'jpeg'
type ExportQuality = 'low' | 'medium' | 'high'

type CameraError =
  | { type: 'permission-denied' }
  | { type: 'permission-dismissed' }
  | { type: 'no-device' }
  | { type: 'device-in-use' }
  | { type: 'device-disconnected' }
  | { type: 'not-supported' }
  | { type: 'insecure-context' }
  | { type: 'stream-interrupted' }
  | { type: 'unknown'; message: string }

interface CapturedFrame {
  imageData: ImageData
  timestamp: number
  filter: FilterId
}

interface CompositionOptions {
  template: TemplateId
  filter: FilterId
  frameEnabled: boolean
  labelText: string
  scale: number  // 1 for preview, 2 for export
}

interface ExportOptions {
  format: ExportFormat
  quality: ExportQuality
  filename: string
}
```

---

## 18. Performance Considerations

### Preventing Video Preview Re-renders

The `<video>` element is managed via a `ref` and is never re-created. The Zustand store uses selective subscriptions so that filter/template changes do not cause the video component to re-render:

```typescript
// Only subscribe to what this component needs
const filter = useSessionStore(state => state.config.filter)
// NOT: const store = useSessionStore() — this would re-render on any change
```

### Canvas Memory Management

- Offscreen canvases are created, used, and dereferenced immediately after export.
- `ImageData` objects in `capturedFrames` are cleared on `resetSession()`.
- `URL.createObjectURL()` URLs are revoked immediately after the download is triggered.

### Stream Cleanup

```typescript
function stopStream(stream: MediaStream) {
  stream.getTracks().forEach(track => track.stop())
}
// Called in useCamera cleanup effect and on resetSession
```
