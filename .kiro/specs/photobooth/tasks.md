# placeholder

# Photobooth Web Application — Implementation Tasks

**Version:** 1.1.0
**Status:** Ready for Implementation
**Date:** 2026-04-18
**Depends on:** requirements.md v1.1.0, design.md v1.1.0

---

## How to Read This File

- `- [ ]` Not started
- `- [-]` In progress
- `- [x]` Complete
- Tasks marked `*` are optional enhancements — implement after core MVP is stable
- Each task references the requirement(s) it satisfies
- Tasks are ordered for incremental delivery: each group builds on the previous

---

## Phase 1 — Project Scaffold and Tooling

### 1. Initialize Next.js project with full toolchain

- [x] 1.1 Bootstrap Next.js 14+ project with TypeScript and App Router (`create-next-app`)
- [x] 1.2 Configure Tailwind CSS with custom design tokens (colors, spacing, fonts)
- [x] 1.3 Install and configure shadcn/ui (Button, Slider, Select, Badge primitives)
- [x] 1.4 Configure ESLint with Next.js recommended rules + `eslint-plugin-jsx-a11y`
- [x] 1.5 Configure Prettier with `.prettierrc`
- [x] 1.6 Configure Vitest with jsdom environment and React Testing Library
- [x] 1.7 Configure `tsconfig.json` with `strict: true` and path aliases (`@/`)
- [x] 1.8 Add `.editorconfig` for cross-editor consistency
- [x] 1.9 Add `.env.example` documenting that no env vars are required for MVP

**Acceptance criteria:** `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`, and `npm run test` all pass on a clean checkout.

---

### 2. Repository documentation and open-source files

- [x] 2.1 Write `README.md` with project description, features, setup, scripts, architecture overview, Vercel deployment instructions, and roadmap section (REQ-OSS-02)
- [x] 2.2 Write `CONTRIBUTING.md` with dev setup, branch naming, conventional commit format, PR process, and code style guide (REQ-OSS-03)
- [x] 2.3 Add `CODE_OF_CONDUCT.md` using Contributor Covenant v2.1 (REQ-OSS-04)
- [x] 2.4 Add `LICENSE` file (MIT) (REQ-OSS-01)
- [x] 2.5 Add `.github/workflows/ci.yml` with four parallel jobs: lint, typecheck, test, build (REQ-OSS-07)

**Acceptance criteria:** CI workflow runs successfully on a push to a feature branch. All four jobs pass.

---

## Phase 2 — Core Types, State, and Camera Foundation

### 3. Shared TypeScript types

- [x] 3.1 Define all core domain types in `src/types/index.ts`:
  - `TemplateId`, `FilterId`, `CountdownDuration`, `SessionStatus`
  - `ExportFormat`, `ExportQuality`
  - `CameraError` union type (including `device-disconnected`)
  - `CapturedFrame`, `CompositionOptions`, `ExportOptions`
  - `Template`, `TemplateSlot` interfaces

**Acceptance criteria:** TypeScript compiles with no errors. All types are exported and importable from `@/types`.

---

### 4. Zustand session store

- [x] 4.1 Implement `src/store/sessionStore.ts` with full state shape (config, capture, camera slices)
- [x] 4.2 Implement all actions: `setTemplate`, `setFilter`, `setCountdown`, `setSelectedDeviceId`, `setAvailableDevices`, `setMirrored`, `startSession`, `captureFrame`, `retakeLastFrame`, `resetSession`, `setStream`, `setCameraError`
- [x] 4.3 Persist `selectedDeviceId` to `sessionStorage` (survives soft navigation, cleared on tab close)
- [x] 4.4 Ensure `resetSession` clears all captured frames and camera errors atomically

**Acceptance criteria:** Store actions update state correctly. `resetSession` returns store to initial state. `selectedDeviceId` is restored from `sessionStorage` on mount.

---

### 5. Camera device enumeration (`useDevices`)

