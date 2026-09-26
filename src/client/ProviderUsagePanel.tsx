/** Sidebar Provider Usage panel, four-column icon strip. Controlled and UI-only: no RPC, no persistence. */

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import type { ProviderSectionLocaleKey } from './provider-section.js'

import { ProviderMark } from './provider-marks.js'
import { SortableList } from './SortableList.js'
import { formatResetLabel, pickPrimaryWindow, type ProviderUsageStatus, type ProviderUsageSummary, type UsageWindowSummary } from './usage.js'
import { ProviderQuotaMeter, providerUiCss } from './provider-ui.js'
export type { ProviderUsageStatus, ProviderUsageSummary, UsageWindowSummary } from './usage.js'

function windowValueText(quotaWindow: UsageWindowSummary): string {
  return quotaWindow.remainingPercent === undefined ? quotaWindow.valueText : String(Math.round(quotaWindow.remainingPercent)) + '%'
}

function usageLow(remainingPercent: number | undefined): boolean {
  return remainingPercent !== undefined && remainingPercent <= 20
}

type Translate = (key: ProviderSectionLocaleKey) => string

function FilterRow(props: { t: Translate, summary: ProviderUsageSummary, hidden: boolean, onToggle: (visible: boolean) => void }): ReactNode {
  return (
    <label className="pu-filter-item">
      <input
        type="checkbox"
        aria-label={props.t('usageShowProvider').replace('{name}', props.summary.name)}
        checked={!props.hidden}
        onChange={event => { props.onToggle(event.target.checked) }}
      />
      <span className="pu-mark"><ProviderMark providerKey={props.summary.providerKey} /></span>
      <span className="pu-filter-name">{props.summary.name}</span>
    </label>
  )
}

/** Controlled props: normalized summaries in display order plus visibility callbacks. */
export interface ProviderUsagePanelProps {
  /** Translator supplied by the registered settings.providers locale namespace. */
  t: Translate
  /** All queryable providers in display order; hiddenKeys filters the grid. */
  providers: readonly ProviderUsageSummary[]
  /** Hidden provider keys (e.g. from provider Loader Config). Defaults to visible-all. */
  hiddenKeys?: readonly string[]
  /** Spins the refresh icon while a parent-driven refresh is in flight. */
  refreshing?: boolean
  onRefresh: (providerKey?: string) => void
  onToggleVisibility: (providerKey: string, visible: boolean) => void
  onShowAll: () => void
  onReorder?: (keys: readonly string[]) => void
}

const STATUS_KEY: Record<ProviderUsageStatus, ProviderSectionLocaleKey> = {
  loading: 'usageLoading',
  ready: 'usageEmptyQuota',
  'logged-out': 'usageLoggedOut',
  unsupported: 'usageUnsupported',
  stale: 'usageStale',
  error: 'usageError',
}

