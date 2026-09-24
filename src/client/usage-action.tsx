/** Mounts the Provider Usage store into the sidebar footer slot. */

import { useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import { PROVIDERS_ITEM_SLOT, type ProviderOrderSettings } from '../order.js'
import { ProviderUsagePanel } from './ProviderUsagePanel.js'
import { createProviderUsageStore, type ProviderUsageStore } from './usage.js'
import type { ProviderDirectory } from './directory.js'
import { disposeReverse } from './cleanup.js'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    'sidebar.footer.action': { kind: 'list', scope: 'root', owner: { wide: boolean } }
  }
}

interface ProviderUsageActionFace {
  usage: ProviderUsageStore
  toggleVisibility: (providerKey: string, visible: boolean) => void
  showAll: () => void
  reorder: (keys: readonly string[]) => void
  subscribeForm: (listener: () => void) => () => void
  readShowSidebarUsage: () => boolean
}

type ProviderUsageActionProps = PropsRuntime<'sidebar.footer.action'> & ProviderUsageActionFace

function ProviderUsageAction(props: ProviderUsageActionProps): ReactNode {
  const usage = useSyncExternalStore(props.usage.subscribe, props.usage.getSnapshot, props.usage.getSnapshot)
  const showSidebarUsage = useSyncExternalStore(props.subscribeForm, props.readShowSidebarUsage, props.readShowSidebarUsage)
  if (!props.wide || !showSidebarUsage) return null
  return (
    <ProviderUsagePanel
      providers={usage.providers}
      hiddenKeys={usage.hiddenKeys}
      refreshing={usage.refreshing}
      onRefresh={key => { key === undefined ? props.usage.refresh() : props.usage.refresh([key]) }}
      onToggleVisibility={props.toggleVisibility}
      onShowAll={props.showAll}
      onReorder={keys => { props.reorder(keys) }}
    />
  )
}

function providerKeys(ctx: ClientContext): string[] {
  return ctx.slots.entriesOfSlot(PROVIDERS_ITEM_SLOT)
    .map(entry => entry.options.key)
    .filter((key): key is string => key !== undefined && key.length > 0)
}

/** Install one root-scoped footer action and keep it synchronized with provider/settings slots. */
export function installProviderUsage(
  ctx: ClientContext,
  orderForm: ConfigForm<ProviderOrderSettings>,
  directory: ProviderDirectory,
  onStore?: (usage: ProviderUsageStore) => void,
): () => void {
  let connection: ConnectionHandle
  try {
    const candidate = ctx.get('connection') as unknown
    if (candidate === undefined || candidate === null || typeof candidate !== 'object' || !('rpc' in candidate)) return () => {}
    connection = candidate as ConnectionHandle
  } catch {
    return () => {}
  }
  const usage = createProviderUsageStore(connection.rpc, key => directory.reader(key))
  onStore?.(usage)
  let directoryGeneration = 0
  let lastConfig = ''
  const reconcile = (): void => {
    const settings = orderForm.getSnapshot()
    const keys = providerKeys(ctx)
    const unconnectedKeys = keys.filter(key => directory.accountOf(key)?.state === 'unconnected')
    const usageOrder = settings.value?.usageOrder ?? []
    const hidden = settings.value?.hiddenUsageProviders ?? []
    const config = JSON.stringify([keys, usageOrder, hidden, unconnectedKeys, directoryGeneration])
    if (config === lastConfig) return
    lastConfig = config
    usage.configure({ registeredKeys: keys, unconnectedKeys, savedOrder: usageOrder, hiddenKeys: hidden })
  }
  const writeList = (field: 'hiddenUsageProviders' | 'usageOrder', value: readonly string[]): void => {
    const settings = orderForm.getSnapshot()
    if (settings.status !== 'ready' || !settings.writable) return
    void orderForm.set(field, [...value]).then(accepted => {
      if (!accepted) console.warn('[dsh-llm-providers-ui] Host refused Provider Usage ' + field + ' update')
    }).catch(error => {
      console.warn('[dsh-llm-providers-ui] failed to save Provider Usage ' + field, error)
    })
  }
  const writeHidden = (hidden: readonly string[]): void => {
    writeList('hiddenUsageProviders', [...new Set(hidden)])
  }
  const toggleVisibility = (providerKey: string, visible: boolean): void => {
    const hidden = new Set(orderForm.getSnapshot().value?.hiddenUsageProviders ?? [])
    if (visible) hidden.delete(providerKey)
    else hidden.add(providerKey)
    writeHidden([...hidden])
  }
  const showAll = (): void => { writeHidden([]) }
  const reorder = (keys: readonly string[]): void => { writeList('usageOrder', keys) }
  reconcile()
  const action = ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'llm-providers-usage',
    order: 0,
    inject: (): ProviderUsageActionFace => ({
      usage, toggleVisibility, showAll, reorder,
      subscribeForm: listener => orderForm.subscribe(listener),
      readShowSidebarUsage: () => orderForm.getSnapshot().value?.showSidebarUsage ?? true,
    }),
  }, ProviderUsageAction))
  const stopSlot = ctx.slots.subscribe(PROVIDERS_ITEM_SLOT, reconcile)
  const stopForm = orderForm.subscribe(reconcile)
  const stopDirectory = directory.subscribe(() => {
    directoryGeneration += 1
    reconcile()
  })
  const stopInvalidate = directory.onInvalidateUsage(key => { usage.invalidate([key]); reconcile() })
  return () => {
    disposeReverse([stopInvalidate, stopDirectory, stopForm, stopSlot, action, () => { usage.dispose() }], 'dsh-llm-providers-ui: usage cleanup failed')
  }
}
