# 📸 Photobooth

A professional, browser-based photobooth application built with Next.js. Capture photos with your webcam, apply filters, compose layouts, and download your shots — all client-side, no backend required.

> **Live demo:** _Deploy your own in one click below_

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/photobooth)
[![CI](https://github.com/your-org/photobooth/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/photobooth/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## ✨ Features

- **Live camera preview** — works with built-in webcams, USB webcams, and DSLR/mirrorless cameras configured as webcam-compatible sources
- **Camera source selector** — pick from all browser-visible video input devices
- **Countdown timer** — 3s, 5s, or 10s countdown before each shot
- **Multi-shot sessions** — capture 1, 2, or 4 photos per session
- **Layout templates** — Single Portrait, 2-Shot Vertical, 4-Shot Grid, Classic Strip
- **Visual filters** — Normal, Grayscale, B&W, Sepia, Vintage + brightness/contrast controls
- **Frame & label** — optional border and event text overlay on the final composition
- **Export** — download as PNG or JPEG (with quality control) at 2× resolution
- **Retake flow** — retake any shot before finalising
- **Fully client-side** — no server, no storage, privacy-first
- **Accessible** — keyboard navigable, WCAG 2.1 AA contrast, screen-reader friendly
- **Responsive** — desktop, tablet, and mobile

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20.9+
- npm 10+

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/photobooth.git
cd photobooth

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** Camera access requires a secure context. `localhost` works without HTTPS. For any other hostname, HTTPS is required.

---

## 📦 Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run typecheck` | Run TypeScript type checker |
| `npm run test` | Run unit and component tests (single run) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

---

## 🏗️ Architecture

This is a **client-side-only Next.js application**. All camera access, image processing, composition, and export happen in the browser using native Web APIs.

```
Browser
├── Next.js App Router (React UI)
├── Zustand session store
├── navigator.mediaDevices (getUserMedia + enumerateDevices)
├── Canvas API (composition + export)
└── CSS filters (live preview)
```

### Key modules

| Path | Responsibility |
|---|---|
| `src/lib/camera/` | Stream lifecycle, device enumeration, constraints |
| `src/lib/filters/` | CSS filter strings + canvas pixel manipulation |
| `src/lib/composition/` | Template layout engine + canvas composer |
| `src/lib/export/` | PNG/JPEG export + filename generation |
| `src/store/sessionStore.ts` | Zustand session state |
| `src/components/booth/` | Capture workspace UI components |
| `src/components/review/` | Review screen + export panel |
| `src/components/errors/` | Error and permission state components |

### Camera device support

The app supports any camera that the browser can access via `navigator.mediaDevices`:

- ✅ Built-in laptop/desktop webcams
- ✅ USB webcams
- ✅ HDMI capture cards
- ✅ DSLR/mirrorless cameras in webcam mode (Canon EOS Webcam Utility, Sony Imaging Edge, etc.)
- ❌ Direct DSLR tethering via vendor SDK (Phase 2 — requires native app)

---

## 🚢 Deployment

### Vercel (recommended)

1. Push your fork to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository
3. No environment variables required — click **Deploy**
4. Vercel enforces HTTPS automatically, satisfying the secure context requirement for camera access

### Manual

```bash
npm run build
npm run start
```

Serve over HTTPS in production. Camera access will not work over plain HTTP.

---

## 🗺️ Roadmap

### MVP (current)
- [x] Camera device picker
- [x] Live preview with CSS filters
- [x] Multi-shot capture with countdown
- [x] Layout templates (single, double, grid, strip)
- [x] Canvas composition engine
- [x] PNG/JPEG export at 2× resolution
- [x] Permission and error states
- [x] Responsive design + accessibility

### Phase 2
- [ ] QR code share
- [ ] Print mode (DPI-correct layout)
- [ ] Animated GIF export
- [ ] Branded overlay upload
- [ ] Event preset system
- [ ] Gallery mode
- [ ] Cloud upload (S3/Cloudinary)
- [ ] Kiosk mode
- [ ] Native desktop app (Electron/Tauri) for full DSLR tethering

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

---

## 📄 License

[MIT](./LICENSE) © 2026 Photobooth Contributors
