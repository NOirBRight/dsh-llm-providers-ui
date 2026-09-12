/** Prototype C provider detail: one shared layout for every provider plugin. */

import type { ReactNode } from 'react'
import { ProviderQuotaMeter } from './provider-ui.js'
import { ProviderRoleBadge } from './provider-ui.js'
import type { ProviderRoleBadgeProps } from './provider-ui.js'
import type { UsageWindowSummary } from '../usage-readers.js'
import { formatResetLabel } from '../usage-readers.js'
import { copy as sectionCopy } from './provider-section.js'
import { SortableList } from './SortableList.js'

/** Account block: plugin owns the business state, the template owns the card. */
export interface ProviderDetailAccount {
  readonly state: 'connected' | 'configured' | 'unconnected'
  /** Primary line, for example the signed-in label or the configured key name. */
  readonly label?: ReactNode
  /** Secondary muted line such as "Subscription · no API key". */
  readonly meta?: ReactNode
  /** Right-aligned actions (sign in, sign out, manage). */
  readonly actions?: ReactNode
  /** Extra rows under the card: API key field, endpoint, read-only hints. */
  readonly body?: ReactNode
}

/** Quota block: values come from the shared usage snapshot, never from the plugin card. */
export interface ProviderDetailQuota {
  readonly status: 'ready' | 'stale' | 'loading' | 'error' | 'unsupported' | 'logged-out'
  readonly windows: readonly UsageWindowSummary[]
  /** Caption under the meters, for example "Updated 22:10". */
  readonly updatedLabel?: ReactNode
  readonly refreshing?: boolean
  readonly onRefresh?: () => void
}

/** Models block: the shared header plus the plugin's own list or editor. */
export interface ProviderDetailModels {
  readonly count?: number
  /** Extra header actions after the shared three. */
  readonly actions?: ReactNode
  /** Hint line under the header. Defaults to the shared copy. */
  readonly hint?: ReactNode
  /** Expand-all switch state and handler. */
  readonly allOpen?: boolean
  readonly onToggleAll?: () => void
  readonly sorting?: boolean
  readonly onToggleSorting?: () => void
  /** Sort needs at least two models in most catalogs. */
  readonly sortDisabled?: boolean
  readonly onChooseFromAccount?: () => void
  readonly chooseDisabled?: boolean
  /** The list itself (rows/editor) plus any trailing action such as add-model. */
  readonly list?: ReactNode
  /**
   * Rows the template renders itself. Providers hand over data and handlers so
   * every card shows the same row chrome; `extra` carries provider-specific fields.
   */
  readonly items?: readonly ProviderDetailModelRow[]
  readonly expanded?: readonly string[]
  readonly onPatch?: (rowId: string, patch: { id?: string; name?: string }) => void
  readonly onRemove?: (rowId: string) => void
  readonly onToggle?: (rowId: string) => void
  readonly onReorder?: (rowIds: readonly string[]) => void
  /** Renders the shared "add model" button when provided. */
  readonly onAdd?: () => void
  readonly addDisabled?: boolean
  /** Provider-specific fields for an expanded row. */
  readonly extra?: (row: ProviderDetailModelRow) => ReactNode
}

/** Icon paths copied from the locked prototype so every card matches it. */
const ICON = {
  expand: 'M2 4h12M2 12h12M5 2v4M11 10v4',
  sort: 'M5 2v12m-3-3 3 3 3-3M11 14V2m-3 3 3-3 3 3',
  plus: 'M8 3v10M3 8h10',
  chevron: 'M6 3l5 5-5 5',
  trash: 'M3 4h10M6 4V2h4v2M4 4l1 10h6l1-10M7 7v4M9 7v4',
} as const

function modelLabelOf(row: ProviderDetailModelRow, index?: number): string {
  const id = row.id.trim()
  if (id.length > 0) return id
  return index === undefined ? row.rowId : String(index + 1)
}

