/**
 * Captures frameCount frames at intervalMs intervals from a video element.
 * Returns an array of ImageData frames.
 */
export function captureBoomerang(
  videoEl: HTMLVideoElement,
  frameCount: number,
  intervalMs: number,
): Promise<ImageData[]> {
  return new Promise((resolve, reject) => {
    const frames: ImageData[] = []
    const canvas = document.createElement('canvas')
    canvas.width = videoEl.videoWidth || videoEl.clientWidth
    canvas.height = videoEl.videoHeight || videoEl.clientHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) { reject(new Error('Could not get canvas context')); return }

    let captured = 0
    const interval = setInterval(() => {
      try {
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
        frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
        captured++
        if (captured >= frameCount) {
          clearInterval(interval)
          resolve(frames)
        }
      } catch (err) {
        clearInterval(interval)
        reject(err)
      }
    }, intervalMs)
  })
}

/**
 * Creates ping-pong boomerang frames: [...frames, ...frames.slice(0,-1).reverse()]
 */
export function createBoomerangFrames(frames: ImageData[]): ImageData[] {
  if (frames.length === 0) return []
  return [...frames, ...frames.slice(0, -1).reverse()]
}
