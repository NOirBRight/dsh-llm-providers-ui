/** Presentation-only model picker overlay. Callers supply grouped candidates. */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface ModelPickerCandidate {
  readonly id: string
  readonly name?: string
  readonly hint?: string
}

export interface ModelPickerSection {
  readonly id: string
  readonly label: string
  readonly models: readonly ModelPickerCandidate[]
}

export interface ModelPickerLabels {
  readonly title: string
  readonly description: string
  readonly search: string
  readonly loading: string
  readonly empty: string
  readonly cancel: string
  readonly apply: string
  readonly close: string
}

const rootStyle: CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', padding: 24,
}
const maskStyle: CSSProperties = { position: 'absolute', inset: 0, background: 'var(--dsw-alias-bg-mask-1)', backdropFilter: 'var(--dsw-mask-blur)' }
const dialogStyle: CSSProperties = {
  position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', width: 'min(520px, 100%)',
  maxHeight: 'min(680px, calc(100vh - 48px))', overflow: 'hidden', border: '1px solid var(--dsw-alias-border-inverted)',
  borderRadius: 24, background: 'var(--dsw-alias-bg-layer-2)', boxShadow: 'var(--dsw-shadow-lv3)', color: 'var(--dsw-alias-label-primary)',
}
const headerStyle: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '22px 14px 12px 24px' }
const titleStyle: CSSProperties = { margin: 0, fontSize: 16, lineHeight: '24px', fontWeight: 500 }
const closeStyle: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, border: 0, borderRadius: 8,
  background: 'transparent', color: 'var(--dsw-alias-label-secondary)', cursor: 'pointer', fontSize: 22,
}
const descriptionStyle: CSSProperties = { margin: 0, padding: '0 24px', fontSize: 14, lineHeight: '22px', color: 'var(--dsw-alias-label-primary)' }
const searchStyle: CSSProperties = {
  boxSizing: 'border-box', width: 'calc(100% - 48px)', minHeight: 36, margin: '16px 24px 0',
  border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 8, padding: '7px 10px',
  background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', font: 'inherit',
}
const listStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0, margin: '12px 24px 20px', padding: 0, overflowY: 'auto', listStyle: 'none' }
const brandHeaderStyle: CSSProperties = { padding: '2px 0 0', fontSize: 12, lineHeight: '18px', fontWeight: 600, color: 'var(--dsw-alias-label-tertiary)' }
const brandListStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 10, margin: 0, padding: 0, listStyle: 'none' }
const candidateStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, lineHeight: '22px', cursor: 'pointer' }
const footerStyle: CSSProperties = { display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 24px 20px' }
const buttonStyle: CSSProperties = {
  minHeight: 36, border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 8, padding: '7px 12px',
  background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', cursor: 'pointer',
}
const statusStyle: CSSProperties = { margin: '16px 24px', fontSize: 13, color: 'var(--dsw-alias-label-secondary)' }
const errorStyle: CSSProperties = { ...statusStyle, color: 'var(--dsw-alias-state-error-primary)' }

function matches(model: ModelPickerCandidate, query: string): boolean {
  if (query.trim() === '') return true
  return ((model.name ?? '') + ' ' + model.id).toLowerCase().includes(query.trim().toLowerCase())
}

/** Searchable grouped checkbox dialog. Does not own discovery or brand rules. */
export function ModelPickerDialog(props: {
  readonly open: boolean
  readonly loading: boolean
  readonly error?: string
  readonly labels: ModelPickerLabels
  readonly sections: readonly ModelPickerSection[]
  readonly picked: ReadonlySet<string>
  readonly onClose: () => void
  readonly onToggle: (id: string) => void
  readonly onApply: () => void
}): ReactNode {
  const { open, loading, error, labels } = props
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (!open) setQuery('') }, [open])
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent): void => { if (event.key === 'Escape') props.onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown) }
  }, [open, props.onClose])
  useEffect(() => {
    if (!open || loading || error !== undefined) return
    searchRef.current?.focus()
  }, [open, loading, error])
  if (!open || typeof document === 'undefined') return null
  const visible = props.sections.map(section => ({
    ...section,
    models: section.models.filter(model => matches(model, query)),
  })).filter(section => section.models.length > 0)
  return createPortal((
    <div style={rootStyle} role="presentation">
      <div style={maskStyle} aria-hidden="true" onClick={props.onClose} />
      <section style={dialogStyle} role="dialog" aria-modal="true" aria-label={labels.title} aria-busy={loading}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>{labels.title}</h2>
          <button type="button" style={closeStyle} aria-label={labels.close} onClick={props.onClose}>×</button>
        </div>
        <p style={descriptionStyle}>{labels.description}</p>
        {loading
          ? <p style={statusStyle} role="status">{labels.loading}</p>
          : error !== undefined
            ? <p style={errorStyle} role="alert">{error}</p>
            : (
              <>
                <input ref={searchRef} style={searchStyle} type="search" value={query} placeholder={labels.search}
                  aria-label={labels.search} onChange={event => { setQuery(event.target.value) }} />
                {visible.length === 0
                  ? <p style={statusStyle} role="status">{labels.empty}</p>
                  : (
                    <ul style={listStyle}>
                      {visible.map(section => (
                        <li key={section.id}>
                          <div style={brandHeaderStyle}>{section.label}</div>
                          <ul style={brandListStyle}>
                            {section.models.map(model => (
                              <li key={model.id}>
                                <label style={candidateStyle}>
                                  <input type="checkbox" checked={props.picked.has(model.id)} onChange={() => { props.onToggle(model.id) }} />
                                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <span>{model.name ?? model.id}{model.name !== undefined && model.name !== model.id ? ' (' + model.id + ')' : ''}</span>
                                    {model.hint === undefined ? null : <span style={{ fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' }}>{model.hint}</span>}
                                  </span>
                                </label>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  )}
              </>
            )}
        <div style={footerStyle}>
          <button type="button" style={buttonStyle} onClick={props.onClose}>{labels.cancel}</button>
          <button type="button" style={{ ...buttonStyle, ...(loading || error !== undefined ? { cursor: 'not-allowed', opacity: 0.4 } : {}) }}
            disabled={loading || error !== undefined} onClick={props.onApply}>{labels.apply}</button>
        </div>
      </section>
    </div>
  ), document.body)
}
