# Photobooth Web Application — Requirements

**Version:** 1.1.0  
**Status:** Revised  
**Date:** 2026-04-18  
**Author:** Senior Product Engineer  

---

## 1. Overview

A professional, browser-based photobooth web application built for personal use, live events, branded activations, and open-source distribution. The application runs entirely client-side in the browser using the WebRTC `getUserMedia` API and the Canvas API for capture, composition, and export. No backend is required for the MVP.

The product must feel premium and polished while remaining simple enough for non-technical users at events. It must be suitable for public release on GitHub under the MIT License.

### Camera Device Scope

This application is a **browser-based photobooth**. Camera access is handled entirely through the browser's `navigator.mediaDevices` API. The supported device categories are:

- Built-in laptop/desktop webcams
- USB webcams
- HDMI capture cards that expose a video feed to the OS
- DSLR or mirrorless cameras **only when** they are configured as a webcam-compatible source (e.g., via manufacturer webcam utility, HDMI capture device, or USB video class driver) and appear to the browser as a standard video input device

**This application does not implement direct DSLR tethering, vendor SDK integration, shutter control, or any hardware-level camera body communication.** Those workflows are explicitly out of scope for the MVP and are documented in Section 8 (Phase 2).

---

## 2. Stakeholders and Users

| Role | Description |
|---|---|
| End User | Non-technical person at an event or personal session using the photobooth |
| Event Organizer | Person deploying the app for a branded or themed event |
| Developer / Contributor | Open-source contributor extending or maintaining the codebase |
| Self-Hoster | Developer deploying the app to Vercel or similar static hosting |

---

## 3. Functional Requirements

### 3.1 Camera and Device Access

**REQ-CAM-01** — The application MUST request webcam access only after an explicit user action (e.g., clicking "Start Photobooth"), never on page load.

**REQ-CAM-02** — The application MUST display a live camera preview with the correct aspect ratio once permission is granted.

**REQ-CAM-03** — The application MUST enumerate all available browser-visible video input devices using `navigator.mediaDevices.enumerateDevices()` and present them to the user as a selectable list.

**REQ-CAM-04** — The application MUST allow the user to select a specific camera source before starting a session. The selected `deviceId` MUST be used in the `getUserMedia` constraints.

**REQ-CAM-05** — The device list MUST refresh automatically when devices are added or removed (via the `devicechange` event).

**REQ-CAM-06** — The application MUST support front and rear camera selection on mobile devices when the OS exposes them as separate video input devices.

**REQ-CAM-07** — The application MUST handle the following camera failure states explicitly:
- Permission denied by user
- Permission denied by system/browser policy
- No camera device found
- Camera device in use by another application
- Browser does not support `getUserMedia`
- Selected device disconnected or became unavailable after stream started

**REQ-CAM-08** — The application MUST clean up and stop all media stream tracks when the user navigates away from the capture screen or closes the session.

**REQ-CAM-09** — The camera preview MUST mirror the image horizontally for front-facing cameras (selfie mode) to match user expectation. For external cameras (USB, HDMI capture), mirroring MUST be off by default with a user toggle available.

**REQ-CAM-10** — The application SHOULD attempt to request the highest available camera resolution up to 1920×1080, falling back gracefully to lower resolutions.

**REQ-CAM-11** — The application MUST perform a camera readiness check before allowing the capture sequence to begin. If the stream is not active or the video element has not started producing frames, the capture button MUST be disabled with a visible reason.

**REQ-CAM-12** — The camera device picker MUST display human-readable device labels when available. When labels are unavailable (before permission is granted), the picker MUST show generic labels (e.g., "Camera 1", "Camera 2") and update to real labels after permission is granted.

**REQ-CAM-13** — The application MUST display a contextual help message when no devices are found, explaining possible causes including: no camera connected, OS-level camera access blocked, or external camera not configured as a webcam-compatible source.

