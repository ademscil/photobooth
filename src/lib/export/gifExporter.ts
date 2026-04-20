import { createBoomerangFrames } from '@/lib/camera/boomerang'

function generateTimestamp(): string {
  const now = new Date()
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
}

/**
 * Exports boomerang frames as a WebM video using MediaRecorder API.
 * Uses captured ImageData frames directly (no live video capture).
 * Falls back to individual PNG downloads if MediaRecorder is not supported.
 */
export async function exportBoomerangAsWebM(frames: ImageData[], fps = 8): Promise<void> {
  if (frames.length === 0) throw new Error('No frames to export')

  // Create ping-pong: forward + backward
  const pingPong = createBoomerangFrames(frames)
  const { width, height } = pingPong[0]

  if (!('MediaRecorder' in window)) {
    await exportFramesAsPng(pingPong)
    return
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get canvas context')

  const stream = canvas.captureStream(fps)
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm'

  let recorder: MediaRecorder
  try {
    recorder = new MediaRecorder(stream, { mimeType })
  } catch {
    await exportFramesAsPng(pingPong)
    return
  }

  const chunks: Blob[] = []
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }

  return new Promise<void>((resolve, reject) => {
    recorder.onstop = () => {
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
    recorder.onerror = () => reject(new Error('Recording failed'))

    recorder.start()

    const frameMs = 1000 / fps
    let i = 0

    const draw = () => {
      if (i >= pingPong.length) {
        recorder.stop()
        return
      }
      ctx.putImageData(pingPong[i++], 0, 0)
      setTimeout(draw, frameMs)
    }
    draw()
  })
}

async function exportFramesAsPng(frames: ImageData[]): Promise<void> {
  const ts = Date.now()
  for (let i = 0; i < Math.min(frames.length, 8); i++) {
    const canvas = document.createElement('canvas')
    canvas.width = frames[i].width
    canvas.height = frames[i].height
    const ctx = canvas.getContext('2d')!
    ctx.putImageData(frames[i], 0, 0)
    await new Promise<void>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) { resolve(); return }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `photobooth-boomerang-${i + 1}-${ts}.png`
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => { URL.revokeObjectURL(url); resolve() }, 500)
      }, 'image/png')
    })
  }
}
