/** Host half: shared llm-providers settings section (first writer wins). */

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
import { PROVIDERS_SETTINGS_NS } from './order.ts'

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
} from './order.ts'
export type { CatalogGroup, ProviderItemKey, ProviderOrderSettings } from './order.ts'

export const name = 'dsh-llm-providers-ui'

const NS = settingsNamespace(PROVIDERS_SETTINGS_NS)

/** Schema of the shared provider-order settings section. */
export interface OrderConfig {
  order: string[]
}
export const OrderConfig: z<OrderConfig> = z.object({
  order: z.array(String).default([]),
})

function alreadyRegistered(error: unknown): boolean {
  return error instanceof Error && /already registered/.test(error.message)
}

/**
 * Register llm-providers when missing. Duplicate registrations from a
 * second installed llm plugin are ignored; the first loaded fiber owns the
 * section until it unloads.
 * @param ctx - host plugin context that injects settings.
 */
export function ensureProviderOrderSettings(ctx: Context): void {
  ctx.inject(['settings'], (sctx) => {
    const occupied = sctx.settings.describe().some(entry => entry.ns === PROVIDERS_SETTINGS_NS)
    if (occupied) return
    try {
      installSettingsSection(sctx, NS, OrderConfig, { order: [] }, {
        setSource: () => {},
        onChange: () => {},
      })
    } catch (error) {
      if (!alreadyRegistered(error)) throw error
    }
  })
}
