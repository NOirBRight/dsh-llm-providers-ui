/** Sidebar Provider Usage panel, prototype B (two-column minis). Controlled and UI-only: no RPC, no persistence. */

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { ProviderMark } from './provider-marks.js'
import { SortableList } from './SortableList.js'
import { pickPrimaryWindow, type ProviderUsageStatus, type ProviderUsageSummary, type UsageWindowSummary } from './usage.js'
export type { ProviderUsageStatus, ProviderUsageSummary, UsageWindowSummary } from './usage.js'

function windowValueText(quotaWindow: UsageWindowSummary): string {
  return quotaWindow.remainingPercent === undefined ? quotaWindow.valueText : String(Math.round(quotaWindow.remainingPercent)) + '%'
}

type UsageTone = 'low' | 'warn'

function usageTone(remainingPercent: number | undefined): UsageTone | undefined {
  if (remainingPercent !== undefined && remainingPercent <= 20) return 'low'
  if (remainingPercent !== undefined && remainingPercent <= 40) return 'warn'
  return undefined
}

function FilterRow(props: { summary: ProviderUsageSummary, hidden: boolean, onToggle: (visible: boolean) => void }): ReactNode {
  return (
    <label className="pu-filter-item">
      <input
        type="checkbox"
        aria-label={'在侧栏显示 ' + props.summary.name}
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
  /** All queryable providers in display order; hiddenKeys filters the grid. */
  providers: readonly ProviderUsageSummary[]
  /** Hidden provider keys (e.g. from llm-providers settings). Defaults to visible-all. */
  hiddenKeys?: readonly string[]
  /** Spins the refresh icon while a parent-driven refresh is in flight. */
  refreshing?: boolean
  onRefresh: (providerKey?: string) => void
  onToggleVisibility: (providerKey: string, visible: boolean) => void
  onShowAll: () => void
  onReorder?: (keys: readonly string[]) => void
}

const STATUS_TEXT: Record<ProviderUsageStatus, string> = {
  loading: '加载中…',
  ready: '暂无额度数据',
  'logged-out': '未登录',
  unsupported: '不支持查询',
  stale: '额度已过期',
  error: '加载失败',
}

const panelCss = [
  '[data-provider-usage-panel]{display:flex;flex-direction:column;position:relative;width:100%;min-width:0;padding:6px 6px 8px;background:transparent}',
  '[data-provider-usage-panel] .pu-head{display:flex;align-items:center;height:32px;padding:0 2px 7px}',
  '[data-provider-usage-panel] .pu-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:550;letter-spacing:.01em;color:color-mix(in srgb,var(--dsw-alias-label-primary) 62%,var(--dsw-alias-label-secondary))}',
  '[data-provider-usage-panel] .pu-actions{display:flex;gap:2px;margin-left:auto}',
  '[data-provider-usage-panel] .pu-mini-spin{display:inline-block;width:9px;height:9px;border:1.5px solid currentColor;border-right-color:transparent;border-radius:50%;vertical-align:middle;animation:pu-spin .55s linear infinite}',
  '[data-provider-usage-panel] .pu-row-refresh{position:absolute;top:0;right:0;width:24px;height:24px}',
  '@media (hover:hover) and (pointer:fine){[data-provider-usage-panel] .pu-row-refresh{opacity:0;pointer-events:none}[data-provider-usage-panel] .pu-cell:hover .pu-row-refresh,[data-provider-usage-panel] .pu-row-refresh:focus-visible,[data-provider-usage-panel] .pu-row-refresh.pu-spinning{opacity:1;pointer-events:auto}}',
  '[data-provider-usage-panel] .pu-detail-head .pu-icon-btn:last-child{margin-left:auto}',
  '[data-provider-usage-panel] .pu-icon-btn{display:grid;place-items:center;width:25px;height:25px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}',
  '[data-provider-usage-panel] .pu-icon-btn:hover{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary)}',
  '[data-provider-usage-panel] .pu-icon-btn:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}',
  '[data-provider-usage-panel] .pu-icon-btn svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.7}',
  '[data-provider-usage-panel] .pu-spinning svg{animation:pu-spin .55s ease}',
  '@keyframes pu-spin{to{transform:rotate(360deg)}}',
  '[data-provider-usage-panel] .pu-stage{width:100%;min-width:0;height:auto;max-height:132px;overflow:auto;padding:1px;margin:-1px;scrollbar-width:thin}',
  '[data-provider-usage-panel] .pu-stage-open{max-height:none;overflow:visible}',
  '[data-provider-usage-panel] .pu-rows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px}',
  '[data-provider-usage-panel] .pu-cell{position:relative;min-width:0}',
  '[data-provider-usage-panel] .pu-row{box-sizing:border-box;display:flex;align-items:center;gap:8px;width:100%;min-width:0;min-height:40px;padding:5px 22px 5px 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:inherit;text-align:left;cursor:pointer;outline:none}',
  '[data-provider-usage-panel] .pu-row:hover{border-color:var(--dsw-alias-label-tertiary)}',
  '[data-provider-usage-panel] .pu-row:focus-visible{box-shadow:0 0 0 1px var(--dsw-alias-border-l2)}',
  '[data-provider-usage-panel] .pu-mark{display:grid;place-items:center;flex:none;width:18px;height:18px;overflow:hidden;opacity:.72}',
  '[data-provider-usage-panel] .pu-logo{display:block;width:18px;height:18px;color:var(--dsw-alias-label-secondary)}',
  '[data-provider-usage-panel] .pu-copy{display:flex;flex-direction:column;gap:0;min-width:0}',
  '[data-provider-usage-panel] .pu-icon{display:grid;place-items:center;flex:none;width:14px;height:14px;border-radius:4px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-module-platform);font-size:8px;font-weight:750}',
  '[data-provider-usage-panel] .pu-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:color-mix(in srgb,var(--dsw-alias-label-primary) 55%,var(--dsw-alias-label-secondary));font-size:10px;font-weight:500;line-height:12px}',
  '[data-provider-usage-panel] .pu-stale{flex:none;margin-left:auto;color:var(--dsw-alias-label-tertiary);font-size:8px}',
  '[data-provider-usage-panel] .pu-primary{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:color-mix(in srgb,var(--dsw-alias-label-primary) 62%,var(--dsw-alias-label-secondary));font-size:12px;font-weight:500;line-height:14px;font-variant-numeric:tabular-nums}',
  '[data-provider-usage-panel] .pu-low .pu-primary,[data-provider-usage-panel] .pu-tip-value.pu-low{color:color-mix(in srgb,#d94848 58%,var(--dsw-alias-label-secondary))}',
  '[data-provider-usage-panel] .pu-warn .pu-primary,[data-provider-usage-panel] .pu-tip-value.pu-warn{color:color-mix(in srgb,#c47b08 58%,var(--dsw-alias-label-secondary))}',
  '[data-provider-usage-panel] .pu-empty-text{color:var(--dsw-alias-label-tertiary);font-weight:550}',
  '[data-provider-usage-panel] .pu-detail{box-sizing:border-box;display:block;width:100%;min-width:0;padding:10px 12px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1)}',
  '[data-provider-usage-panel] .pu-detail-head{display:flex;align-items:center;gap:8px;margin-bottom:4px}',
  '[data-provider-usage-panel] .pu-detail-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:550;color:color-mix(in srgb,var(--dsw-alias-label-primary) 62%,var(--dsw-alias-label-secondary))}',
  '[data-provider-usage-panel] .pu-detail-sub{margin:0 0 4px;color:var(--dsw-alias-label-tertiary);font-size:11px}',
  '[data-provider-usage-panel] .pu-win{display:flex;flex-direction:column;gap:5px;padding:8px 0 2px}',
  '[data-provider-usage-panel] .pu-win + .pu-win{border-top:1px solid var(--dsw-alias-border-l2)}',
  '[data-provider-usage-panel] .pu-win-top{display:flex;align-items:baseline;justify-content:space-between;gap:8px}',
  '[data-provider-usage-panel] .pu-tip-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:12px}',
  '[data-provider-usage-panel] .pu-tip-value{font-variant-numeric:tabular-nums;font-weight:500;font-size:12px;color:color-mix(in srgb,var(--dsw-alias-label-primary) 62%,var(--dsw-alias-label-secondary))}',
  '[data-provider-usage-panel] .pu-bar{display:block;width:100%;height:6px;overflow:hidden;border:0;border-radius:99px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,var(--dsw-alias-bg-layer-1));accent-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 42%,var(--dsw-alias-label-secondary))}',
  '[data-provider-usage-panel] .pu-bar::-webkit-progress-bar{background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,var(--dsw-alias-bg-layer-1));border-radius:99px}',
  '[data-provider-usage-panel] .pu-bar::-webkit-progress-value{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 42%,var(--dsw-alias-label-secondary));border-radius:99px}',
  '[data-provider-usage-panel] .pu-bar::-moz-progress-bar{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 42%,var(--dsw-alias-label-secondary));border-radius:99px}',
  '[data-provider-usage-panel] .pu-bar.pu-warn{accent-color:color-mix(in srgb,#c47b08 48%,var(--dsw-alias-label-secondary))}',
  '[data-provider-usage-panel] .pu-bar.pu-warn::-webkit-progress-value,[data-provider-usage-panel] .pu-bar.pu-warn::-moz-progress-bar{background:color-mix(in srgb,#c47b08 48%,var(--dsw-alias-label-secondary))}',
  '[data-provider-usage-panel] .pu-bar.pu-low{accent-color:color-mix(in srgb,#d94848 48%,var(--dsw-alias-label-secondary))}',
  '[data-provider-usage-panel] .pu-bar.pu-low::-webkit-progress-value,[data-provider-usage-panel] .pu-bar.pu-low::-moz-progress-bar{background:color-mix(in srgb,#d94848 48%,var(--dsw-alias-label-secondary))}',
  '[data-provider-usage-panel] .pu-tip-reset{color:var(--dsw-alias-label-tertiary);font-size:11px}',
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
  '@media (max-width:640px){[data-provider-usage-panel] .pu-name{font-size:11px;line-height:13px}}',
].join('\n')

function localReset(value: string | undefined): string | undefined {
  if (value === undefined) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return undefined
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function headlineOf(summary: ProviderUsageSummary): string {
  const hasData = summary.status === 'ready' || summary.status === 'stale'
  const primary = hasData ? pickPrimaryWindow(summary.windows) : undefined
  if (primary === undefined) return summary.status === 'ready' ? '—' : STATUS_TEXT[summary.status]
  return windowValueText(primary)
}

/** One compact two-column mini. Tap/click opens the detail card. */
function RefreshIcon(): ReactNode {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16.2 7A6.5 6.5 0 1 0 16 13.5" /><path d="M16.2 3.8V7H13" /></svg>
}

function ProviderRow(props: { summary: ProviderUsageSummary, onSelect: () => void, onRefresh: () => void }): ReactNode {
  const summary = props.summary
  const hasData = summary.status === 'ready' || summary.status === 'stale'
  const primary = hasData ? pickPrimaryWindow(summary.windows) : undefined
  const headline = headlineOf(summary)
  const tone = usageTone(primary?.remainingPercent)
  return (
    <div className="pu-cell">
      <div
        role="button"
        tabIndex={0}
        className={'pu-row' + (tone === undefined ? '' : ' pu-' + tone)}
        aria-label={summary.name + ' ' + (primary === undefined ? STATUS_TEXT[summary.status] : headline)}
        onClick={props.onSelect}
        onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); props.onSelect() } }}
      >
        <span className="pu-mark"><ProviderMark providerKey={summary.providerKey} /></span>
        <span className="pu-copy">
          <span className="pu-name">{summary.name}{summary.status === 'stale' ? ' · 已过期' : ''}</span>
          <span className={'pu-primary' + (primary === undefined ? ' pu-empty-text' : '')}>{headline}</span>
        </span>
      </div>
      <button
        type="button"
        className={'pu-icon-btn pu-row-refresh' + (summary.refreshing === true ? ' pu-spinning' : '')}
        aria-label={'刷新 ' + summary.name}
        onClick={props.onRefresh}
      >
        {summary.refreshing === true ? <span className="pu-mini-spin" /> : <RefreshIcon />}
      </button>
    </div>
  )
}

