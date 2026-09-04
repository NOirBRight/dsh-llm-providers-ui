# 侧边栏 Provider Usage 规格

> 状态：原型已确认，待生产实现。  
> 原型分支：`prototype/sidebar-provider-usage`  
> 原型入口：`pnpm prototype:sidebar-usage`，打开 `http://127.0.0.1:4178/sidebar-provider-usage.html?variant=B&count=6`。

## 1. 目标

在 DSH 左侧 Workspace/Session 侧边栏底部持续展示所有用户选择的、可查询额度的 LLM Provider，使用户在打开模型选择器前就能看到全局订阅额度，并据此手动切换模型。

本功能只表示订阅额度余量，不表示实时拥塞、延迟、吞吐或会话 Token 消耗。

## 2. 已确认的设计

采用原型 **B：双列摘要**。

- 面板位于 Sessions 列表和 Settings 之间。
- 桌面侧边栏每行显示 2 个 Provider；6 个 Provider 共 3 行，不滚动。
- 移动端同样每行 2 个 Provider。
- Provider 超过当前可见容量时，只滚动 Provider Usage 面板，不影响 Settings 固定位置。
- Sessions 区域保持原有数据、搜索和排序，仅因面板占位而缩短可视高度并内部滚动。
- 当前会话正在使用的 Provider 不高亮，避免侧栏喧宾夺主。

### 2.1 Provider 单元

每个单元固定两层信息：

1. Provider 品牌 logo 和名称（单行，超出省略）。
2. 周期最长窗口的剩余整数百分比；空数据为 —。点卡片进入详情页看全部窗口、进度条和本地重置时间。右上角可单票刷新。

列表示例：

```text
Codex     38%
```

详情页展示该 Provider 的全部窗口、进度条和本地重置时间。

短标签：

| 完整窗口 | 侧边栏标签 |
|---|---|
| Session | S |
| Week | W |
| Month | M |
| Credits | Cr |
| Agent | A |
| Day | D |
| Local | L |
| Other | Oth |
| 2h / 5h 等短标签 | 保持原样 |

不使用原生 title Tooltip。详情页用系统本地时间显示重置时刻，不展示原始 ISO。

### 2.2 颜色

- 默认信息保持中性色。
- 卡片数字一律为剩余额度的整数百分比。
- 剩余 ≤20% 红色，≤40% 琥珀色，其余中性。
- Provider 品牌色仅用于低饱和图标底色。
- 不使用整块红、黄、绿卡片，不把额度强行合成为健康分数。

### 2.3 显示选择

面板标题栏提供筛选按钮，弹出“侧栏显示”面板：

- 显示已检测 Provider 的复选框。
- 提供“显示全部”。
- Provider 较多时提供搜索。
- 标题栏固定为 Provider Usage、筛选和刷新；不显示 6/6 计数。
- 只影响侧边栏 Provider Usage，不影响设置页卡片、模型目录或模型选择器。
- 默认显示所有可查询 Provider。
- 新检测到的 Provider 默认显示，除非用户明确隐藏。

生产设置存入现有 `llm-providers` namespace：

```ts
interface OrderConfig {
  order: string[]
  hiddenUsageProviders: string[]
}
```

使用隐藏列表而不是可见列表，使以后新增 Provider 默认出现。保存字符串 key；渲染时再与当前已检测 Provider 取交集。

## 3. 布局与扩展数量

### 桌面

- 目标侧边栏宽度：约 276px。
- 两列等宽微格，PC 与移动端相同。
- 单元高度约 40px。
- 6 个 Provider 在 3 行内完整显示。
- 列表内容区固定约 132px；详情页按窗口数撑开，一页显示完，不内部滚动。

### 刷新

- 挂载时读一次可见 Provider。
- 之后每 15 分钟轮询可见 Provider。
- 5 分钟内的成功快照不因配置重入或轮询重复请求；工具栏刷新强制重读。
- 成功快照写入 localStorage/sessionStorage（secret-free 数字），刷新失败或 reload 时先显示上次成功值。
- 设置页暂不接入；若接入则先读快照，超过 5 分钟再单票重读。

### 移动端

- 视口宽度不超过 640px 时侧栏仍约 280px，改为两列以免截断名称。
- 不改为全宽抽屉。
- Provider 多于可见高度时在面板内部滚动。
- 侧边栏折叠为 56px rail 时不渲染 Provider Usage 面板。

### 更多 Provider

- 不分页。
- 保持现有 Provider 排序；复用 `llm-providers.order`。
- 面板内部滚动，标题和筛选/刷新操作保持可见。
- 选择面板支持搜索，避免 20 个以上 Provider 时出现过长复选框列表。

