# dsh-llm-providers-ui

Shared **library** (not a Cordis plugin) for unofficial LLM provider plugins.

- `ensureProviderOrderSettings(ctx)` — host first-writer registers the public `settings.register` namespace `llm-providers` (`{ order: string[] }`).
- `ensureProviderSection(ctx)` — browser first-writer registers Settings → LLM Providers and drag-sorts keyed `settings.provider.item` cards. Optional `settingsScope` is read with Cordis `ctx.get('settingsScope')`.
- `applySavedOrder` / `sortCatalogGroups` — one saved key list drives both the settings page and the chat picker.

Each llm plugin calls both helpers and injects its own card. Installing one plugin is enough to show the page.

## Consumer contract

`./client` exports TypeScript source. It is **not** a web module-table row. Every dynamic plugin that imports it must `alwaysBundle` `dsh-llm-providers-ui` and `dsh-llm-providers-ui/client` in its client tsdown config so the factory does not `require()` a missing table entry.

Until this package is published to npm, lab checkouts use `link:../dsh-llm-providers-ui`. A market release pins `dsh-llm-providers-ui` to a semver and ships the bundled `lib/client.js` of each llm plugin.

The chat picker (`dsh-model-switch`) imports `sortCatalogGroups` and re-reads `llm-providers.order`.