const panelCss = [
  '[data-provider-usage-panel]{display:flex;flex-direction:column;position:relative;width:100%;min-width:0;padding:6px 6px 8px;background:transparent}',
  '[data-provider-usage-panel] .pu-head{display:flex;align-items:center;height:24px;padding:0 2px 4px}',
  '[data-provider-usage-panel] .grow{flex:1;min-width:0}',
  '[data-provider-usage-panel] .pu-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:550;letter-spacing:.01em;color:color-mix(in srgb,var(--dsw-alias-label-primary) 62%,var(--dsw-alias-label-secondary))}',
  '[data-provider-usage-panel] .pu-actions{display:flex;gap:2px;margin-left:auto}',
  '[data-provider-usage-panel] .pu-mini-spin{display:inline-block;width:9px;height:9px;border:1.5px solid currentColor;border-right-color:transparent;border-radius:50%;vertical-align:middle;animation:pu-spin .55s linear infinite}',
  '[data-provider-usage-panel] .pu-detail-head .pu-icon-btn:last-child{margin-left:auto}',
  '[data-provider-usage-panel] .pu-icon-btn{display:grid;place-items:center;width:25px;height:25px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}',
  '[data-provider-usage-panel] .pu-icon-btn:hover{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary)}',
  '[data-provider-usage-panel] .pu-icon-btn:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}',
  '[data-provider-usage-panel] .pu-icon-btn svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.7}',
  '[data-provider-usage-panel] .pu-spinning svg{animation:pu-spin .55s ease}',
  '@keyframes pu-spin{to{transform:rotate(360deg)}}',
  '[data-provider-usage-panel] .pu-stage{width:100%;min-width:0;height:auto;max-height:min(70dvh,420px);overflow:auto;padding:1px;margin:-1px;scrollbar-width:thin}',
  '[data-provider-usage-panel] .pu-stage-open{max-height:none;overflow:visible}',
  '[data-provider-usage-panel] .pu-rows{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}',
  '[data-provider-usage-panel] .pu-cell{position:relative;min-width:0}',
  '[data-provider-usage-panel] .pu-row{box-sizing:border-box;display:flex;align-items:center;gap:3px;width:100%;min-width:0;min-height:32px;padding:4px 0;border:0;border-radius:5px;background:transparent;color:inherit;text-align:left;cursor:pointer;outline:none}',
  '[data-provider-usage-panel] .pu-row:hover{background:var(--dsw-alias-bg-module-platform)}',
  '[data-provider-usage-panel] .pu-row:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:-2px}',
  '[data-provider-usage-panel] .pu-mark{display:grid;place-items:center;flex:none;width:18px;height:18px;overflow:visible}',
  '[data-provider-usage-panel] .pu-logo{display:block;width:100%;height:100%;color:var(--dsw-alias-label-secondary)}',
  '[data-provider-usage-panel] .pu-row .pu-mark{position:relative;width:16px;height:16px}',
  '[data-provider-usage-panel] .pu-stale{position:absolute;right:-3px;top:-7px;font-size:12px;color:var(--dsw-alias-label-secondary)}',
  '[data-provider-usage-panel] .pu-primary{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary);font-size:12px;font-weight:650;line-height:16px;font-variant-numeric:tabular-nums}',
  '[data-provider-usage-panel] .pu-warn .pu-primary{color:color-mix(in srgb,#c47b08 58%,var(--dsw-alias-label-secondary))}',
  '[data-provider-usage-panel] .pu-empty-text{color:var(--dsw-alias-label-tertiary);font-weight:550}',
  '[data-provider-usage-panel] .pu-detail{box-sizing:border-box;display:flex;flex-direction:column;width:100%;min-width:0;padding:0;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);overflow:hidden}',
  '[data-provider-usage-panel] .pu-detail-head{display:flex;align-items:center;gap:6px;padding:0 6px;border-bottom:1px solid var(--dsw-alias-border-l2);flex:none}',
  '[data-provider-usage-panel] .pu-detail-head .pu-icon-btn{width:32px;height:32px;flex:none}',
  '[data-provider-usage-panel] .pu-detail-body{padding:8px 10px;display:grid;gap:10px}',
  '[data-provider-usage-panel] .pu-detail-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:550;color:color-mix(in srgb,var(--dsw-alias-label-primary) 62%,var(--dsw-alias-label-secondary))}',
  '[data-provider-usage-panel] .pu-detail-sub{margin:0;color:var(--dsw-alias-label-tertiary);font-size:11px}',
  '[data-provider-usage-panel] .pu-tip-empty{padding:8px 0;color:var(--dsw-alias-label-secondary);font-size:12px}',
  '[data-provider-usage-panel] .pu-empty{padding:22px 8px;color:var(--dsw-alias-label-tertiary);text-align:center;font-size:11px;line-height:18px}',
  '[data-provider-usage-panel] .pu-empty-btn{margin-top:8px;padding:4px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-state-business-primary);font-size:11px;cursor:pointer}',
  '[data-provider-usage-panel] .pu-popover{position:absolute;z-index:20;right:4px;bottom:44px;left:4px;max-height:min(520px,calc(100vh - 100px));overflow:hidden;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-shadow-lv2,0 10px 30px rgba(0,0,0,0.18))}',
  '[data-provider-usage-panel] .pu-popover-head{display:flex;align-items:center;padding:12px 12px 8px}',
  '[data-provider-usage-panel] .pu-popover-title{font-size:13px;font-weight:500;color:var(--dsw-alias-label-secondary)}',
  '[data-provider-usage-panel] .pu-popover-sub{margin-top:2px;color:var(--dsw-alias-label-tertiary);font-size:10.5px}',
  '[data-provider-usage-panel] .pu-popover-close{margin-left:auto}',
  '[data-provider-usage-panel] .pu-search{width:calc(100% - 20px);height:30px;margin:0 10px 6px;padding:0 9px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;outline:none;background:transparent;color:var(--dsw-alias-label-primary);font-size:12px}',
  '[data-provider-usage-panel] .pu-search:focus{border-color:var(--dsw-alias-state-business-primary)}',
  '[data-provider-usage-panel] .pu-filter-list{max-height:330px;overflow:auto;padding:2px 8px 8px}',
  '[data-provider-usage-panel] .pu-filter-item{display:flex;align-items:center;gap:8px;min-height:34px;padding:0 5px;border-radius:7px;font-size:12px;color:var(--dsw-alias-label-primary);cursor:pointer}',
  '[data-provider-usage-panel] .pu-filter-list [data-sortable-row="true"]{grid-template-columns:16px minmax(0,1fr)!important;border:0;background:transparent;border-radius:7px}',
  '[data-provider-usage-panel] .pu-filter-list [data-sortable-handle]{width:16px!important;min-height:28px!important;border-right:0!important;opacity:.65}',
  '[data-provider-usage-panel] .pu-filter-item:hover{background:var(--dsw-alias-bg-module-platform)}',
  '[data-provider-usage-panel] .pu-filter-all{width:100%;border:0;border-bottom:1px solid var(--dsw-alias-border-l2);background:transparent;text-align:left;font-weight:500}',
  '[data-provider-usage-panel] .pu-filter-all:disabled{cursor:default;opacity:.55}',
  '[data-provider-usage-panel] .pu-filter-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  '[data-provider-usage-panel] .pu-no-match{padding:16px 8px;color:var(--dsw-alias-label-tertiary);text-align:center;font-size:11px}',
  '@media (pointer:coarse){[data-provider-usage-panel] .pu-row{min-height:44px}[data-provider-usage-panel] .pu-icon-btn,[data-provider-usage-panel] .pu-detail-head .pu-icon-btn{width:44px;height:44px}[data-provider-usage-panel] .pu-head{height:44px;padding-bottom:0}}',
].join('\n')

