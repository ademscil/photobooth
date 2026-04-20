import type { Template, TemplateId } from '@/types'

export const TEMPLATES: Record<Exclude<TemplateId, 'custom'>, Template> = {
  single: {
    id: 'single',
    name: 'Single',
    shotCount: 1,
    canvasAspectRatio: 3 / 4,
    padding: 0.05,
    slots: [{ x: 0.05, y: 0.05, width: 0.9, height: 0.9 }],
  },
  double: {
    id: 'double',
    name: 'Double',
    shotCount: 2,
    canvasAspectRatio: 3 / 5,
    padding: 0.04,
    slots: [
      { x: 0.04, y: 0.04, width: 0.92, height: 0.44 },
      { x: 0.04, y: 0.52, width: 0.92, height: 0.44 },
    ],
  },
  grid: {
    id: 'grid',
    name: 'Grid',
    shotCount: 4,
    canvasAspectRatio: 1,
    padding: 0.04,
    slots: [
      { x: 0.04, y: 0.04, width: 0.44, height: 0.44 },
      { x: 0.52, y: 0.04, width: 0.44, height: 0.44 },
      { x: 0.04, y: 0.52, width: 0.44, height: 0.44 },
      { x: 0.52, y: 0.52, width: 0.44, height: 0.44 },
    ],
  },
  strip: {
    id: 'strip',
    name: 'Strip',
    shotCount: 4,
    canvasAspectRatio: 1 / 3.5,
    padding: 0.025,
    slots: [
      { x: 0.05, y: 0.025, width: 0.9, height: 0.215 },
      { x: 0.05, y: 0.262, width: 0.9, height: 0.215 },
      { x: 0.05, y: 0.499, width: 0.9, height: 0.215 },
      { x: 0.05, y: 0.736, width: 0.9, height: 0.215 },
    ],
  },
  // Film strip: 4 photos in vertical strip with sprocket-hole decoration
  filmstrip: {
    id: 'filmstrip',
    name: 'Film Strip',
    shotCount: 4,
    canvasAspectRatio: 1 / 3.5,
    padding: 0.025,
    slots: [
      { x: 0.12, y: 0.025, width: 0.76, height: 0.215 },
      { x: 0.12, y: 0.262, width: 0.76, height: 0.215 },
      { x: 0.12, y: 0.499, width: 0.76, height: 0.215 },
      { x: 0.12, y: 0.736, width: 0.76, height: 0.215 },
    ],
  },
  // Polaroid: 1 photo with thick white border and caption area
  polaroid: {
    id: 'polaroid',
    name: 'Polaroid',
    shotCount: 1,
    canvasAspectRatio: 3 / 3.8,
    padding: 0.06,
    slots: [{ x: 0.06, y: 0.06, width: 0.88, height: 0.72 }],
  },
  // 3-photo collage: 1 large left + 2 small stacked right
  collage3: {
    id: 'collage3',
    name: 'Collage 3',
    shotCount: 3,
    canvasAspectRatio: 4 / 3,
    padding: 0.03,
    slots: [
      { x: 0.03, y: 0.03, width: 0.55, height: 0.94 },
      { x: 0.61, y: 0.03, width: 0.36, height: 0.455 },
      { x: 0.61, y: 0.515, width: 0.36, height: 0.455 },
    ],
  },
}

export function getTemplate(id: TemplateId): Template {
  if (id === 'custom') {
    throw new Error('getTemplate() should not be called for custom templates')
  }
  const template = TEMPLATES[id]
  if (!template) {
    throw new Error(`Unknown template ID: ${id}`)
  }
  return template
}
