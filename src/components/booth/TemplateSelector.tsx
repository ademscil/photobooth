'use client'

import { useState } from 'react'
import type { TemplateId } from '@/types'
import { CustomTemplateBuilder } from './CustomTemplateBuilder'
import { useSessionStore } from '@/store/sessionStore'

interface TemplateSelectorProps {
  value: TemplateId
  onChange: (id: TemplateId) => void
  disabled?: boolean
}

const BUILT_IN: { id: Exclude<TemplateId, 'custom'>; label: string; diagram: React.ReactNode }[] = [
  {
    id: 'single', label: 'Single',
    diagram: (
      <svg viewBox="0 0 30 40" className="h-full w-full" aria-hidden="true">
        <rect x="2" y="2" width="26" height="36" rx="1" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  {
    id: 'double', label: 'Double',
    diagram: (
      <svg viewBox="0 0 30 50" className="h-full w-full" aria-hidden="true">
        <rect x="2" y="2" width="26" height="21" rx="1" fill="currentColor" opacity="0.3" />
        <rect x="2" y="27" width="26" height="21" rx="1" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  {
    id: 'grid', label: 'Grid',
    diagram: (
      <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden="true">
        <rect x="2" y="2" width="17" height="17" rx="1" fill="currentColor" opacity="0.3" />
        <rect x="21" y="2" width="17" height="17" rx="1" fill="currentColor" opacity="0.3" />
        <rect x="2" y="21" width="17" height="17" rx="1" fill="currentColor" opacity="0.3" />
        <rect x="21" y="21" width="17" height="17" rx="1" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  {
    id: 'strip', label: 'Strip',
    diagram: (
      <svg viewBox="0 0 20 70" className="h-full w-full" aria-hidden="true">
        <rect x="2" y="2" width="16" height="14" rx="1" fill="currentColor" opacity="0.3" />
        <rect x="2" y="19" width="16" height="14" rx="1" fill="currentColor" opacity="0.3" />
        <rect x="2" y="36" width="16" height="14" rx="1" fill="currentColor" opacity="0.3" />
        <rect x="2" y="53" width="16" height="14" rx="1" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
]

export function TemplateSelector({ value, onChange, disabled = false }: TemplateSelectorProps) {
  const [showBuilder, setShowBuilder] = useState(false)
  const { customTemplate, setCustomTemplate } = useSessionStore()

  const allItems = [...BUILT_IN.map(t => t.id), 'custom' as const]

  const handleSelect = (id: TemplateId) => {
    if (disabled) return
    if (id === 'custom') { setShowBuilder(true); return }
    onChange(id)
  }

  const handleArrowKey = (e: React.KeyboardEvent, currentIndex: number) => {
    let next = currentIndex
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (currentIndex + 1) % allItems.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (currentIndex - 1 + allItems.length) % allItems.length
    else return
    e.preventDefault()
    handleSelect(allItems[next])
    document.getElementById(`template-${allItems[next]}`)?.focus()
  }

  return (
    <>
      {showBuilder && (
        <CustomTemplateBuilder
          existing={customTemplate}
          onSave={(ct) => { setCustomTemplate(ct); setShowBuilder(false) }}
          onCancel={() => setShowBuilder(false)}
        />
      )}

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">Layout</p>
        <div role="radiogroup" aria-label="Layout template" className="grid grid-cols-5 gap-1.5">
          {BUILT_IN.map((t, i) => {
            const isSelected = value === t.id
            return (
              <div
                key={t.id}
                id={`template-${t.id}`}
                role="radio"
                aria-checked={isSelected}
                aria-label={t.label}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => handleSelect(t.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(t.id) }
                  handleArrowKey(e, i)
                }}
                className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 ${
                  isSelected ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'border-border bg-background text-muted-foreground hover:border-brand-primary/50'
                } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <div className="h-7 w-7">{t.diagram}</div>
                <span className="text-[10px] font-medium">{t.label}</span>
              </div>
            )
          })}

          {/* Custom template */}
          <div
            id="template-custom"
            role="radio"
            aria-checked={value === 'custom'}
            aria-label="Custom template"
            tabIndex={value === 'custom' ? 0 : -1}
            onClick={() => handleSelect('custom')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect('custom') }
              handleArrowKey(e, BUILT_IN.length)
            }}
            className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 ${
              value === 'custom' ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'border-dashed border-border bg-background text-muted-foreground hover:border-brand-primary/50'
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="text-[10px] font-medium">Custom</span>
          </div>
        </div>

        {value === 'custom' && customTemplate && (
          <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 dark:border-green-800 dark:bg-green-950">
            <span className="text-xs text-green-700 dark:text-green-300">✓ {customTemplate.name}</span>
            <button
              type="button"
              onClick={() => !disabled && setShowBuilder(true)}
              className="text-xs text-green-600 underline hover:no-underline dark:text-green-400"
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </>
  )
}
