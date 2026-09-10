# Task Panel 额度详情 · 交互原型

## 已锁定的部分

Provider 设置方案 C 和全局侧栏显示开关锁定于 `93d085e`，原分支 `prototype/provider-settings-system-v2` 不再调整。新探索位于 `prototype/task-panel-usage-popover`；不修改生产插件、3080、账号配置或外部逐 Provider 偏好。

复用已批准的颜色、品牌 SVG、10 格额度条、整数剩余百分比和系统时区格式。低于 20% 沿用 amber 提示，不新增红色分级、综合评分或跨账户合计。

## 要回答的问题

在保留任务上下文的前提下，额度详情应短暂浮出、在侧栏展开，还是作为持续阅读区域？三种方案使用同一份演示数据，不是换皮肤对比。

| variant | 结构与操作 | 取舍 |
|---|---|---|
| A · 贴边浮卡 | 点击 mini 打开固定定位浮卡；Esc、关闭按钮、外部按下关闭；账户事实默认折叠 | 最接近提示框，不挤压布局，但会短暂覆盖部分对话 |
| B · 原位展开 | 额度网格替换为侧栏详情；返回恢复网格；正文单独滚动 | 不遮挡对话，但宽度限制密度，切换 Provider 前需返回 |
| C · 伴随面板 | 与会话并列，保持打开；可直接切换 Provider；Esc 或关闭退出 | 持续查阅更稳定，但占宽；窄屏让出会话区，手机为带返回的完整阅读面板 |

A 为默认比较入口。三种方案均点击驱动，Enter / Space / 触摸等价；没有 hover-only 操作、原生 title 或持久化“固定”设置。

## 共同约束

- 使用共享 `quotaBlock` / `meter` / `dateLabel` / `resetStamp`；账户、模型编辑仍前往已锁定的设置页，不塞进提示框。
- 首次加载、失败有缓存、失败无缓存、未连接、不支持、未知重置时间、真实 0% 和只读保持区分；无有效剩余百分比不画假空条。
- 刷新仅影响当前 Provider；按钮保持 DOM 和焦点，aria-disabled 配合逻辑拦截重复操作，不清空已有可用读数。
- A 使用顶层 popover 避开 sidebar overflow 裁切，双轴留 12px，跟随 scroll、resize、ResizeObserver 和 VisualViewport。
- Esc / 关闭返回触发卡片；外部点击关闭 A 不抢走目标焦点。B/C 不因外部点击关闭，避免会话输入时丢失详情。
- 触控操作至少 44px；头尾操作与正文滚动分离，小窗口仍可关闭或前往设置。
- 全局侧栏开关仍控制整块 Provider Usage；已有 `hiddenUsageProviders` / `usageOrder` 不新增、不重置、不迁移。
- 模型/API key 草稿和聊天测试输入独立。均为演示数据，不调用 Provider，不持久化。

## 运行与比较

```sh
pnpm prototype:usage-popover
node prototypes/check-usage-popover.mjs
PROTOTYPE_URL=http://127.0.0.1:4187/provider-settings-system.html node prototypes/check-provider-settings.mjs
```

入口：`http://127.0.0.1:4187/provider-settings-system.html?surface=task&variant=A&inspect=codex`。A/B/C 共用路由；底部箭头或键盘 ← / → 切换，不拦截输入框及原生选择控件的方向键。

“演示”菜单提供 Provider、状态、主题、尺寸、重置、完整状态查看；动作同时输出可检查的 record。服务仅允许六个原型资产，不暴露目录或测试源码。

## 源码参考与边界

- 插件 `src/client/ProviderUsagePanel.tsx` / `usage-action.tsx`：mini、状态、刷新及外部偏好边界。
- DSH Tooltip/HoverCard/anchored position：定位、裁切、指针和焦点设计参考；没有引入 ui-primitives 运行时依赖。
- 保留已锁定设置的回归检查，新增提示框交互检查。只验证 Chromium 桌面及触摸/视口模拟，不冒充实体手机验收。
- 选定方案后再实施生产代码，本轮不直接替换真实 Task Panel。