function UsageDetail(props: { summary: ProviderUsageSummary, onBack: () => void, onRefresh: () => void }): ReactNode {
  const summary = props.summary
  return (
    <div className="pu-detail" aria-label={summary.name + ' 额度详情'}>
      <div className="pu-detail-head">
        <button type="button" className="pu-icon-btn" aria-label="返回全部 Provider" onClick={props.onBack}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5 7 10l5.5 5.5" /></svg>
        </button>
        <span className="pu-mark"><ProviderMark providerKey={summary.providerKey} /></span>
        <span className="pu-detail-name">{summary.name}</span>
        <button
          type="button"
          className={'pu-icon-btn' + (summary.refreshing === true ? ' pu-spinning' : '')}
          aria-label={'刷新 ' + summary.name}
          onClick={props.onRefresh}
        >
          {summary.refreshing === true ? <span className="pu-mini-spin" /> : <RefreshIcon />}
        </button>
      </div>
      <div className="pu-detail-sub">剩余额度</div>
      {summary.windows.length === 0
        ? <div className="pu-tip-empty">{STATUS_TEXT[summary.status]}</div>
        : summary.windows.map(quotaWindow => {
          const reset = localReset(quotaWindow.resetsAt)
          const tone = usageTone(quotaWindow.remainingPercent)
          const remaining = quotaWindow.remainingPercent
          return (
            <div key={quotaWindow.id} className="pu-win">
              <div className="pu-win-top">
                <span className="pu-tip-label">{quotaWindow.label}</span>
                <span className={'pu-tip-value' + (tone === undefined ? '' : ' pu-' + tone)}>{windowValueText(quotaWindow)}</span>
              </div>
              {remaining === undefined ? null : <progress className={'pu-bar' + (tone === undefined ? '' : ' pu-' + tone)} max={100} value={remaining} />}
              {reset === undefined ? null : <div className="pu-tip-reset">重置 {reset}</div>}
            </div>
          )
        })}
    </div>
  )
}

