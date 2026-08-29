/** Browser half of the shared LLM Providers shell. */

export { SortableList } from './SortableList.tsx'
export type { SortableListProps } from './SortableList.tsx'
export { ProvidersSection, bindProvidersSection } from './ProvidersSection.tsx'
export { ensureProviderSection } from './provider-section.ts'
export { installProvidersNavIcon } from './nav-icon.ts'
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
} from './provider-section.ts'
export type { CatalogGroup, ProviderItemKey, ProviderOrderSettings } from './provider-section.ts'
