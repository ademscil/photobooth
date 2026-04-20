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
