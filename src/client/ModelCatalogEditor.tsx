/** Generic model catalog list and details editor. Callers own discovery and persistence. */

import type { ReactNode } from 'react'
import { SortableList } from './SortableList.js'
import {
  ModelCatalogCapabilities,
  ModelCatalogDetails,
  ModelCatalogRow,
  catalogStyles,
} from './model-catalog-ui.js'

/** One catalog row the editor can display and patch. */
export interface ModelCatalogDraft {
  readonly rowId: string
  readonly id: string
  readonly name?: string
  readonly contextWindow?: string
  readonly inputLimit?: string
  readonly output?: string
  readonly vision?: boolean
  readonly thinking?: boolean
  readonly defaultEffort?: string
  readonly efforts?: readonly { readonly id: string; readonly name: string }[]
  readonly sources?: Readonly<Record<string, string>>
  readonly overrides?: Readonly<Record<string, boolean>>
}

/** Which details the caller wants rendered. Extra numeric fields stay hidden unless enabled. */
export interface ModelCatalogFields {
  readonly vision?: boolean
  readonly thinking?: boolean
  readonly defaultEffort?: boolean
  readonly context?: boolean
  readonly inputLimit?: boolean
  readonly output?: boolean
  readonly triState?: boolean
  readonly restoreAuto?: boolean
}

/** Copy owned by the caller so this module stays locale-free. */
export interface ModelCatalogLabels {
  readonly modelId: string
  readonly modelName: string
  readonly modelDetails: string
  readonly remove: string
  readonly drag: string
  readonly moveUp: string
  readonly moveDown: string
  readonly vision: string
  readonly thinking: string
  readonly defaultEffort: string
  readonly contextWindow: string
  readonly contextWindowDefault: string
  readonly inputLimit?: string
  readonly output?: string
  readonly unknown?: string
  readonly supported?: string
  readonly unsupported?: string
  readonly restoreAuto?: string
  readonly source?: string
  readonly expandAll?: string
  readonly collapseAll?: string
}

const iconButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  border: 0,
  borderRadius: 8,
  background: 'transparent',
  color: 'var(--dsw-alias-label-secondary)',
  cursor: 'pointer',
} as const

/** Patch that may delete a field by sending explicit undefined. */
export type CatalogPatch<T> = { [K in keyof T]?: T[K] | undefined }

/** Copy declared draft keys, including contextWindow. Thinking false clears defaultEffort. */
export function applyCatalogPatch<T extends ModelCatalogDraft>(model: T, patch: CatalogPatch<T>): T {
  const next: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(model)) next[key] = value
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) delete next[key]
    else next[key] = value
  }
  if (patch.thinking === false) delete next.defaultEffort
  return next as T
}

