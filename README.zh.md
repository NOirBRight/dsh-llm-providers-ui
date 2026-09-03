# dsh-llm-providers-ui

[English](README.md) | 中文

DeepSeek Harness **LLM Providers** 设置页的挂载 owner。

兼容性：本版本要求 DeepSeek Harness `0.1.2-alpha.4` 与 `@deepseek-ai/cordis@4.0.2`；与 Alpha.1–Alpha.3 不兼容。仍使用旧 runtime 的用户请保留为该 runtime 构建的最后一个插件 tag。

## 兼容性

已验证运行时是 DeepSeek Harness `0.1.2-alpha.4` 与 `0.1.2-rc.1`（Cordis `4.0.2`）；这份记录只是证据，不是 allowlist。

未知的新版本会先打一条 warning，再按正常挂载路径 best-effort 尝试，不会因为未验证而跳过。

只有复现过的故障才会加入 blocklist；受影响版本、原因和证据见[兼容性记录](package.json)。


## Ownership

- Host 拥有 `llm-providers` 设置命名空间 `{ order: string[] }`（唯一写者）。卸载 owner 会删除该命名空间；重装后重建。各 provider 的 `llm` 路由相互独立，因此缺 owner 时 provider 在 Host 侧照常工作。
- Web（client）拥有 `settings.section` 的 `id: providers`（order 12）及子项 `settings.provider.item`（keyed、root）、locale `settings.providers` 和导航图标。section 与子项声明只在 Host 侧 `llm-providers` scope 就绪后挂载；provider 插件只通过 `settings.provider.item` 贡献自己 keyed 的卡片。

加载顺序无关紧要。卸载某个 provider 只移除它的卡片。卸载/重装 owner 不会损坏 provider 的 Host 服务；owner 回来后卡片经公共 slot 生命周期重新出现。

## 缺失 owner

- 无 owner 的 Headless/Host：模型路由照常工作。
- 无 owner 的 Web：Providers 页及其卡片被省略；provider Host 路由保持在线。开发期间浏览器控制台会打一条 owner-unavailable 警告；owner 就绪后，另一条 `settings.section` 警告用于标识缺失的 Web 设置壳。

## 导航图标

导航行上的 14px 地球 glyph 是隔离的临时适配器（`src/client/nav-icon.ts`）。DSH 的 `settings.section` 没有 icon 字段，因此该文件经 `MutationObserver` + rAF 给 DOM 打补丁。它幂等且只归这里所有——不要复制到 provider 插件里。DSH 暴露公共图标 seam 后替换该文件。

## Exports

- `dsh-llm-providers-ui`（Host）：`applySavedOrder`、`decodeProviderOrder`、`sortCatalogGroups`、`PROVIDER_ITEM_ORDER` 等。构建产物：`lib/index.js` + `lib/types`。
- `dsh-llm-providers-ui/order`（纯函数，ESM）：同一套 order helper，供 `dsh-model-switch` 与 provider picker 使用的稳定构建产物。构建产物：`lib/order.js` + `lib/types/order.d.ts`。provider 插件 `alwaysBundle` 该构建产物；不要从 `src` import。
- `dsh-llm-providers-ui/sortable`（client 工具，ESM）：`SortableList` 拖拽排序实现。构建产物：`lib/sortable.js` + `lib/types/sortable.d.ts`。唯一实现在 `src/client/SortableList.tsx`，此处 re-export；provider 插件 `alwaysBundle` 该构建文件。不要从 `src/client/SortableList.tsx` import。
- `dsh-llm-providers-ui/client`（Web）：owner 插件接线。构建产物：`lib/client.js`（ModuleLoader CJS）+ `lib/types/client`。不要 import `./src/*`。

本包只暴露上面列出的构建后 `lib/` 入口；调用方应 import 这些包导出，而非源码路径。

## 安装

本包是必须显式安装的 bundle。在 DSH 第三方 bundle 支持传递自动挂载之前，profile 必须把 `dsh-llm-providers-ui` 和 provider 插件一起列出（例如 `~/.dsh-lab/profiles/web/package.json` 的 `dsh.profile.bundles` 与 `dependencies`）。与 provider 之间没有严格的加载顺序要求。见 `cordis.patch.yml`。

## Consumer contract

provider 插件只 import 自己的设置/模型契约，并以自己的 `settingsNs` key 在 `settings.provider.item` 下注册卡片。
`dsh-model-switch` 经构建产物 `dsh-llm-providers-ui/order` 复用 `sortCatalogGroups`。

在 npm 发布之前，lab checkout 在开发时可用 `link:../dsh-llm-providers-ui`，但工作区 `package.json` 不得提交 `link:` spec。

## Release 安装（Latest）

共享的 LLM Providers 设置页、导航、卡片排序与 picker 排序 owner。release 产物面向 DeepSeek Harness 0.1.2-alpha.4，只含构建后的 Host/Client 文件；没有 sibling 仓库源码、工作站路径、link: 或 workspace: 依赖。

Latest 安装（URL 永不带版本号）：

~~~sh
dsh plugin --profile web add --force \
  https://github.com/NOirBRight/dsh-llm-providers-ui/releases/latest/download/dsh-llm-providers-ui-0.1.5.tgz
~~~

固定版本安装：

~~~sh
dsh plugin --profile web add --force \
  https://github.com/NOirBRight/dsh-llm-providers-ui/releases/download/v0.1.5/dsh-llm-providers-ui-0.1.5.tgz
~~~

更新、卸载与验证：

~~~sh
# 更新到最新 Release
dsh plugin --profile web add --force \
  https://github.com/NOirBRight/dsh-llm-providers-ui/releases/latest/download/dsh-llm-providers-ui-0.1.5.tgz
# 验证加载与版本
dsh plugin --profile web list
dsh plugin --profile web doctor
# 只卸载本插件
dsh plugin --profile web remove dsh-llm-providers-ui
~~~

配置：Web UI 插件用 Settings 里的插件区，纯 Host 插件用 profile 的 dsh.profile.bundles 条目。从本 README 的最小 YAML/JSON 示例起步，凭据/后端地址显式给出。

回滚：重跑上面的固定 v0.1.3 命令（或之前记录的 Alpha.4 tarball），核对 profile 列表，然后重启一次 Web 服务。检查 journalctl --user -u dsh-web.service 与 dsh plugin --profile web doctor；绝不在生产 profile 里放源码 checkout。

Release 与完整性随 Alpha.4 迁移 release 一起发布。