- [x] 5.1 Implement `src/lib/camera/useDevices.ts` hook
- [x] 5.2 Call `navigator.mediaDevices.enumerateDevices()` and filter for `videoinput` kind
- [x] 5.3 Listen for `devicechange` event and refresh device list automatically
- [x] 5.4 Return generic labels ("Camera 1", "Camera 2") when device labels are empty strings (pre-permission)
- [x] 5.5 Re-enumerate after permission is granted to get real device labels
- [x] 5.6 Handle the case where `navigator.mediaDevices` is undefined (unsupported browser)

**Acceptance criteria:** Hook returns correct device list. Adding/removing a USB camera updates the list within 1 second. Generic labels shown before permission, real labels shown after.

---

### 6. Camera stream lifecycle (`useCamera`)

- [x] 6.1 Implement `src/lib/camera/useCamera.ts` hook with state machine: `IDLE → REQUESTING → ACTIVE → ERROR → REQUESTING`
- [x] 6.2 Implement `src/lib/camera/constraints.ts` — build `MediaStreamConstraints` from `deviceId`, resolution preference (up to 1080p), and facing mode
- [x] 6.3 Request stream with `{ exact: deviceId }` when a device is selected; fall back to `{ video: true }` otherwise
- [x] 6.4 Assign stream to `videoRef.current.srcObject` without re-creating the `<video>` element
- [x] 6.5 Implement `mapGetUserMediaError` in `src/lib/camera/constraints.ts` to map all `getUserMedia` error names to `CameraError` union types
- [x] 6.6 Attach `track.addEventListener('ended', ...)` listener to detect device disconnection mid-session and set `device-disconnected` error
- [x] 6.7 Implement `stopStream(stream)` — call `track.stop()` on all tracks
- [x] 6.8 Call `stopStream` in the hook's cleanup effect and on `resetSession`
- [x] 6.9 Implement device switching: when `selectedDeviceId` changes, stop current stream then start new stream

**Acceptance criteria:** Stream starts on demand. Switching devices stops the old stream and starts the new one without page reload. Unplugging a USB camera triggers `device-disconnected` error state. Stream is stopped when component unmounts.

---

### 7. Browser capability detection

- [x] 7.1 Implement `src/lib/utils/browser.ts` with:
  - `isGetUserMediaSupported(): boolean`
  - `isSecureContext(): boolean`
  - `getBrowserName(): string` (for error messages)
- [x] 7.2 Check for insecure context on app mount and surface `insecure-context` error before requesting camera

**Acceptance criteria:** Unsupported browser and HTTP context are detected before any camera request is made.

---

## Phase 3 — Camera UI and Device Picker

### 8. Camera device picker component

- [x] 8.1 Implement `src/components/booth/CameraDevicePicker.tsx`
- [x] 8.2 Render a `<select>` (or shadcn Select) listing all available `videoinput` devices by label
- [x] 8.3 Show "No cameras found" state with a help link when device list is empty
- [x] 8.4 Auto-select the first device when only one is available; show picker only when multiple devices exist
- [x] 8.5 Disable the picker during an active capture sequence
- [x] 8.6 On selection change, call `setSelectedDeviceId` → triggers `useCamera` device switch
- [x] 8.7 Write component test: renders device list, shows "no cameras" state, calls handler on change

**Acceptance criteria:** Picker shows all available cameras. Selecting a different camera switches the live preview within 2 seconds. Picker is hidden when only one camera is available. Disabled during capture.

---

### 9. Camera preview component

- [x] 9.1 Implement `src/components/booth/CameraPreview.tsx` with a `<video>` element managed via `ref`
- [x] 9.2 Apply CSS `filter` style from `getCssFilterString(filterId, brightness, contrast)` to the video element
- [x] 9.3 Apply `transform: scaleX(-1)` when `isMirrored` is true
- [x] 9.4 Add `aria-label="Live camera preview"` and `<figure>` + `<figcaption>` wrapper
- [x] 9.5 Show a loading skeleton while stream is in `REQUESTING` state
- [x] 9.6 Implement camera readiness check: disable capture button and show reason when `videoEl.readyState < 2` or stream is not active (REQ-CAM-11)
- [x] 9.7 Write component test: renders video element, applies correct CSS filter class

