/** Settings > LLM Providers page shell. Provider cards arrive through settings.provider.item. */

import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type {
  PropsLocale,
  PropsRenderSlots,
  PropsRuntime,
} from '@deepseek-ai/dsh-client-ui-slots'
import type { SettingsSectionOwnerProps } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { ProviderSectionLocaleKey } from './provider-section.js'
import { applySavedOrder, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS } from '../order.js'
import { SortableList } from './SortableList.js'
import type { ProviderHeaderOwnership, ProviderRole } from './directory.js'
import { providerUiCss } from './provider-ui.js'

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
}

const pageStyle: CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 16, width: '100%',
}
const titleStyle: CSSProperties = {
  margin: 0, color: 'var(--dsw-alias-label-primary)', fontSize: 16, fontWeight: 500, lineHeight: '24px',
}
const subtitleStyle: CSSProperties = {
  margin: '4px 0 0', color: 'var(--dsw-alias-label-secondary)', fontSize: 13, lineHeight: '20px',
}
const toolbarStyle: CSSProperties = { display: 'flex', justifyContent: 'flex-end' }
const sortButtonStyle: CSSProperties = {
  minHeight: 34, border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 18,
  padding: '6px 14px', background: 'var(--dsw-alias-bg-layer-1)',
  color: 'var(--dsw-alias-label-primary)', fontSize: 13, lineHeight: '20px', cursor: 'pointer',
}
const emptyStyle: CSSProperties = { color: 'var(--dsw-alias-label-tertiary)', fontSize: 13, lineHeight: '20px' }
const fallbackWrapStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }
const fallbackBadgeBase: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start', whiteSpace: 'nowrap',
  fontSize: 10, fontWeight: 500, lineHeight: '16px', padding: '0 5px', borderRadius: 3,
  border: '1px solid transparent',
}
const fallbackBadgeLlm: CSSProperties = {
  color: 'var(--dsw-alias-label-secondary)',
  borderColor: 'var(--dsw-alias-border-secondary)',
  background: 'transparent',
}
const fallbackBadgeAgent: CSSProperties = {
  color: 'var(--dsw-alias-bg-layer-1)',
  borderColor: 'var(--dsw-alias-label-primary)',
  background: 'var(--dsw-alias-label-primary)',
}

/** Bind the shared page to live keyed-slot and settings snapshots. */
export function bindProvidersSection(
  listRegisteredKeys: () => readonly string[],
  subscribe: (listener: () => void) => () => void,
  readOrder: () => { keys: readonly string[], disabled: boolean },
  onReorder: (keys: string[]) => void,
  roleOf: (key: string) => ProviderRole,
  headerOf?: (key: string) => ProviderHeaderOwnership,
): (props: ProvidersSectionSlotProps) => ReactNode {
  return function BoundProvidersSection(props: ProvidersSectionSlotProps): ReactNode {
    const [, bump] = useState(0)
    useEffect(() => subscribe(() => { bump(value => value + 1) }), [subscribe])
    const order = readOrder()
    return (
      <ProvidersSection
        renderSlot={props.renderSlot}
        t={props.t}
        registeredKeys={listRegisteredKeys()}
        savedOrder={order.keys}
        disabled={order.disabled}
        onReorder={onReorder}
        roleOf={roleOf}
        {...(headerOf === undefined ? {} : { headerOf })}
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
  const items = keys.map(key => ({ key }))
  const [sorting, setSorting] = useState(false)
  const showToggle = keys.length > 1 && props.disabled !== true
  const sortable = sorting && showToggle
  const renderCard = (item: { key: string }): ReactNode => {
    const node = props.renderSlot?.(PROVIDERS_ITEM_SLOT, {}, { entryKey: item.key })
    if (node == null) return null
    const role = props.roleOf?.(item.key) ?? 'llm'
    if (props.headerOf?.(item.key) === 'shared') return <div data-provider-slot="" data-provider-role={role}>{node}</div>
    return (
      <div data-provider-slot="" data-provider-role={role} style={fallbackWrapStyle}>
        <span style={{ ...fallbackBadgeBase, ...(role === 'agent' ? fallbackBadgeAgent : fallbackBadgeLlm) }}>{role === 'agent' ? 'Agent' : 'LLM'}</span>
        {node}
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
      <style>{providerUiCss}</style>
      <header>
        <h2 style={titleStyle}>{t('title')}</h2>
        <p style={subtitleStyle}>{t('subtitle')}</p>
      </header>
      {showToggle
        ? (
          <div style={toolbarStyle}>
            <button type="button" style={sortButtonStyle} aria-expanded={sorting} onClick={() => { setSorting(value => !value) }}>
              {sorting ? t('done') : t('sort')}
            </button>
          </div>
        )
        : null}
      {body}
    </div>
  )
}