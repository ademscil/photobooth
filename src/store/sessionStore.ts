'use client'

import { create } from 'zustand'
import type {
  CameraError,
  CapturedFrame,
  CountdownDuration,
  CustomTemplate,
  FilterId,
  FrameStyle,
  SessionStatus,
  TemplateId,
} from '@/types'

const DEVICE_ID_KEY = 'photobooth:selectedDeviceId'

function readPersistedDeviceId(): string | null {
  if (typeof window === 'undefined') return null
  try { return sessionStorage.getItem(DEVICE_ID_KEY) } catch { return null }
}

function persistDeviceId(id: string | null): void {
  if (typeof window === 'undefined') return
  try {
    if (id === null) sessionStorage.removeItem(DEVICE_ID_KEY)
    else sessionStorage.setItem(DEVICE_ID_KEY, id)
  } catch { /* ignore */ }
}

interface ConfigSlice {
  template: TemplateId
  filter: FilterId
  countdown: CountdownDuration
  frameEnabled: boolean
  labelText: string
  customTemplate: CustomTemplate | null
  frameStyle: FrameStyle
}

interface CaptureSlice {
  status: SessionStatus
  currentShot: number
  totalShots: number
  capturedFrames: CapturedFrame[]
}

interface CameraSlice {
  stream: MediaStream | null
  selectedDeviceId: string | null
  availableDevices: MediaDeviceInfo[]
  isMirrored: boolean
  cameraError: CameraError | null
}

export interface SessionState extends ConfigSlice, CaptureSlice, CameraSlice {
  setTemplate: (id: TemplateId) => void
  setFilter: (id: FilterId) => void
  setCountdown: (duration: CountdownDuration) => void
  setFrameEnabled: (enabled: boolean) => void
  setLabelText: (text: string) => void
  setCustomTemplate: (ct: CustomTemplate | null) => void
  setFrameStyle: (style: FrameStyle) => void
  setSelectedDeviceId: (id: string | null) => void
  setAvailableDevices: (devices: MediaDeviceInfo[]) => void
  setMirrored: (mirrored: boolean) => void
  setStream: (stream: MediaStream | null) => void
  setCameraError: (error: CameraError | null) => void
  startCapture: () => void
  captureFrame: (frame: CapturedFrame) => void
  retakeLastFrame: () => void
  finishCapture: () => void
  startExport: () => void
  finishExport: () => void
  resetSession: () => void
}

const TEMPLATE_SHOT_COUNT: Record<TemplateId, 1 | 2 | 3 | 4> = {
  single: 1, double: 2, grid: 4, strip: 4, filmstrip: 4, polaroid: 1, collage3: 3, custom: 1,
}

const initialConfig: ConfigSlice = {
  template: 'single', filter: 'normal', countdown: 3,
  frameEnabled: false, labelText: '', customTemplate: null, frameStyle: 'none',
}

const initialCapture: CaptureSlice = {
  status: 'idle', currentShot: 0, totalShots: 1, capturedFrames: [],
}

const initialCamera: CameraSlice = {
  stream: null, selectedDeviceId: null,
  availableDevices: [], isMirrored: true, cameraError: null,
}

export const useSessionStore = create<SessionState>()((set) => ({
  ...initialConfig,
  ...initialCapture,
  ...initialCamera,
  selectedDeviceId: readPersistedDeviceId(),

  setTemplate: (id) => set({ template: id, totalShots: TEMPLATE_SHOT_COUNT[id] }),
  setFilter: (id) => set({ filter: id }),
  setCountdown: (duration) => set({ countdown: duration }),
  setFrameEnabled: (enabled) => set({ frameEnabled: enabled }),
  setLabelText: (text) => set({ labelText: text }),
  setCustomTemplate: (ct) => set({
    customTemplate: ct,
    template: ct ? 'custom' : 'single',
    totalShots: ct ? ct.shotCount : 1,
  }),
  setFrameStyle: (style) => set({ frameStyle: style }),

  setSelectedDeviceId: (id) => { persistDeviceId(id); set({ selectedDeviceId: id, cameraError: null }) },
  setAvailableDevices: (devices) => set({ availableDevices: devices }),
  setMirrored: (mirrored) => set({ isMirrored: mirrored }),
  setStream: (stream) => set({ stream }),
  setCameraError: (error) => set({ cameraError: error }),

  startCapture: () => set((state) => ({
    status: 'capturing', currentShot: 1,
    totalShots: state.template === 'custom' && state.customTemplate
      ? state.customTemplate.shotCount
      : TEMPLATE_SHOT_COUNT[state.template],
    capturedFrames: [],
  })),
  captureFrame: (frame) => set((state) => ({
    capturedFrames: [...state.capturedFrames, frame],
    currentShot: state.currentShot + 1,
  })),
  retakeLastFrame: () => set((state) => ({
    capturedFrames: state.capturedFrames.slice(0, -1),
    currentShot: Math.max(1, state.currentShot - 1),
  })),
  finishCapture: () => set({ status: 'reviewing' }),
  startExport: () => set({ status: 'exporting' }),
  finishExport: () => set({ status: 'reviewing' }),
  resetSession: () => set({ ...initialCapture, cameraError: null }),
}))
