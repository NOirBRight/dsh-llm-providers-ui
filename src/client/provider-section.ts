/** Shared Settings > LLM Providers section. First installed provider plugin wins the nav row. */

import type { ClientContext } from './shim.js'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import { installProvidersNavIcon } from './nav-icon.ts'
import { bindProvidersSection } from './ProvidersSection.tsx'
import {
  decodeProviderOrder,
  PROVIDERS_ITEM_SLOT,
  PROVIDERS_LOCALE_NS,
  PROVIDERS_SECTION_ID,
  PROVIDERS_SETTINGS_NS,
} from '../order.ts'

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
} from '../order.ts'
export type { CatalogGroup, ProviderItemKey, ProviderOrderSettings } from '../order.ts'

const copy = {
  zh: {
    nav: 'LLM 供应商',
    title: 'LLM 供应商',
    subtitle: '连接账号，并选择哪些模型出现在对话的模型列表里。拖动卡片会改变对话模型列表里的供应商顺序。',
    empty: '安装 Cursor、Grok、Codex 或 Ollama Cloud 后，在这里连接账号并选择模型。',
    drag: '拖动排序',
  },
  en: {
    nav: 'LLM Providers',
    title: 'LLM Providers',
    subtitle: 'Connect accounts and choose which models appear in the chat picker. Drag cards to change provider order in the picker.',
    empty: 'Install Cursor, Grok, Codex, or Ollama Cloud to connect an account and pick models here.',
    drag: 'Reorder',
  },
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    'settings.provider.item': { kind: 'keyed'; scope: 'root' }
  }
  interface LocaleNamespaceMap {
    'settings.providers': keyof typeof copy.en
  }
}

interface SlotsFace {
  inject(name: string, factory: () => (() => void) | void): void
  register(options: Record<string, unknown>, component: unknown): () => void
  entries(name: string): readonly { options: { id?: string; key?: string } }[]
  subscribe?(name: string, listener: () => void): () => void
}

interface LocaleFace {
  register(namespace: string, dicts: { zh: Record<string, string>; en: Record<string, string> }): () => void
  bind(namespace: string): (key: string) => string
}

interface OrderScope {
  getSnapshot(): { value?: { order: string[] }, writable: boolean, status: string }
  subscribe(listener: () => void): () => void
  set(field: string, value: unknown): Promise<void>
}

interface SettingsScopeFace {
  bind(options: { namespace: string, decode: (value: unknown) => { order: string[] } }): OrderScope
}

function isOccupied(slots: SlotsFace): boolean {
  return slots.entries('settings.section').some(entry => entry.options.id === PROVIDERS_SECTION_ID)
}

function duplicateSection(error: unknown): boolean {
  return error instanceof Error && /already has|requires options/.test(error.message)
}

function bindOrder(ctx: ClientContext): OrderScope | undefined {
  let settingsScope: SettingsScopeFace | undefined
  try {
    settingsScope = ctx.get('settingsScope') as SettingsScopeFace | undefined
  } catch {
    settingsScope = undefined
  }
  if (settingsScope === undefined || typeof settingsScope.bind !== 'function') return undefined
  try {
    return settingsScope.bind({ namespace: PROVIDERS_SETTINGS_NS, decode: decodeProviderOrder })
  } catch {
    return undefined
  }
}

/**
 * Register the shared LLM Providers section when missing. Uninstalling every
 * provider plugin drops the nav row because only they call this helper.
 * @param ctx - browser plugin context (slots + locale; settingsScope optional).
 */
export function ensureProviderSection(ctx: ClientContext): void {
  const slots = (ctx as unknown as { slots: SlotsFace }).slots
  const locale = (ctx as unknown as { locale: LocaleFace }).locale
  const orderScope = bindOrder(ctx)

  slots.inject('settings.section', () => {
    let disposeSection: (() => void) | undefined
    let disposeLocale: (() => void) | undefined
    let disposeIcon: (() => void) | undefined
    let stopOrder: (() => void) | undefined

    const claim = (): void => {
      if (disposeSection !== undefined || isOccupied(slots)) return
      disposeLocale ??= locale.register(PROVIDERS_LOCALE_NS, copy)
      const t = locale.bind(PROVIDERS_LOCALE_NS)
      try {
        disposeSection = slots.register({
          name: 'settings.section',
          id: PROVIDERS_SECTION_ID,
          order: 12,
          label: () => t('nav'),
          locale: PROVIDERS_LOCALE_NS,
          children: { [PROVIDERS_ITEM_SLOT]: { kind: 'keyed', scope: 'root' } },
        }, bindProvidersSection(
          () => slots.entries(PROVIDERS_ITEM_SLOT)
            .map(entry => entry.options.key)
            .filter((key): key is string => typeof key === 'string' && key.length > 0),
          listener => {
            const stopSlot = slots.subscribe?.(PROVIDERS_ITEM_SLOT, listener)
            stopOrder = orderScope?.subscribe(listener)
            return () => {
              stopSlot?.()
              stopOrder?.()
              stopOrder = undefined
            }
          },
          () => {
            const snapshot = orderScope?.getSnapshot()
            return {
              keys: snapshot?.value?.order ?? [],
              disabled: snapshot !== undefined && (snapshot.status !== 'ready' || snapshot.writable !== true),
            }
          },
          keys => { void orderScope?.set('order', keys) },
        ))
        disposeIcon ??= installProvidersNavIcon()
      } catch (error) {
        if (!duplicateSection(error)) throw error
      }
    }

    claim()
    const stop = slots.subscribe?.('settings.section', () => {
      if (!isOccupied(slots)) {
        disposeSection = undefined
        claim()
      }
    })
    return () => {
      stop?.()
      stopOrder?.()
      stopOrder = undefined
      disposeIcon?.()
      disposeIcon = undefined
      disposeSection?.()
      disposeSection = undefined
      disposeLocale?.()
      disposeLocale = undefined
    }
  })
}
