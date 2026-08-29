/** Settings > LLM Providers page shell. Provider cards arrive through settings.provider.item. */

import { Fragment, useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { applySavedOrder, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS } from '../order.ts'
import { SortableList } from './SortableList.tsx'

interface ProvidersSectionProps {
  renderSlot?: (name: string, slotProps: object, opts?: { entryKey?: string }) => ReactNode
  t?: (key: 'title' | 'subtitle' | 'empty' | 'drag') => string
  /** Live keyed contributions. */
  registeredKeys?: readonly string[]
  /** Saved order from llm-providers settings. */
  savedOrder?: readonly string[]
  /** Persist a new card order. */
  onReorder?: (keys: string[]) => void
  /** Disable dragging while settings are not writable. */
  disabled?: boolean
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

/** Bind the shared page to live keyed-slot ledger and saved order. */
export function bindProvidersSection(
  listRegisteredKeys: () => readonly string[],
  subscribe?: (listener: () => void) => (() => void) | undefined,
  readOrder?: () => { keys: readonly string[], disabled: boolean },
  onReorder?: (keys: string[]) => void,
): (props: ProvidersSectionProps) => ReactNode {
  return function BoundProvidersSection(props: ProvidersSectionProps): ReactNode {
    const [, bump] = useState(0)
    useEffect(() => {
      const stopSlot = subscribe?.(() => bump(n => n + 1))
      return () => { stopSlot?.() }
    }, [subscribe])
    const order = readOrder?.()
    const next: ProvidersSectionProps = { registeredKeys: listRegisteredKeys() }
    if (props.renderSlot !== undefined) next.renderSlot = props.renderSlot
    if (props.t !== undefined) next.t = props.t
    if (order !== undefined) {
      next.savedOrder = order.keys
      next.disabled = order.disabled
    }
    if (onReorder !== undefined) next.onReorder = onReorder
    return <ProvidersSection {...next} />
  }
}

/** Render installed provider cards. Two or more cards grow a left drag handle. */
export function ProvidersSection(props: ProvidersSectionProps): ReactNode {
  const t = props.t ?? ((key: 'title' | 'subtitle' | 'empty' | 'drag') => key)
  const renderSlot = props.renderSlot
  const keys = applySavedOrder(props.registeredKeys ?? [], props.savedOrder ?? [])
  const items = keys.map(key => ({ key }))
  const renderCard = (item: { key: string }): ReactNode => {
    const node = renderSlot?.(PROVIDERS_ITEM_SLOT, {}, { entryKey: item.key })
    return node == null ? null : <Fragment>{node}</Fragment>
  }
  const body = keys.length === 0
    ? <p style={emptyStyle}>{t('empty')}</p>
    : keys.length < 2 || props.disabled === true
      ? <div style={listStyle}>{items.map(item => <Fragment key={item.key}>{renderCard(item)}</Fragment>)}</div>
      : (
        <SortableList
          framed={false}
          items={items}
          getId={item => item.key}
          dragLabel={item => t('drag') + ': ' + item.key}
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
