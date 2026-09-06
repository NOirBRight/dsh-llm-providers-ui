# dsh-llm-providers-ui

English | [中文](README.zh.md)

Mounted owner of the **LLM Providers** Settings page for DeepSeek Harness.

## Compatibility

Verified runtimes are DeepSeek Harness `0.1.2-alpha.4` and `0.1.2-rc.1` on Cordis `4.0.2`; this record is evidence, not an allowlist.

Unknown newer runtimes are attempted on a best-effort basis after one warning, and the plugin keeps its normal mount path.

A reproduced failure is blocklisted only afterward; see the [compatibility records](package.json) for the affected version, reason, and evidence.


## Ownership

- Host owns the `llm-providers` settings namespace `{ order: string[] }` (sole writer). Unloading the owner drops the namespace; reloading recreates it. Providers continue to work Host-side when the owner is absent because their `llm` routes are independent.
- Web (client) owns `settings.section` `id: providers` (order 12) with child `settings.provider.item` (keyed, root), locale `settings.providers`, and the nav-icon. The section and child declaration mount only while the Host-owned `llm-providers` scope is ready; provider plugins contribute only their keyed card via `settings.provider.item`.

Load order does not matter. Unloading a provider removes only its card. Unloading/reloading the owner does not corrupt provider Host services; cards reappear via the public slot lifecycle when the owner returns.

## Missing owner

- Headless/Host without the owner: model routing still works.
- Web without the owner: the Providers page and its cards are omitted; provider Host routes stay live. During development, the browser console emits one owner-unavailable warning; after the owner is ready, a separate `settings.section` warning identifies a missing Web settings shell.

## Navigation icon

The 14px globe glyph on the nav row is an isolated temporary adapter (`src/client/nav-icon.ts`). DSH's `settings.section` has no icon field, so this file patches the DOM via `MutationObserver` + rAF. It is idempotent and owned only here — do not duplicate it into provider plugins. When DSH exposes a public icon seam, replace this file.

## Exports

- `dsh-llm-providers-ui` (Host): `applySavedOrder`, `decodeProviderOrder`, `sortCatalogGroups`, `PROVIDER_ITEM_ORDER`, etc. Built artifact: `lib/index.js` + `lib/types`.
- `dsh-llm-providers-ui/order` (pure, ESM): same order helpers, stable built utility for `dsh-model-switch` and provider pickers. Built artifact: `lib/order.js` + `lib/types/order.d.ts`. Provider plugins `alwaysBundle` this built export; do not import from `src`.
- `dsh-llm-providers-ui/sortable` (client utility, ESM): `SortableList` drag-reorder implementation. Built artifact: `lib/sortable.js` + `lib/types/sortable.d.ts`. Single implementation lives in `src/client/SortableList.tsx` and is re-exported here; provider plugins `alwaysBundle` the built file. Do not import from `src/client/SortableList.tsx`.
- `dsh-llm-providers-ui/provider-ui` (client utility, ESM): shared `ProviderCardHeader`, `ProviderQuotaMeter`, `normalizeQuotaRemaining`, and `providerUiCss`. Built artifact: `lib/provider-ui.js` + `lib/types/provider-ui.d.ts`. Single implementation lives in `src/client/provider-ui.tsx` and is re-exported here; provider plugins `alwaysBundle` the built file. Do not import from `src/client/provider-ui.tsx`.
- `dsh-llm-providers-ui/client` (Web): owner plugin wiring and the `providerDirectory` Cordis service declaration. Built artifact: `lib/client.js` (ModuleLoader CJS) + `lib/types/client`; it exports only the plugin entrypoints. Do not import `./src/*`.
- `dsh-llm-providers-ui/usage-readers` (pure, ESM): `ProviderUsageReader` types and vendor `create*UsageReader` factories for provider client bundles. Built artifact: `lib/usage-readers.js` + `lib/types/usage-readers.d.ts`. Provider plugins `alwaysBundle` this export.

The package exposes only the built `lib/` entrypoints listed above; consumers should import those package exports rather than source paths.

## Installation