**Acceptance criteria:** Video preview renders without distortion. CSS filter changes without stream interruption. Capture button is disabled until video is producing frames.

---

### 10. Permission and error screens

- [x] 10.1 Implement `src/components/permission/PermissionRequest.tsx` — explains why camera access is needed, with "Allow Camera" button
- [x] 10.2 Implement `src/components/permission/PermissionDenied.tsx` — step-by-step browser unblock instructions, retry button (REQ-CAM-07)
- [x] 10.3 Implement `src/components/errors/NoCameraError.tsx` — no device found message with:
  - Checklist: check USB connection, check OS camera permissions, check if another app is using the camera
  - Note: "If using a DSLR/mirrorless camera, ensure it is configured as a webcam-compatible source" (REQ-CAM-13)
- [x] 10.4 Implement `src/components/errors/UnsupportedBrowser.tsx` — lists supported browsers, HTTPS warning
- [x] 10.5 Implement `src/components/errors/StreamInterrupted.tsx` — stream lost mid-session, reconnect button
- [x] 10.6 Implement `src/components/errors/DeviceDisconnected.tsx` — device removed mid-session, reconnect/retry button
- [x] 10.7 Implement `src/components/errors/ErrorBoundary.tsx` — React error boundary with fallback UI (REQ-REL-03)
- [x] 10.8 Implement `PermissionGate` logic: renders correct error component based on `cameraError` type
- [x] 10.9 Write component tests for `PermissionDenied` and `NoCameraError` — verify correct message and CTA render

**Acceptance criteria:** Each error state renders the correct message, icon, and recovery action. Error messages are announced via `aria-live`. Focus moves to error heading on mount.

---

## Phase 4 — Capture Flow

### 11. Countdown and capture mechanics

- [x] 11.1 Implement `src/components/booth/CountdownOverlay.tsx` — animated countdown number overlay on camera preview
- [x] 11.2 Add `aria-live="assertive"` region that announces each countdown second to screen readers (REQ-A11Y-05)
- [x] 11.3 Implement countdown logic in a custom hook `useCountdown(duration, onComplete)`
- [x] 11.4 Implement flash/shutter effect — white overlay div, 150ms opacity animation on capture (REQ-CAP-07)
- [x] 11.5 Implement `captureFrame(videoEl, filter, mirrored)` in `src/lib/camera/capture.ts` — draws video frame to offscreen canvas, applies canvas filter, returns `ImageData`
- [x] 11.6 Implement `Escape` key handler to cancel active countdown (REQ-A11Y keyboard)

**Acceptance criteria:** Countdown displays and animates correctly. Screen reader announces each second. Flash effect plays at capture moment. Escape cancels countdown.

---

### 12. Shot progress and multi-shot flow

- [x] 12.1 Implement `src/components/booth/ShotProgress.tsx` — "Shot N of M" indicator with visual dots/steps
- [x] 12.2 Add `aria-live="polite"` region announcing shot progress to screen readers
- [x] 12.3 Implement multi-shot auto-advance: after each capture, pause 500ms then start next countdown automatically
- [x] 12.4 Implement retake flow: `retakeLastFrame()` removes last frame, decrements `currentShot`, restarts countdown for that shot
- [x] 12.5 Implement `src/components/booth/RetakeButton.tsx` — visible only after at least one shot is captured
- [x] 12.6 Navigate to review screen when `capturedFrames.length === totalShots`

**Acceptance criteria:** Multi-shot sessions advance automatically. Retake correctly replaces the last frame. Progress indicator updates after each capture. Review screen appears when all shots are done.

---

### 13. Control panel and selectors

- [x] 13.1 Implement `src/components/booth/TemplateSelector.tsx` — visual grid of template options with preview thumbnails
- [x] 13.2 Implement `src/components/booth/FilterSelector.tsx` — horizontal scroll of filter swatches with live preview
- [x] 13.3 Implement `src/components/booth/CountdownSelector.tsx` — 3s / 5s / 10s toggle buttons
- [x] 13.4 Implement `src/components/booth/ControlPanel.tsx` — wraps all selectors; collapsible accordion on mobile
- [x] 13.5 Implement `src/components/booth/CaptureButton.tsx` — primary action button; disabled with tooltip when camera not ready
- [x] 13.6 Ensure all selectors are keyboard navigable with arrow keys (REQ-A11Y-01)
- [x] 13.7 Ensure all controls have visible focus states and accessible labels (REQ-A11Y-02, REQ-A11Y-03)

