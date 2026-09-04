/** Settings > LLM Providers page shell. Provider cards arrive through settings.provider.item. */

import { Fragment, useEffect, useState } from 'react'
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
  /** Disable dragging while settings are not writable. */
  disabled?: boolean
  /** Shell close affordance from the official settings.section owner props. */
  close?: SettingsSectionOwnerProps['close']
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
const listStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 12 }
const emptyStyle: CSSProperties = { color: 'var(--dsw-alias-label-tertiary)', fontSize: 13, lineHeight: '20px' }

/** Bind the shared page to live keyed-slot and settings snapshots. */
export function bindProvidersSection(
  listRegisteredKeys: () => readonly string[],
  subscribe: (listener: () => void) => () => void,
  readOrder: () => { keys: readonly string[], disabled: boolean },
  onReorder: (keys: string[]) => void,
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
      />
    )
  }
}

/** Render installed provider cards. Two or more cards grow a left drag handle. */
export function ProvidersSection(props: ProvidersSectionProps): ReactNode {
  const t = props.t ?? ((key: 'title' | 'subtitle' | 'empty' | 'drag') => key)
  const keys = applySavedOrder(props.registeredKeys ?? [], props.savedOrder ?? [])
  const items = keys.map(key => ({ key }))
  const renderCard = (item: { key: string }): ReactNode => {
    const node = props.renderSlot?.(PROVIDERS_ITEM_SLOT, {}, { entryKey: item.key })
    return node == null ? null : <Fragment>{node}</Fragment>
  }
  const body = keys.length === 0
    ? <p style={emptyStyle}>{t('empty')}</p>
    : keys.length < 2
      ? <div style={listStyle}>{items.map(item => <Fragment key={item.key}>{renderCard(item)}</Fragment>)}</div>
      : (
        <SortableList
          chrome="card"
          items={items}
          getId={item => item.key}
          dragLabel={item => t('drag') + ': ' + item.key}
          disabled={props.disabled === true}
          onReorder={next => { props.onReorder?.(next.map(item => item.key)) }}
          renderItem={item => renderCard(item)}
        />
      )

  return (
    <div data-providers-section={PROVIDERS_LOCALE_NS} style={pageStyle}>
      <header>
        <h2 style={titleStyle}>{t('title')}</h2>
        <p style={subtitleStyle}>{t('subtitle')}</p>
      </header>
      {body}
    </div>
  )
}