This package is a bundle that must be installed explicitly. Until DSH's third-party bundle supports transitive auto-mount, the profile must list `dsh-llm-providers-ui` alongside the provider plugins (e.g. in `~/.dsh-lab/profiles/web/package.json` `dsh.profile.bundles` and `dependencies`). No strict load order with providers is required. See `cordis.patch.yml`.

## Consumer contract

Provider plugins register their card under `settings.provider.item` with their `settingsNs` key and register `{ key, role, header, usage }` on `ctx.providerDirectory` inside an effect. The returned disposer owns the registration. Usage-enabled providers import their reader factory from `dsh-llm-providers-ui/usage-readers`. Unregistered cards keep the LLM badge and do not receive a Provider Usage tile.
Migrated cards render the shared header from `dsh-llm-providers-ui/provider-ui` (`ProviderCardHeader` with `role`, caller `status`, and headline `quota`; `title`/`mark`/`summary`/`open`/`unsaved` keep the legacy codex layout), mark their root `li[data-provider-card][data-provider-role]`, their header button `data-provider-card-header`, and their body `data-provider-body`, include one `<style>{providerUiCss}</style>`, and declare `header: 'shared'` so the shell drops its fallback badge. Missing quota renders no meter, never a zero bar; `normalizeQuotaRemaining` keeps precision and reports NaN/Infinity/out-of-range as unavailable.
Provider plugins import directory and slot types from `dsh-llm-providers-ui/client` with `import type {}` and must not duplicate the module augmentations locally. After sign-out or account switch, providers call `ctx.providerDirectory.invalidateUsage(key)` so the sidebar drops the cached quota and refetches; transient read errors still show the last good windows as stale.
`dsh-model-switch` reuses `sortCatalogGroups` via the built `dsh-llm-providers-ui/order` export.

Until this package is published to npm, lab checkouts may use `link:../dsh-llm-providers-ui` in dev, but workspace `package.json` must not commit `link:` specs.

## Release installation (Latest)

Shared LLM Providers settings page, navigation, card order, and picker sort owner. The release artifact targets DeepSeek Harness 0.1.2-alpha.4 and contains built Host/Client files only; it has no sibling-repository source, workstation path, link:, or workspace: dependency.

Latest installation (the URL never contains a version):

~~~sh
dsh plugin --profile web add --force \
  https://github.com/NOirBRight/dsh-llm-providers-ui/releases/latest/download/dsh-llm-providers-ui-0.1.7.tgz
~~~

Fixed-version installation:

~~~sh
dsh plugin --profile web add --force \
  https://github.com/NOirBRight/dsh-llm-providers-ui/releases/download/v0.1.7/dsh-llm-providers-ui-0.1.7.tgz
~~~

Update, uninstall, and verify:

~~~sh
# Update to the latest Release
dsh plugin --profile web add --force \
  https://github.com/NOirBRight/dsh-llm-providers-ui/releases/latest/download/dsh-llm-providers-ui-0.1.7.tgz
# Verify the loaded version
dsh plugin --profile web list
dsh plugin --profile web doctor
# Uninstall only this plugin
dsh plugin --profile web remove dsh-llm-providers-ui
~~~

Configuration: use the plugin section in Settings for Web UI plugins, or the profile dsh.profile.bundles entry for Host-only plugins. Start with this README's minimal YAML/JSON example and provide credentials/backend addresses explicitly.

Rollback: rerun the fixed v0.1.3 command (or the previously recorded Alpha.4 tarball), verify the profile list, then restart the Web service once. Inspect journalctl --user -u dsh-web.service and dsh plugin --profile web doctor; never put a source checkout in the production profile.

Release and integrity will be published with the Alpha.4 migration release.

## Live lab UI check

With an isolated Chrome exposing CDP on port 9229 and authenticated to the existing 3082 lab, run `node scripts/check-lab-settings.mjs`. The check covers seven real Provider cards and their brand/role icons at 1280, 390 and 320 pixels in light/dark themes, including expanded Antigravity. It restores the prior theme, does not edit Provider credentials or configuration, and writes screenshots to `/tmp/lab-*.png`. The script does not start a replacement application server.