/** Controlled sidebar Provider Usage panel (two-column minis, tap for details). */
export function ProviderUsagePanel(props: ProviderUsagePanelProps): ReactNode {
  const hidden = new Set(props.hiddenKeys ?? [])
  const visible = props.providers.filter(summary => !hidden.has(summary.providerKey))
  const [filterOpen, setFilterOpen] = useState(false)
  const [detailKey, setDetailKey] = useState<string | undefined>()
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement | null>(null)
  const detail = visible.find(summary => summary.providerKey === detailKey)

  useEffect(() => {
    if (filterOpen) searchRef.current?.focus()
    else setQuery('')
  }, [filterOpen])

  useEffect(() => {
    if (detailKey === undefined) return
    const onKey = (event: KeyboardEvent): void => { if (event.key === 'Escape') setDetailKey(undefined) }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey) }
  }, [detailKey])

  const normalizedQuery = query.trim().toLowerCase()
  const matches = normalizedQuery === ''
    ? props.providers
    : props.providers.filter(summary => summary.name.toLowerCase().includes(normalizedQuery))
  const allVisible = props.providers.length > 0 && visible.length === props.providers.length

  let body: ReactNode
  if (visible.length === 0) {
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
          <ProviderRow
            key={summary.providerKey}
            summary={summary}
            onSelect={() => { setFilterOpen(false); setDetailKey(summary.providerKey) }}
            onRefresh={() => { props.onRefresh(summary.providerKey) }}
          />
        ))}
      </div>
    )
  }

  return (
    <section data-provider-usage-panel aria-label="Provider Usage">
      <style>{panelCss}</style>
      <div className="pu-head">
        <span className="pu-title">Provider Usage</span>
        <span className="pu-actions">
          <button
            type="button"
            className="pu-icon-btn"
            aria-label="选择侧栏显示的 Provider"
            aria-expanded={filterOpen}
            onClick={() => { setFilterOpen(open => !open) }}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h8M15 5h2M9 10h8M3 10h2M3 15h6M13 15h4" /><circle cx="13" cy="5" r="2" /><circle cx="7" cy="10" r="2" /><circle cx="11" cy="15" r="2" /></svg>
          </button>
          <button
            type="button"
            className={'pu-icon-btn' + (props.refreshing === true ? ' pu-spinning' : '')}
            aria-label="刷新用量"
            onClick={() => { props.onRefresh() }}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16.2 7A6.5 6.5 0 1 0 16 13.5" /><path d="M16.2 3.8V7H13" /></svg>
          </button>
        </span>
      </div>
      <div className={'pu-stage' + (detail === undefined ? '' : ' pu-stage-open')}>{detail === undefined ? body : <UsageDetail summary={detail} onBack={() => { setDetailKey(undefined) }} onRefresh={() => { props.onRefresh(detail.providerKey) }} />}</div>
      {filterOpen
        ? (
          <section
            className="pu-popover"
            role="dialog"
            aria-label="侧栏显示"
            onKeyDown={event => { if (event.key === 'Escape') { setFilterOpen(false); setDetailKey(undefined) } }}
          >
            <div className="pu-popover-head">
              <div>
                <div className="pu-popover-title">侧栏显示</div>
                <div className="pu-popover-sub">只影响 Provider Usage，不影响模型列表</div>
              </div>
              <button type="button" className="pu-icon-btn pu-popover-close" aria-label="关闭筛选" onClick={() => { setFilterOpen(false) }}>×</button>
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
              <button
                type="button"
                className="pu-filter-item pu-filter-all"
                disabled={allVisible}
                onClick={props.onShowAll}
              >
                {'显示全部 ' + String(props.providers.length) + ' 个'}
              </button>
              {matches.length === 0 ? <p className="pu-no-match">没有匹配的 Provider</p> : query.trim() === '' && props.onReorder !== undefined && matches.length > 1
                ? (
                  <SortableList
                    items={[...matches]}
                    getId={summary => summary.providerKey}
                    dragLabel={summary => '调整顺序: ' + summary.name}
                    onReorder={next => { props.onReorder?.(next.map(summary => summary.providerKey)) }}
                    renderItem={summary => (
                      <FilterRow summary={summary} hidden={hidden.has(summary.providerKey)} onToggle={visible => { props.onToggleVisibility(summary.providerKey, visible) }} />
                    )}
                  />
                )
                : matches.map(summary => (
                  <FilterRow key={summary.providerKey} summary={summary} hidden={hidden.has(summary.providerKey)} onToggle={visible => { props.onToggleVisibility(summary.providerKey, visible) }} />
                ))}
            </div>
          </section>
        )
        : null}
    </section>
  )
}
