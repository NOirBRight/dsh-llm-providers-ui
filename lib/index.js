import { PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS, PROVIDERS_SECTION_ID, PROVIDERS_SETTINGS_NS, PROVIDER_ITEM_ORDER, PROVIDER_ROUTES, applySavedOrder, decodeProviderOrder, providerRoute, sortCatalogGroups } from "./order.js";
import z from "@deepseek-ai/schemastery";
//#region lib/types/index.js
/**
* Host plugin: sole owner of the llm-providers settings namespace.
* Provider plugins register only their keyed card and llm route. This module
* keeps the shared provider-order utilities for dsh-model-switch and the Web picker.
* @module dsh-llm-providers-ui
*/
const name = "dsh-llm-providers-ui";
/** This owner can mount before the optional Settings service is available. */
const inject = [];
const OrderConfig = z.object({ order: z.array(String).default([]) });
const Config = z.object({});
/**
* Host plugin apply: sole writer of the llm-providers namespace.
* The registration rides the Host fiber, so unloading the owner drops the
* namespace, and reloading recreates it. Providers continue to work
* Host-side when the owner is absent; their llm routes remain registered.
* Duplicate registration fails loud; only one Host owner may be installed.
* @param ctx - Host Cordis context.
*/
function apply(ctx, _config = {}) {
	const install = (settings) => {
		settings.installSection(ctx, PROVIDERS_SETTINGS_NS, OrderConfig, { order: [] }, {
			setSource: () => void 0,
			onChange: () => void 0
		});
	};
	const settings = ctx.get("settings");
	if (settings !== void 0) install(settings);
	else ctx.inject(["settings"], (settingsCtx) => install(settingsCtx.settings));
}
//#endregion
export { Config, OrderConfig, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS, PROVIDERS_SECTION_ID, PROVIDERS_SETTINGS_NS, PROVIDER_ITEM_ORDER, PROVIDER_ROUTES, apply, applySavedOrder, decodeProviderOrder, inject, name, providerRoute, sortCatalogGroups };