**Acceptance criteria:** All selectors update session state correctly. Control panel collapses on mobile. All controls are keyboard accessible. Touch targets are ≥ 44×44px.

---

## Phase 5 — Filters

### 14. Filter utilities

- [x] 14.1 Implement `src/lib/filters/filterDefinitions.ts` — registry of all 5 filter presets with ID, name, CSS string, and canvas function reference
- [x] 14.2 Implement `src/lib/filters/cssFilters.ts` — `getCssFilterString(filterId, brightness, contrast): string`
- [x] 14.3 Implement `src/lib/filters/canvasFilters.ts` — `applyCanvasFilter(ctx, filterId, width, height): void` using `getImageData`/`putImageData` pixel manipulation for: grayscale, bw, sepia, vintage
- [x] 14.4 Write unit tests for `getCssFilterString` — all 5 filters + brightness/contrast combinations
- [ ] 14.5 Write unit tests for `applyCanvasFilter` — verify pixel values change correctly for each filter

**Acceptance criteria:** CSS filter strings match design spec. Canvas filter produces visually equivalent output to CSS filter. Tests pass with ≥ 70% coverage on filter utilities.

---

## Phase 6 — Composition Engine

### 15. Template layout definitions

- [x] 15.1 Implement `src/lib/composition/templates.ts` — define all 4 templates with normalized slot geometry:
  - `single`: 3:4 ratio, 1 slot
  - `double`: 3:5 ratio, 2 stacked slots
  - `grid`: 1:1 ratio, 4 slots in 2×2
  - `strip`: 1:3.5 ratio, 4 stacked slots (classic strip)
- [ ] 15.2 Write unit tests for template slot calculations — verify slot positions, dimensions, and padding are within bounds (0–1 normalized)

**Acceptance criteria:** All 4 templates have correct slot geometry. No slot overflows canvas bounds. Tests pass.

---

### 16. Canvas composition engine

- [x] 16.1 Implement `src/lib/composition/composer.ts` — `compose(frames, template, filter, options, scale): HTMLCanvasElement`
- [ ] 16.2 Create offscreen canvas at `scale × template dimensions`
- [ ] 16.3 Draw white background
- [ ] 16.4 For each slot: calculate pixel rect from normalized coords, draw `ImageData` frame scaled to fit slot with `object-fit: cover` crop behavior
- [ ] 16.5 Apply canvas filter to each slot region after drawing
- [x] 16.6 Implement `src/lib/composition/decorations.ts` — `drawFrame(ctx, options)` and `drawLabel(ctx, text, options)`
- [ ] 16.7 Write unit tests for `compose` — verify canvas dimensions, slot count, and that frames are placed in correct positions

**Acceptance criteria:** Composed canvas has correct dimensions at 1× (preview) and 2× (export). All frames are placed without overflow. Frame border and label render when enabled.

---

## Phase 7 — Review Screen and Export

### 17. Review screen

- [x] 17.1 Implement `src/components/review/ReviewCanvas.tsx` — renders composed canvas at preview scale (1×)
- [x] 17.2 Implement `src/components/review/CustomizePanel.tsx` — frame toggle, label text input, background color picker
- [ ] 17.3 Re-compose canvas when filter, frame, or label options change
- [ ] 17.4 Implement filter selector on review screen (post-capture filter change)

**Acceptance criteria:** Review screen shows correct composition. Changing filter/frame/label updates the preview in real time.

---

### 18. Export utilities and download

- [x] 18.1 Implement `src/lib/export/filename.ts` — `generateFilename(format): string` → `photobooth-YYYY-MM-DD-HHmmss.{ext}`
- [x] 18.2 Implement `src/lib/export/exporter.ts` — `exportImage(canvas, format, quality): Promise<void>`
  - Re-compose at 2× scale
  - `canvas.toBlob(cb, mimeType, qualityValue)`
  - `URL.createObjectURL(blob)` → programmatic `<a>` click → `URL.revokeObjectURL()`
