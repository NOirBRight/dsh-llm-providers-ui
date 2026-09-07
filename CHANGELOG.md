# Changelog

## [0.1.10] - 2026-09-07

- Shared Provider headers, quota minis, role marks, and theme-adaptive vendor icons.
- Three complete compact quota rows with single-line status and unrestricted expanded details.
- Narrow settings layout and declaration consumers verified against the packaged public interfaces.

## [0.1.7] - 2026-09-05

### Changed

- Quieter Provider Usage tiles; independent usageOrder (drag in the sidebar filter); hover-only per-card refresh on fine pointers.

## [0.1.6] - 2026-09-04

### Added

- Sidebar Provider Usage: two-column remaining-quota minis, two-layer local-time detail with progress bars, 15-minute poll, last-good cache, per-card refresh, and visibility filters.

## [0.1.5] - 2026-09-03

### Changed

- DSH compatibility declarations cover the verified Alpha.4 and rc.1 runtimes.
- Unknown runtimes warn once and use the normal best-effort mount path; only reproduced failures may be blocklisted.


## 0.1.4

- Docs only: install commands point at the versioned 0.1.3 tarball (the unversioned URLs 404), new README.zh.md Chinese translation, and CI running pnpm check on push/PR. No code change from 0.1.3.

## 0.1.1

- Shared LLM Providers settings shell with left-grip drag reorder.
- `llm-providers.order` settings section owned by the providers-ui Host plugin.
- `sortCatalogGroups` so the chat picker follows the saved card order.
- Bundle Schemastery into the Web client so the Alpha.4 module table can materialize the plugin.
- Verify packed Web clients against the Alpha.4 platform module table instead of Node module resolution.