/** Shared refresh glyph. */
function RefreshIcon(): ReactNode {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16.2 7A6.5 6.5 0 1 0 16 13.5" /><path d="M16.2 3.8V7H13" /></svg>
}

function ProviderRow(props: { t: Translate, summary: ProviderUsageSummary, onSelect: () => void }): ReactNode {
  const summary = props.summary
  const hasData = summary.status === 'ready' || summary.status === 'stale'
  const primary = hasData ? pickPrimaryWindow(summary.windows) ?? summary.windows[0] : undefined
  const headline = primary === undefined ? (summary.status === 'loading' ? '…' : '—') : windowValueText(primary)
  const label = summary.name + ' ' + (primary === undefined ? props.t(STATUS_KEY[summary.status]) : headline) + (summary.status === 'stale' ? ' · ' + props.t('usageExpired') : '')
  const low = usageLow(primary?.remainingPercent)
  return (
    <div className="pu-cell">
      <button
        type="button"
        className={'pu-row' + (low ? ' pu-warn' : '')}
        data-usage-key={summary.providerKey}
        aria-label={label}
        title={label}
        onClick={props.onSelect}
      >
        <span className="pu-mark"><ProviderMark providerKey={summary.providerKey} />{summary.status === 'stale' && <span className="pu-stale" aria-hidden="true">*</span>}</span>
        <span className={'pu-primary' + (primary === undefined ? ' pu-empty-text' : '')}>{headline}</span>
      </button>
    </div>
  )
}

