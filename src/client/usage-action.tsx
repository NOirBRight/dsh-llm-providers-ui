/** Mounts the Provider Usage store into the sidebar footer slot. */

import { useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
import type { UseSessions } from '@deepseek-ai/dsh-client-ui-session/client'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import { PROVIDERS_ITEM_SLOT, providerKeyForRoute, type ProviderOrderSettings } from '../order.js'
import { ProviderUsagePanel } from './ProviderUsagePanel.js'
import { createProviderUsageStore, type ProviderUsageStore } from './usage.js'
import { disposeReverse } from './cleanup.js'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    'sidebar.footer.action': { kind: 'list', scope: 'root', owner: { wide: boolean } }
  }
  interface GlobalStandardProps {
    useSessions: UseSessions
  }
}

interface ProviderUsageActionFace {
  usage: ProviderUsageStore
  toggleVisibility: (providerKey: string, visible: boolean) => void
  showAll: () => void
}

type ProviderUsageActionProps = PropsRuntime<'sidebar.footer.action'> & ProviderUsageActionFace

type SessionListState = ReturnType<ProviderUsageActionProps['useSessions']>

function currentProviderKey(state: SessionListState): string | undefined {
  const currentSessionId = state.current
  if (currentSessionId === undefined) return undefined
  const session = state.byId[currentSessionId]
  const selection = session?.projectionValues?.modelSelection
  const provider = selection?.next?.provider
  return provider === undefined ? undefined : providerKeyForRoute(provider)
}

function ProviderUsageAction(props: ProviderUsageActionProps): ReactNode {
  const usage = useSyncExternalStore(props.usage.subscribe, props.usage.getSnapshot, props.usage.getSnapshot)
  const activeProviderKey = props.useSessions(currentProviderKey)
  if (!props.wide) return null
  return (
    <ProviderUsagePanel
      providers={usage.providers}
      hiddenKeys={usage.hiddenKeys}
      {...activeProviderKey === undefined ? {} : { currentProviderKey: activeProviderKey }}
      refreshing={usage.refreshing}
      onRefresh={key => { key === undefined ? props.usage.refresh() : props.usage.refresh([key]) }}
      onToggleVisibility={props.toggleVisibility}
      onShowAll={props.showAll}
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
  orderScope: SettingsScope<ProviderOrderSettings>,
): () => void {
  let connection: ConnectionHandle
  try {
    const candidate = ctx.get('connection') as unknown
    if (candidate === undefined || candidate === null || typeof candidate !== 'object' || !('rpc' in candidate)) return () => {}
    connection = candidate as ConnectionHandle
  } catch {
    return () => {}
  }
  const usage = createProviderUsageStore(connection.rpc)
  let lastConfig = ''
  const reconcile = (): void => {
    const settings = orderScope.getSnapshot()
    const keys = providerKeys(ctx)
    const order = settings.value?.order ?? []
    const hidden = settings.value?.hiddenUsageProviders ?? []
    const config = JSON.stringify([keys, order, hidden])
    if (config === lastConfig) return
    lastConfig = config
    usage.configure({ registeredKeys: keys, savedOrder: order, hiddenKeys: hidden })
  }
  const writeHidden = (hidden: readonly string[]): void => {
    const settings = orderScope.getSnapshot()
    if (settings.status !== 'ready' || !settings.writable) return
    void orderScope.set('hiddenUsageProviders', [...new Set(hidden)]).catch(error => {
      console.warn('[dsh-llm-providers-ui] failed to save Provider Usage visibility', error)
    })
  }
  const toggleVisibility = (providerKey: string, visible: boolean): void => {
    const hidden = new Set(orderScope.getSnapshot().value?.hiddenUsageProviders ?? [])
    if (visible) hidden.delete(providerKey)
    else hidden.add(providerKey)
    writeHidden([...hidden])
  }
  const showAll = (): void => { writeHidden([]) }
  reconcile()
  const action = ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'llm-providers-usage',
    order: 0,
    inject: (): ProviderUsageActionFace => ({ usage, toggleVisibility, showAll }),
  }, ProviderUsageAction))
  const stopSlot = ctx.slots.subscribe(PROVIDERS_ITEM_SLOT, reconcile)
  const stopSettings = orderScope.subscribe(reconcile)
  return () => {
    disposeReverse([stopSettings, stopSlot, action, () => { usage.dispose() }], 'dsh-llm-providers-ui: usage cleanup failed')
  }
}
