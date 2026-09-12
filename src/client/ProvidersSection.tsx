/** Settings > LLM Providers page shell. Provider cards arrive through settings.provider.item. */

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type {
  PropsLocale,
  PropsRenderSlots,
  PropsRuntime,
} from '@deepseek-ai/dsh-client-ui-slots'
import type { SettingsSectionOwnerProps } from '@deepseek-ai/dsh-client-ui-settings/client'
import { windowNameOf } from './provider-section.js'
import type { ProviderSectionLocaleKey } from './provider-section.js'
import { applySavedOrder, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS } from '../order.js'
import { formatResetLabel, pickPrimaryWindow, type ProviderUsageSummary } from './usage.js'
import { ProviderQuotaMeter } from './provider-ui.js'
import { ProviderMark } from './provider-marks.js'
import { SortableList } from './SortableList.js'
import type { ProviderDetailOwnership, ProviderHeaderOwnership, ProviderRole } from './directory.js'
import { providerUiCss, ProviderRoleBadge } from './provider-ui.js'
import { settingsCCss } from './settings-c-css.js'
import { ProviderDetail, providerDetailCopy } from './provider-detail.js'

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
  /** Resolve who renders the expanded detail. Shared cards render it themselves. */
  detailOf?: (key: string) => ProviderDetailOwnership
  /** Resolve the provider display name the plugin published. */
  nameOf?: (key: string) => string | undefined
  /** Resolve the active model count the plugin published. */
  modelCountOf?: (key: string) => number | undefined
  showSidebarUsage?: boolean
  onShowSidebarUsage?: (show: boolean) => void
  usageSummaries?: readonly ProviderUsageSummary[]
  accountOf?: (key: string) => { state: 'connected' | 'configured' | 'unconnected' } | undefined
  onRefresh?: (key?: string) => void
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

/**
 * Overview meter label: the provider's full window name, with bare abbreviations
 * replaced by the shared localized wording so every provider reads the same.
 * @param window - primary usage window.
 * @param t - section locale binding.
 * @returns the display name for the overview row.
 */
function windowName(window: { readonly label: string, readonly shortLabel?: string }, t: (key: ProviderSectionLocaleKey) => string): string {
  return windowNameOf(window.label, { hour: t('windowHour'), week: t('windowWeek'), month: t('windowMonth') })
}

function linkState(key: string, account: { state: 'connected' | 'configured' | 'unconnected' } | undefined, summary: ProviderUsageSummary | undefined): 'connected' | 'configured' | 'unconnected' {
  if (account !== undefined) return account.state
  if (summary === undefined || summary.status === 'logged-out') return 'unconnected'
  return API_KEY_AUTH.test(key) ? 'configured' : 'connected'
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
  onRefresh?: (key?: string) => void,
  detailOf?: (key: string) => ProviderDetailOwnership,
  nameOf?: (key: string) => string | undefined,
  modelCountOf?: (key: string) => number | undefined,
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
        {...(detailOf === undefined ? {} : { detailOf })}
        {...(nameOf === undefined ? {} : { nameOf })}
        {...(modelCountOf === undefined ? {} : { modelCountOf })}
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
  // Settings policy: the overview paints from cache, then refreshes once when the page opens.
  const refreshRef = useRef(props.onRefresh)
  refreshRef.current = props.onRefresh
  useEffect(() => { refreshRef.current?.() }, [])
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
    const role = props.roleOf?.(item.key) ?? 'llm'
    const summary = props.usageSummaries?.find(entry => entry.providerKey === item.key)
      ?? props.usageSummaries?.find(entry => item.key.endsWith(entry.providerKey) || entry.providerKey.endsWith(item.key))
    const account = props.accountOf?.(item.key)
    const migrated = detail !== undefined && (props.detailOf?.(item.key) ?? 'legacy') === 'shared'
    // Migrated cards read this context and render the shared template; older cards ignore it.
    const node = props.renderSlot?.(PROVIDERS_ITEM_SLOT, {
      mode: detail === undefined ? 'overview' : 'detail',
      // The page owns the active locale and the shared template: cards render it
      // instead of bundling their own copy.
      copy: props.t?.('details') === providerDetailCopy.zh.details ? providerDetailCopy.zh : providerDetailCopy.en,
      template: ProviderDetail,
      ...(summary === undefined
        ? {}
        : { usage: { status: summary.status, windows: summary.windows, ...(summary.fetchedAt === undefined ? {} : { fetchedAt: summary.fetchedAt }) } }),
      ...(account === undefined ? {} : { accountState: account.state }),
      ...(detail === undefined || props.onRefresh === undefined
        ? {}
        : { onRefresh: () => { props.onRefresh?.(item.key) } }),
    }, { entryKey: item.key })
    if (node == null) return null
    const card = props.headerOf?.(item.key) === 'shared'
      ? <div data-provider-slot="" data-provider-role={role}>{node}</div>
      : (
        <div data-provider-slot="" data-provider-role={role} style={fallbackWrapStyle}>
          <span style={fallbackBadgeAlign}><ProviderRoleBadge {...(role === 'llm' ? {} : { role })} /></span>
          {node}
        </div>
      )
    const linked = linkState(item.key, account, summary)
    // Prefer the count the plugin publishes; the hidden probe is the legacy fallback.
    const models = props.modelCountOf?.(item.key)
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
      if (migrated) {
        // The migrated card renders the prototype layout itself; the page adds the breadcrumb only.
        return card
      }
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
          <div className="c-cell">{identity}</div>
        <div className="c-mini">
          {missing === undefined && primary !== undefined
            ? <ProviderQuotaMeter
                label={windowName(primary, t)}
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
            <span>{props.usageSummaries?.find(entry => entry.providerKey === detail)?.name ?? props.nameOf?.(detail) ?? detail}</span>
          </div>
        )}
      {body}
    </div>
  )
}