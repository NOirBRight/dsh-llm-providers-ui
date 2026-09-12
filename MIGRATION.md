# 插件迁移配方（共享 detail 模板）

目标：插件不再自绘详情，改由 `dsh-llm-providers-ui/provider-detail` 渲染；迁移后删除设置页里的 DOM 补丁路径。

## 1. 声明所有权

在插件注册 Provider Directory 的地方加上 `detail: 'shared'` 与 `name`（有模型数就加 `modelCount`）：

```ts
directory.register({
  key: GROK_SETTINGS_NAMESPACE,
  name: 'Grok',
  role: 'llm',
  header: 'shared',
  detail: 'shared',
  usage: createGrokUsageReader(),
  modelCount: () => snapshot.value?.models.length ?? 0,
})
```

设置页据此：详情只渲染面包屑 + 你的卡片，不再运行 `normalizeDetail`、不再自绘额度区。

## 2. 读取 slot 上下文

卡片会收到类型为 `ProviderItemSlotContext` 的额外 props（旧卡片不读也不受影响）：

```ts
import { ProviderDetail, providerDetailCopy, type ProviderItemSlotContext } from 'dsh-llm-providers-ui/provider-detail'

export function DeviceCard(props: PropsRuntime<'settings.provider.item'> & DeviceFace & Partial<ProviderItemSlotContext>) {
  if (props.mode === 'detail') return <ProviderDetail copy={providerDetailCopy[localeOf(props)]} ... />
  return <legacy collapsed card>
}
```

`mode: 'overview'` 时保持现有折叠卡片不变；`mode: 'detail'` 时渲染共享模板。

## 3. 传什么给模板

| 模板字段 | 来源 |
|---|---|
| `name` / `role` / `mark` | 插件自己的品牌与角色（agent 型传 `role: 'agent'`） |
| `notice` | 插件现有的说明或风险提示文案 |
| `account` | 业务状态：`state` 用目录里发布的状态；`label` 账号标识（**不要放密钥**）；`meta` 说明行；`actions` 登录/退出等按钮；`body` API Key 输入等额外行 |
| `quota` | **只用** `props.usage`（共享快照）+ `onRefresh`（详情才有）；不要再自己发额度请求 |
| `models` | `count`、`allOpen`/`onToggleAll`、`sorting`/`onToggleSorting`/`sortDisabled`、`onChooseFromAccount`/`chooseDisabled`、`items`（行数据：`rowId`/`id`/`name`）、`expanded`/`onPatch`/`onRemove`/`onToggle`/`onReorder`/`onAdd`，以及 `extra`（该行的插件私有字段）。模板自己渲染行卡片与「添加模型」按钮，插件不再传 JSX |
| `advanced` | 你现有的能力/工具开关 JSX（模板会放进默认关闭的折叠区） |
| `footer` | 版本/来源行（可选） |
| `draft` | 保存/放弃条（仅在有草稿时渲染） |

额度区不再由插件渲染：删除插件里的 `UsageHeader`/`UsageBar`/`UsageSkeleton` 与详情挂载时的额度请求；侧栏与总览的额度由共享 store 提供。

## 4. 迁移后要删的插件代码

- 详情里的额度区块、`rememberHeadlineQuota` 等 headline 写入（共享 store 负责缓存）；
- `ProviderCardHeader` 的额度/状态参数（折叠卡片按需要保留 header）；
- 插件自己的模型标题栏与三个按钮（改用模板的 `models` 字段）；
- 自绘的分区间距与图标。

## 4b. 打包注意（否则线上直接加载失败）

插件把共享 UI 打进自己的 bundle。新增子路径后，必须在插件 `tsdown.config.ts` 的 `alwaysBundle` 里放行，否则运行时会出现：

```
client-modules: require("dsh-llm-providers-ui/provider-detail") missed the module table
```

```ts
alwaysBundle: id => id === 'dsh-llm-providers-ui/provider-detail' || id.startsWith('dsh-llm-providers-ui/provider-detail/'),
```

另外：lab 里用 `file:` 预览 tarball 时，**必须换文件名**（`-preview.1` → `-preview.2`），否则 pnpm 认为 spec 未变而沿用旧包。

即使换了文件名，`pnpm add` / `pnpm install --force` 也可能因为 store 硬链接而不覆盖 `node_modules/` 里的旧文件（判断方法：`ls -l node_modules/<pkg>/lib/client.js` 的 mtime 没变，或与 tarball 内容哈希不一致）。此时按 tarball 解开后直接覆盖对应文件，再重启服务：

```bash
cd /tmp && rm -rf tgzfix && mkdir tgzfix && cd tgzfix
tar -xzf <preview>.tgz
cp -f package/lib/client.js /home/noirbright/.dsh-lab/profiles/web/node_modules/<pkg>/lib/client.js
systemctl --user restart dsh-lab.service
```

## 5. 验收（每个插件都要过）

