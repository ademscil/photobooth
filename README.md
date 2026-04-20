# 📸 Photobooth

> Professional browser-based photobooth application for events, personal use, and branded activations.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ademscil/photobooth)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## ✨ Features

- **Multiple layout templates** — Single, Double, Grid, Strip, Film Strip, Polaroid, 3-Photo Collage, and fully custom
- **Live filters** — Normal, Grayscale, B&W, Sepia, Vintage applied in real-time
- **Decorative frame styles** — Classic, Film, Polaroid, Modern, Vintage overlays
- **Custom template builder** — Upload your own background and overlay images with configurable photo slots
- **QRIS payment** — Integrated Midtrans payment gateway for cashless transactions
- **Cash voucher support** — Operator-issued voucher codes for cash payments
- **Session timer** — Configurable per-session countdown (default 5 min × 2 sessions)
- **Boomerang export** — Ping-pong WebM animation from captured frames
- **QR download** — Cloudinary-hosted photos accessible via QR code scan
- **DSLR support** — Works with any HDMI capture card as a webcam source
- **Responsive UI** — Works on desktop and mobile browsers
- **Accessible** — WCAG-oriented markup with keyboard navigation and screen reader support

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/ademscil/photobooth.git
cd photobooth

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Midtrans and Cloudinary credentials

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 💳 Pricing Tiers

| Tier | Price | Sessions | Templates | Print |
|------|-------|----------|-----------|-------|
| Basic | Rp 15.000 | 2 × 5 min | 1 downloadable | 1 × 4R |
| Premium | Rp 25.000 | 2 × 5 min | 2 downloadable | 2 × 4R |

Prices are configurable via `NEXT_PUBLIC_PHOTO_PRICE` and `NEXT_PUBLIC_PRINT_PRICE` environment variables.

## 📷 Camera Support

Any camera that appears as a webcam in the browser is supported:

- **Built-in webcam** — works out of the box
- **USB webcam** — plug and play
- **DSLR / mirrorless** — connect via HDMI capture card (e.g. Elgato Cam Link, Magewell)
- **Multiple cameras** — switch between devices in the UI

## 🔧 Configuration

Copy `.env.example` to `.env.local` and fill in your values:

| Variable | Description |
|----------|-------------|
| `MIDTRANS_SERVER_KEY` | Midtrans server key (keep secret, server-side only) |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Midtrans client key (public) |
| `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION` | `true` for production, `false` for sandbox |
| `NEXT_PUBLIC_MERCHANT_ID` | Your Midtrans merchant ID |
| `NEXT_PUBLIC_PHOTO_PRICE` | Session price in IDR (e.g. `15000`) |
| `NEXT_PUBLIC_PRINT_PRICE` | Print price per sheet in IDR (e.g. `5000`) |
| `VOUCHER_CODES` | Comma-separated cash voucher codes (e.g. `CASH001,EVENT2024`) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned upload preset name |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL (required for Midtrans webhooks in production) |

## 🚢 Deployment

### Vercel (recommended)

1. Push this repository to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository
3. Add all environment variables from `.env.example` in the Vercel dashboard
4. Deploy — Vercel auto-detects Next.js and builds correctly

The included `vercel.json` configures the Singapore region (`sin1`) for lower latency in Southeast Asia.

### Manual build

```bash
npm run build
npm start
```

## 📁 Architecture

```
src/
├── app/                  # Next.js App Router pages and API routes
│   ├── booth/            # Main photobooth page
│   ├── download/[id]/    # QR download page
│   └── api/payment/      # Midtrans payment API routes
├── components/
│   ├── booth/            # Camera, capture, template, filter controls
│   ├── payment/          # QRIS payment modal and pricing screen
│   ├── review/           # Export, customize, print, QR panels
│   └── errors/           # Camera error states
├── lib/
│   ├── camera/           # Camera hooks, capture, boomerang
│   ├── composition/      # Canvas composition engine, templates, decorations
│   ├── export/           # Image export, Cloudinary upload, boomerang WebM
│   └── filters/          # Canvas and CSS filter implementations
├── store/                # Zustand state (session, payment, print)
└── types/                # Shared TypeScript types
```

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

[MIT](./LICENSE) © 2024 Photobooth Contributors
