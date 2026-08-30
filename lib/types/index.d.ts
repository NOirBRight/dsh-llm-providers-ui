/** Host half: shared llm-providers settings section (first writer wins). */
import z from '@deepseek-ai/schemastery';
export { PROVIDERS_SECTION_ID, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS, PROVIDERS_SETTINGS_NS, PROVIDER_ITEM_ORDER, PROVIDER_ROUTES, applySavedOrder, decodeProviderOrder, providerRoute, sortCatalogGroups, } from './order.ts';
export type { CatalogGroup, ProviderItemKey, ProviderOrderSettings } from './order.ts';
export declare const name = "dsh-llm-providers-ui";
/** Schema of the shared provider-order settings section. */
export interface OrderConfig {
    order: string[];
}
export declare const OrderConfig: z<OrderConfig>;
/**
 * Register llm-providers when missing. Duplicate registrations from a
 * second installed llm plugin are ignored; the first loaded fiber owns the
 * section until it unloads.
 * @param ctx - Cordis plugin context; uses public inject(['settings']).
 */
export declare function ensureProviderOrderSettings(ctx: {
    inject: Function;
}): void;
//# sourceMappingURL=index.d.ts.map