/** Settings > LLM Providers page shell. Provider cards arrive through settings.provider.item. */

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type {
  PropsLocale,
  PropsRenderSlots,
  PropsRuntime,
} from '@deepseek-ai/dsh-client-ui-slots'
import type { SettingsSectionOwnerProps } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { ProviderSectionLocaleKey } from './provider-section.js'
import { applySavedOrder, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS } from '../order.js'
import { formatResetLabel, pickPrimaryWindow, type ProviderUsageSummary } from './usage.js'
import { ProviderQuotaMeter } from './provider-ui.js'
import { ProviderMark } from './provider-marks.js'
import { SortableList } from './SortableList.js'
import type { ProviderHeaderOwnership, ProviderRole } from './directory.js'
import { providerUiCss, ProviderRoleBadge } from './provider-ui.js'
import { settingsCCss } from './settings-c-css.js'

/** Props composed by the official settings.section and child-slot contracts. */
type ProvidersSectionSlotProps =
  PropsRuntime<'settings.section'>
  & PropsRenderSlots<typeof PROVIDERS_ITEM_SLOT>
  & PropsLocale<typeof PROVIDERS_LOCALE_NS>

type ProviderRenderSlot = ProvidersSectionSlotProps['renderSlot']
type ProviderTranslate = ProvidersSectionSlotProps['t'] & ((key: ProviderSectionLocaleKey) => string)

/** Direct-render props retained for focused component tests and previews. */
export interface ProvidersSectionProps {
  renderSlot?: ProviderRenderSlot
  t?: ProviderTranslate
  /** Live keyed contributions. */
  registeredKeys?: readonly string[]
  /** Saved order from llm-providers settings. */
  savedOrder?: readonly string[]
  /** Persist a new card order. */
  onReorder?: (keys: string[]) => void
  /** Disable sorting while settings are not writable. */
  disabled?: boolean
  /** Shell close affordance from the official settings.section owner props. */
  close?: SettingsSectionOwnerProps['close']
  /** Resolve the shell-owned badge for a Provider card. */
  roleOf?: (key: string) => ProviderRole
  /** Resolve who renders a Provider header. Shared cards own their badge; legacy cards keep the shell fallback. */
  headerOf?: (key: string) => ProviderHeaderOwnership
  showSidebarUsage?: boolean
  onShowSidebarUsage?: (show: boolean) => void
  usageSummaries?: readonly ProviderUsageSummary[]
  accountOf?: (key: string) => { state: 'connected' | 'configured' | 'unconnected' } | undefined
  onRefresh?: (key: string) => void
}

// ponytail: the native dialog lives inside the sidebar; remove ancestry overrides once the host portals settings.
const providerShellCss = `
div:has([role="dialog"] [data-providers-section]){opacity:1!important;visibility:visible!important;z-index:1000!important;pointer-events:auto!important}
@media(max-width:680px){
 [role="dialog"]:has([data-providers-section]){flex-direction:column;width:calc(100% - 16px);max-width:calc(100% - 16px);height:calc(100dvh - 16px);max-height:calc(100dvh - 16px)}
 [role="dialog"]:has([data-providers-section])>nav{width:100%;min-width:0;flex:none;padding:8px;border-right:0;border-bottom:1px solid var(--dsw-alias-border-l2)}
 [role="dialog"]:has([data-providers-section])>nav>div:last-child{display:flex;flex-direction:row;gap:4px;overflow-x:auto}
 [role="dialog"]:has([data-providers-section])>nav button{flex:none;white-space:nowrap;min-height:44px;padding:8px 10px}
 [role="dialog"]:has([data-providers-section])>div{width:100%;min-width:0;min-height:0;flex:1}
}
`

const fallbackWrapStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }
const fallbackBadgeAlign: CSSProperties = { alignSelf: 'flex-start' }

const API_KEY_AUTH = /(?:ollama|opencode-go|commandcode)$/u