- [x] 18.3 Implement `src/components/review/ExportPanel.tsx` — PNG download button, JPEG download with quality selector (low/medium/high), loading spinner during export
- [ ] 18.4 Add `aria-live="polite"` region for export status announcements
- [ ] 18.5 Handle export failure: catch `toBlob` errors, show error toast with retry option (REQ-EXP-06)
- [ ] 18.6 Write unit tests for `generateFilename` — correct format, timestamp pattern
- [ ] 18.7 Write unit tests for `exporter` — mock `canvas.toBlob`, verify correct MIME type and quality values passed

**Acceptance criteria:** PNG download works. JPEG download respects quality setting. Filename includes correct timestamp. Export failure shows error with retry. Export completes within 3 seconds for 4-shot strip at 2×.

---

## Phase 8 — Landing Screen and App Shell

### 19. Landing page

- [x] 19.1 Implement `src/app/page.tsx` — landing screen with app name, tagline, feature highlights, and "Start Photobooth" CTA
- [ ] 19.2 No camera access on landing page (REQ-CAM-01)
- [ ] 19.3 "Start Photobooth" navigates to `/booth`

**Acceptance criteria:** Landing page renders without requesting camera. CTA navigates to booth. Page achieves Lighthouse Performance ≥ 85.

---

### 20. App shell and layout

- [x] 20.1 Implement `src/app/layout.tsx` — root layout with metadata, Open Graph tags, font loading
- [x] 20.2 Implement `src/components/layout/Header.tsx` — minimal header with app name and optional restart link
- [x] 20.3 Implement `src/components/layout/Footer.tsx` — minimal footer with GitHub link and MIT license note
- [ ] 20.4 Implement `src/app/globals.css` — Tailwind base, CSS custom properties for theme tokens
- [x] 20.5 Implement `src/app/booth/page.tsx` — capture workspace page, wraps all booth components with `ErrorBoundary`

**Acceptance criteria:** App shell renders correctly on all breakpoints. No layout shift on navigation.

---

## Phase 9 — Responsive Design and Accessibility Polish

### 21. Responsive layout

- [x] 21.1 Implement mobile layout for capture workspace: full-width preview, controls below, collapsible options panel (REQ-RES-01, REQ-RES-02)
- [x] 21.2 Implement desktop layout: preview left, control panel right sidebar (REQ-RES-01)
- [x] 21.3 Ensure `<video>` uses `object-fit: cover` within aspect-ratio container (REQ-RES-03)
- [ ] 21.4 Verify all touch targets are ≥ 44×44px on mobile (REQ-RES-04)

**Acceptance criteria:** Layout is correct and usable on 320px, 768px, and 1280px viewports. No horizontal scroll on mobile.

---

### 22. Accessibility audit and fixes

- [ ] 22.1 Verify logical tab order through all interactive controls
- [ ] 22.2 Add `aria-label` to all icon-only buttons
- [ ] 22.3 Verify all `aria-live` regions are in place (countdown, shot progress, export status, errors)
- [ ] 22.4 Verify focus moves to error heading when error screen mounts
- [ ] 22.5 Run `eslint-plugin-jsx-a11y` and fix all warnings
- [ ] 22.6 Verify color contrast meets WCAG 2.1 AA (4.5:1 text, 3:1 UI components)

**Acceptance criteria:** No `jsx-a11y` lint errors. All interactive elements have accessible names. Focus management works correctly on screen transitions.

---

## Phase 10 — Testing and CI Verification

### 23. Unit test suite

- [ ] 23.1 Tests for `cssFilters.ts` — all filter strings, brightness/contrast combinations
- [ ] 23.2 Tests for `canvasFilters.ts` — pixel manipulation correctness for each filter
- [ ] 23.3 Tests for `templates.ts` — slot geometry bounds and shot counts
- [ ] 23.4 Tests for `composer.ts` — canvas dimensions, frame placement
- [ ] 23.5 Tests for `filename.ts` — format and timestamp pattern
- [ ] 23.6 Tests for `exporter.ts` — mock `toBlob`, verify MIME type and quality
- [ ] 23.7 Tests for `mapGetUserMediaError` — all error name mappings