**REQ-CAM-14** — The application MUST NOT attempt direct DSLR tethering, vendor SDK communication, or hardware shutter control. DSLR/mirrorless cameras are supported only when they appear to the browser as a standard `videoinput` device.

---

### 3.2 Capture Flow

**REQ-CAP-01** — The user MUST be able to select a countdown duration before capture: 3 seconds, 5 seconds, or 10 seconds.

**REQ-CAP-02** — The countdown MUST be displayed prominently over the camera preview with a visible, animated countdown indicator.

**REQ-CAP-03** — The user MUST be able to select the number of shots per session: 1, 2, or 4 photos.

**REQ-CAP-04** — When multiple shots are selected, the application MUST automatically advance through each shot with the countdown, showing clear progress (e.g., "Shot 2 of 4").

**REQ-CAP-05** — The user MUST be able to retake the most recent shot before proceeding to the next.

**REQ-CAP-06** — The user MUST be able to restart the entire session from any point in the capture flow.

**REQ-CAP-07** — A flash/shutter visual effect MUST play at the moment of capture to provide clear feedback.

**REQ-CAP-08** — Captured frames MUST be stored in session state and remain available until the session is explicitly reset.

---

### 3.3 Templates and Composition

**REQ-TPL-01** — The application MUST provide the following layout templates:

| Template ID | Name | Description |
|---|---|---|
| `single` | Single Portrait | One photo, portrait orientation |
| `double` | 2-Shot Vertical | Two photos stacked vertically |
| `grid` | 4-Shot Grid | Four photos in a 2×2 grid |
| `strip` | Classic Strip | Four photos in a vertical strip (classic photobooth format) |

**REQ-TPL-02** — Each template MUST apply consistent spacing, padding, and safe crop behavior so photos are never clipped unexpectedly.

**REQ-TPL-03** — The user MUST be able to optionally add a frame border to the composition.

**REQ-TPL-04** — The user MUST be able to optionally add a text label (e.g., event name, date) to the bottom of the composition.

**REQ-TPL-05** — The final composition MUST be rendered to an HTML Canvas element at export quality (minimum 2× the on-screen preview resolution).

**REQ-TPL-06** — Template selection MUST be available before the capture session begins and MUST determine how many shots are required.

---

### 3.4 Filters and Visual Effects

**REQ-FLT-01** — The application MUST provide the following filter presets:

| Filter ID | Name |
|---|---|
| `normal` | Normal |
| `grayscale` | Grayscale |
| `bw` | Black & White (high contrast) |
| `sepia` | Sepia |
| `vintage` | Vintage |

**REQ-FLT-02** — The application MUST provide brightness and contrast adjustment controls.

**REQ-FLT-03** — Filters MUST be applied visually during the live preview so the user sees the effect before capture.

**REQ-FLT-04** — Filters MUST be applied consistently to the final exported composition.

**REQ-FLT-05** — Filter implementation MUST use CSS filters for live preview performance and Canvas pixel manipulation for export accuracy.

**REQ-FLT-06** — Switching filters MUST not interrupt the live camera stream.

---

### 3.5 Export

**REQ-EXP-01** — The user MUST be able to download the final composition as a PNG file.

**REQ-EXP-02** — The user MUST be able to optionally download as JPEG with a quality selector (low / medium / high).

**REQ-EXP-03** — The exported file MUST be named with a timestamp (e.g., `photobooth-2026-04-18-143022.png`).

**REQ-EXP-04** — Export MUST render at a higher resolution than the on-screen preview (minimum 2× scale factor).

**REQ-EXP-05** — The application MUST show a loading/progress indicator during export rendering.

**REQ-EXP-06** — The application MUST handle export failures gracefully with a user-facing error message and retry option.

---

### 3.6 User Interface and Screens

**REQ-UI-01 — Landing Screen**  
The application MUST display a landing screen with:
- Application name and tagline
- A prominent "Start Photobooth" call-to-action button
- Brief feature highlights or instructions
- No camera access requested at this stage

