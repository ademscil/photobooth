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
}

export function getTemplate(id: TemplateId): Template {
  if (id === 'custom') {
    // Custom template is handled separately in composer.ts
    throw new Error('getTemplate() should not be called for custom templates')
  }
  const template = TEMPLATES[id]
  if (!template) {
    throw new Error(`Unknown template ID: ${id}`)
  }
  return template
}
