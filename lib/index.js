import { PROVIDERS_CONFIG_ID, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS, PROVIDERS_SECTION_ID, PROVIDER_ITEM_ORDER, PROVIDER_ROUTES, applySavedOrder, providerRoute, sortCatalogGroups } from "./order.js";
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
* Host plugin: owner of the LLM Providers Loader Config entry.
* Provider plugins register only their keyed card and llm route. This module
* keeps the shared provider-order utilities for dsh-model-switch and the Web picker.
* @module dsh-llm-providers-ui
*/
const name = "dsh-llm-providers-ui";
/** Settings is optional; this owner only disables its generated page when present. */
const inject = [];
const Config = z.object({
	order: z.array(String).default([]).volatile(),
	hiddenUsageProviders: z.array(String).default([]).volatile(),
	usageOrder: z.array(String).default([]).volatile(),
	showSidebarUsage: z.boolean().default(true).volatile()
});
/**
* Host plugin: Loader Config owns provider order and visibility. Settings only
* disables the generic page because the client contributes the custom surface.
* @param ctx - Host Cordis context.
*/
function apply(ctx, _config) {
	if (!allowDshRuntime(ctx.logger, "dsh-llm-providers-ui", ["@deepseek-ai/dsh-settings"])) return;
	const settings = ctx.get("settings");
	if (settings !== void 0) ctx.effect(() => settings.configure({ auto: false }, ctx.fiber));
	else ctx.inject(["settings"], (settingsCtx) => {
		settingsCtx.effect(() => settingsCtx.settings.configure({ auto: false }, ctx.fiber));
	});
}
//#endregion
export { Config, PROVIDERS_CONFIG_ID, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS, PROVIDERS_SECTION_ID, PROVIDER_ITEM_ORDER, PROVIDER_ROUTES, apply, applySavedOrder, inject, name, providerRoute, sortCatalogGroups };
