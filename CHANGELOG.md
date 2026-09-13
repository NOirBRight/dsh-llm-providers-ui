## v0.2.8

Model row chevrons follow the `expanded` list only. `allOpen` no longer force-opens every row, so adding a model or clicking Expand all still lets a row collapse.

DSH Host packages are no longer version-locked. `@deepseek-ai/dsh-*` peers are `*` and optional; unknown Hosts warn once and still mount. Cordis stays `>=4.0.2 <5.0.0`. Compile-target `devDependencies` remain `0.1.5-rc.1`.

## v0.2.7

侧边栏/详情的额度窗口按 5 小时 → 周 → 月显示。

解码器在 0.2.6 已按这个顺序产出，但 Provider Usage 把解码后的 windows 缓存在 localStorage，刷新页面仍用旧顺序。读缓存和写入缓存时都 `orderUsageWindows`，旧缓存也会重排。

## v0.2.6

Command Code 额度窗口顺序改为 5 小时 → 周 → 月（月在最后），侧边栏 Provider Usage 与详情页共用同一 `windows` 数组。

## v0.2.5

提交重建后的 `lib/usage-readers.js`。

v0.2.4 源码已把 `plan.currentPeriodEnd` 接到月度 `resetsAt`，但发布脚本在提交之后才 build，git 里的 `lib/` 仍是旧解码器。本次把产物一并纳入版本，和源码一致。

## v0.2.4

Command Code 月度额度补上重置时间。

官方 Studio 的 MONTHLY LIMIT「Resets on Sep 26」来自订阅的 `currentPeriodEnd`（计费周期结束），不是 `windowLimits.monthly.resetAt`。解码月度窗口时之前只算了剩余百分比，没带这个时间戳，详情页就落到「重置时间未提供」。

- `decodeCommandCodeUsage` 把 `plan.currentPeriodEnd` 接到月度窗口的 `resetsAt`。
- 5 小时窗口在无用量时官方本身就不给 reset（文案是 "No usage in this window yet"）；周窗口本来就会读 `windowLimits.weekly.resetAt`，这次用例一并锁住。

## v0.2.3

修复侧边栏 Provider Usage 面板的 Provider 图标被裁切与大小不一。

- 根因：`.pu-mark` 是 16×16 且 `overflow:hidden`，而 `.pu-logo` 声明 18×18 → 每个图标被裁掉 2px。现在容器与图标同尺寸，且图标按容器 100% 渲染，不再裁剪。
- 大小不一：各品牌 mark 的 viewBox 与实际墨迹范围不一致（例如 Antigravity 的 169×148 带大片留白、Ollama 18.2×24 偏窄、OpenCode Go 256×320 偏高），方形框内按 `meet` 缩放后视觉重量差别明显。现在每个 mark 的 viewBox 都归一到**实测墨迹框**（含 6% 内衬），七个品牌在侧边栏里视觉尺寸一致。
- 覆盖 `tests/provider-marks.spec.tsx` 的对应断言。
- 只影响共享包（侧边栏面板不随插件打包），插件无需重建。

## v0.2.2

统一详情页与概览的额度窗口文案。

- 新增共享的 `windowNameOf(label, names)`（`provider-section.ts`）：把 `Monthly` / `Cursor Models · Monthly` / `M` 这类标签统一渲染成本地化的完整短语（中文「每月窗口」、英文 "Monthly window"）。概览行与详情额度块现在调用**同一个函数**，不再各写一份。
- `ProviderDetailCopy` 增加 `windowHour` / `windowWeek` / `windowMonth`，插件无需改动即可获得统一文案（插件传入的 `copy` 由设置页构造）。
- 详情额度块的重置说明行也使用同一短语。
- 测试：详情断言改为校验规范化文案；共享文案表覆盖概览与详情两条路径。

## v0.2.1

修复 0.2.0 的视觉回归，并补上样式表回归测试。

- **恢复分区分隔线**：额度区与模型区顶部的 1px 分隔线 + 16px 内衬在 0.2.0 中被一次子串清理误删（`data-provider-model` 的过滤把 `data-provider-models` 的规则一并删掉），现已恢复。
- **新增 `tests/settings-c-css.spec.ts`**：断言分区分隔线、草稿栏面板样式、单行工具栏与「不再出现旧 `[data-provider-model]` 钩子 / `.c-probe`」，避免同类误删再次发生。
- 详情布局与 0.2.0 一致：共享模板、槽位下发、`items` + `extra` 行接口、高级设置折叠区块、移动端单行工具栏。

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
