export type FrameStyle = 'none' | 'classic' | 'film' | 'polaroid' | 'modern' | 'vintage'

export interface FrameConfig {
  id: FrameStyle
  name: string
  description: string
}

export const FRAME_CONFIGS: FrameConfig[] = [
  { id: 'none', name: 'Tanpa Frame', description: 'Foto polos tanpa border' },
  { id: 'classic', name: 'Classic', description: 'Border putih elegan' },
  { id: 'film', name: 'Film Strip', description: 'Gaya film strip klasik' },
  { id: 'polaroid', name: 'Polaroid', description: 'Gaya foto polaroid' },
  { id: 'modern', name: 'Modern', description: 'Border tipis modern' },
  { id: 'vintage', name: 'Vintage', description: 'Frame vintage dengan ornamen' },
]

/**
 * Draws a decorative frame on the canvas after photos are placed.
 * Called by composer.ts after drawing all photo slots.
 */
export function drawFrameStyle(
  ctx: CanvasRenderingContext2D,
  style: FrameStyle,
  width: number,
  height: number,
): void {
  switch (style) {
    case 'classic':
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 4
      ctx.strokeRect(8, 8, width - 16, height - 16)
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 20
      ctx.strokeRect(14, 14, width - 28, height - 28)
      break

    case 'film': {
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(0, 0, 40, height)
      ctx.fillRect(width - 40, 0, 40, height)
      ctx.fillStyle = '#fff'
      for (let y = 20; y < height; y += 40) {
        ctx.beginPath()
        ctx.roundRect(8, y, 24, 20, 4)
        ctx.fill()
        ctx.beginPath()
        ctx.roundRect(width - 32, y, 24, 20, 4)
        ctx.fill()
      }
      break
    }

    case 'polaroid':
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, width, height)
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 2
      ctx.strokeRect(1, 1, width - 2, height - 2)
      ctx.fillStyle = '#fff'
      ctx.fillRect(20, height - 80, width - 40, 60)
      break

    case 'modern': {
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#6366f1')
      gradient.addColorStop(1, '#8b5cf6')
      ctx.strokeStyle = gradient
      ctx.lineWidth = 12
      ctx.strokeRect(6, 6, width - 12, height - 12)
      break
    }

    case 'vintage': {
      ctx.strokeStyle = '#92400e'
      ctx.lineWidth = 6
      ctx.strokeRect(10, 10, width - 20, height - 20)
      ctx.lineWidth = 2
      ctx.strokeRect(20, 20, width - 40, height - 40)
      const corners: [number, number][] = [
        [15, 15],
        [width - 15, 15],
        [15, height - 15],
        [width - 15, height - 15],
      ]
      ctx.fillStyle = '#92400e'
      corners.forEach(([x, y]) => {
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fill()
      })
      break
    }

    case 'none':
    default:
      break
  }
}
