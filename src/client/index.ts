/** Browser owner of the LLM Providers Settings page. */

import z from '@deepseek-ai/schemastery'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
// These imports intentionally load the official alpha.1 declaration merges:
// settingsScope, locale, SlotRegistry, and the SlotCore contract table.
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import {
  PROVIDERS_ITEM_SLOT,
  PROVIDERS_LOCALE_NS,
  PROVIDERS_SECTION_ID,
  PROVIDERS_SETTINGS_NS,
  decodeProviderOrder,
  type ProviderOrderSettings,
} from '../order.js'
import { bindProvidersSection } from './ProvidersSection.js'
import { disposeAfterSetup, disposeReverse } from './cleanup.js'
import { installProvidersNavIcon } from './nav-icon.js'
import { copy } from './provider-section.js'

export const name = 'dsh-llm-providers-ui-client'
export const inject = ['slots', 'locale', 'settingsScope']

/** Client configuration for the Providers page owner. */
export interface Config {}
export const Config: z<Config> = z.object({})

type Disposer = () => void

/**
 * Warn once while the Host owner has not published the settings namespace.
 * @param orderScope - client scope bound to the Host-owned namespace.
 * @returns disposer for the deferred check and scope subscription.
 */
function installMissingOwnerDiagnostic(orderScope: SettingsScope<ProviderOrderSettings>): Disposer {
  let warned = false
  const check = (): void => {
    const status = orderScope.getSnapshot().status
    if (warned || status === 'ready' || status === 'loading') return
    warned = true
    console.warn('[dsh-llm-providers-ui] llm-providers settings owner is unavailable; omitting the Providers page until the Host owner is loaded.')
  }
  const timer = setTimeout(check, 0)
  const stop = orderScope.subscribe(check)
  return () => {
    disposeReverse([
      () => { clearTimeout(timer) },
      stop,
    ], 'dsh-llm-providers-ui: owner diagnostic cleanup failed')
  }
}

/**
 * Warn once when an available Host namespace has no Web section declaration.
 * @param ctx - Web Cordis context with the public SlotCore face.
 * @param orderScope - client scope used to gate the page transaction.
 * @returns disposer for the deferred check and both subscriptions.
 */
function installMissingSectionDiagnostic(
  ctx: ClientContext,
  orderScope: SettingsScope<ProviderOrderSettings>,
): Disposer {
  let warned = false
  const check = (): void => {
    if (warned
      || orderScope.getSnapshot().status !== 'ready'
      || ctx.slots.spec('settings.section') !== undefined) return
    warned = true
    console.warn('[dsh-llm-providers-ui] settings.section is missing; the Providers page cannot mount until the Web settings shell declares it.')
  }
  const timer = setTimeout(check, 0)
  const stopSection = ctx.slots.subscribe('settings.section', check)
  const stopScope = orderScope.subscribe(check)
  return () => {
    disposeReverse([
      () => { clearTimeout(timer) },
      stopSection,
      stopScope,
    ], 'dsh-llm-providers-ui: section diagnostic cleanup failed')
  }
}

/**
 * Mount the page transaction only while the Host-owned settings scope is ready.
 * @param ctx - Web Cordis context with official slot and settings services.
 * @param orderScope - client scope used to gate the page transaction.
 * @param t - locale lookup for the page label.
 * @returns disposer for the scope listener and active page transaction.
 */
function installSectionTransaction(
  ctx: ClientContext,
  orderScope: SettingsScope<ProviderOrderSettings>,
  t: () => string,
): Disposer {
  let stopSection: Disposer | undefined
  let stopNav: Disposer | undefined

  const unmount = (): void => {
    const section = stopSection
    const nav = stopNav
    stopSection = undefined
    stopNav = undefined
    disposeReverse([section, nav], 'dsh-llm-providers-ui: page unmount failed')
  }
  const mount = (): void => {
    if (stopSection !== undefined || orderScope.getSnapshot().status !== 'ready') return
    const section = ctx.slots.inject('settings.section', () => ctx.slots.register({
      name: 'settings.section',
      id: PROVIDERS_SECTION_ID,
      order: 12,
      label: t,
      locale: PROVIDERS_LOCALE_NS,
      children: { [PROVIDERS_ITEM_SLOT]: { kind: 'keyed', scope: 'root' } },
    }, bindProvidersSection(
      () => ctx.slots.entriesOfSlot(PROVIDERS_ITEM_SLOT)
        .map(entry => entry.options.key)
        .filter((key): key is string => key !== undefined && key.length > 0),
      listener => {
        const stopSlot = ctx.slots.subscribe(PROVIDERS_ITEM_SLOT, listener)
        const stopSettings = orderScope.subscribe(listener)
        return () => {
          disposeReverse([stopSlot, stopSettings], 'dsh-llm-providers-ui: section listener cleanup failed')
        }
      },
      () => {
        const snapshot = orderScope.getSnapshot()
        return {
          keys: snapshot.value?.order ?? [],
          disabled: snapshot.status !== 'ready' || !snapshot.writable,
        }
      },
      keys => { void orderScope.set('order', keys) },
    )))
    try {
      const nav = installProvidersNavIcon()
      stopSection = section
      stopNav = nav
    } catch (error) {
      disposeAfterSetup(error, [section], 'dsh-llm-providers-ui: page setup rollback failed')
    }
  }
  const reconcile = (): void => {
    if (orderScope.getSnapshot().status === 'ready') mount()
    else unmount()
  }
  let stopScope: Disposer | undefined
  try {
    stopScope = orderScope.subscribe(reconcile)
    reconcile()
  } catch (error) {
    disposeAfterSetup(error, [stopScope, unmount], 'dsh-llm-providers-ui: transaction setup rollback failed')
  }
  return () => {
    disposeReverse([stopScope, unmount], 'dsh-llm-providers-ui: transaction cleanup failed')
  }
}

/**
 * Mount the sole LLM Providers page, locale, slot, and nav-icon adapter.
 * The page is independent of shell/provider load order and appears only after
 * the Host-owned settings namespace is available.
 * @param ctx - Web Cordis context with official slot, locale, and settingsScope faces.
 */
export function apply(ctx: ClientContext, _config: Config = {}): void {
  ctx.effect(() => {
    const disposers: Disposer[] = []
    try {
      disposers.push(ctx.locale.register(PROVIDERS_LOCALE_NS, copy))

      const orderScope: SettingsScope<ProviderOrderSettings> = ctx.settingsScope.bind({
        namespace: PROVIDERS_SETTINGS_NS,
        decode: decodeProviderOrder,
      })
      const t = ctx.locale.bind(PROVIDERS_LOCALE_NS)

      disposers.push(installMissingOwnerDiagnostic(orderScope))
      disposers.push(installMissingSectionDiagnostic(ctx, orderScope))
      disposers.push(installSectionTransaction(ctx, orderScope, () => t('nav')))
    } catch (error) {
      disposeAfterSetup(error, disposers, 'dsh-llm-providers-ui: setup failed and cleanup failed')
    }
    return () => {
      disposeReverse(disposers, 'dsh-llm-providers-ui: outer cleanup failed')
    }
  }, 'dsh-llm-providers-ui: providers section')
}
