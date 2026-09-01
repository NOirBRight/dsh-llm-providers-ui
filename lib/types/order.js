/** Shared LLM provider card order: settings keys, picker routes, and catalog sort. */
export const PROVIDERS_SECTION_ID = 'providers';
export const PROVIDERS_ITEM_SLOT = 'settings.provider.item';
export const PROVIDERS_LOCALE_NS = 'settings.providers';
export const PROVIDERS_SETTINGS_NS = 'llm-providers';
/** Display order for installed provider cards when the user has not saved one. */
export const PROVIDER_ITEM_ORDER = [
    'llm-cursor',
    'llm-grok',
    'llm-codex',
    'llm-ollama',
    'llm-commandcode',
    'llm-opencode-go',
];
const KNOWN_KEYS = new Set(PROVIDER_ITEM_ORDER);
/** settings.provider.item key to llm route id used by session.models / the picker. */
export const PROVIDER_ROUTES = {
    'llm-cursor': 'cursor',
    'llm-grok': 'grok',
    'llm-codex': 'codex',
    'llm-ollama': 'ollama-cloud',
    'llm-commandcode': 'commandcode',
    'llm-opencode-go': 'opencode-go',
};
const ROUTE_TO_KEY = new Map(Object.entries(PROVIDER_ROUTES).map(([key, route]) => [route, key]));
/** Decode the llm-providers settings section. Unknown input becomes an empty order. */
export function decodeProviderOrder(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value))
        return { order: [] };
    const raw = value.order;
    if (!Array.isArray(raw))
        return { order: [] };
    return { order: raw.filter((entry) => typeof entry === 'string' && entry.length > 0) };
}
/**
 * Merge a saved key list with the keys that are actually installed.
 * Saved keys that are not installed are dropped; installed keys missing from
 * the save append in PROVIDER_ITEM_ORDER, then leftover unknown keys.
 * Nothing registered yields an empty list (the settings empty state).
 */
export function applySavedOrder(registered, saved = []) {
    const have = [...new Set(registered.filter(key => key.length > 0))];
    if (have.length === 0)
        return [];
    const installed = new Set(have);
    const preferredSaved = [...new Set(saved)].filter(key => installed.has(key));
    const preferred = new Set(preferredSaved);
    const rest = have.filter(key => !preferred.has(key));
    const known = PROVIDER_ITEM_ORDER.filter(key => rest.includes(key));
    const extra = rest.filter(key => !KNOWN_KEYS.has(key));
    return [...preferredSaved, ...known, ...extra];
}
/** Map a settings.provider.item key to its llm route id when known. */
export function providerRoute(key) {
    return PROVIDER_ROUTES[key];
}
/**
 * Sort picker/catalog groups: mapped providers follow saved card order,
 * groups the map does not know keep catalog order and append after.
 */
export function sortCatalogGroups(groups, saved = []) {
    const ranked = applySavedOrder(groups.map(group => ROUTE_TO_KEY.get(group.id)).filter((key) => key !== undefined), saved);
    const rank = new Map(ranked.flatMap((key, index) => {
        const route = providerRoute(key);
        return route === undefined ? [] : [[route, index]];
    }));
    const known = [];
    const unknown = [];
    for (const group of groups) {
        if (rank.has(group.id))
            known.push(group);
        else
            unknown.push(group);
    }
    known.sort((left, right) => (rank.get(left.id) ?? 0) - (rank.get(right.id) ?? 0));
    return [...known, ...unknown];
}
//# sourceMappingURL=order.js.map