**REQ-UI-02 — Permission Screen**  
When camera access is being requested, the application MUST display:
- A clear explanation of why camera access is needed
- Visual indication that permission is being requested
- Troubleshooting guidance if permission is denied

**REQ-UI-03 — Capture Workspace**  
The capture screen MUST include:
- Live camera preview (primary focus)
- Camera source selector (device picker)
- Template selector
- Filter selector
- Countdown duration selector
- Shot progress indicator (e.g., "1 / 4")
- Capture button (disabled with reason when camera is not ready)
- Retake button (after first capture)
- Restart session button
- Settings/options panel (collapsible on mobile)

**REQ-UI-04 — Review Screen**  
After all shots are captured, the application MUST display:
- Final composed layout preview
- Filter selector (to change filter post-capture)
- Frame/text customization options
- Download PNG button
- Download JPEG button
- Start Over button
- Share button (Phase 2)

**REQ-UI-05 — Error Screen**  
The application MUST display a dedicated error state for:
- Camera permission denied
- No camera found
- Unsupported browser
- Stream interrupted mid-session
- Selected device disconnected during session
- External camera not accessible (not exposed as webcam-compatible source)

Each error state MUST include a descriptive message, an icon, and a recovery action (retry, refresh, or instructions). For external camera errors, the message MUST include a brief explanation that DSLR/mirrorless cameras require a webcam utility or HDMI capture device to be visible to the browser.

---

### 3.7 Responsive Design

**REQ-RES-01** — The application MUST be fully functional on desktop (1280px+), tablet (768px–1279px), and mobile (320px–767px).

**REQ-RES-02** — On mobile, the capture workspace controls MUST be accessible without scrolling during active capture.

**REQ-RES-03** — The camera preview MUST maintain correct aspect ratio across all screen sizes without distortion.

**REQ-RES-04** — Touch targets MUST be a minimum of 44×44px on mobile.

---

## 4. Non-Functional Requirements

### 4.1 Accessibility

**REQ-A11Y-01** — All interactive controls MUST be keyboard accessible with logical tab order.

**REQ-A11Y-02** — All form controls, buttons, and interactive elements MUST have descriptive accessible labels (`aria-label` or visible text).

**REQ-A11Y-03** — Focus states MUST be clearly visible and MUST NOT be suppressed.

**REQ-A11Y-04** — Color contrast MUST meet WCAG 2.1 AA minimum (4.5:1 for normal text, 3:1 for large text and UI components).

**REQ-A11Y-05** — Countdown announcements MUST be communicated to screen readers via `aria-live` regions.

**REQ-A11Y-06** — The camera preview MUST have an appropriate `aria-label` describing its purpose.

**REQ-A11Y-07** — Error messages MUST be announced to screen readers immediately when they appear.

---

### 4.2 Performance

**REQ-PERF-01** — The initial page load MUST achieve a Lighthouse Performance score of 85 or above on desktop.

**REQ-PERF-02** — The live camera preview MUST render at a minimum of 24fps on modern hardware without frame drops caused by application logic.

**REQ-PERF-03** — Filter switching MUST not cause visible lag or frame drops during live preview.

**REQ-PERF-04** — All media streams MUST be properly released when no longer needed to prevent memory leaks.

**REQ-PERF-05** — Canvas composition and export MUST complete within 3 seconds for a 4-shot strip at 2× resolution on a mid-range device.

**REQ-PERF-06** — The application MUST NOT cause unnecessary re-renders of the video preview element during state updates.

---

### 4.3 Reliability

**REQ-REL-01** — The application MUST handle all camera API errors without crashing and MUST display a recoverable error state.

**REQ-REL-02** — If the camera stream is interrupted mid-session (e.g., device disconnected), the application MUST detect this and display an appropriate error with a reconnect option.

**REQ-REL-03** — The application MUST include a React Error Boundary at the top level to catch unexpected rendering errors.

