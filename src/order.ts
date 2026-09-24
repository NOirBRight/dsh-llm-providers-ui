/** Shared LLM provider card order: settings keys, picker routes, and catalog sort. */

export const PROVIDERS_SECTION_ID = 'providers'
export const PROVIDERS_ITEM_SLOT = 'settings.provider.item'
export const PROVIDERS_LOCALE_NS = 'settings.providers'
export const PROVIDERS_CONFIG_ID = 'llm-providers-ui'

/** Display order for installed provider cards when the user has not saved one. */
export const PROVIDER_ITEM_ORDER = [
  'llm-cursor',
  'llm-grok',
  'llm-codex',
  'llm-ollama',
  'llm-commandcode',
  'llm-opencode-go',
] as const

export type ProviderItemKey = (typeof PROVIDER_ITEM_ORDER)[number]

const KNOWN_KEYS = new Set<string>(PROVIDER_ITEM_ORDER)

/** settings.provider.item key to llm route id used by session.models / the picker. */
export const PROVIDER_ROUTES: Record<ProviderItemKey, string> = {
  'llm-cursor': 'cursor',
  'llm-grok': 'grok',
  'llm-codex': 'codex',
  'llm-ollama': 'ollama-cloud',
  'llm-commandcode': 'commandcode',
  'llm-opencode-go': 'opencode-go',
}

const ROUTE_TO_KEY = new Map<string, ProviderItemKey>(
  (Object.entries(PROVIDER_ROUTES) as Array<[ProviderItemKey, string]>).map(([key, route]) => [route, key]),
)

export interface ProviderOrderSettings {
  order: string[]
  hiddenUsageProviders: string[]
  usageOrder: string[]
  showSidebarUsage: boolean
}

/**
 * Merge a saved key list with the keys that are actually installed.
 * Saved keys that are not installed are dropped; installed keys missing from
 * the save append in PROVIDER_ITEM_ORDER, then leftover unknown keys.
 * Nothing registered yields an empty list (the settings empty state).
 */
export function applySavedOrder(registered: readonly string[], saved: readonly string[] = []): string[] {
  const have = [...new Set(registered.filter(key => key.length > 0))]
  if (have.length === 0) return []
  const installed = new Set(have)
  const preferredSaved = [...new Set(saved)].filter(key => installed.has(key))
  const preferred = new Set(preferredSaved)
  const rest = have.filter(key => !preferred.has(key))
  const known = PROVIDER_ITEM_ORDER.filter(key => rest.includes(key))
  const extra = rest.filter(key => !KNOWN_KEYS.has(key))
  return [...preferredSaved, ...known, ...extra]
}

export interface CatalogGroup {
  id: string
}

/** Map an llm route id to its settings.provider.item key when known. */
export function providerKeyForRoute(route: string): ProviderItemKey | undefined {
  return ROUTE_TO_KEY.get(route)
}

/** Map a settings.provider.item key to its llm route id when known. */
export function providerRoute(key: string): string | undefined {
  return (PROVIDER_ROUTES as Record<string, string>)[key]
}

function ownCatalogKey(catalogKeys: Readonly<Record<string, string>>, id: string): string | undefined {
  return Object.hasOwn(catalogKeys, id) ? catalogKeys[id] : undefined
}

/**
 * Sort picker/catalog groups from declared directory routes.
 * With a saved card order, mapped providers follow that list; with none, groups keep catalog order.
 * Groups the live map does not know keep catalog order and append after ranked routes.
 * @param catalogKeys - live catalog-group-id → card-key map from ProviderDirectory.catalogRoutes().
 */
export function sortCatalogGroups<T extends CatalogGroup>(
  groups: readonly T[],
  saved: readonly string[] = [],
  catalogKeys: Readonly<Record<string, string>> = {},
): T[] {
  if (saved.length === 0) return [...groups]
  const idByKey = new Map<string, string>()
  for (const [id, key] of Object.entries(catalogKeys)) idByKey.set(key, id)
  const ranked = applySavedOrder(
    groups.map(group => ownCatalogKey(catalogKeys, group.id)).filter((key): key is string => key !== undefined),
    saved,
  )
  const rank = new Map(ranked.flatMap((key, index) => {
    const route = idByKey.get(key)
    return route === undefined ? [] : [[route, index] as const]
  }))
  const known: T[] = []
  const unknown: T[] = []
  for (const group of groups) {
    if (rank.has(group.id)) known.push(group)
    else unknown.push(group)
  }
  known.sort((left, right) => (rank.get(left.id) ?? 0) - (rank.get(right.id) ?? 0))
  return [...known, ...unknown]
}
