# Task Panel 额度详情 · 已选 B

## 已确认的方向

用户选定 **B · 原位展开**：点击 Provider 后在侧栏内阅读，返回恢复额度网格。A/C 与比较工具条保留在历史提交 `1c9f6cc`；当前入口固定 B，旧 variant 链接自动归一。

Provider 设置方案 C、全局侧栏开关仍锁定于 `93d085e`；原分支 `prototype/provider-settings-system-v2` 不变。本轮只调整 `prototype/task-panel-usage-popover` 原型，不修改生产插件、3080 或外部偏好。

## 本轮交互与内容

- **全局刷新**：Provider Usage 标题旁增加「刷新全部」，列表和详情态均可用；刷新所有已连接、可查询的 LLM Provider，不仅是当前详情。跳过不支持、只读及已在刷新的请求，避免重复。详情头部继续保留单 Provider 刷新。
- **自适应高度**：取消统一详情高度。一个、两个、三个窗口按实际内容展开；只有空间不足时限制最大高度并滚动正文，头尾操作保留。展开「更多用量」也参与高度计算。
- **信息精简**：默认只显示 Provider 名称、额度窗口/剩余量、重置时间和必要状态。删除重复的「已连接 · 账户额度」「各窗口独立计量」「更新时间未提供」；账期、套餐和按模型统计归入默认折叠的「更多用量」。
- **时间**：只保留一处系统时区；实际刷新后显示简短更新时间。重置时间继续使用共享系统时区格式，不伪造未知时间。
- **稳定交互**：全局/单项刷新共用资格与忙碌检查，按钮保持 DOM 和焦点；没有数据变化时不替换当前详情正文，保留选择、滚动和展开状态。Esc / 返回恢复触发卡片焦点。
- **状态仍完整**：首次加载、失败缓存、失败无缓存、未连接、不支持、0%、未知重置时间及只读仍有对应表达，不为精简而混淆。

额度条、品牌、颜色、整数百分比沿用锁定设置。低于 20% 使用既有 amber 提示，不增加分级或跨账户合计。

## 边界

全局侧栏开关仍控制整块 Provider Usage；外部 `hiddenUsageProviders` / `usageOrder` 不重复设置、不清空、不迁移。账号和模型操作仍前往设置。全部为演示数据，不发送实际刷新请求，不持久化；原型中的批量调用在生产接入时应对应现有 `onRefresh()`，单项对应 `onRefresh([key])`。

## 运行与检查

```sh
pnpm prototype:usage-popover
node prototypes/check-usage-popover.mjs
PROTOTYPE_URL=http://127.0.0.1:4187/provider-settings-system.html node prototypes/check-provider-settings.mjs
```

预览：`http://127.0.0.1:4187/provider-settings-system.html?surface=task&variant=B&inspect=codex`。

“演示”菜单保留 Provider、状态、主题、尺寸、重置及完整状态查看。当前代码不再切换 A/C，方向键不拦截。受限服务只提供六个演示资产。

检查覆盖一/二/三窗口自然高度、展开/收起、短视口、全局刷新范围和去重、只读/未连接/不支持、DOM/焦点/草稿保留、设置跳转和全局显隐，并回归锁定设置。浏览器与触摸模拟不等同于实体手机验收。

源码参考仍为 `src/client/ProviderUsagePanel.tsx`、`usage-action.tsx` 及已锁定原型，不增加 DSH UI 运行时依赖。本轮不会直接替换真实 Task Panel。