function IconChevron({ open }: { open: boolean }): ReactNode {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden
      style={{ flex: 'none', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 120ms ease' }}>
      <path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTrash(): ReactNode {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2.5 4h11M6.5 4V2.5h3V4M4 4l.7 9a1 1 0 001 .9h4.6a1 1 0 001-.9L12 4M6.5 6.8v4.4M9.5 6.8v4.4"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Capability({
  label, value, disabled, triState, unknownLabel, supportedLabel, unsupportedLabel, onChange,
}: {
  label: string
  value: boolean | undefined
  disabled: boolean
  triState: boolean
  unknownLabel: string
  supportedLabel: string
  unsupportedLabel: string
  onChange: (value: boolean | undefined) => void
}): ReactNode {
  if (!triState) {
    return (
      <label style={{ ...catalogStyles.labelStyle, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <input type="checkbox" checked={value === true} disabled={disabled} onChange={event => { onChange(event.target.checked) }} />
        {label}
      </label>
    )
  }
  const selected = value === true ? 'yes' : value === false ? 'no' : 'unknown'
  return (
    <label style={{ ...catalogStyles.labelStyle, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {label}
      <select style={catalogStyles.selectStyle} value={selected} disabled={disabled} aria-label={label}
        onChange={event => {
          const next = event.target.value
          onChange(next === 'yes' ? true : next === 'no' ? false : undefined)
        }}>
        <option value="unknown">{unknownLabel}</option>
        <option value="yes">{supportedLabel}</option>
        <option value="no">{unsupportedLabel}</option>
      </select>
    </label>
  )
}

function Source({ labels, sources, field }: { labels: ModelCatalogLabels; sources?: Readonly<Record<string, string>> | undefined; field: string }): ReactNode {
  const source = sources?.[field]
  if (source === undefined || labels.source === undefined) return null
  return <span style={{ fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' }}>{labels.source.replace('{source}', source)}</span>
}

function Restore({ labels, field, overrides, disabled, onRestore }: {
  labels: ModelCatalogLabels
  field: string
  overrides?: Readonly<Record<string, boolean>> | undefined
  disabled: boolean
  onRestore?: ((field: string) => void) | undefined
}): ReactNode {
  if (labels.restoreAuto === undefined || onRestore === undefined || overrides?.[field] !== true) return null
  return <button type="button" style={{ ...iconButtonStyle, width: 'auto', padding: '0 8px', fontSize: 12 }} disabled={disabled} onClick={() => { onRestore(field) }}>{labels.restoreAuto}</button>
}

/** Sortable catalog rows with optional vision, thinking, effort, and capacity fields. */
export function ModelCatalogEditor<T extends ModelCatalogDraft>(props: {
  readonly items: readonly T[]
  readonly fields: ModelCatalogFields
  readonly labels: ModelCatalogLabels
  readonly disabled?: boolean
  readonly sorting?: boolean
  readonly expanded: ReadonlySet<string>
  readonly onReorder: (items: T[]) => void
  readonly onPatch: (index: number, patch: CatalogPatch<T>) => void
  readonly onRemove?: (index: number) => void
  readonly onToggle: (rowId: string) => void
  readonly onRestore?: (index: number, field: string) => void
}): ReactNode {
  const { items, fields, labels, disabled = false, sorting = false, expanded, onRestore } = props
  const allClosed = items.length > 0 && items.every(model => !expanded.has(model.rowId))
  const zh = typeof document !== 'undefined' && document.documentElement.lang.toLowerCase().startsWith('zh')
  const expandLabel = labels.expandAll ?? (zh ? '全部展开' : 'Expand all')
  const collapseLabel = labels.collapseAll ?? (zh ? '全部收起' : 'Collapse all')
  return (
    <div>
    {items.length === 0 ? null : (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button type="button" disabled={disabled} aria-pressed={!allClosed} style={{ ...iconButtonStyle, width: 'auto', minWidth: 96, padding: '0 10px', gap: 6, fontSize: 12 }}
          onClick={() => {
            for (const model of items) {
              const open = expanded.has(model.rowId)
              if (allClosed && !open) props.onToggle(model.rowId)
              if (!allClosed && open) props.onToggle(model.rowId)
            }
          }}>{allClosed ? expandLabel : collapseLabel}</button>
      </div>
    )}
    <SortableList
      items={[...items]}
      getId={model => model.rowId}
      disabled={disabled}
      sorting={sorting}
      chrome="row"
      dragLabel={(model, index) => labels.drag + ': ' + (model.id.trim() || String(index + 1))}
      onReorder={props.onReorder}
      renderItem={(model, index) => {
        const label = model.id.trim() || String(index + 1)
        const open = expanded.has(model.rowId)
        const efforts = model.efforts ?? []
        const patch = (next: CatalogPatch<ModelCatalogDraft>): void => { props.onPatch(index, next as CatalogPatch<T>) }
        return (
          <div data-model-row={label} data-provider-model="" style={sorting ? catalogStyles.modelContentSortingStyle : catalogStyles.modelContentStyle}>
            <label style={catalogStyles.fieldStyle}>
              <span style={catalogStyles.labelStyle}>{labels.modelId}</span>
              <input style={catalogStyles.rowInputStyle} value={model.id} placeholder={labels.modelId}
                aria-label={labels.modelId + ' ' + String(index + 1)} disabled={disabled}
                onChange={event => { patch({ id: event.target.value }) }} />
            </label>
            <label style={catalogStyles.fieldStyle}>
              <span style={catalogStyles.labelStyle}>{labels.modelName}</span>
              <input style={catalogStyles.rowInputStyle} value={model.name ?? ''} placeholder={labels.modelName}
                aria-label={labels.modelName + ' ' + String(index + 1)} disabled={disabled}
                onChange={event => { patch({ name: event.target.value || undefined }) }} />
            </label>
            {sorting ? null : (
            <button type="button" style={{ ...iconButtonStyle, marginTop: 18 }} aria-label={labels.modelDetails + ': ' + label} aria-expanded={open}
              title={labels.modelDetails} onClick={() => { props.onToggle(model.rowId) }}>
              <IconChevron open={open} />
            </button>
            )}
            {props.onRemove === undefined ? null : (
              <button type="button" style={{ ...iconButtonStyle, marginTop: 18 }} aria-label={labels.remove + ' ' + label} title={labels.remove}
                disabled={disabled} onClick={() => { props.onRemove?.(index) }}>
                <IconTrash />
              </button>
            )}
            {open ? (
              <ModelCatalogDetails>
                {(fields.context || fields.inputLimit || fields.output) ? (
                  <ModelCatalogRow>
                    {fields.context ? (
                      <label style={catalogStyles.fieldStyle}>
                        <span style={catalogStyles.labelStyle}>{labels.contextWindow}</span>
                        <input style={catalogStyles.inputStyle} inputMode="numeric" placeholder={labels.contextWindowDefault}
                          value={model.contextWindow ?? ''} disabled={disabled} aria-label={labels.contextWindow}
                          onChange={event => { patch({ contextWindow: event.target.value }) }} />
                        <Source labels={labels} sources={model.sources} field="contextWindow" />
                        <Restore labels={labels} field="contextWindow" overrides={model.overrides} disabled={disabled} onRestore={field => { onRestore?.(index, field) }} />
                      </label>
                    ) : null}
                    {fields.inputLimit ? (
                      <label style={catalogStyles.fieldStyle}>
                        <span style={catalogStyles.labelStyle}>{labels.inputLimit ?? labels.contextWindow}</span>
                        <input style={catalogStyles.inputStyle} inputMode="numeric" placeholder={labels.contextWindowDefault}
                          value={model.inputLimit ?? ''} disabled={disabled} aria-label={labels.inputLimit ?? labels.contextWindow}
                          onChange={event => { patch({ inputLimit: event.target.value }) }} />
                        <Source labels={labels} sources={model.sources} field="inputLimit" />
                        <Restore labels={labels} field="inputLimit" overrides={model.overrides} disabled={disabled} onRestore={field => { onRestore?.(index, field) }} />
                      </label>
                    ) : null}
                    {fields.output ? (
                      <label style={catalogStyles.fieldStyle}>
                        <span style={catalogStyles.labelStyle}>{labels.output ?? labels.contextWindow}</span>
                        <input style={catalogStyles.inputStyle} inputMode="numeric" placeholder={labels.contextWindowDefault}
                          value={model.output ?? ''} disabled={disabled} aria-label={labels.output ?? labels.contextWindow}
                          onChange={event => { patch({ output: event.target.value }) }} />
                        <Source labels={labels} sources={model.sources} field="output" />
                        <Restore labels={labels} field="output" overrides={model.overrides} disabled={disabled} onRestore={field => { onRestore?.(index, field) }} />
                      </label>
                    ) : null}
                  </ModelCatalogRow>
                ) : null}
                <ModelCatalogCapabilities>
                  {fields.vision ? (
                    <>
                      <Capability label={labels.vision} value={model.vision} disabled={disabled} triState={fields.triState === true}
                        unknownLabel={labels.unknown ?? labels.contextWindowDefault} supportedLabel={labels.supported ?? labels.vision} unsupportedLabel={labels.unsupported ?? labels.thinking}
                        onChange={vision => { patch({ vision }) }} />
                      <Source labels={labels} sources={model.sources} field="vision" />
                      <Restore labels={labels} field="vision" overrides={model.overrides} disabled={disabled} onRestore={field => { onRestore?.(index, field) }} />
                    </>
                  ) : null}
                  {fields.thinking ? (
                    <>
                      <Capability label={labels.thinking} value={model.thinking} disabled={disabled} triState={fields.triState === true}
                        unknownLabel={labels.unknown ?? labels.contextWindowDefault} supportedLabel={labels.supported ?? labels.vision} unsupportedLabel={labels.unsupported ?? labels.thinking}
                        onChange={thinking => { patch({ thinking }) }} />
                      <Source labels={labels} sources={model.sources} field="thinking" />
                      <Restore labels={labels} field="thinking" overrides={model.overrides} disabled={disabled} onRestore={field => { onRestore?.(index, field) }} />
                    </>
                  ) : null}
                  {fields.defaultEffort && efforts.length > 0 ? (
                    <label style={{ ...catalogStyles.labelStyle, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {labels.defaultEffort}
                      <select style={catalogStyles.selectStyle} value={model.defaultEffort ?? (fields.triState ? '' : efforts[0]?.id ?? '')} disabled={disabled || model.thinking === false}
                        aria-label={labels.defaultEffort + ' ' + label}
                        onChange={event => {
                          const value = event.target.value
                          patch({ defaultEffort: value === '' ? undefined : efforts.find(entry => entry.id === value)?.id })
                        }}>
                        {fields.triState ? <option value="">{labels.unknown ?? labels.contextWindowDefault}</option> : null}
                        {efforts.map(effort => <option key={effort.id} value={effort.id}>{effort.name}</option>)}
                      </select>
                      <Source labels={labels} sources={model.sources} field="defaultEffort" />
                      <Restore labels={labels} field="defaultEffort" overrides={model.overrides} disabled={disabled} onRestore={field => { onRestore?.(index, field) }} />
                    </label>
                  ) : null}
                </ModelCatalogCapabilities>
              </ModelCatalogDetails>
            ) : null}
          </div>
        )
      }}
    />
    </div>
  )
}
