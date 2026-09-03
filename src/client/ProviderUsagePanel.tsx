/** Sidebar Provider Usage panel, prototype B (two-column digest). Controlled and UI-only: no RPC, no persistence. */

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import type { ProviderUsageSummary, UsageWindowSummary } from './usage.js'
export type { ProviderUsageStatus, ProviderUsageSummary, UsageWindowSummary } from './usage.js'

/** Headline window: smallest remainingPercent, else the first window. Never ranks providers. */
function pickPrimaryWindow(windows: readonly UsageWindowSummary[]): UsageWindowSummary | undefined {
  let best: UsageWindowSummary | undefined
  for (const window of windows) {
    const remaining = window.remainingPercent
    if (remaining === undefined) continue
    if (best === undefined || remaining < (best.remainingPercent ?? Number.POSITIVE_INFINITY)) best = window
  }
  return best ?? windows[0]
}

/** Headline text: percent when known, otherwise the window's own text. */
function primaryValueText(window: UsageWindowSummary | undefined): string {
  if (window === undefined) return ''
  return window.remainingPercent === undefined ? window.valueText : String(window.remainingPercent) + '%'
}

type UsageTone = 'low' | 'warn' | 'ok' | 'neutral'

/** Only low/warn headlines take red/amber; everything else stays neutral. */
function usageTone(remainingPercent: number | undefined): UsageTone {
  if (remainingPercent === undefined) return 'neutral'
  if (remainingPercent <= 15) return 'low'
  if (remainingPercent <= 35) return 'warn'
  return 'ok'
}

/** Controlled props: normalized summaries in display order plus visibility callbacks. */
export interface ProviderUsagePanelProps {
  /** All queryable providers in display order; hiddenKeys filters the grid. */
  providers: readonly ProviderUsageSummary[]
  /** Hidden provider keys (e.g. from llm-providers settings). Defaults to visible-all. */
  hiddenKeys?: readonly string[]
  /** Provider key of the current session; gets the active highlight. */
  currentProviderKey?: string
  /** Spins the refresh icon while a parent-driven refresh is in flight. */
  refreshing?: boolean
  /** Initial load with no data yet. */
  loading?: boolean
  /** Usage channel unavailable and no data to show. */
  unavailable?: boolean
  onRefresh: () => void
  onToggleVisibility: (providerKey: string, visible: boolean) => void
  onShowAll: () => void
  onHideAll: () => void
}

const STATUS_TEXT: Record<string, string> = {
  loading: '加载中…',
  'logged-out': '未登录',
  unsupported: '不支持查询',
  error: '加载失败',
}