**Acceptance criteria:** All unit tests pass. Utility modules achieve ≥ 70% coverage.

---

### 24. Component test suite

- [ ] 24.1 `CameraDevicePicker.test.tsx` — renders device list, shows "no cameras" state, calls handler on change, disabled during capture
- [ ] 24.2 `CameraPreview.test.tsx` — renders video element, applies CSS filter, shows loading state
- [ ] 24.3 `PermissionDenied.test.tsx` — renders correct message and retry button
- [ ] 24.4 `NoCameraError.test.tsx` — renders DSLR guidance note, checklist items
- [ ] 24.5 `ErrorBoundary.test.tsx` — catches render error and shows fallback UI

**Acceptance criteria:** All component tests pass. Critical error states are covered.

---

### 25. CI verification

- [ ] 25.1 Verify `npm run lint` passes with zero warnings
- [ ] 25.2 Verify `npm run typecheck` passes with zero errors
- [ ] 25.3 Verify `npm run test` passes with coverage report
- [ ] 25.4 Verify `npm run build` produces a successful Next.js build
- [ ] 25.5 Verify GitHub Actions CI workflow runs all four jobs successfully on a PR

**Acceptance criteria:** All CI jobs pass on a clean branch. No lint errors, type errors, test failures, or build errors.

---

## Phase 11 — Deployment

### 26. Vercel deployment

- [ ] 26.1 Configure `next.config.ts` — no special config needed for client-side MVP; ensure no server-only APIs are used
- [ ] 26.2 Deploy to Vercel and verify HTTPS is enforced (satisfies REQ-SEC-01)
- [ ] 26.3 Verify camera access works on the deployed Vercel URL (HTTPS required for `getUserMedia`)
- [ ] 26.4 Add Vercel deployment badge and live demo URL to `README.md`

**Acceptance criteria:** App is live on Vercel. Camera access works. HTTPS is enforced.

---

## Optional Enhancements (Post-MVP, implement if time allows)

- [ ]* Add mirror toggle button in capture workspace for external cameras
- [ ]* Add background color picker for composition canvas
- [ ]* Add "copy to clipboard" button on review screen (Clipboard API)
- [ ]* Add PWA manifest for installability
- [ ]* Add keyboard shortcut reference tooltip in capture workspace

---

## Phase 2 — Future Architecture (Do Not Implement in MVP)

The following task groups are documented for future planning. They require architectural decisions beyond the browser-only MVP scope.

### Future: Advanced Camera and Hardware Integration

- [ ] Research Electron/Tauri wrapper for native OS camera access
- [ ] Evaluate gPhoto2 / libgphoto2 for DSLR USB tethering via native bridge
- [ ] Evaluate Canon EDSDK / Nikon SDK licensing for commercial use
- [ ] Design IPC protocol between native camera process and web UI
- [ ] Prototype hardware shutter trigger via USB HID or serial port
- [ ] Design printer integration using native print driver API (dye-sub / photo printer)
- [ ] Evaluate WebUSB feasibility for direct camera PTP/MTP communication

### Future: Event and Kiosk Features

- [ ] Implement offline event booth mode (PWA with full offline support)
- [ ] Implement kiosk mode (full-screen, touch-optimized, no browser chrome)
- [ ] Implement event preset system (save/load theme, filter, text config)
- [ ] Implement branded overlay upload (PNG overlay positioning)
- [ ] Implement QR code share flow
- [ ] Implement print mode with correct DPI and bleed settings
- [ ] Implement animated GIF export (burst capture)

### Future: Backend and Cloud Features

- [ ] Design cloud upload flow (S3 / Cloudinary)
- [ ] Design gallery mode with session persistence
- [ ] Design admin dashboard for event organizers
- [ ] Design privacy-respecting analytics