**REQ-REL-04** — Session state MUST be preserved in memory during the session but MUST NOT persist to localStorage or external storage in the MVP (privacy-first default).

**REQ-REL-05** — The application MUST function correctly in the latest two major versions of Chrome, Firefox, Safari, and Edge.

---

### 4.4 Security and Privacy

**REQ-SEC-01** — Camera access MUST only be requested in a secure context (HTTPS). The application MUST display a clear warning if accessed over HTTP.

**REQ-SEC-02** — No captured images or video frames MUST be transmitted to any server in the MVP. All processing is client-side only.

**REQ-SEC-03** — No analytics, tracking, or telemetry MUST be included in the MVP without explicit user consent.

**REQ-SEC-04** — The application MUST NOT store captured images in localStorage, IndexedDB, or any persistent browser storage in the MVP.

---

### 4.5 Maintainability

**REQ-MAINT-01** — The codebase MUST follow a clear modular architecture separating camera logic, session state, filter utilities, composition engine, export utilities, and UI components.

**REQ-MAINT-02** — All modules MUST be written in TypeScript with strict type checking enabled.

**REQ-MAINT-03** — Components MUST be small, focused, and reusable. No component should exceed 200 lines without strong justification.

**REQ-MAINT-04** — ESLint and Prettier MUST be configured and enforced in CI.

**REQ-MAINT-05** — All public functions and complex logic MUST include JSDoc comments.

---

## 5. Browser Compatibility Requirements

| Browser | Minimum Version | Notes |
|---|---|---|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14.1+ | getUserMedia requires HTTPS |
| Edge | 90+ | Full support |
| Mobile Chrome (Android) | 90+ | Rear camera selection supported |
| Mobile Safari (iOS) | 14.5+ | Front camera only on some devices |

**REQ-COMPAT-01** — The application MUST detect unsupported browsers and display a clear, friendly message with a list of supported browsers.

**REQ-COMPAT-02** — The application MUST NOT use experimental or non-standard browser APIs without a documented fallback.

---

## 6. Open-Source Repository Requirements

**REQ-OSS-01** — The repository MUST include an MIT License file.

**REQ-OSS-02** — The repository MUST include a `README.md` with:
- Project name, description, and screenshot/demo placeholder
- Feature list
- Quick start / setup instructions
- Available npm scripts
- Architecture overview (brief)
- Deployment instructions for Vercel
- Roadmap section
- Contributing section

**REQ-OSS-03** — The repository MUST include a `CONTRIBUTING.md` with:
- How to set up the development environment
- Branch naming conventions
- Conventional commit format guidance
- Pull request process
- Code style guidelines

