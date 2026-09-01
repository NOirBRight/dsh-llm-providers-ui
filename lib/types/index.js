/**
 * Host plugin: sole owner of the llm-providers settings namespace.
 * Provider plugins register only their keyed card and llm route. This module
 * keeps the shared provider-order utilities for dsh-model-switch and the Web picker.
 * @module dsh-llm-providers-ui
 */
import z from '@deepseek-ai/schemastery';
import { settingsNamespace } from '@deepseek-ai/dsh-settings';
import { PROVIDERS_SETTINGS_NS } from './order.js';
export { PROVIDERS_SECTION_ID, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS, PROVIDERS_SETTINGS_NS, PROVIDER_ITEM_ORDER, PROVIDER_ROUTES, applySavedOrder, decodeProviderOrder, providerRoute, sortCatalogGroups, } from './order.js';
export const name = 'dsh-llm-providers-ui';
export const inject = ['settings'];
const NS = settingsNamespace(PROVIDERS_SETTINGS_NS);
export const OrderConfig = z.object({
    order: z.array(String).default([]),
});
export const Config = z.object({});
/**
 * Host plugin apply: sole writer of the llm-providers namespace.
 * The registration rides the Host fiber, so unloading the owner drops the
 * namespace, and reloading recreates it. Providers continue to work
 * Host-side when the owner is absent; their llm routes remain registered.
 * Duplicate registration fails loud; only one Host owner may be installed.
 * @param ctx - Host Cordis context.
 */
export function apply(ctx, _config = {}) {
    ctx.settings.register(NS, OrderConfig, { base: { order: [] } });
}
//# sourceMappingURL=index.js.map