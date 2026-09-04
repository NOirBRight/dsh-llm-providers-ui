import { PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS, PROVIDERS_SECTION_ID, PROVIDERS_SETTINGS_NS, PROVIDER_ITEM_ORDER, PROVIDER_ROUTES, applySavedOrder, decodeProviderOrder, providerRoute, sortCatalogGroups } from "./order.js";
import { createRequire } from "node:module";
import z from "@deepseek-ai/schemastery";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
//#region lib/types/compatibility.js
/**
* Classify one runtime without treating the verified table as an allowlist.
* @param version - Resolved DSH runtime version.
* @param verified - Releases with direct compatibility evidence.
* @param blocklist - Versions excluded after reproduced failures.
* @returns The fail-open mount decision.
*/
function classifyDshRuntime(version, verified, blocklist = {}) {
	const reason = blocklist[version];
	if (typeof reason === "string" && reason.trim() !== "") return {
		kind: "blocked",
		reason
	};
	return verified.has(version) ? { kind: "verified" } : { kind: "unverified" };
}
/**
* Apply the fail-open decision and emit at most one visible warning.
* @param logger - Host logger receiving compatibility warnings.
* @param pluginName - Plugin identifier used in diagnostics.
* @param version - Resolved DSH runtime version.
* @param verified - Releases with direct compatibility evidence.
* @param blocklist - Versions excluded after reproduced failures.
* @returns Whether the host mount should continue.
*/
function shouldMountDshRuntime(logger, pluginName, version, verified, blocklist = {}) {
	const decision = classifyDshRuntime(version, verified, blocklist);
	if (decision.kind === "blocked") {
		logger.warn(`[${pluginName}] blocked on DSH ${version}: ${decision.reason}; see package.json#dsh.compatibility.blocklist`);
		return false;
	}
	if (decision.kind === "unverified") logger.warn(`[${pluginName}] best-effort on unverified runtime ${version}`);
	return true;
}
function readManifest() {
	try {
		return JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
	} catch {
		return {};
	}
}
function packageVersion(packageName) {
	try {
		const require = createRequire(import.meta.url);
		let directory = dirname(require.resolve(packageName));
		for (;;) {
			try {
				const manifest = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"));
				if (typeof manifest.version === "string" && manifest.version !== "") return manifest.version;
			} catch {}
			const parent = dirname(directory);
			if (parent === directory) return void 0;
			directory = parent;
		}
	} catch {
		return;
	}
}
/**
* Warn once for an unknown runtime while keeping the normal host mount path.
* @param logger - Host logger receiving compatibility warnings.
* @param pluginName - Plugin identifier used in diagnostics.
* @param candidates - DSH peer packages used to resolve the host version.
* @returns Whether the host mount should continue.
*/
function allowDshRuntime(logger, pluginName, candidates) {
	const version = process.env.DSH_VERSION?.trim() || candidates.map(packageVersion).find((value) => value !== void 0) || "unknown";
	const compatibility = readManifest().dsh?.compatibility;
	return shouldMountDshRuntime(logger, pluginName, version, new Set(Object.entries(compatibility?.dshReleases ?? {}).filter(([, status]) => status === "compatible" || status === "verified").map(([release]) => release)), compatibility?.blocklist);
}
//#endregion
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
const OrderConfig = z.object({
	order: z.array(String).default([]),
	hiddenUsageProviders: z.array(String).default([])
});
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
	if (!allowDshRuntime(ctx.logger, "dsh-llm-providers-ui", ["@deepseek-ai/dsh-settings"])) return;
	const install = (settings) => {
		settings.installSection(ctx, PROVIDERS_SETTINGS_NS, OrderConfig, {
			order: [],
			hiddenUsageProviders: []
		}, {
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