## 4. 数据模型

共享 UI 只消费展示所需的最小归一化结果：

```ts
type ProviderUsageStatus =
  | 'loading'
  | 'ready'
  | 'logged-out'
  | 'unsupported'
  | 'stale'
  | 'error'

interface UsageWindowSummary {
  id: string
  label: string
  shortLabel: string
  remainingPercent?: number
  valueText: string
  resetsAt?: string
}

interface ProviderUsageSummary {
  providerKey: string
  name: string
  status: ProviderUsageStatus
  fetchedAt?: string
  windows: readonly UsageWindowSummary[]
}
```

主窗口的选择规则：

1. 在有 `remainingPercent` 的窗口中选择周期最长者：Month > Week > Day > 已知 Cursor 总周期（`Curs`）> `Nh` 小时窗口 > Session > Agent/Local。
2. 没有百分比但有 Credits/Unlimited 文本时，显示该文本，不推导百分比。
3. 不跨 Provider 比较不同单位，不生成综合排名或推荐。

## 5. 模块与 seam

### `dsh-llm-providers-ui`

拥有全部新增功能：

- 注册 `sidebar.footer.action` occupant。
- Provider Usage 面板和响应式布局。
- 可见性设置和现有 Provider 顺序复用。
- 已知 Provider 的 usage reader adapter。
- 归一化、加载、错误隔离和刷新状态。

### DSH `ui-sidebar`

保持不变。复用已有 `sidebar.footer.action` seam，不替换 `SidebarRoot`，不新增 DSH 核心 slot。

### Provider 插件

保持不变。`dsh-llm-providers-ui` 通过当前已存在的 secret-free usage RPC channel/endpoint 读取数据。新增 Provider 若已有同类 RPC，只在本包增加 reader adapter；不要求 Provider 设置卡片增加侧边栏 UI。

## 6. 加载与错误行为

- 面板挂载时读取所有“可见且已检测”的 Provider。
- 点击刷新按钮重新读取所有可见 Provider。
- 可见 Provider 每 15 分钟轮询；5 分钟内的成功快照不因配置重入重复请求。
- 每个 Provider 独立失败，一个失败不能清空或阻止其他 Provider。
- 有旧数据时读取失败进入 `stale`，保留旧值并标记过期。
- 无旧数据时分别展示未登录、不支持或失败状态。
- 卸载时中止未完成请求。
- 浏览器只接收 secret-free usage view，凭据继续留在 Host。

## 7. 交互边界

第一版只提供全局额度观察和手动刷新。用户仍通过现有模型选择器切换模型。

以下不在第一版范围：

- 自动切换 Provider 或模型。
- 基于额度的推荐、排序或综合健康分数。
- TTFT、Tokens/s、错误率等实时负载。
- 历史曲线或数据库持久化（侧栏 last-good 快照除外）。
- 对现有 StatsLine、composer 或 model picker 的修改。
- 修改各 Provider 插件的设置卡片。

## 8. 可访问性

- Provider 指标卡是可点的 `role="button"`，accessible name 包含 Provider 和主额度值。单票刷新是卡内独立 button。
- 筛选按钮、刷新按钮和复选框有明确的 accessible name。
- Tooltip 不是唯一信息来源；窗口短标签和值在正文中可见。
- 颜色不作为唯一状态提示。
- 键盘可打开筛选、切换复选框并关闭弹层。

## 9. 验收标准

1. 276px 桌面侧边栏中，6 个 Provider 以两列微格显示且无需滚动。
2. Provider 名称单行省略，卡片带统一尺寸品牌 logo 和右上角刷新。
3. 点击卡片打开额度详情卡；重置时间为本地时区。移动端同样可点。
4. 12 和 20 Provider 场景使用面板内部滚动，不分页，Settings 保持固定。
5. 用户可搜索、全选和单独隐藏 Provider；刷新后选择仍保留。
6. 新检测 Provider 默认显示；隐藏设置不改变模型列表。
7. 一个 Provider 请求失败不影响其他 Provider。
8. 侧边栏折叠时不显示额度面板，重新展开后恢复。
9. 无任何 Provider 可显示时给出空状态和打开筛选的入口。
10. DSH 核心无需修改。Codex `auth/status` 须等用量刷新完成后再返回（`dsh-llm-codex`）。

## 10. 验证场景

原型提供以下 URL 场景：

- 6 Provider：`?variant=B&count=6`
- 12 Provider：`?variant=B&count=12`
- 20 Provider：`?variant=B&count=20`

生产实现至少检查：桌面 276px、移动视口、三窗口 Provider、Credits 文本、未登录、不支持、部分失败、全部隐藏以及 20 Provider。
