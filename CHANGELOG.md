## v0.2.0

共享详情模板 0.2.0 —— 7 个 provider 插件的协调发布起点。

- 新增 `dsh-llm-providers-ui/provider-detail`：ProviderDetail 模板（身份 → 提示 → 账号 → 额度 → 模型 → 折叠高级设置 → 页脚 → 保存条）、`providerDetailCopy`（中英）、以及设置页下发卡片的 `ProviderItemSlotContext`（`mode`/`usage`/`accountState`/`onRefresh`/`copy`/`template`）。
- 目录契约扩展：`name`、`modelCount`、`detail: 'shared'`，以及 `nameOf`/`modelCountOf`/`detailOf`/`update`。
- 声明 `detail: 'shared'` 的卡片自己渲染详情：设置页不再运行 DOM 规范化、探针与插件样式覆盖。
- 模型行由模板渲染（固定字段列槽、排序只读、排序时收起、单层圆角），插件通过 `items` + `extra` 提供数据与私有字段。
- 高级设置、分区分隔线、草稿栏、移动端工具条与 token（圆角/内衬/复选框）按锁定原型对齐。
- 概览：窗口名统一（5 小时 / 每周 / 每月窗口），模型数由插件发布。
- **接口有破坏性变更**：插件必须使用 slot 上下文中的 `template`/`copy`，并在 `items`/`extra` 下提供模型行；旧版插件需同步升级（本版本与 7 个插件 0.2.x 一起发布）。

## v0.2.0

共享详情模板 0.2.0 —— 7 个 provider 插件的协调发布起点。

- 新增 `dsh-llm-providers-ui/provider-detail`：ProviderDetail 模板（身份 → 提示 → 账号 → 额度 → 模型 → 折叠高级设置 → 页脚 → 保存条）、`providerDetailCopy`（中英）、以及设置页下发卡片的 `ProviderItemSlotContext`（`mode`/`usage`/`accountState`/`onRefresh`/`copy`/`template`）。
- 目录契约扩展：`name`、`modelCount`、`detail: 'shared'`，以及 `nameOf`/`modelCountOf`/`detailOf`/`update`。
- 声明 `detail: 'shared'` 的卡片自己渲染详情：设置页不再运行 DOM 规范化、探针与插件样式覆盖。
- 模型行由模板渲染（固定字段列槽、排序只读、排序时收起、单层圆角），插件通过 `items` + `extra` 提供数据与私有字段。
- 高级设置、分区分隔线、草稿栏、移动端工具条与 token（圆角/内衬/复选框）按锁定原型对齐。
- 概览：窗口名统一（5 小时 / 每周 / 每月窗口），模型数由插件发布。
- **接口有破坏性变更**：插件必须使用 slot 上下文中的 `template`/`copy`，并在 `items`/`extra` 下提供模型行；旧版插件需同步升级（本版本与 7 个插件 0.2.x 一起发布）。

# Changelog

# v0.2.0

共享详情模板 0.2.0 —— 7 个 provider 插件的协调发布起点。

- 新增 `dsh-llm-providers-ui/provider-detail`：ProviderDetail 模板（身份 → 提示 → 账号 → 额度 → 模型 → 折叠高级设置 → 页脚 → 保存条）、`providerDetailCopy`（中英）、以及设置页下发卡片的 `ProviderItemSlotContext`（`mode`/`usage`/`accountState`/`onRefresh`/`copy`/`template`）。
- 目录契约扩展：`name`、`modelCount`、`detail: 'shared'`，以及 `nameOf`/`modelCountOf`/`detailOf`/`update`。
- 声明 `detail: 'shared'` 的卡片自己渲染详情：设置页不再运行 DOM 规范化、探针与插件样式覆盖。
- 模型行由模板渲染（固定字段列槽、排序只读、排序时收起、单层圆角），插件通过 `items` + `extra` 提供数据与私有字段。
- 高级设置、分区分隔线、草稿栏、移动端工具条与 token（圆角/内衬/复选框）按锁定原型对齐。
- 概览：窗口名统一（5 小时 / 每周 / 每月窗口），模型数由插件发布。
- **接口有破坏性变更**：插件必须使用 slot 上下文中的 `template`/`copy`，并在 `items`/`extra` 下提供模型行；旧版插件需同步升级（本版本与 7 个插件 0.2.x 一起发布）。


## [0.1.12] - 2026-09-10

- Shared model catalog editor and picker (`./model-catalog`). Generic patches keep `contextWindow`. Optional input/output fields and tri-state capabilities stay caller-opted.

## [0.1.11] - 2026-09-09

- Keep last-good sidebar quota visible across a configure that temporarily has no readers.

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
