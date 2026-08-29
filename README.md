# dsh-llm-providers-ui

Shared **library** (not a Cordis plugin) for unofficial LLM provider plugins:

- `ensureProviderOrderSettings(ctx)` — host first-writer registers the `llm-providers` settings section (`{ order: string[] }`).
- `ensureProviderSection(ctx)` — browser first-writer registers Settings → LLM Providers and drag-sorts keyed `settings.provider.item` cards.
- `applySavedOrder` / `sortCatalogGroups` — one saved key list drives both the settings page and the chat picker.

Each llm plugin calls both helpers and injects its own card. Installing one plugin is enough to show the page.

The chat picker (`dsh-model-switch`) imports `sortCatalogGroups` and re-reads `llm-providers.order`.
