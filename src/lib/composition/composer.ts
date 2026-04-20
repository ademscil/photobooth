import type { CapturedFrame, CompositionOptions, CustomTemplate, FilterId } from '@/types'
import { getTemplate } from './templates'
import { drawFrame, drawLabel, drawFilmstripDecoration, drawPolaroidDecoration } from './decorations'
import { drawFrameStyle } from './frameTemplates'

/** 4R print size reference: 10×15cm at 300dpi ≈ 1181×1772px
 *  We use scale factor on BASE_WIDTH=600 to get print quality output.
 *  scale=4 → 2400px wide ≈ 4R at 300dpi
 */

/**
 * Composes captured frames into a single canvas using the specified template.
 */
export function compose(
  frames: CapturedFrame[],
  options: CompositionOptions,
): HTMLCanvasElement {
  const { template: templateId, filter, frameEnabled, labelText, scale, customTemplate } = options

  // Use custom template if selected
  if (templateId === 'custom' && customTemplate) {
    return composeCustom(frames, customTemplate, filter, frameEnabled, labelText, scale, options.frameStyle)
  }

  const template = getTemplate(templateId)
  // Use 4R proportions: width fixed, height derived from aspect ratio
  // For preview (scale=1): ~600px wide. For export (scale=2): ~1200px wide
  const previewWidth = 600
  const canvasWidth = previewWidth * scale
  const canvasHeight = Math.round(canvasWidth / template.canvasAspectRatio)

  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get 2D canvas context for composition')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  template.slots.forEach((slot, i) => {
    const frame = frames[i]
    if (!frame) return
    drawFrameInSlot(ctx, frame, slot.x * canvasWidth, slot.y * canvasHeight, slot.width * canvasWidth, slot.height * canvasHeight, filter)
  })

  // Template-specific decorations (drawn after photos, before frame overlays)
  if (templateId === 'filmstrip') {
    drawFilmstripDecoration(ctx, canvasWidth, canvasHeight)
  } else if (templateId === 'polaroid') {
    drawPolaroidDecoration(ctx, canvasWidth, canvasHeight)
  }

  if (frameEnabled) drawFrame(ctx, canvasWidth, canvasHeight)
  if (options.frameStyle && options.frameStyle !== 'none') {
    drawFrameStyle(ctx, options.frameStyle, canvasWidth, canvasHeight)
  }
  if (labelText.trim()) drawLabel(ctx, labelText, canvasWidth, canvasHeight, 24 * scale)

  return canvas
}

/**
 * Composes using a custom template with optional background/overlay images.
 */
function composeCustom(
  frames: CapturedFrame[],
  customTemplate: CustomTemplate,
  filter: FilterId,
  frameEnabled: boolean,
  labelText: string,
  scale: number,
  frameStyle?: import('@/types').FrameStyle,
): HTMLCanvasElement {
  const canvasWidth = customTemplate.canvasWidth * scale
  const canvasHeight = customTemplate.canvasHeight * scale

  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get 2D canvas context')

  // 1. White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // 2. Background image (drawn first, behind photos)
  if (customTemplate.backgroundImage) {
    const bgImg = new Image()
    bgImg.src = customTemplate.backgroundImage
    // Draw synchronously if already loaded (data URL)
    ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight)
  }

  // 3. Photo slots
  customTemplate.slots.forEach((slot, i) => {
    const frame = frames[i]
    if (!frame) return
    drawFrameInSlot(
      ctx, frame,
      slot.x * canvasWidth, slot.y * canvasHeight,
      slot.width * canvasWidth, slot.height * canvasHeight,
      filter,
    )
  })

  // 4. Overlay image (drawn on top of photos — for frames/borders/branding)
  if (customTemplate.overlayImage) {
    const overlayImg = new Image()
    overlayImg.src = customTemplate.overlayImage
    ctx.drawImage(overlayImg, 0, 0, canvasWidth, canvasHeight)
  }

  // 5. Decorations
  if (frameEnabled) drawFrame(ctx, canvasWidth, canvasHeight)
  if (frameStyle && frameStyle !== 'none') {
    drawFrameStyle(ctx, frameStyle, canvasWidth, canvasHeight)
  }
  if (labelText.trim()) drawLabel(ctx, labelText, canvasWidth, canvasHeight, 24 * scale)

  return canvas
}

/** Draw a single captured frame into a slot with cover-crop behavior. */
function drawFrameInSlot(
  ctx: CanvasRenderingContext2D,
  frame: CapturedFrame,
  destX: number,
  destY: number,
  destW: number,
  destH: number,
  filter: FilterId,
): void {
  destX = Math.round(destX)
  destY = Math.round(destY)
  destW = Math.round(destW)
  destH = Math.round(destH)

  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = frame.imageData.width
  tempCanvas.height = frame.imageData.height
  const tempCtx = tempCanvas.getContext('2d')
  if (!tempCtx) return
  tempCtx.putImageData(frame.imageData, 0, 0)

  const srcW = frame.imageData.width
  const srcH = frame.imageData.height
  const srcAspect = srcW / srcH
  const destAspect = destW / destH

  let cropX = 0, cropY = 0, cropW = srcW, cropH = srcH

  if (srcAspect > destAspect) {
    cropW = Math.round(srcH * destAspect)
    cropX = Math.round((srcW - cropW) / 2)
  } else if (srcAspect < destAspect) {
    cropH = Math.round(srcW / destAspect)
    cropY = Math.round((srcH - cropH) / 2)
  }

  ctx.drawImage(tempCanvas, cropX, cropY, cropW, cropH, destX, destY, destW, destH)

  if (filter !== 'normal') {
    applyFilterToRegion(ctx, filter, destX, destY, destW, destH)
  }
}

/**
 * Applies a pixel filter to a specific rectangular region of the canvas.
 */
function applyFilterToRegion(
  ctx: CanvasRenderingContext2D,
  filter: FilterId,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  if (filter === 'normal' || width <= 0 || height <= 0) return

  const imageData = ctx.getImageData(x, y, width, height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    switch (filter) {
      case 'grayscale': {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b
        data[i] = gray
        data[i + 1] = gray
        data[i + 2] = gray
        break
      }
      case 'bw': {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b
        const boosted = gray < 128 ? Math.max(0, gray * 0.6) : Math.min(255, gray * 1.2 + 20)
        const bwVal = boosted < 128 ? 0 : 255
        data[i] = bwVal
        data[i + 1] = bwVal
        data[i + 2] = bwVal
        break
      }
      case 'sepia': {
        data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
        data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
        data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
        break
      }
      case 'vintage': {
        const vr = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
        const vg = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
        const vb = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
        const gray = 0.299 * vr + 0.587 * vg + 0.114 * vb
        const desatFactor = 0.85
        const brightFactor = 0.95
        data[i] = Math.min(255, (vr * desatFactor + gray * (1 - desatFactor)) * brightFactor)
        data[i + 1] = Math.min(255, (vg * desatFactor + gray * (1 - desatFactor)) * brightFactor)
        data[i + 2] = Math.min(255, (vb * desatFactor + gray * (1 - desatFactor)) * brightFactor)
        break
      }
    }
  }

  ctx.putImageData(imageData, x, y)
}