const panelCss = [
  '[data-provider-usage-panel]{display:flex;flex-direction:column;position:relative;min-width:0;padding:7px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1)}',
  '[data-provider-usage-panel] .pu-head{display:flex;align-items:center;height:28px;padding:0 1px 5px}',
  '[data-provider-usage-panel] .pu-title{font-size:12.5px;font-weight:650;color:var(--dsw-alias-label-primary)}',
  '[data-provider-usage-panel] .pu-count{margin-left:6px;color:var(--dsw-alias-label-tertiary);font-size:11px;font-variant-numeric:tabular-nums}',
  '[data-provider-usage-panel] .pu-actions{display:flex;gap:2px;margin-left:auto}',
  '[data-provider-usage-panel] .pu-icon-btn{display:grid;place-items:center;width:25px;height:25px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}',
  '[data-provider-usage-panel] .pu-icon-btn:hover{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary)}',
  '[data-provider-usage-panel] .pu-icon-btn svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.7}',
  '[data-provider-usage-panel] .pu-spinning svg{animation:pu-spin .55s ease}',
  '@keyframes pu-spin{to{transform:rotate(360deg)}}',
  '[data-provider-usage-panel] .pu-scroll{max-height:170px;overflow:auto;scrollbar-width:thin}',
  '[data-provider-usage-panel] .pu-rows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));overflow:hidden;border:1px solid var(--dsw-alias-border-l2);border-radius:9px;background:var(--dsw-alias-bg-layer-1)}',
  '[data-provider-usage-panel] .pu-row{display:flex;flex-direction:column;align-items:stretch;gap:5px;width:100%;min-width:0;min-height:51px;padding:7px 8px 6px;border:0;border-right:1px solid var(--dsw-alias-border-l2);border-bottom:1px solid var(--dsw-alias-border-l2);border-radius:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}',
  '[data-provider-usage-panel] .pu-row:nth-child(even){border-right:0}',
  '[data-provider-usage-panel] .pu-row:nth-last-child(-n+2){border-bottom:0}',
  '[data-provider-usage-panel] .pu-row:hover{background:var(--dsw-alias-bg-module-platform)}',
  '[data-provider-usage-panel] .pu-active{background:var(--dsw-alias-bg-module-platform);box-shadow:inset 2px 0 var(--dsw-alias-state-business-primary)}',
  '[data-provider-usage-panel] .pu-top{display:flex;align-items:center;gap:5px;min-width:0}',
  '[data-provider-usage-panel] .pu-id{display:flex;align-items:center;gap:5px;min-width:0}',
  '[data-provider-usage-panel] .pu-icon{display:grid;place-items:center;flex:none;width:16px;height:16px;border-radius:5px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-module-platform);font-size:9px;font-weight:700}',
  '[data-provider-usage-panel] .pu-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary);font-size:10.5px;font-weight:650}',
  '[data-provider-usage-panel] .pu-primary{flex:none;margin-left:auto;color:var(--dsw-alias-label-secondary);font-size:10.5px;font-variant-numeric:tabular-nums}',
  '[data-provider-usage-panel] .pu-low .pu-primary{color:#d94848}',
  '[data-provider-usage-panel] .pu-warn .pu-primary{color:#c47b08}',
  '[data-provider-usage-panel] .pu-stale{flex:none;padding:0 3px;border:1px solid var(--dsw-alias-border-l2);border-radius:4px;color:var(--dsw-alias-label-tertiary);font-size:8px;line-height:12px;white-space:nowrap}',
  '[data-provider-usage-panel] .pu-windows{display:grid;gap:2px;min-width:0;color:var(--dsw-alias-label-secondary);font-size:8px;line-height:11px;white-space:nowrap}',
  '[data-provider-usage-panel] .pu-window{display:flex;justify-content:center;gap:2px;min-width:0;overflow:hidden}',
  '[data-provider-usage-panel] .pu-window small{flex:none;color:var(--dsw-alias-label-tertiary);font-size:inherit;text-transform:uppercase}',
  '[data-provider-usage-panel] .pu-window b{overflow:hidden;color:var(--dsw-alias-label-secondary);font-weight:600;font-variant-numeric:tabular-nums}',
  '[data-provider-usage-panel] .pu-empty{padding:22px 8px;color:var(--dsw-alias-label-tertiary);text-align:center;font-size:11px;line-height:18px}',
  '[data-provider-usage-panel] .pu-empty-btn{margin-top:8px;padding:4px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;background:transparent;color:var(--dsw-alias-state-business-primary);font-size:11px;cursor:pointer}',
  '[data-provider-usage-panel] .pu-popover{position:absolute;z-index:20;right:4px;bottom:44px;left:4px;max-height:min(520px,calc(100vh - 100px));overflow:hidden;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-shadow-lv2,0 10px 30px rgba(0,0,0,0.18))}',
  '[data-provider-usage-panel] .pu-popover-head{display:flex;align-items:center;padding:12px 12px 8px}',
  '[data-provider-usage-panel] .pu-popover-title{font-size:13px;font-weight:700;color:var(--dsw-alias-label-primary)}',
  '[data-provider-usage-panel] .pu-popover-sub{margin-top:2px;color:var(--dsw-alias-label-tertiary);font-size:10.5px}',
  '[data-provider-usage-panel] .pu-popover-close{margin-left:auto}',
  '[data-provider-usage-panel] .pu-search{width:calc(100% - 20px);height:30px;margin:0 10px 6px;padding:0 9px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;outline:none;background:transparent;color:var(--dsw-alias-label-primary);font-size:12px}',
  '[data-provider-usage-panel] .pu-filter-list{max-height:330px;overflow:auto;padding:2px 8px 8px}',
  '[data-provider-usage-panel] .pu-filter-item{display:flex;align-items:center;gap:8px;min-height:34px;padding:0 5px;border-radius:7px;font-size:12px;color:var(--dsw-alias-label-primary);cursor:pointer}',
  '[data-provider-usage-panel] .pu-filter-item:hover{background:var(--dsw-alias-bg-module-platform)}',
  '[data-provider-usage-panel] .pu-filter-all{border-bottom:1px solid var(--dsw-alias-border-l2);font-weight:650}',
  '[data-provider-usage-panel] .pu-filter-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  '[data-provider-usage-panel] .pu-no-match{padding:16px 8px;color:var(--dsw-alias-label-tertiary);text-align:center;font-size:11px}',
  '@media (max-width:640px){[data-provider-usage-panel] .pu-rows{grid-template-columns:1fr}[data-provider-usage-panel] .pu-row{min-height:45px;border-right:0}[data-provider-usage-panel] .pu-row:nth-last-child(-n+2){border-bottom:1px solid var(--dsw-alias-border-l2)}[data-provider-usage-panel] .pu-row:last-child{border-bottom:0}[data-provider-usage-panel] .pu-windows{gap:8px;font-size:9px}}',
].join('\n')