**REQ-OSS-04** — The repository MUST include a `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1 recommended) to establish community standards appropriate for a public open-source project.

**REQ-OSS-05** — The repository MUST include an `.editorconfig` file for consistent editor behavior across contributors.

**REQ-OSS-06** — The repository MUST include a `.env.example` file documenting any environment variables, even if none are required in the MVP.

**REQ-OSS-07** — The repository MUST include GitHub Actions CI workflows for:
- Lint check
- TypeScript type check
- Unit tests
- Build verification

---

## 7. Testing Requirements

**REQ-TEST-01** — Unit tests MUST cover composition/layout logic (canvas rendering calculations, padding, crop).

**REQ-TEST-02** — Unit tests MUST cover export utility functions (filename generation, format selection, scale factor).

**REQ-TEST-03** — Unit tests MUST cover filter utility functions (CSS filter string generation, canvas pixel manipulation).

**REQ-TEST-04** — Component tests MUST cover critical UI states: loading, error (permission denied, no camera), and empty states.

**REQ-TEST-05** — Tests MUST use Vitest as the test runner with React Testing Library for component tests.

**REQ-TEST-06** — A minimum of 70% code coverage is RECOMMENDED for utility modules. Coverage is not required for UI-only components.

---

## 8. Phase 2 Requirements (Out of Scope for MVP)

The following features are explicitly out of scope for the MVP but MUST be documented for future development:

| Feature | Description |
|---|---|
| QR Code Share | Generate a QR code linking to a downloadable version of the photo |
| Print Mode | Print-optimized layout with correct DPI and bleed settings |
| Animated GIF | Capture a short burst and export as animated GIF |
| Branded Overlays | Upload and position custom PNG overlays (logos, frames) |
| Event Presets | Save and load event configurations (theme, text, filters) |
| Gallery Mode | View and manage multiple sessions in a local gallery |
| Cloud Upload | Optional upload to S3, Cloudinary, or similar |
| Admin Dashboard | Event organizer dashboard for managing presets and sessions |
| Kiosk Mode | Full-screen, touch-optimized mode for unattended event use |
| Analytics | Privacy-respecting session analytics for event organizers |

### Phase 2 — Advanced Camera and Hardware Integration (Future Architecture Only)

The following camera and hardware workflows are **explicitly not part of the MVP** and require a fundamentally different architecture (native desktop bridge, vendor SDK, or dedicated hardware driver). They are documented here for future planning only.

| Feature | Description | Why Excluded from MVP |
|---|---|---|
| Direct DSLR Tethering | Control DSLR/mirrorless camera body via USB tethering (e.g., gPhoto2, libgphoto2, Canon EDSDK, Nikon SDK) | Requires native OS process or Electron/Tauri bridge; not accessible from browser sandbox |
| Hardware Shutter Trigger | Trigger camera shutter via physical button or foot pedal connected to hardware | Requires native HID/serial access; not available in browser |
| Printer Integration | Send composed photo directly to a dye-sub or photo printer | Requires native print driver access; browser print API is insufficient for event-quality output |
| Offline Event Booth Mode | Fully offline kiosk with local asset management and no internet dependency | Requires PWA with full offline support and local storage strategy |
| Native Desktop App | Electron or Tauri wrapper enabling full hardware access | Separate product track; out of scope for web-first MVP |

---

## 9. Constraints and Assumptions

- The MVP is fully client-side. No backend, database, or server-side rendering is required.
- The application will be deployed to Vercel as a Next.js static export or server-rendered app.
- Camera access requires HTTPS in production. Local development on `localhost` is exempt from this requirement.
- The application does not need to support Internet Explorer or legacy browsers.
- Captured images are ephemeral — they exist only in memory for the duration of the session.
- The application does not need user accounts, authentication, or persistent storage in the MVP.
- All text in the MVP will be in English. Internationalization (i18n) is a Phase 2 concern.
- Camera support is limited to devices that the browser can access via `navigator.mediaDevices.getUserMedia`. No native OS drivers, vendor SDKs, or hardware bridges are used.
- DSLR/mirrorless cameras are supported only when they appear to the browser as a standard `videoinput` device. Users who want to use a DSLR must configure it as a webcam-compatible source themselves (e.g., via Canon EOS Webcam Utility, Sony Imaging Edge Webcam, or an HDMI capture card). The application provides guidance for this but does not automate it.

---

## 10. Glossary

| Term | Definition |
|---|---|
| Session | A single photobooth run from camera start to export/download |
| Shot | A single captured photo frame within a session |
| Template | A layout preset defining how shots are arranged in the final composition |
| Composition | The final rendered canvas combining all shots, filters, and decorations |
| Strip | A classic vertical photobooth layout with 4 shots stacked |
| Filter | A visual effect applied to the camera preview and/or final composition |
| Export | The act of rendering the final composition to a downloadable image file |
| Retake | Discarding the most recent shot and recapturing it |
| Secure Context | A browser context served over HTTPS or localhost |
| Device Picker | UI control for selecting among available browser-visible video input devices |
| Webcam-Compatible Source | Any camera device that the OS exposes as a standard UVC/video input device, accessible via `getUserMedia` |
| DSLR Tethering | Direct hardware communication with a DSLR camera body via vendor SDK or USB protocol — **not supported in MVP** |
