/** Shared Settings > LLM Providers section. The dsh-llm-providers-ui client owns the nav row. */
export { PROVIDERS_SECTION_ID, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS, PROVIDERS_SETTINGS_NS, PROVIDER_ITEM_ORDER, PROVIDER_ROUTES, applySavedOrder, decodeProviderOrder, providerRoute, sortCatalogGroups, } from '../order.js';
export type { CatalogGroup, ProviderItemKey, ProviderOrderSettings } from '../order.js';
/** Locale copy: empty state names all six providers. */
export declare const copy: {
    readonly zh: {
        readonly nav: "LLM 供应商";
        readonly title: "LLM 供应商";
        readonly subtitle: "先看账户额度，再进入独立详情页配置。";
        readonly empty: "安装 Cursor、Grok、Codex、Ollama Cloud、CommandCode 或 OpenCode Go 后，在这里连接账号并选择模型。";
        readonly drag: "拖动排序";
        readonly sort: "Provider 排序";
        readonly done: "完成排序";
        readonly modelCount: "{n} 个模型";
        readonly moveUp: "上移";
        readonly moveDown: "下移";
        readonly sidebarToggle: "在侧边栏显示";
        readonly sidebarToggleHint: "仅控制 Task Panel 的额度区域";
        readonly filterAll: "全部";
        readonly filterLlm: "LLM";
        readonly filterAgent: "Agent";
        readonly details: "详情";
        readonly overview: "返回总览";
        readonly connected: "已连接";
        readonly configured: "已配置";
        readonly unconnected: "未连接";
        readonly connectedCount: "已连接的 Provider";
        readonly connectedHint: "额度属于各自账户，不合并统计，也不互相替代。";
        readonly colProvider: "Provider / 连接状态";
        readonly colQuota: "主要窗口 · 剩余额度";
        readonly colConfig: "配置";
        readonly systemZone: "系统时区";
        readonly breadcrumbOverview: "额度总览";
        readonly quotaHeading: "剩余额度";
        readonly quotaMeta: "账户剩余额度 · 各窗口独立计量";
        readonly connectToSee: "连接后查看额度";
        readonly unsupportedQuota: "暂不支持额度查询";
        readonly loadingQuota: "正在读取额度…";
        readonly errorQuota: "额度读取失败";
        readonly resetAt: "重置于 ";
        readonly resetOverdue: "已到期，等待更新 · ";
        readonly resetMissing: "{period} · 重置时间未提供";
        readonly refresh: "刷新";
        readonly refreshing: "刷新中";
        readonly accountHeading: "账号与连接";
        readonly advancedHeading: "高级设置";
        readonly advancedNote: "可选能力与工具";
        readonly accountOauthMeta: "订阅授权，不使用 API Key";
        readonly accountApiMeta: "API Key · 不会回显已保存的密钥";
        readonly expandAll: "全部展开";
        readonly collapseAll: "全部收起";
    };
    readonly en: {
        readonly nav: "LLM Providers";
        readonly title: "LLM Providers";
        readonly subtitle: "Review account quota, then open an independent detail page to configure.";
        readonly empty: "Install Cursor, Grok, Codex, Ollama Cloud, CommandCode, or OpenCode Go to connect an account and pick models here.";
        readonly drag: "Reorder";
        readonly sort: "Sort providers";
        readonly done: "Done sorting";
        readonly modelCount: "{n} models";
        readonly moveUp: "Move up";
        readonly moveDown: "Move down";
        readonly sidebarToggle: "Show in sidebar";
        readonly sidebarToggleHint: "Only the Task Panel quota block";
        readonly filterAll: "All";
        readonly filterLlm: "LLM";
        readonly filterAgent: "Agent";
        readonly details: "Details";
        readonly overview: "Back to overview";
        readonly connected: "Connected";
        readonly configured: "Configured";
        readonly unconnected: "Not connected";
        readonly connectedCount: "Connected providers";
        readonly connectedHint: "Quota belongs to each account. Totals are not merged.";
        readonly colProvider: "Provider / connection";
        readonly colQuota: "Primary window · remaining";
        readonly colConfig: "Setup";
        readonly systemZone: "System time zone";
        readonly breadcrumbOverview: "Quota overview";
        readonly quotaHeading: "Remaining quota";
        readonly quotaMeta: "Account remaining · each window is independent";
        readonly connectToSee: "Connect to see quota";
        readonly unsupportedQuota: "Quota is not available";
        readonly loadingQuota: "Reading quota…";
        readonly errorQuota: "Could not read quota";
        readonly resetAt: "Resets ";
        readonly resetOverdue: "Expired, waiting for update · ";
        readonly resetMissing: "{period} · reset time not provided";
        readonly refresh: "Refresh";
        readonly refreshing: "Refreshing";
        readonly accountHeading: "Account";
        readonly advancedHeading: "Advanced";
        readonly advancedNote: "Optional capabilities";
        readonly accountOauthMeta: "Subscription · no API key";
        readonly accountApiMeta: "API Key · saved keys are never echoed";
        readonly expandAll: "Expand all";
        readonly collapseAll: "Collapse all";
    };
};
export type ProviderSectionLocaleKey = keyof typeof copy.en;
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        'settings.provider.item': {
            kind: 'keyed';
            scope: 'root';
        };
    }
    interface LocaleNamespaceMap {
        'settings.providers': keyof typeof copy.en;
    }
}
//# sourceMappingURL=provider-section.d.ts.map