function windowTooltip(windows: readonly { label: string, valueText: string, remainingPercent?: number, resetsAt?: string }[]): string {
  return windows
    .map(window => window.label + ' ' + (window.remainingPercent === undefined ? window.valueText : String(window.remainingPercent) + '%')
      + (window.resetsAt === undefined ? '' : ' · 重置 ' + window.resetsAt))
    .join('；')
}

/** One compact two-line provider cell. Statuses without data show a single status line. */
function ProviderRow(props: { summary: ProviderUsageSummary, active: boolean }): ReactNode {
  const summary = props.summary
  const hasData = summary.status === 'ready' || summary.status === 'stale'
  const primary = hasData ? pickPrimaryWindow(summary.windows) : undefined
  const tone = primary === undefined ? 'neutral' : usageTone(primary.remainingPercent)
  const headline = primary === undefined ? (STATUS_TEXT[summary.status] ?? '') : primaryValueText(primary)
  const shown = summary.windows.slice(0, 3)
  const toneClass = tone === 'low' ? ' pu-low' : tone === 'warn' ? ' pu-warn' : ''
  return (
    <button
      type="button"
      className={'pu-row' + toneClass + (props.active ? ' pu-active' : '')}
      aria-label={summary.name + ' ' + headline}
      title={summary.windows.length > 0 ? windowTooltip(summary.windows) : headline}
    >
      <span className="pu-top">
        <span className="pu-id">
          <span className="pu-icon" aria-hidden>{summary.name.trim().charAt(0)}</span>
          <span className="pu-name">{summary.name}</span>
        </span>
        <b className="pu-primary">{headline}</b>
        {summary.status === 'stale'
          ? <span className="pu-stale" title={'上次更新 ' + (summary.fetchedAt ?? '未知')}>已过期</span>
          : null}
      </span>
      {shown.length > 0
        ? (
          <span className="pu-windows" style={{ gridTemplateColumns: 'repeat(' + String(shown.length) + ', minmax(0, 1fr))' }}>
            {shown.map(window => (
              <span key={window.id} className="pu-window" title={window.label + (window.resetsAt === undefined ? '' : ' · 重置 ' + window.resetsAt)}>
                <small>{window.shortLabel}</small>
                <b>{window.remainingPercent === undefined ? window.valueText : String(window.remainingPercent) + '%'}</b>
              </span>
            ))}
          </span>
        )
        : null}
    </button>
  )
}