1. 该仓库 `pnpm test` / `build` 全绿；
2. 详情页自动额度请求为 **0**（切换详情不额外发 `/usage/read`）；
3. 手动刷新只发一次该 provider 的请求；
4. 详情顺序与原型一致：身份 → 提示 → 账号 → 额度 → 模型 → 折叠的高级设置 → 页脚 → 保存条；
5. 账号操作、刷新、模型三按钮、保存按钮靠右；手动添加模型在列表下方左侧；
6. 高级设置默认关闭，用户展开后不被重绘关回去；
7. 零模型 provider（Codex）不出现闪烁与重复按钮。


## 7. 迁移经验（做完 7 个插件后总结）

### 顺序与粒度
- **先做一个插件到「你自己满意」，再批量**：第一个（Cursor）定下的接口形状被后面 6 个复用，省掉 6 轮返工。
- **先切接口，再谈样式**：`items` + `extra` 定下来之前改样式都是白改。

### 接口设计（踩过的坑）
1. **行渲染必须在模板里**：插件各画一套行 → 布局/交互永远不齐（Antigravity 用的是共享编辑器、OpenCode Go 与 CommandCode 又各自不同）。模板给 `items`（数据）+ `extra`（插件私有字段），插件不给 markup。
2. **CSS 与模板代码都要由页面下发**：先做 CSS 抽离（页面注入样式表），再做组件抽离（slot 上下文传 `template`），否则每改一处都要重建 7 个包。
3. **模板组件通过 slot 上下文传**（`props.template`），不要走 window 全局：页面本来就在传 `copy`/`usage`/`onRefresh`，多一个组件引用不需要新机制，也保住类型。
4. **`mark` 也要页面/插件显式传**：模板画不出品牌图标。

### 展开区（provider 私有字段）
5. **固定列槽，不要自动排布**：`grid-template-columns:minmax(0,200px) max-content minmax(0,200px)`。用 `1fr`/`auto-fit` 时，某个字段缺失会让其它字段位置漂移（用户一眼就能看出来）。
6. **复选框列按内容定宽 + `flex-wrap:nowrap`**，否则两个勾选会被挤成两行、并与输入框失去对齐。
7. **对齐要用「中线一致」验证**，不是「容器 top 一致」：`inputMid == checksMid`。

### 交互一致性
8. **排序态要只读 + 收起展开行**，并保持按钮宽度稳定（文案长短切换会抖，用 `min-width` 或短文案）。
9. **`SortableList` 的 `chrome` 模式**：调用方自己画卡片时必须用 `chrome="bare"`，否则行外壳与卡片各画一层边框/圆角，拖动幽灵还会比行更宽。
10. **「全部展开」要真的展开行**：模板里 `expanded = !sorting && (allOpen || expanded.includes(rowId))`，不要只切旧的 catalog 状态。

### 设计 token
11. **从锁定原型里抓真实 token**（svg path、圆角、内衬、`accent-color`），不要凭印象：输入框 7px/`7px 9px`/34h、按钮 9px/`6px 12px`、复选框 15px + `accent-color:var(--c-ink)`、字号 12px。
12. **插件旧 CSS 会污染模板行**：模板行不要再带插件的旧钩子属性（如 `data-provider-model`），否则插件样式表会命中它（`display:flex` 把网格打乱）。

### 流程与事故预防
13. **所有命令显式传工作目录**：我因为漏写 `cd` 把用户 main 仓库里未提交的改动误提交了一次（`git add -A`），用 `reset --soft HEAD~1 && git reset` 安全回滚；事后审计了 8 个 main 仓库的 HEAD。
14. **`pnpm install` 对同名 tarball 不可靠**：换文件名（`-preview.N`）之外，遇到类型没更新就 `rm -rf node_modules/<pkg>` 再装。
15. **插件包分 host/client 两份产物**：改 `src/usage.ts`（宿主侧）只替换 `lib/client.js` 不生效，必须一起替换 `lib/index.js`。
16. **每次只验证一件事**：展开/收起、只读、列位、图标、宽度，逐项量（`aria-expanded`、`readonly` count、`getBoundingClientRect`、`gridTemplateColumns`），别用「看起来对」。
17. **测试断言的是旧内联样式时，改断言而不是改回旧实现**：把 `style.minHeight === '32px'` 换成 `className` 包含共享类。
## 6. 迁移顺序（按风险与覆盖面）

1. **Grok**（OAuth + 搜索 + 能力开关）：把每行映射成 `items`，行内字段放进 `extra`，删掉插件自己的行 JSX；
2. **OpenCode Go**（API Key + 多窗口）：额度要展示全部窗口，重置时间用原始 ISO；
3. Cursor、Codex（零模型）、Ollama、CommandCode（API Key 账号卡）、Antigravity（`role: 'agent'`）。

全部迁移完成后，删除设置页的 `normalizeDetail`/`paint*`/定时重绘与相关 CSS 覆盖。