/**
 * Host plugin: sole owner of the llm-providers settings namespace.
 * Provider plugins register only their keyed card and llm route. This module
 * keeps the shared provider-order utilities for dsh-model-switch and the Web picker.
 * @module dsh-llm-providers-ui
 */

import z from '@deepseek-ai/schemastery'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-settings'
import type SettingsProvider from '@deepseek-ai/dsh-settings'
import { PROVIDERS_SETTINGS_NS } from './order.js'

export {
  PROVIDERS_SECTION_ID,
  PROVIDERS_ITEM_SLOT,
  PROVIDERS_LOCALE_NS,
  PROVIDERS_SETTINGS_NS,
  PROVIDER_ITEM_ORDER,
  PROVIDER_ROUTES,
  applySavedOrder,
  decodeProviderOrder,
  providerRoute,
  sortCatalogGroups,
} from './order.js'
export type { CatalogGroup, ProviderItemKey, ProviderOrderSettings } from './order.js'

export const name = 'dsh-llm-providers-ui'
/** This owner can mount before the optional Settings service is available. */
export const inject: string[] = []

/** Schema of the shared provider-order settings section. */
export interface OrderConfig {
  order: string[]
}
export const OrderConfig: z<OrderConfig> = z.object({
  order: z.array(String).default([]),
})

/** Host configuration for the providers-ui owner (currently no fields). */
export interface Config {}
export const Config: z<Config> = z.object({})

/**
 * Host plugin apply: sole writer of the llm-providers namespace.
 * The registration rides the Host fiber, so unloading the owner drops the
 * namespace, and reloading recreates it. Providers continue to work
 * Host-side when the owner is absent; their llm routes remain registered.
 * Duplicate registration fails loud; only one Host owner may be installed.
 * @param ctx - Host Cordis context.
 */
export function apply(ctx: Context, _config: Config = {}): void {
  const install = (settings: SettingsProvider): void => {
    settings.installSection(ctx, PROVIDERS_SETTINGS_NS, OrderConfig, { order: [] }, {
      setSource: () => undefined,
      onChange: () => undefined,
    })
  }
  const settings = ctx.get('settings')
  if (settings !== undefined) {
    install(settings)
  } else {
    // Keep the host usable without the optional service and attach when a
    // settings provider is mounted later in the composition.
    ctx.inject(['settings'], (settingsCtx) => install(settingsCtx.settings))
  }
}
