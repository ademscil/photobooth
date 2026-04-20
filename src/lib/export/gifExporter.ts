import { createBoomerangFrames } from '@/lib/camera/boomerang'

function generateTimestamp(): string {
  const now = new Date()
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
}

/**
 * Exports captured frames as a boomerang (ping-pong) WebM video.
 *
 * Fix: draw first frame BEFORE starting captureStream so the stream
 * has valid content from the start. Use requestVideoFrameCallback or
 * a small delay to ensure frames are captured by MediaRecorder.
 */
export async function exportBoomerangAsWebM(frames: ImageData[], fps = 8): Promise<void> {
  if (frames.length === 0) throw new Error('No frames to export')

  const pingPong = createBoomerangFrames(frames)
  const { width, height } = pingPong[0]

  // Fallback: if MediaRecorder not supported, export as PNG sequence
  if (!('MediaRecorder' in window)) {
    await exportFramesAsPng(pingPong)
    return
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get canvas context')

  // Draw first frame BEFORE capturing stream — critical fix
  ctx.putImageData(pingPong[0], 0, 0)

  // Use 25fps stream capture rate, we control timing manually
  const stream = canvas.captureStream(25)

  const mimeTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ]
  const mimeType = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) ?? 'video/webm'

  let recorder: MediaRecorder
  try {
    recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2_500_000 })
  } catch {
    await exportFramesAsPng(pingPong)
    return
  }

  const chunks: Blob[] = []
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }

  return new Promise<void>((resolve, reject) => {
    recorder.onstop = () => {
      // Stop all stream tracks
      stream.getTracks().forEach((t) => t.stop())

      if (chunks.length === 0) {
        // No data recorded — fall back to PNG
        exportFramesAsPng(pingPong).then(resolve).catch(reject)
        return
      }

      const blob = new Blob(chunks, { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `photobooth-boomerang-${generateTimestamp()}.webm`
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      resolve()
    }

    recorder.onerror = () => {
      exportFramesAsPng(pingPong).then(resolve).catch(reject)
    }

    // Start recording, request data every 100ms
    recorder.start(100)

    const frameMs = Math.round(1000 / fps)
    let i = 0

    const drawNext = () => {
      if (i >= pingPong.length) {
        // Give recorder time to capture the last frame
        setTimeout(() => recorder.stop(), frameMs * 2)
        return
      }
      ctx.putImageData(pingPong[i++], 0, 0)
      setTimeout(drawNext, frameMs)
    }

    // Small initial delay to let recorder initialise
    setTimeout(drawNext, 50)
  })
}

async function exportFramesAsPng(frames: ImageData[]): Promise<void> {
  const ts = Date.now()
  // Export up to 8 key frames
  const keyFrames = frames.filter((_, i) => i % Math.max(1, Math.floor(frames.length / 8)) === 0).slice(0, 8)

  for (let i = 0; i < keyFrames.length; i++) {
    const canvas = document.createElement('canvas')
    canvas.width = keyFrames[i].width
    canvas.height = keyFrames[i].height
    const ctx = canvas.getContext('2d')!
    ctx.putImageData(keyFrames[i], 0, 0)

    await new Promise<void>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) { resolve(); return }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `photobooth-frame-${i + 1}-${ts}.png`
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => { URL.revokeObjectURL(url); resolve() }, 300)
      }, 'image/png')
    })
  }
}
