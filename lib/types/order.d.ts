/** Shared LLM provider card order: settings keys, picker routes, and catalog sort. */
export declare const PROVIDERS_SECTION_ID = "providers";
export declare const PROVIDERS_ITEM_SLOT = "settings.provider.item";
export declare const PROVIDERS_LOCALE_NS = "settings.providers";
export declare const PROVIDERS_CONFIG_ID = "llm-providers-ui";
/** Display order for installed provider cards when the user has not saved one. */
export declare const PROVIDER_ITEM_ORDER: readonly ["llm-cursor", "llm-grok", "llm-codex", "llm-ollama", "llm-commandcode", "llm-opencode-go"];
export type ProviderItemKey = (typeof PROVIDER_ITEM_ORDER)[number];
/** settings.provider.item key to llm route id used by session.models / the picker. */
export declare const PROVIDER_ROUTES: Record<ProviderItemKey, string>;
export interface ProviderOrderSettings {
    order: string[];
    hiddenUsageProviders: string[];
    usageOrder: string[];
    showSidebarUsage: boolean;
}
/**
 * Merge a saved key list with the keys that are actually installed.
 * Saved keys that are not installed are dropped; installed keys missing from
 * the save append in PROVIDER_ITEM_ORDER, then leftover unknown keys.
 * Nothing registered yields an empty list (the settings empty state).
 */
export declare function applySavedOrder(registered: readonly string[], saved?: readonly string[]): string[];
export interface CatalogGroup {
    id: string;
}
/** Map an llm route id to its settings.provider.item key when known. */
export declare function providerKeyForRoute(route: string): ProviderItemKey | undefined;
/** Map a settings.provider.item key to its llm route id when known. */
export declare function providerRoute(key: string): string | undefined;
/**
 * Sort picker/catalog groups from declared directory routes.
 * With a saved card order, mapped providers follow that list; with none, groups keep catalog order.
 * Groups the live map does not know keep catalog order and append after ranked routes.
 * @param catalogKeys - live catalog-group-id → card-key map from ProviderDirectory.catalogRoutes().
 */
export declare function sortCatalogGroups<T extends CatalogGroup>(groups: readonly T[], saved?: readonly string[], catalogKeys?: Readonly<Record<string, string>>): T[];
//# sourceMappingURL=order.d.ts.map