function UsageDetail(props: { t: Translate, summary: ProviderUsageSummary, onBack: () => void, onRefresh: () => void }): ReactNode {
  const summary = props.summary
  return (
    <div className="pu-detail" aria-label={props.t('usageDetails').replace('{name}', summary.name)}>
      <div className="pu-detail-head">
        <button type="button" className="pu-icon-btn" aria-label={props.t('usageBack')} autoFocus onClick={props.onBack}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5 7 10l5.5 5.5" /></svg>
        </button>
        <span className="pu-mark"><ProviderMark providerKey={summary.providerKey} /></span>
        <span className="pu-detail-name grow">{summary.name}</span>
        <button
          type="button"
          className={'pu-icon-btn' + (summary.refreshing === true ? ' pu-spinning' : '')}
          aria-label={props.t('usageRefreshProvider').replace('{name}', summary.name)}
          onClick={props.onRefresh}
        >
          {summary.refreshing === true ? <span className="pu-mini-spin" /> : <RefreshIcon />}
        </button>
      </div>
      <div className="pu-detail-body">
      <div className="pu-detail-sub">{props.t('quotaHeading') + (summary.status === 'stale' ? ' · ' + props.t('usageExpired') : '')}</div>
      {summary.windows.length === 0
        ? <div className="pu-tip-empty">{props.t(STATUS_KEY[summary.status])}</div>
        : summary.windows.map(quotaWindow => {
          const reset = formatResetLabel(quotaWindow.resetsAt, quotaWindow.label, { at: props.t('resetAt'), overdue: props.t('resetOverdue'), missing: props.t('resetMissing') })
          return (
            <ProviderQuotaMeter
              key={quotaWindow.id}
              label={quotaWindow.label}
              {...(quotaWindow.remainingPercent === undefined ? {} : { remainingPercent: quotaWindow.remainingPercent })}
              emptyLabel={quotaWindow.valueText}
              {...(reset === undefined ? {} : { detail: reset })}
            />
          )
        })}
      </div>
    </div>
  )
}

