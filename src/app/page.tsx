import Link from 'next/link'

const features = [
  { emoji: '📸', title: 'Kamera Profesional', desc: 'Support DSLR via HDMI capture' },
  { emoji: '🎨', title: 'Template Custom', desc: 'Upload frame branded event kamu' },
  { emoji: '💳', title: 'Bayar Mudah', desc: 'QRIS & Cash, langsung download' },
  { emoji: '⏱️', title: '2 Sesi × 5 Menit', desc: 'Total 10 menit sesi foto' },
  { emoji: '🎁', title: 'Boomerang & GIF', desc: 'Animasi seru dari sesi foto' },
  { emoji: '📱', title: 'QR Download', desc: 'Scan QR untuk download soft file' },
]

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 px-4 py-24 text-center text-white">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
          📷 Photobooth
        </h1>
        <p className="mt-4 text-xl font-medium text-indigo-100 sm:text-2xl">
          Abadikan Momen Terbaik Kamu
        </p>
        <Link
          href="/booth"
          className="mt-10 inline-flex min-h-[56px] items-center justify-center rounded-2xl bg-white px-10 py-4 text-lg font-bold text-indigo-700 shadow-xl transition-all hover:bg-indigo-50 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
        >
          Mulai Foto Sekarang →
        </Link>
      </section>

      {/* Features */}
      <section className="bg-background px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground">
            Semua yang kamu butuhkan
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <span className="text-3xl" aria-hidden="true">{f.emoji}</span>
                <div>
                  <p className="font-semibold text-foreground">{f.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-muted/40 px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-2 text-2xl font-bold text-foreground">Harga Terjangkau</h2>
          <p className="mb-10 text-muted-foreground">2 sesi foto, masing-masing 5 menit</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-8 text-left">
              <h3 className="text-lg font-bold text-foreground">Basic</h3>
              <p className="mt-1 text-sm text-muted-foreground">Cetak 1 template</p>
              <p className="mt-4 text-4xl font-extrabold text-foreground">Rp 15.000</p>
              <Link
                href="/booth"
                className="mt-6 block rounded-xl border border-border bg-background py-3 text-center text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Pilih Basic
              </Link>
            </div>
            <div className="relative rounded-2xl border-2 border-brand-primary bg-card p-8 text-left shadow-lg shadow-brand-primary/10">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-white">
                Populer
              </span>
              <h3 className="text-lg font-bold text-foreground">Premium</h3>
              <p className="mt-1 text-sm text-muted-foreground">Cetak 2 template</p>
              <p className="mt-4 text-4xl font-extrabold text-foreground">Rp 25.000</p>
              <Link
                href="/booth"
                className="mt-6 block rounded-xl bg-brand-primary py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-secondary"
              >
                Pilih Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background px-4 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Photobooth — Abadikan Momen Terbaik Kamu
      </footer>
    </main>
  )
}