function linkState(key: string, account: { state: 'connected' | 'configured' | 'unconnected' } | undefined, summary: ProviderUsageSummary | undefined): 'connected' | 'configured' | 'unconnected' {
  if (account !== undefined) return account.state
  if (summary === undefined || summary.status === 'logged-out') return 'unconnected'
  return API_KEY_AUTH.test(key) ? 'configured' : 'connected'
}

function countModels(root: ParentNode): number | undefined {
  const rows = root.querySelectorAll('[data-provider-model]').length
  if (rows > 0) return rows
  const text = [...root.querySelectorAll('[data-provider-header-summary]')].map(node => node.textContent ?? '').join(' ')
  const match = /(\d+)\s*(?:models?|个模型)/iu.exec(text)
  return match === null ? undefined : Number(match[1])
}

function IconSort(): ReactNode {
  return <svg className="c-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 2v12m-3-3 3 3 3-3M11 14V2m-3 3 3-3 3 3" /></svg>
}
function IconCheck(): ReactNode {
  return <svg className="c-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8l3 3 7-7" /></svg>
}
function IconBack(): ReactNode {
  return <svg className="c-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg>
}
function IconRefresh(): ReactNode {
  return <svg className="c-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 6a5.2 5.2 0 1 0 .1 4M13 2v4H9" /></svg>
}

function paintAccount(section: HTMLElement, t: (key: ProviderSectionLocaleKey) => string, linked: 'connected' | 'configured' | 'unconnected'): void {
  section.classList.add('c-account')
  if (section.previousElementSibling?.getAttribute('data-c-account-head') !== '') {
    const head = document.createElement('div')
    head.className = 'c-account-head'
    head.setAttribute('data-c-account-head', '')
    head.textContent = t('accountHeading')
    section.parentElement?.insertBefore(head, section)
  }
  if (section.querySelector('[data-c-account-name]') !== null) return
  const paragraph = section.querySelector('p')
  const raw = (paragraph?.textContent ?? section.getAttribute('aria-label') ?? '').trim()
  const match = /Signed in as\s+(.+)/iu.exec(raw) ?? /以\s*(.+?)\s*身份登录/u.exec(raw) ?? (/@/.test(raw) ? [raw, raw] as const : null)
  const email = match?.[1]?.trim()
  if (paragraph === null || email === undefined || email.length === 0) return
  const name = document.createElement('div')
  name.className = 'c-account-name'
  name.setAttribute('data-c-account-name', '')
  const dot = document.createElement('span')
  dot.className = 'c-dot good'
  name.append(dot, document.createTextNode(email))
  const meta = document.createElement('div')
  meta.className = 'c-account-meta'
  meta.textContent = linked === 'configured' ? t('accountApiMeta') : t('accountOauthMeta')
  const copy = document.createElement('div')
  copy.className = 'c-account-copy'
  copy.append(name, meta)
  paragraph.replaceWith(copy)
}

/** Bind the shared page to live keyed-slot and settings snapshots. */
export function bindProvidersSection(
  listRegisteredKeys: () => readonly string[],
  subscribe: (listener: () => void) => () => void,
  readPage: () => { keys: readonly string[], disabled: boolean, showSidebarUsage: boolean },
  onReorder: (keys: string[]) => void,
  roleOf: (key: string) => ProviderRole,
  onShowSidebarUsage: (show: boolean) => void,
  headerOf?: (key: string) => ProviderHeaderOwnership,
  readUsage?: () => readonly ProviderUsageSummary[],
  subscribeUsage?: (listener: () => void) => () => void,
  accountOf?: (key: string) => { state: 'connected' | 'configured' | 'unconnected' } | undefined,
  onRefresh?: (key: string) => void,
): (props: ProvidersSectionSlotProps) => ReactNode {
  return function BoundProvidersSection(props: ProvidersSectionSlotProps): ReactNode {
    const [, bump] = useState(0)
    useEffect(() => subscribe(() => { bump(value => value + 1) }), [subscribe])
    const order = readPage()
    const usageSummaries = useSyncExternalStore(subscribeUsage ?? (() => () => undefined), readUsage ?? (() => []), readUsage ?? (() => []))
    return (
      <ProvidersSection
        renderSlot={props.renderSlot}
        t={props.t}
        registeredKeys={listRegisteredKeys()}
        savedOrder={order.keys}
        disabled={order.disabled}
        onReorder={onReorder}
        roleOf={roleOf}
        showSidebarUsage={order.showSidebarUsage}
        onShowSidebarUsage={onShowSidebarUsage}
        usageSummaries={usageSummaries}
        {...(headerOf === undefined ? {} : { headerOf })}
        {...(accountOf === undefined ? {} : { accountOf })}
        {...(onRefresh === undefined ? {} : { onRefresh })}
      />
    )
  }
}