/** Controlled sidebar Provider Usage panel (four-column icon strip, tap for details). */
export function ProviderUsagePanel(props: ProviderUsagePanelProps): ReactNode {
  const providers = props.providers.filter(summary => summary.status !== 'logged-out')
  const hidden = new Set(props.hiddenKeys ?? [])
  const visible = providers.filter(summary => !hidden.has(summary.providerKey))
  const [filterOpen, setFilterOpen] = useState(false)
  const [detailKey, setDetailKey] = useState<string | undefined>()
  const closeDetail = (): void => {
    const key = detailKey
    setDetailKey(undefined)
    queueMicrotask(() => {
      const row = document.querySelector('[data-provider-usage-panel] [data-usage-key="' + key + '"]')
      if (row instanceof HTMLElement) row.focus()
    })
  }
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement | null>(null)
  const detail = visible.find(summary => summary.providerKey === detailKey)

  useEffect(() => {
    if (filterOpen) searchRef.current?.focus()
    else setQuery('')
  }, [filterOpen])

  useEffect(() => {
    if (detailKey === undefined) return
    const onKey = (event: KeyboardEvent): void => { if (event.key === 'Escape') closeDetail() }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey) }
  }, [detailKey])

  const normalizedQuery = query.trim().toLowerCase()
  const matches = normalizedQuery === ''
    ? providers
    : providers.filter(summary => summary.name.toLowerCase().includes(normalizedQuery))
  const allVisible = providers.length > 0 && visible.length === providers.length

  let body: ReactNode
  if (visible.length === 0) {
    body = (
      <div className="pu-empty">
        <div>{providers.length === 0 ? props.t('usageNoProviders') : props.t('usageNoneVisible')}</div>
        <div>{props.t('usageFilterHint')}</div>
        <button type="button" className="pu-empty-btn" onClick={() => { setFilterOpen(true) }}>{props.t('usageOpenFilter')}</button>
      </div>
    )
  } else {
    body = (
      <div className="pu-rows">
        {visible.map(summary => (
          <ProviderRow
            t={props.t}
            key={summary.providerKey}
            summary={summary}
            onSelect={() => { setFilterOpen(false); setDetailKey(summary.providerKey) }}
          />
        ))}
      </div>
    )
  }

  return (
    <section data-provider-usage-panel aria-label={props.t('usageTitle')}>
      <style>{providerUiCss + panelCss}</style>
      {detail === undefined && <div className="pu-head">
        <span className="pu-title">{props.t('usageTitle')}</span>
        <span className="pu-actions">
          <button
            type="button"
            className="pu-icon-btn"
            aria-label={props.t('usageChooseProviders')}
            aria-expanded={filterOpen}
            onClick={() => { setFilterOpen(open => !open) }}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h8M15 5h2M9 10h8M3 10h2M3 15h6M13 15h4" /><circle cx="13" cy="5" r="2" /><circle cx="7" cy="10" r="2" /><circle cx="11" cy="15" r="2" /></svg>
          </button>
          <button
            type="button"
            className={'pu-icon-btn' + (props.refreshing === true ? ' pu-spinning' : '')}
            aria-label={props.t('usageRefreshAll')}
            onClick={() => { props.onRefresh() }}
          >
            <RefreshIcon />
          </button>
        </span>
      </div>}
      <div className={'pu-stage' + (detail === undefined ? '' : ' pu-stage-open')}>{detail === undefined ? body : <UsageDetail t={props.t} summary={detail} onBack={closeDetail} onRefresh={() => { props.onRefresh(detail.providerKey) }} />}</div>
      {filterOpen
        ? (
          <section
            className="pu-popover"
            role="dialog"
            aria-label={props.t('usageVisibility')}
            onKeyDown={event => { if (event.key === 'Escape') { setFilterOpen(false); setDetailKey(undefined) } }}
          >
            <div className="pu-popover-head">
              <div>
                <div className="pu-popover-title">{props.t('usageVisibility')}</div>
                <div className="pu-popover-sub">{props.t('usageVisibilityHint')}</div>
              </div>
              <button type="button" className="pu-icon-btn pu-popover-close" aria-label={props.t('usageCloseFilter')} onClick={() => { setFilterOpen(false) }}>×</button>
            </div>
            <input
              ref={searchRef}
              className="pu-search"
              type="search"
              aria-label={props.t('usageSearch')}
              placeholder={props.t('usageSearch')}
              value={query}
              onChange={event => { setQuery(event.target.value) }}
            />
            <div className="pu-filter-list">
              <button
                type="button"
                className="pu-filter-item pu-filter-all"
                disabled={allVisible}
                onClick={props.onShowAll}
              >
                {props.t('usageShowAll').replace('{n}', String(providers.length))}
              </button>
              {matches.length === 0 ? <p className="pu-no-match">{props.t('usageNoMatch')}</p> : query.trim() === '' && props.onReorder !== undefined && matches.length > 1
                ? (
                  <SortableList
                    items={[...matches]}
                    getId={summary => summary.providerKey}
                    dragLabel={summary => props.t('usageReorder').replace('{name}', summary.name)}
                    onReorder={next => { props.onReorder?.(next.map(summary => summary.providerKey)) }}
                    renderItem={summary => (
                      <FilterRow t={props.t} summary={summary} hidden={hidden.has(summary.providerKey)} onToggle={visible => { props.onToggleVisibility(summary.providerKey, visible) }} />
                    )}
                  />
                )
                : matches.map(summary => (
                  <FilterRow t={props.t} key={summary.providerKey} summary={summary} hidden={hidden.has(summary.providerKey)} onToggle={visible => { props.onToggleVisibility(summary.providerKey, visible) }} />
                ))}
            </div>
          </section>
        )
        : null}
    </section>
  )
}
