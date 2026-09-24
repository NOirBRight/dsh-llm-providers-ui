/**
 * Host plugin: owner of the LLM Providers Loader Config entry.
 * Provider plugins register only their keyed card and llm route. This module
 * keeps the shared provider-order utilities for dsh-model-switch and the Web picker.
 * @module dsh-llm-providers-ui
 */

import z from '@deepseek-ai/schemastery'
import type { Context, Volatile } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-settings'
import { allowDshRuntime } from './compatibility.ts'

export {
  PROVIDERS_SECTION_ID,
  PROVIDERS_ITEM_SLOT,
  PROVIDERS_LOCALE_NS,
  PROVIDERS_CONFIG_ID,
  PROVIDER_ITEM_ORDER,
  PROVIDER_ROUTES,
  applySavedOrder,
  providerRoute,
  sortCatalogGroups,
} from './order.js'
export type { CatalogGroup, ProviderItemKey, ProviderOrderSettings } from './order.js'

export const name = 'dsh-llm-providers-ui'
/** Settings is optional; this owner only disables its generated page when present. */
export const inject: string[] = []

/** Live provider order and visibility fields exposed through this entry's ConfigForm. */
export interface Config {
  order: Volatile<string[]>
  hiddenUsageProviders: Volatile<string[]>
  usageOrder: Volatile<string[]>
  showSidebarUsage: Volatile<boolean>
}
export const Config = z.object({
  order: z.array(String).default([]).volatile(),
  hiddenUsageProviders: z.array(String).default([]).volatile(),
  usageOrder: z.array(String).default([]).volatile(),
  showSidebarUsage: z.boolean().default(true).volatile(),
})

/**
 * Host plugin: Loader Config owns provider order and visibility. Settings only
 * disables the generic page because the client contributes the custom surface.
 * @param ctx - Host Cordis context.
 */
export function apply(ctx: Context, _config?: Config): void {
  if (!allowDshRuntime(ctx.logger, 'dsh-llm-providers-ui', ['@deepseek-ai/dsh-settings'])) return

  const settings = ctx.get('settings')
  if (settings !== undefined) {
    ctx.effect(() => settings.configure({ auto: false }, ctx.fiber))
  } else {
    ctx.inject(['settings'], settingsCtx => {
      settingsCtx.effect(() => settingsCtx.settings.configure({ auto: false }, ctx.fiber))
    })
  }
}