/** Controlled sidebar Provider Usage panel (desktop two columns, mobile one column). */
export function ProviderUsagePanel(props: ProviderUsagePanelProps): ReactNode {
  const hidden = new Set(props.hiddenKeys ?? [])
  const visible = props.providers.filter(summary => !hidden.has(summary.providerKey))
  const [filterOpen, setFilterOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (filterOpen) searchRef.current?.focus()
    else setQuery('')
  }, [filterOpen])

  const normalizedQuery = query.trim().toLowerCase()
  const matches = normalizedQuery === ''
    ? props.providers
    : props.providers.filter(summary => summary.name.toLowerCase().includes(normalizedQuery))
  const allVisible = props.providers.length > 0 && visible.length === props.providers.length

  let body: ReactNode
  if (props.unavailable === true) {
    body = <p className="pu-empty">Provider 用量暂不可用，请稍后刷新重试。</p>
  } else if (props.loading === true && visible.length === 0) {
    body = <p className="pu-empty">正在加载 Provider 用量…</p>
  } else if (visible.length === 0) {
    body = (
      <div className="pu-empty">
        <div>{props.providers.length === 0 ? '暂无可查询的 Provider' : '没有显示的 Provider'}</div>
        <div>使用筛选按钮选择要在侧栏显示的 Provider</div>
        <button type="button" className="pu-empty-btn" onClick={() => { setFilterOpen(true) }}>打开筛选</button>
      </div>
    )
  } else {
    body = (
      <div className="pu-rows">
        {visible.map(summary => (
          <ProviderRow key={summary.providerKey} summary={summary} active={summary.providerKey === props.currentProviderKey} />
        ))}
      </div>
    )
  }

  return (
    <section data-provider-usage-panel aria-label="Provider Usage">
      <style>{panelCss}</style>
      <div className="pu-head">
        <span className="pu-title">Provider Usage</span>
        <span className="pu-count" aria-label={'已显示 ' + String(visible.length) + ' / 可查询 ' + String(props.providers.length)}>
          {String(visible.length) + ' / ' + String(props.providers.length)}
        </span>
        <span className="pu-actions">
          <button
            type="button"
            className="pu-icon-btn"
            aria-label="选择侧栏显示的 Provider"
            aria-expanded={filterOpen}
            title="选择显示的 Provider"
            onClick={() => { setFilterOpen(open => !open) }}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h8M15 5h2M9 10h8M3 10h2M3 15h6M13 15h4" /><circle cx="13" cy="5" r="2" /><circle cx="7" cy="10" r="2" /><circle cx="11" cy="15" r="2" /></svg>
          </button>
          <button
            type="button"
            className={'pu-icon-btn' + (props.refreshing === true ? ' pu-spinning' : '')}
            aria-label="刷新用量"
            title="刷新全部"
            onClick={props.onRefresh}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16.2 7A6.5 6.5 0 1 0 16 13.5" /><path d="M16.2 3.8V7H13" /></svg>
          </button>
        </span>
      </div>
      <div className="pu-scroll">{body}</div>
      {filterOpen
        ? (
          <section
            className="pu-popover"
            role="dialog"
            aria-label="侧栏显示"
            onKeyDown={event => { if (event.key === 'Escape') setFilterOpen(false) }}
          >
            <div className="pu-popover-head">
              <div>
                <div className="pu-popover-title">侧栏显示</div>
                <div className="pu-popover-sub">只影响 Provider Usage，不影响模型列表</div>
              </div>
              <button type="button" className="pu-icon-btn pu-popover-close" aria-label="关闭" onClick={() => { setFilterOpen(false) }}>×</button>
            </div>
            <input
              ref={searchRef}
              className="pu-search"
              type="search"
              aria-label="搜索 Provider"
              placeholder="搜索 Provider"
              value={query}
              onChange={event => { setQuery(event.target.value) }}
            />
            <div className="pu-filter-list">
              <label className="pu-filter-item pu-filter-all">
                <input
                  type="checkbox"
                  aria-label="显示全部 Provider"
                  checked={allVisible}
                  onChange={event => { if (event.target.checked) props.onShowAll(); else props.onHideAll() }}
                />
                <span className="pu-filter-name">{'显示全部 ' + String(props.providers.length) + ' 个'}</span>
              </label>
              {matches.map(summary => (
                <label key={summary.providerKey} className="pu-filter-item">
                  <input
                    type="checkbox"
                    aria-label={'在侧栏显示 ' + summary.name}
                    checked={!hidden.has(summary.providerKey)}
                    onChange={event => { props.onToggleVisibility(summary.providerKey, event.target.checked) }}
                  />
                  <span className="pu-icon" aria-hidden>{summary.name.trim().charAt(0)}</span>
                  <span className="pu-filter-name">{summary.name}</span>
                </label>
              ))}
              {matches.length === 0 ? <p className="pu-no-match">没有匹配的 Provider</p> : null}
            </div>
          </section>
        )
        : null}
    </section>
  )
}
