/**
 * Draws a frame border around the entire canvas.
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  color = '#000000',
  lineWidth = 8,
): void {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  // Inset by half lineWidth so the stroke is fully visible
  const half = lineWidth / 2
  ctx.strokeRect(half, half, canvasWidth - lineWidth, canvasHeight - lineWidth)
  ctx.restore()
}

/**
 * Draws a text label centered at the bottom of the canvas.
 */
export function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  canvasWidth: number,
  canvasHeight: number,
  fontSize = 24,
  color = '#333333',
): void {
  if (!text.trim()) return

  ctx.save()
  ctx.font = `${fontSize}px sans-serif`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText(text, canvasWidth / 2, canvasHeight - fontSize * 0.4)
  ctx.restore()
}

/**
 * Draws film-strip sprocket holes on left and right edges.
 * Used by the 'filmstrip' template.
 */
export function drawFilmstripDecoration(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
): void {
  const stripW = Math.round(canvasWidth * 0.1)
  ctx.save()

  // Black side strips
  ctx.fillStyle = '#111111'
  ctx.fillRect(0, 0, stripW, canvasHeight)
  ctx.fillRect(canvasWidth - stripW, 0, stripW, canvasHeight)

  // Sprocket holes
  const holeW = Math.round(stripW * 0.55)
  const holeH = Math.round(canvasHeight * 0.04)
  const holeX1 = Math.round((stripW - holeW) / 2)
  const holeX2 = canvasWidth - stripW + Math.round((stripW - holeW) / 2)
  const holeSpacing = Math.round(canvasHeight * 0.065)
  const radius = Math.round(holeH * 0.35)

  ctx.fillStyle = '#ffffff'
  for (let y = holeSpacing; y < canvasHeight - holeH; y += holeSpacing * 1.6) {
    const yRound = Math.round(y)
    ctx.beginPath()
    ctx.roundRect(holeX1, yRound, holeW, holeH, radius)
    ctx.fill()
    ctx.beginPath()
    ctx.roundRect(holeX2, yRound, holeW, holeH, radius)
    ctx.fill()
  }

  ctx.restore()
}

/**
 * Draws a polaroid-style white border with caption area.
 * Used by the 'polaroid' template.
 */
export function drawPolaroidDecoration(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
): void {
  const border = Math.round(canvasWidth * 0.06)
  const bottomExtra = Math.round(canvasHeight * 0.12)

  ctx.save()

  // White border (top, left, right)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasWidth, border)
  ctx.fillRect(0, 0, border, canvasHeight)
  ctx.fillRect(canvasWidth - border, 0, border, canvasHeight)

  // Thick white bottom (caption area)
  ctx.fillRect(0, canvasHeight - border - bottomExtra, canvasWidth, border + bottomExtra)

  // Subtle shadow/border
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, canvasWidth - 2, canvasHeight - 2)

  ctx.restore()
}
