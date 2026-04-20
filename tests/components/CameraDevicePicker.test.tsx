import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CameraDevicePicker } from '@/components/booth/CameraDevicePicker'
import type { VideoDevice } from '@/lib/camera/useDevices'

const makeDevice = (id: string, label: string): VideoDevice => ({
  deviceId: id,
  label,
  raw: { deviceId: id, kind: 'videoinput', label, groupId: '', toJSON: () => ({}) } as MediaDeviceInfo,
})

describe('CameraDevicePicker', () => {
  it('renders nothing when exactly one device is available', () => {
    const { container } = render(
      <CameraDevicePicker
        devices={[makeDevice('d1', 'Built-in Camera')]}
        selectedDeviceId="d1"
        onSelect={vi.fn()}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows no-cameras help message when device list is empty', () => {
    render(
      <CameraDevicePicker
        devices={[]}
        selectedDeviceId={null}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText(/no cameras found/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /check camera access/i })).toBeInTheDocument()
  })

  it('renders a select when multiple devices are available', () => {
    render(
      <CameraDevicePicker
        devices={[makeDevice('d1', 'Camera 1'), makeDevice('d2', 'USB Webcam')]}
        selectedDeviceId="d1"
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByLabelText(/camera source/i)).toBeInTheDocument()
  })

  it('calls onSelect with the new deviceId when user changes selection', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()

    render(
      <CameraDevicePicker
        devices={[makeDevice('d1', 'Camera 1'), makeDevice('d2', 'USB Webcam')]}
        selectedDeviceId="d1"
        onSelect={onSelect}
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByText('USB Webcam'))

    expect(onSelect).toHaveBeenCalledWith('d2', expect.anything())
  })

  it('disables the select when disabled prop is true', () => {
    render(
      <CameraDevicePicker
        devices={[makeDevice('d1', 'Camera 1'), makeDevice('d2', 'USB Webcam')]}
        selectedDeviceId="d1"
        onSelect={vi.fn()}
        disabled
      />,
    )
    expect(screen.getByRole('combobox')).toBeDisabled()
  })
})
