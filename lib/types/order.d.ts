/** Shared LLM provider card order: settings keys, picker routes, and catalog sort. */
export declare const PROVIDERS_SECTION_ID = "providers";
export declare const PROVIDERS_ITEM_SLOT = "settings.provider.item";
export declare const PROVIDERS_LOCALE_NS = "settings.providers";
export declare const PROVIDERS_SETTINGS_NS = "llm-providers";
/** Display order for installed provider cards when the user has not saved one. */
export declare const PROVIDER_ITEM_ORDER: readonly ["llm-cursor", "llm-grok", "llm-codex", "llm-ollama", "llm-commandcode", "llm-opencode-go"];
export type ProviderItemKey = (typeof PROVIDER_ITEM_ORDER)[number];
/** settings.provider.item key to llm route id used by session.models / the picker. */
export declare const PROVIDER_ROUTES: Record<ProviderItemKey, string>;
export interface ProviderOrderSettings {
    order: string[];
}
/** Decode the llm-providers settings section. Unknown input becomes an empty order. */
export declare function decodeProviderOrder(value: unknown): ProviderOrderSettings;
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
/** Map a settings.provider.item key to its llm route id when known. */
export declare function providerRoute(key: string): string | undefined;
/**
 * Sort picker/catalog groups: mapped providers follow saved card order,
 * groups the map does not know keep catalog order and append after.
 */
export declare function sortCatalogGroups<T extends CatalogGroup>(groups: readonly T[], saved?: readonly string[]): T[];
//# sourceMappingURL=order.d.ts.map