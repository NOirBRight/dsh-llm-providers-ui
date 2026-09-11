/** Settings > LLM Providers page shell. Provider cards arrive through settings.provider.item. */

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type {
  PropsLocale,
  PropsRenderSlots,
  PropsRuntime,
} from '@deepseek-ai/dsh-client-ui-slots'
import type { SettingsSectionOwnerProps } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { ProviderSectionLocaleKey } from './provider-section.js'
import { applySavedOrder, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS } from '../order.js'
import { pickPrimaryWindow, type ProviderUsageSummary } from './usage.js'
import { ProviderQuotaMeter } from './provider-ui.js'
import { ProviderMark } from './provider-marks.js'
import { SortableList } from './SortableList.js'
import type { ProviderHeaderOwnership, ProviderRole } from './directory.js'
import { providerUiCss, ProviderRoleBadge } from './provider-ui.js'

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
  accountOf?: (key: string) => { connected: boolean } | undefined
}

const pageStyle: CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 16, width: '100%',
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

const titleStyle: CSSProperties = {
  margin: 0, color: 'var(--dsw-alias-label-primary)', fontSize: 16, fontWeight: 500, lineHeight: '24px',
}
const toolbarStyle: CSSProperties = { display: 'flex', justifyContent: 'flex-end' }
const sortButtonStyle: CSSProperties = {
  minHeight: 34, border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 18,
  padding: '6px 14px', background: 'var(--dsw-alias-bg-layer-1)',
  color: 'var(--dsw-alias-label-primary)', fontSize: 13, lineHeight: '20px', cursor: 'pointer',
}
const emptyStyle: CSSProperties = { color: 'var(--dsw-alias-label-tertiary)', fontSize: 13, lineHeight: '20px' }
const fallbackWrapStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }
const fallbackBadgeAlign: CSSProperties = { alignSelf: 'flex-start' }

/** Bind the shared page to live keyed-slot and settings snapshots. */
export function bindProvidersSection(
  listRegisteredKeys: () => readonly string[],
  subscribe: (listener: () => void) => () => void,
  readOrder: () => { keys: readonly string[], disabled: boolean, showSidebarUsage: boolean },
  onReorder: (keys: string[]) => void,
  roleOf: (key: string) => ProviderRole,
  onShowSidebarUsage: (show: boolean) => void,
  headerOf?: (key: string) => ProviderHeaderOwnership,
  readUsage?: () => readonly ProviderUsageSummary[],
  subscribeUsage?: (listener: () => void) => () => void,
  accountOf?: (key: string) => { connected: boolean } | undefined,
): (props: ProvidersSectionSlotProps) => ReactNode {
  return function BoundProvidersSection(props: ProvidersSectionSlotProps): ReactNode {
    const [, bump] = useState(0)
    useEffect(() => subscribe(() => { bump(value => value + 1) }), [subscribe])
    const order = readOrder()
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
      />
    )
  }
}

/**
 * Render installed provider cards as a plain divider list. Sorting is an
 * explicit mode: one SortableList stays mounted in both modes with the same
 * keyed rows, so live slot state (authentication, drafts) survives the mode
 * toggle and every reorder.
 */
export function ProvidersSection(props: ProvidersSectionProps): ReactNode {
  const t = props.t ?? ((key: ProviderSectionLocaleKey) => key)
  const keys = applySavedOrder(props.registeredKeys ?? [], props.savedOrder ?? [])
  const [sorting, setSorting] = useState(false)
  const [filter, setFilter] = useState<'all' | 'llm' | 'agent'>('all')
  const [detail, setDetail] = useState<string | undefined>(undefined)
  const showToggle = keys.length > 1 && props.disabled !== true && detail === undefined
  const sortable = sorting && showToggle
  const orderBeforeSort = useRef<readonly string[] | undefined>(undefined)
  useEffect(() => {
    if (!sorting) return
    orderBeforeSort.current = keys
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
    if (detail !== undefined) {
      const windows = props.usageSummaries?.find(summary => summary.providerKey === item.key)?.windows ?? []
      return (
        <div>
          {windows.map(quotaWindow => (
            <ProviderQuotaMeter
              key={quotaWindow.id}
              label={quotaWindow.label}
              {...(quotaWindow.remainingPercent === undefined ? {} : { remainingPercent: quotaWindow.remainingPercent })}
              emptyLabel={quotaWindow.valueText}
            />
          ))}
          {card}
        </div>
      )
    }
    const summary = props.usageSummaries?.find(entry => entry.providerKey === item.key)
    const primary = summary === undefined ? undefined : pickPrimaryWindow(summary.windows)
    const account = props.accountOf?.(item.key)
    return (
      <div data-provider-row={item.key} data-provider-role={role} style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 44 }}>
        <span style={{ width: 20, height: 20, flex: 'none' }}><ProviderMark providerKey={item.key} /></span>
        <ProviderRoleBadge {...(role === 'llm' ? {} : { role })} />
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{summary?.name ?? item.key}</span>
        {account === undefined ? null : <span>{account.connected ? t('connected') : t('unconnected')}</span>}
        <span>{primary?.remainingPercent === undefined ? '\u2014' : Math.round(primary.remainingPercent) + '%'}</span>
        <button type="button" style={sortButtonStyle} data-action="open-provider" onClick={() => { setDetail(item.key) }}>{t('details')}</button>
      </div>
    )
  }
  const body = keys.length === 0
    ? <p style={emptyStyle}>{t('empty')}</p>
    : (
      <div data-providers-list="">
        <SortableList
          chrome="plain"
          items={items}
          getId={item => item.key}
          dragLabel={item => t('drag') + ': ' + item.key}
          moveButtons
          moveUpLabel={item => t('moveUp') + ': ' + item.key}
          moveDownLabel={item => t('moveDown') + ': ' + item.key}
          sorting={sortable}
          {...(props.disabled === undefined ? {} : { disabled: props.disabled })}
          onReorder={next => { props.onReorder?.(next.map(item => item.key)) }}
          renderItem={item => renderCard(item)}
        />
      </div>
    )

  return (
    <div data-providers-section={PROVIDERS_LOCALE_NS} style={pageStyle}>
      <style>{providerUiCss + providerShellCss}</style>
      <header>
        <h2 style={titleStyle}>{t('title')}</h2>
      </header>
      {detail === undefined
        ? (
          <div style={toolbarStyle}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 44, fontSize: 13 }}>
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
            <span id="sidebar-usage-hint" style={{ fontSize: 11, color: 'var(--dsw-alias-label-tertiary)' }}>{t('sidebarToggleHint')}</span>
            {(['all', 'llm', 'agent'] as const).map(id => (
              <button key={id} type="button" style={sortButtonStyle} aria-pressed={filter === id} onClick={() => { setFilter(id) }}>
                {t(id === 'all' ? 'filterAll' : id === 'llm' ? 'filterLlm' : 'filterAgent')}
              </button>
            ))}
            {showToggle
              ? <button type="button" style={sortButtonStyle} aria-expanded={sorting} onClick={() => { setSorting(value => !value) }}>{sorting ? t('done') : t('sort')}</button>
              : null}
          </div>
        )
        : (
          <div style={toolbarStyle}>
            <button type="button" style={sortButtonStyle} onClick={() => { setDetail(undefined) }}>{t('overview')}</button>
          </div>
        )}
      {body}
    </div>
  )
}