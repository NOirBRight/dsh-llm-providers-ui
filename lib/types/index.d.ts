/**
 * Host plugin: owner of the LLM Providers Loader Config entry.
 * Provider plugins register only their keyed card and llm route. This module
 * keeps the shared provider-order utilities for dsh-model-switch and the Web picker.
 * @module dsh-llm-providers-ui
 */
import z from '@deepseek-ai/schemastery';
import type { Context, Volatile } from '@deepseek-ai/cordis';
export { PROVIDERS_SECTION_ID, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS, PROVIDERS_CONFIG_ID, PROVIDER_ITEM_ORDER, PROVIDER_ROUTES, applySavedOrder, providerRoute, sortCatalogGroups, } from './order.js';
export type { CatalogGroup, ProviderItemKey, ProviderOrderSettings } from './order.js';
export declare const name = "dsh-llm-providers-ui";
/** Settings is optional; this owner only disables its generated page when present. */
export declare const inject: string[];
/** Live provider order and visibility fields exposed through this entry's ConfigForm. */
export interface Config {
    order: Volatile<string[]>;
    hiddenUsageProviders: Volatile<string[]>;
    usageOrder: Volatile<string[]>;
    showSidebarUsage: Volatile<boolean>;
}
export declare const Config: z<Schemastery.ObjectS<NoInfer<{
    order: z<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    hiddenUsageProviders: z<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    usageOrder: z<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    showSidebarUsage: z<boolean, boolean, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    order: z<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    hiddenUsageProviders: z<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    usageOrder: z<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    showSidebarUsage: z<boolean, boolean, "volatile-defined">;
}>>, "plain">;
/**
 * Host plugin: Loader Config owns provider order and visibility. Settings only
 * disables the generic page because the client contributes the custom surface.
 * @param ctx - Host Cordis context.
 */
export declare function apply(ctx: Context, _config?: Config): void;
//# sourceMappingURL=index.d.ts.map