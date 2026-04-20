/**
 * Pre-built frame style decorations drawn on top of the composition.
 * These are purely canvas-drawn (no image uploads required).
 */

export type FrameStyle = 'none' | 'classic' | 'floral' | 'minimal' | 'dark'

export interface FrameConfig {
  id: FrameStyle
  name: string
  description: string
}

export const FRAME_CONFIGS: FrameConfig[] = [
  { id: 'none', name: 'None', description: 'No frame' },
  { id: 'classic', name: 'Classic', description: 'Gold border frame' },
  { id: 'floral', name: 'Floral', description: 'Pink floral corners' },
  { id: 'minimal', name: 'Minimal', description: 'Corner accents' },
  { id: 'dark', name: 'Dark', description: 'Dark border with gold line' },
]

/**
 * Draws a pre-built frame style onto the canvas.
 */
export function drawFrameStyle(
  ctx: CanvasRenderingContext2D,
  style: FrameStyle,
  w: number,
  h: number,
): void {
  if (style === 'none') return

  ctx.save()

  switch (style) {
    case 'classic':
      drawClassicFrame(ctx, w, h)
      break
    case 'floral':
      drawFloralFrame(ctx, w, h)
      break
    case 'minimal':
      drawMinimalFrame(ctx, w, h)
      break
    case 'dark':
      drawDarkFrame(ctx, w, h)
      break
  }

  ctx.restore()
}

function drawClassicFrame(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const b = Math.round(w * 0.04)
  // Outer gold border
  ctx.strokeStyle = '#c9a84c'
  ctx.lineWidth = b
  ctx.strokeRect(b / 2, b / 2, w - b, h - b)
  // Inner thin line
  ctx.strokeStyle = '#f5d78e'
  ctx.lineWidth = Math.max(2, b * 0.3)
  const inset = b * 1.4
  ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2)
}

function drawFloralFrame(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const b = Math.round(w * 0.05)
  // Pink/rose border
  ctx.strokeStyle = '#f9a8d4'
  ctx.lineWidth = b
  ctx.strokeRect(b / 2, b / 2, w - b, h - b)
  // Corner flowers (simple circles)
  const r = b * 1.2
  const positions = [
    [b, b], [w - b, b], [b, h - b], [w - b, h - b],
  ]
  ctx.fillStyle = '#ec4899'
  positions.forEach(([x, y]) => {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    // Petals
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
      ctx.beginPath()
      ctx.arc(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9, r * 0.5, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

function drawMinimalFrame(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const b = Math.round(w * 0.025)
  // Thin white border with shadow effect
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = b
  ctx.strokeRect(b / 2, b / 2, w - b, h - b)
  // Corner accents
  const len = Math.round(w * 0.08)
  const inset = b * 2
  ctx.strokeStyle = '#6366f1'
  ctx.lineWidth = Math.max(3, b * 0.6)
  const corners = [
    [[inset, inset + len], [inset, inset], [inset + len, inset]],
    [[w - inset - len, inset], [w - inset, inset], [w - inset, inset + len]],
    [[inset, h - inset - len], [inset, h - inset], [inset + len, h - inset]],
    [[w - inset - len, h - inset], [w - inset, h - inset], [w - inset, h - inset - len]],
  ]
  corners.forEach((pts) => {
    ctx.beginPath()
    ctx.moveTo(pts[0][0], pts[0][1])
    ctx.lineTo(pts[1][0], pts[1][1])
    ctx.lineTo(pts[2][0], pts[2][1])
    ctx.stroke()
  })
}

function drawDarkFrame(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const b = Math.round(w * 0.05)
  // Dark border
  ctx.fillStyle = '#111827'
  ctx.fillRect(0, 0, w, b)
  ctx.fillRect(0, h - b, w, b)
  ctx.fillRect(0, 0, b, h)
  ctx.fillRect(w - b, 0, b, h)
  // Gold inner line
  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = Math.max(2, b * 0.15)
  const inset = b + ctx.lineWidth
  ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2)
}
