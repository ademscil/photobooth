import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CameraPreview } from '@/components/booth/CameraPreview'

describe('CameraPreview', () => {
  it('renders a video element with accessible label', () => {
    render(<CameraPreview stream={null} filter="normal" />)
    // The <figure> has aria-label
    expect(screen.getByRole('figure', { name: /live camera preview/i })).toBeInTheDocument()
  })

  it('shows loading skeleton when stream is null', () => {
    render(<CameraPreview stream={null} filter="normal" isReady={false} />)
    expect(screen.getByText(/waiting for camera/i)).toBeInTheDocument()
  })

  it('shows starting camera text when stream exists but not ready', () => {
    const mockStream = { getTracks: () => [] } as unknown as MediaStream
    render(<CameraPreview stream={mockStream} filter="normal" isReady={false} />)
    expect(screen.getByText(/starting camera/i)).toBeInTheDocument()
  })

  it('applies CSS filter style to video element', () => {
    render(<CameraPreview stream={null} filter="sepia" isReady={true} />)
    const video = document.querySelector('video')
    expect(video?.style.filter).toBe('sepia(80%)')
  })

  it('applies mirror transform when mirrored is true', () => {
    render(<CameraPreview stream={null} filter="normal" mirrored={true} />)
    const video = document.querySelector('video')
    expect(video?.className).toContain('scale-x-[-1]')
  })

  it('does not apply mirror transform when mirrored is false', () => {
    render(<CameraPreview stream={null} filter="normal" mirrored={false} />)
    const video = document.querySelector('video')
    expect(video?.className).not.toContain('scale-x-[-1]')
  })

  it('includes filter name in figcaption for screen readers', () => {
    render(<CameraPreview stream={null} filter="vintage" />)
    expect(screen.getByText(/vintage filter applied/i)).toBeInTheDocument()
  })
})