function DetailIcon({ path }: { readonly path: string }): ReactNode {
  return (
    <svg className="c-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

/** One editable model row rendered by the shared template. */
export interface ProviderDetailModelRow {
  readonly rowId: string
  readonly id: string
  readonly name?: string
}

/** Locale copy contract so the template stays locale-free. */
export interface ProviderDetailCopy {
  readonly details: string
  readonly connected: string
  readonly configured: string
  readonly unconnected: string
  readonly modelCount: string
  readonly quotaHeading: string
  readonly quotaMeta: string
  readonly refresh: string
  readonly refreshing: string
  readonly accountHeading: string
  readonly modelsHeading: string
  readonly modelsCount: string
  readonly modelsHint: string
  readonly expandAll: string
  readonly modelIdLabel: string
  readonly modelNameLabel: string
  readonly addModelLabel: string
  readonly removeModelLabel: string
  readonly dragModelLabel: string
  readonly collapseAll: string
  readonly sort: string
  readonly done: string
  readonly chooseFromAccount: string
  readonly addModel: string
  readonly advancedHeading: string
  readonly advancedNote: string
  readonly resetAt: string
  readonly resetOverdue: string
  readonly resetMissing: string
  readonly connectToSee: string
  readonly unsupportedQuota: string
  readonly loadingQuota: string
  readonly errorQuota: string
}

function detailCopyOf(locale: 'zh' | 'en'): ProviderDetailCopy {
  const source = sectionCopy[locale]
  return {
    details: source.details,
    connected: source.connected,
    configured: source.configured,
    unconnected: source.unconnected,
    modelCount: source.modelCount,
    quotaHeading: source.quotaHeading,
    quotaMeta: source.quotaMeta,
    refresh: source.refresh,
    refreshing: source.refreshing,
    accountHeading: source.accountHeading,
    modelsHeading: source.modelsHeading,
    modelIdLabel: source.modelIdLabel,
    modelNameLabel: source.modelNameLabel,
    addModelLabel: source.addModelLabel,
    removeModelLabel: source.removeModelLabel,
    dragModelLabel: source.dragModelLabel,
    modelsCount: source.modelsCount,
    modelsHint: source.modelsHint,
    expandAll: source.expandAll,
    collapseAll: source.collapseAll,
    sort: source.sortModels,
    done: source.done,
    chooseFromAccount: source.chooseFromAccount,
    addModel: source.addModel,
    advancedHeading: source.advancedHeading,
    advancedNote: source.advancedNote,
    connectToSee: source.connectToSee,
    unsupportedQuota: source.unsupportedQuota,
    loadingQuota: source.loadingQuota,
    errorQuota: source.errorQuota,
    resetAt: source.resetAt,
    resetOverdue: source.resetOverdue,
    resetMissing: source.resetMissing,
  }
}

/**
 * What the settings page hands to a provider card through the item slot.
 * Plugins that migrate to the shared template read this; older cards ignore it.
 */
export interface ProviderItemSlotContext {
  /** Which surface renders the card right now. */
  readonly mode: 'overview' | 'detail'
  /** Live shared usage snapshot for this provider, when one exists. */
  readonly usage?: {
    readonly status: 'ready' | 'stale' | 'loading' | 'error' | 'unsupported' | 'logged-out'
    readonly windows: readonly UsageWindowSummary[]
    readonly fetchedAt?: string
  }
  /** Business account state the plugin published on the directory. */
  readonly accountState?: 'connected' | 'configured' | 'unconnected'
  /** Shared copy in the page's active locale, so every provider reads the same. */
  readonly copy?: ProviderDetailCopy
  /**
   * Shared detail template, injected by the settings page so provider plugins
   * never bundle their own copy: one rebuild of the UI updates every provider.
   */
  readonly template?: (props: ProviderDetailProps) => ReactNode
  /** Manual quota refresh; only the detail surface offers it. */
  readonly onRefresh?: () => void
}

/** Shared detail copy so every plugin renders the same words. */
export const providerDetailCopy: Readonly<Record<'zh' | 'en', ProviderDetailCopy>> = {
  zh: detailCopyOf('zh'),
  en: detailCopyOf('en'),
}

export interface ProviderDetailProps {
  readonly name: string
  readonly role?: ProviderRoleBadgeProps['role']
  readonly mark?: ReactNode
  readonly copy: ProviderDetailCopy
  readonly account?: ProviderDetailAccount
  readonly quota: ProviderDetailQuota
  readonly models?: ProviderDetailModels
  /** Notice or risk copy shown above the account card. */
  readonly notice?: ReactNode
  /** Folded, closed by default; the template never reopens or force-closes it. */
  readonly advanced?: ReactNode
  readonly footer?: ReactNode
  /** Unsaved-changes bar; rendered only when the plugin has a draft. */
  readonly draft?: ReactNode
}

function quotaEmptyLabel(status: ProviderDetailQuota['status'], copy: ProviderDetailCopy): string {
  if (status === 'unsupported') return copy.unsupportedQuota
  if (status === 'loading') return copy.loadingQuota
  if (status === 'error') return copy.errorQuota
  return copy.connectToSee
}

/**
 * The single provider detail layout: identity, notice, account, quota, models,
 * advanced, footer. Plugins pass data and content; geometry and copy live here so
 * every provider looks and reads the same.
 */
export function ProviderDetail(props: ProviderDetailProps): ReactNode {
  const account = props.account
  const state = account?.state ?? 'unconnected'
  const stateLabel = state === 'connected' ? props.copy.connected : state === 'configured' ? props.copy.configured : props.copy.unconnected
  const count = props.models?.count
  return (
    <article className="c-full" data-provider-detail="">
      <div className="c-detail-title">
        <div className="c-identity">
          {props.mark === undefined ? null : <span className="c-brand">{props.mark}</span>}
          <div>
            <div className="c-name-line">
              <span className="c-name">{props.name}</span>
              <ProviderRoleBadge {...(props.role === undefined ? {} : { role: props.role })} />
            </div>
            <div className="c-sub">
              <span className={'c-dot' + (state === 'unconnected' ? '' : ' good')} />
              {stateLabel}
              {count === undefined ? null : (
                <>
                  <span aria-hidden="true">·</span>
                  {props.copy.modelCount.replace('{n}', String(count))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {props.notice === undefined ? null : <p className="c-notice">{props.notice}</p>}

      {account === undefined ? null : (
        <div className="c-account-group">
          <div className="c-account-head">{props.copy.accountHeading}</div>
          <section className="c-account">
            <div className="c-account-copy">
              <div className="c-account-name">
                <span className={'c-dot' + (state === 'unconnected' ? '' : ' good')} />
                {account.label}
              </div>
              {account.meta === undefined ? null : <div className="c-account-meta">{account.meta}</div>}
            </div>
            {account.actions === undefined ? null : <div className="c-account-actions">{account.actions}</div>}
          </section>
          {account.body === undefined ? null : <div className="c-account-body">{account.body}</div>}
        </div>
      )}

      <section data-c-quota="">
        <div className="c-quota-head">
          <h3>{props.copy.quotaHeading}</h3>
          {props.quota.onRefresh === undefined ? null : (
            <button type="button" className="c-btn quiet" disabled={props.quota.refreshing === true} onClick={props.quota.onRefresh}>
              {props.quota.refreshing === true ? props.copy.refreshing : props.copy.refresh}
            </button>
          )}
        </div>
        <div className="c-quota-list">
          {props.quota.windows.length === 0
            ? <div className="c-missing">{quotaEmptyLabel(props.quota.status, props.copy)}</div>
            : props.quota.windows.map(window => {
                const detail = formatResetLabel(window.resetsAt, window.label, {
                  at: props.copy.resetAt,
                  overdue: props.copy.resetOverdue,
                  missing: props.copy.resetMissing,
                })
                return (
                  <ProviderQuotaMeter
                    key={window.id}
                    label={window.label}
                    {...(window.remainingPercent === undefined ? {} : { remainingPercent: window.remainingPercent })}
                    emptyLabel={window.valueText}
                    {...(detail === undefined ? {} : { detail })}
                  />
                )
              })}
        </div>
        <div className="c-quota-meta">
          <span>{props.copy.quotaMeta}</span>
          {props.quota.updatedLabel === undefined ? null : <span>{props.quota.updatedLabel}</span>}
        </div>
      </section>

      {props.models === undefined ? null : (
        <section data-provider-models="">
          <div className="c-models-head">
            <div className="c-models-title">
              <h3>{props.copy.modelsHeading}</h3>
              <span className="c-count">{props.copy.modelsCount.replace('{n}', String(props.models.count ?? 0))}</span>
            </div>
            <div className="c-models-actions">
              {props.models.onToggleAll === undefined ? null : (
                <button type="button" className="c-btn quiet c-icon-label" aria-pressed={props.models.allOpen === true} onClick={props.models.onToggleAll}>
                  <DetailIcon path={ICON.expand} />
                  {props.models.allOpen === true ? props.copy.collapseAll : props.copy.expandAll}
                </button>
              )}
              {props.models.onToggleSorting === undefined ? null : (
                <button type="button" className="c-btn quiet c-icon-label" aria-pressed={props.models.sorting === true} disabled={props.models.sortDisabled === true} onClick={props.models.onToggleSorting}>
                  <DetailIcon path={ICON.sort} />
                  {props.models.sorting === true ? props.copy.done : props.copy.sort}
                </button>
              )}
              {props.models.onChooseFromAccount === undefined ? null : (
                <button type="button" className="c-btn c-icon-label" disabled={props.models.chooseDisabled === true} onClick={props.models.onChooseFromAccount}>
                  <DetailIcon path={ICON.plus} />
                  {props.copy.chooseFromAccount}
                </button>
              )}
              {props.models.actions}
            </div>
          </div>
          <p className="c-models-hint">{props.models.hint ?? props.copy.modelsHint}</p>
          <div className="c-models-list">
            {props.models.list}
            {props.models.items === undefined ? null : (
              <>
                <SortableList
                  items={props.models.items}
                  getId={row => row.rowId}
                  chrome="bare"
                  disabled={props.models.onReorder === undefined}
                  sorting={props.models.sorting === true}
                  moveButtons={props.models.sorting === true}
                  dragLabel={row => props.copy.dragModelLabel + ': ' + modelLabelOf(row)}
                  moveUpLabel={row => props.copy.dragModelLabel + ': ' + modelLabelOf(row)}
                  moveDownLabel={row => props.copy.dragModelLabel + ': ' + modelLabelOf(row)}
                  onReorder={rows => { props.models?.onReorder?.(rows.map(row => row.rowId)) }}
                  renderItem={(row, index) => {
                    const label = modelLabelOf(row, index)
                    // Sorting folds every row; "expand all" opens them without touching state.
                    const expanded = props.models?.sorting !== true
                      && (props.models?.allOpen === true || props.models?.expanded?.includes(row.rowId) === true)
                    return (
                      <div className="c-model-card" data-model-row={label}>
                        <div className="c-model-top">
                          <label className="c-field">
                            <span className="c-field-label">{props.copy.modelIdLabel}</span>
                            <input
                              className="c-input"
                              value={row.id}
                              readOnly={props.models?.sorting === true}
                              spellCheck={false}
                              autoComplete="off"
                              placeholder={props.copy.modelIdLabel}
                              aria-label={props.copy.modelIdLabel + ' ' + String(index + 1)}
                              onChange={event => { props.models?.onPatch?.(row.rowId, { id: event.target.value }) }}
                            />
                          </label>
                          <label className="c-field">
                            <span className="c-field-label">{props.copy.modelNameLabel}</span>
                            <input
                              className="c-input"
                              value={row.name ?? ''}
                              readOnly={props.models?.sorting === true}
                              autoComplete="off"
                              placeholder={props.copy.modelNameLabel}
                              aria-label={props.copy.modelNameLabel + ' ' + String(index + 1)}
                              onChange={event => { props.models?.onPatch?.(row.rowId, { name: event.target.value }) }}
                            />
                          </label>
                          {props.models?.onToggle === undefined ? null : (
                            <button type="button" className="c-btn quiet c-icon-only" aria-expanded={expanded} aria-label={props.copy.details + ': ' + label} onClick={() => { props.models?.onToggle?.(row.rowId) }}>
                              <DetailIcon path={ICON.chevron} />
                            </button>
                          )}
                          {props.models?.onRemove === undefined ? null : (
                            <button type="button" className="c-btn quiet c-icon-only" aria-label={props.copy.removeModelLabel + ' ' + label} onClick={() => { props.models?.onRemove?.(row.rowId) }}>
                              <DetailIcon path={ICON.trash} />
                            </button>
                          )}
                        </div>
                        {props.models?.extra === undefined || !expanded ? null : <div className="c-model-extra">{props.models.extra(row)}</div>}
                      </div>
                    )
                  }}
                />
                {props.models.onAdd === undefined ? null : (
                  <button type="button" className="c-btn c-icon-label c-add-model" disabled={props.models.addDisabled === true} onClick={props.models.onAdd}>
                    <DetailIcon path={ICON.plus} />
                    {props.copy.addModelLabel}
                  </button>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {props.advanced === undefined ? null : (
        <details className="c-advanced">
          <summary>
            <DetailIcon path={ICON.chevron} />
            <span>{props.copy.advancedHeading}</span>
            <span className="c-advanced-note">{props.copy.advancedNote}</span>
          </summary>
          <div className="c-advanced-content">{props.advanced}</div>
        </details>
      )}

      {props.footer === undefined ? null : <div className="c-footer">{props.footer}</div>}
      {props.draft === undefined ? null : <div className="c-draft">{props.draft}</div>}
    </article>
  )
}