/**
 * Settings C: compact quota ledger on overview; the plugin item slot mounts
 * only in the independent detail view. Sorting reorders ledger rows in place.
 */
export function ProvidersSection(props: ProvidersSectionProps): ReactNode {
  const t = props.t ?? ((key: ProviderSectionLocaleKey) => key)
  const keys = applySavedOrder(props.registeredKeys ?? [], props.savedOrder ?? [])
  const [sorting, setSorting] = useState(false)
  const [filter, setFilter] = useState<'all' | 'llm' | 'agent'>('all')
  const [detail, setDetail] = useState<string | undefined>(undefined)
  const [modelCounts, setModelCounts] = useState<Readonly<Record<string, number>>>({})
  useLayoutEffect(() => {
    if (detail === undefined) return
    const root = document.querySelector('[data-providers-section] .c-full')
    if (!(root instanceof HTMLElement)) return
    const paint = (): void => {
      const header = root.querySelector('[data-provider-card-header]')
      if (header instanceof HTMLElement && header.getAttribute('aria-expanded') !== 'true') header.click()
      if (root.querySelector('[data-provider-model]') === null) {
        const catalog = root.querySelector('section[aria-label*="model" i] button[aria-expanded="false"], section[aria-label*="模型"] button[aria-expanded="false"]')
        if (catalog instanceof HTMLElement) catalog.click()
      }
      root.querySelectorAll('section[aria-label]').forEach(section => {
        if (!(section instanceof HTMLElement)) return
        const label = section.getAttribute('aria-label') ?? ''
        if (/usage|用量/i.test(label)) {
          section.hidden = true
          return
        }
        if (/model|模型|catalog/i.test(label)) return
        paintAccount(section, t, linkState(detail, props.accountOf?.(detail), props.usageSummaries?.find(entry => entry.providerKey === detail)))
      })
      if (root.querySelector('[data-provider-body]')) root.setAttribute('data-ready', '')
    }
    paint()
    const observer = new MutationObserver(paint)
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [detail])
  useLayoutEffect(() => {
    const next: Record<string, number> = {}
    document.querySelectorAll('[data-model-probe]').forEach(node => {
      if (!(node instanceof HTMLElement) || node.dataset.modelProbe === undefined) return
      const count = countModels(node)
      if (count !== undefined) next[node.dataset.modelProbe] = count
    })
    const full = document.querySelector('[data-providers-section] .c-full')
    if (full instanceof HTMLElement && detail !== undefined) {
      const count = countModels(full)
      if (count !== undefined) next[detail] = count
    }
    setModelCounts(prev => {
      let changed = false
      const merged = { ...prev }
      for (const [key, count] of Object.entries(next)) {
        if (merged[key] !== count) {
          merged[key] = count
          changed = true
        }
      }
      return changed ? merged : prev
    })
  })
  const showToggle = keys.length > 1 && props.disabled !== true && detail === undefined
  const sortable = sorting && showToggle
  const orderBeforeSort = useRef<readonly string[] | undefined>(undefined)
  useEffect(() => {
    if (!sorting) {
      orderBeforeSort.current = undefined
      return
    }
    if (orderBeforeSort.current === undefined) orderBeforeSort.current = keys
    const onKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      const previous = orderBeforeSort.current
      setSorting(false)
      if (previous !== undefined) props.onReorder?.([...previous])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sorting, keys, props])
  const visibleKeys = keys.filter(key => filter === 'all' || (props.roleOf?.(key) ?? 'llm') === filter)
  const items = (detail === undefined ? visibleKeys : keys.filter(key => key === detail)).map(key => ({ key }))
  const renderCard = (item: { key: string }): ReactNode => {
    const node = props.renderSlot?.(PROVIDERS_ITEM_SLOT, {}, { entryKey: item.key })
    if (node == null) return null
    const role = props.roleOf?.(item.key) ?? 'llm'
    const card = props.headerOf?.(item.key) === 'shared'
      ? <div data-provider-slot="" data-provider-role={role}>{node}</div>
      : (
        <div data-provider-slot="" data-provider-role={role} style={fallbackWrapStyle}>
          <span style={fallbackBadgeAlign}><ProviderRoleBadge {...(role === 'llm' ? {} : { role })} /></span>
          {node}
        </div>
      )
    const summary = props.usageSummaries?.find(entry => entry.providerKey === item.key)
      ?? props.usageSummaries?.find(entry => item.key.endsWith(entry.providerKey) || entry.providerKey.endsWith(item.key))
    const account = props.accountOf?.(item.key)
    const linked = linkState(item.key, account, summary)
    const models = modelCounts[item.key]
    const copy = { at: t('resetAt'), overdue: t('resetOverdue'), missing: t('resetMissing') }
    const identity = (
      <div className="c-identity">
        <span className="c-brand"><ProviderMark providerKey={item.key} /></span>
        <div>
          <div className="c-name-line">
            <span className="c-name">{summary?.name ?? item.key}</span>
            <ProviderRoleBadge {...(role === 'llm' ? {} : { role })} />
          </div>
          <div className="c-sub">
            <span className={'c-dot' + (linked === 'unconnected' ? '' : ' good')} />
            {t(linked)}
            {models === undefined ? null : <><span aria-hidden="true">·</span>{t('modelCount').replace('{n}', String(models))}</>}
          </div>
        </div>
      </div>
    )
    if (detail !== undefined) {
      const windows = summary?.windows ?? []
      return (
        <article className="c-full">
          <div className="c-detail-title">{identity}</div>
          <section data-c-quota="">
            <div className="c-quota-head">
              <h3>{t('quotaHeading')}</h3>
              <button type="button" className="c-btn quiet" disabled={props.disabled === true || summary?.refreshing === true} onClick={() => { props.onRefresh?.(item.key) }}>{summary?.refreshing === true ? t('refreshing') : <><IconRefresh /> {t('refresh')}</>}</button>
            </div>
            <div className="c-quota-list">
              {windows.length === 0
                ? <div className="c-missing">{summary?.status === 'unsupported' ? t('unsupportedQuota') : summary?.status === 'error' ? t('errorQuota') : summary?.status === 'loading' ? t('loadingQuota') : t('connectToSee')}</div>
                : windows.map(quotaWindow => {
                  const reset = formatResetLabel(quotaWindow.resetsAt, quotaWindow.label, copy)
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
            <div className="c-quota-meta">
              <span>{t('quotaMeta')}</span>
              <span>{t('systemZone')} · {Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
            </div>
          </section>
          <div className="c-plugin">{card}</div>
        </article>
      )
    }
    const primary = summary === undefined ? undefined : pickPrimaryWindow(summary.windows)
    const missing = primary !== undefined
      ? undefined
      : summary === undefined || summary.status === 'logged-out'
        ? t('connectToSee')
        : summary.status === 'unsupported'
          ? t('unsupportedQuota')
          : summary.status === 'loading'
            ? t('loadingQuota')
            : summary.status === 'error'
              ? t('errorQuota')
              : t('connectToSee')
    const reset = primary === undefined ? undefined : formatResetLabel(primary.resetsAt, primary.label, copy)
    return (
      <div className="c-row-grid" data-provider-row={item.key} data-provider-role={role}>
        <div className="c-probe" data-model-probe={item.key} aria-hidden="true">{card}</div>
        <div className="c-cell">{identity}</div>
        <div className="c-mini">
          {missing === undefined && primary !== undefined
            ? <ProviderQuotaMeter
                label={primary.shortLabel || primary.label}
                {...(primary.remainingPercent === undefined ? {} : { remainingPercent: primary.remainingPercent })}
                emptyLabel={primary.valueText}
                {...(reset === undefined ? {} : { detail: reset })}
              />
            : <div className="c-missing">{missing}</div>}
        </div>
        <button type="button" className="c-btn" data-action="open-provider" onClick={() => { setDetail(item.key) }}>{t('details')}</button>
      </div>
    )
  }
  const linkedCount = keys.filter(key => {
    const account = props.accountOf?.(key)
    const summary = props.usageSummaries?.find(entry => entry.providerKey === key)
      ?? props.usageSummaries?.find(entry => key.endsWith(entry.providerKey) || entry.providerKey.endsWith(key))
    return linkState(key, account, summary) !== 'unconnected'
  }).length
  const body = keys.length === 0
    ? <p className="c-empty">{t('empty')}</p>
    : (
      <div className="c-ledger" data-providers-list="">
        {detail === undefined ? <div className="c-labels"><span>{t('colProvider')}</span><span>{t('colQuota')}</span><span>{t('colConfig')}</span></div> : null}
        <SortableList
          chrome="plain"
          items={items}
          getId={item => item.key}
          dragLabel={item => t('drag') + ': ' + item.key}
          sorting={sortable}
          {...(props.disabled === undefined ? {} : { disabled: props.disabled })}
          onReorder={next => { props.onReorder?.(next.map(item => item.key)) }}
          renderItem={item => renderCard(item)}
        />
      </div>
    )

  return (
    <div data-providers-section={PROVIDERS_LOCALE_NS} {...(sortable ? { 'data-sorting': '' } : {})}>
      <style>{providerUiCss + providerShellCss + settingsCCss}</style>
      {detail === undefined
        ? (
          <>
            <header className="c-page-title">
              <div>
                <h2>{t('title')}</h2>
                <p>{t('subtitle')}</p>
              </div>
              {showToggle
                ? <button type="button" className="c-btn c-sort" aria-expanded={sorting} onClick={() => { setSorting(value => !value) }}>{sorting ? <><IconCheck /> {t('done')}</> : <><IconSort /> {t('sort')}</>}</button>
                : null}
            </header>
            <div className="c-note">
              <span className="c-number">{linkedCount}</span>
              <div className="c-copy">
                <strong>{t('connectedCount')}</strong>
                <p>{t('connectedHint')}</p>
              </div>
              <label className="c-switch">
                <span>{t('sidebarToggle')}</span>
                <input
                  type="checkbox"
                  role="switch"
                  aria-label={t('sidebarToggle')}
                  aria-describedby="sidebar-usage-hint"
                  checked={props.showSidebarUsage !== false}
                  disabled={props.disabled === true}
                  onChange={event => { props.onShowSidebarUsage?.(event.target.checked) }}
                />
              </label>
              <span id="sidebar-usage-hint" className="sr-only">{t('sidebarToggleHint')}</span>
            </div>
            <div className="c-filters">
              <div className="c-row">
                {(['all', 'llm', 'agent'] as const).map(id => (
                  <button key={id} type="button" className={'c-btn' + (filter === id ? '' : ' quiet')} aria-pressed={filter === id} onClick={() => { setFilter(id) }}>
                    {t(id === 'all' ? 'filterAll' : id === 'llm' ? 'filterLlm' : 'filterAgent')}
                  </button>
                ))}
              </div>
              <span className="c-zone">{t('systemZone')} · {Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
            </div>
          </>
        )
        : (
          <div className="c-crumb">
            <button type="button" onClick={() => { setDetail(undefined) }}><IconBack /> {t('breadcrumbOverview')}</button>
            <span>/</span>
            <span>{props.usageSummaries?.find(entry => entry.providerKey === detail)?.name ?? detail}</span>
          </div>
        )}
      {body}
    </div>
  )
}