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
| `models` | `count`、`allOpen`/`onToggleAll`、`sorting`/`onToggleSorting`、`onChooseFromAccount`、`list` = 你现有的模型编辑器 JSX |
| `advanced` | 你现有的能力/工具开关 JSX（模板会放进默认关闭的折叠区） |
| `footer` | 版本/来源行（可选） |
| `draft` | 保存/放弃条（仅在有草稿时渲染） |

额度区不再由插件渲染：删除插件里的 `UsageHeader`/`UsageBar`/`UsageSkeleton` 与详情挂载时的额度请求；侧栏与总览的额度由共享 store 提供。

## 4. 迁移后要删的插件代码

- 详情里的额度区块、`rememberHeadlineQuota` 等 headline 写入（共享 store 负责缓存）；
- `ProviderCardHeader` 的额度/状态参数（折叠卡片按需要保留 header）；
- 插件自己的模型标题栏与三个按钮（改用模板的 `models` 字段）；
- 自绘的分区间距与图标。

## 5. 验收（每个插件都要过）

1. 该仓库 `pnpm test` / `build` 全绿；
2. 详情页自动额度请求为 **0**（切换详情不额外发 `/usage/read`）；
3. 手动刷新只发一次该 provider 的请求；
4. 详情顺序与原型一致：身份 → 提示 → 账号 → 额度 → 模型 → 折叠的高级设置 → 页脚 → 保存条；
5. 账号操作、刷新、模型三按钮、保存按钮靠右；手动添加模型在列表下方左侧；
6. 高级设置默认关闭，用户展开后不被重绘关回去；
7. 零模型 provider（Codex）不出现闪烁与重复按钮。

## 6. 迁移顺序（按风险与覆盖面）

1. **Grok**（OAuth + 搜索 + 能力开关）：模型列表是 `<SortableList>` + `renderItem`，整体搬到 `models.list` 即可；
2. **OpenCode Go**（API Key + 多窗口）：额度要展示全部窗口，重置时间用原始 ISO；
3. Cursor、Codex（零模型）、Ollama、CommandCode（API Key 账号卡）、Antigravity（`role: 'agent'`）。

全部迁移完成后，删除设置页的 `normalizeDetail`/`paint*`/定时重绘与相关 CSS 覆盖。