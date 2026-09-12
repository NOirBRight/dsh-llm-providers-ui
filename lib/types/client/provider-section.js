/** Shared Settings > LLM Providers section. The dsh-llm-providers-ui client owns the nav row. */
/**
 * Canonical window wording, shared by the overview rows and the detail quota block:
 * "Monthly", "Cursor Models · Monthly" and "M" all read as the same full phrase.
 * @param label - the provider-supplied window label.
 * @param names - the locale's canonical hour/week/month phrases.
 * @returns the label to display.
 */
export function windowNameOf(label, names) {
    const canonical = (token) => {
        const value = token.trim().toLowerCase();
        if (/^(?:5h|5 h|5-hour|5 hour|hour|hourly)$/u.test(value))
            return names.hour;
        if (/^(?:w|wk|week|weekly)$/u.test(value))
            return names.week;
        if (/^(?:m|mo|month|monthly)$/u.test(value))
            return names.month;
        return undefined;
    };
    const trimmed = label.trim();
    const direct = canonical(trimmed);
    if (direct !== undefined)
        return direct;
    // "Cursor Models · Monthly" keeps its scope and spells the period out in full.
    const parts = trimmed.split('·');
    const tail = parts.at(-1)?.trim() ?? '';
    const mapped = canonical(tail);
    if (mapped !== undefined && parts.length > 1)
        return [...parts.slice(0, -1).map(part => part.trim()), mapped].join(' · ');
    return trimmed;
}
export { PROVIDERS_SECTION_ID, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS, PROVIDERS_SETTINGS_NS, PROVIDER_ITEM_ORDER, PROVIDER_ROUTES, applySavedOrder, decodeProviderOrder, providerRoute, sortCatalogGroups, } from '../order.js';
/** Locale copy: empty state names all six providers. */
export const copy = {
    zh: {
        nav: 'LLM 供应商',
        title: 'LLM 供应商',
        subtitle: '先看账户额度，再进入独立详情页配置。',
        empty: '安装 Cursor、Grok、Codex、Ollama Cloud、CommandCode 或 OpenCode Go 后，在这里连接账号并选择模型。',
        drag: '拖动排序',
        sort: 'Provider 排序',
        done: '完成',
        modelCount: '{n} 个模型',
        moveUp: '上移',
        moveDown: '下移',
        sidebarToggle: '在侧边栏显示',
        sidebarToggleHint: '仅控制 Task Panel 的额度区域',
        filterAll: '全部',
        filterLlm: 'LLM',
        filterAgent: 'Agent',
        details: '详情',
        overview: '返回总览',
        connected: '已连接',
        configured: '已配置',
        unconnected: '未连接',
        connectedCount: '已连接的 Provider',
        connectedHint: '额度属于各自账户，不合并统计，也不互相替代。',
        colProvider: 'Provider / 连接状态',
        colQuota: '主要窗口 · 剩余额度',
        windowHour: '5 小时窗口',
        windowWeek: '每周窗口',
        windowMonth: '每月窗口',
        colConfig: '配置',
        systemZone: '系统时区',
        breadcrumbOverview: '额度总览',
        quotaHeading: '剩余额度',
        quotaMeta: '账户剩余额度 · 各窗口独立计量',
        connectToSee: '连接后查看额度',
        unsupportedQuota: '暂不支持额度查询',
        loadingQuota: '正在读取额度…',
        errorQuota: '额度读取失败',
        resetAt: '重置于 ',
        resetOverdue: '已到期，等待更新 · ',
        resetMissing: '{period} · 重置时间未提供',
        refresh: '刷新',
        refreshing: '刷新中',
        accountHeading: '账号与连接',
        advancedHeading: '高级设置',
        advancedNote: '可选能力与工具',
        accountOauthMeta: '订阅授权，不使用 API Key',
        accountApiMeta: 'API Key · 不会回显已保存的密钥',
        expandAll: '全部展开',
        collapseAll: '全部收起',
        modelIdLabel: 'Model ID',
        modelNameLabel: '显示名称',
        addModelLabel: '手动添加模型',
        removeModelLabel: '删除',
        dragModelLabel: '拖动排序',
        modelsHeading: '模型',
        modelsCount: '{n} 个',
        modelsHint: '名称和 ID 始终显示；展开箭头查看容量与能力参数。',
        sortModels: '排序',
        chooseFromAccount: '从账户目录选取',
        addModel: '手动添加模型',
    },
    en: {
        nav: 'LLM Providers',
        title: 'LLM Providers',
        subtitle: 'Review account quota, then open an independent detail page to configure.',
        empty: 'Install Cursor, Grok, Codex, Ollama Cloud, CommandCode, or OpenCode Go to connect an account and pick models here.',
        drag: 'Reorder',
        sort: 'Sort providers',
        done: 'Done',
        modelCount: '{n} models',
        moveUp: 'Move up',
        moveDown: 'Move down',
        sidebarToggle: 'Show in sidebar',
        sidebarToggleHint: 'Only the Task Panel quota block',
        filterAll: 'All',
        filterLlm: 'LLM',
        filterAgent: 'Agent',
        details: 'Details',
        overview: 'Back to overview',
        connected: 'Connected',
        configured: 'Configured',
        unconnected: 'Not connected',
        connectedCount: 'Connected providers',
        connectedHint: 'Quota belongs to each account. Totals are not merged.',
        colProvider: 'Provider / connection',
        colQuota: 'Primary window · remaining',
        windowHour: '5-hour window',
        windowWeek: 'Weekly window',
        windowMonth: 'Monthly window',
        colConfig: 'Setup',
        systemZone: 'System time zone',
        breadcrumbOverview: 'Quota overview',
        quotaHeading: 'Remaining quota',
        quotaMeta: 'Account remaining · each window is independent',
        connectToSee: 'Connect to see quota',
        unsupportedQuota: 'Quota is not available',
        loadingQuota: 'Reading quota…',
        errorQuota: 'Could not read quota',
        resetAt: 'Resets ',
        resetOverdue: 'Expired, waiting for update · ',
        resetMissing: '{period} · reset time not provided',
        refresh: 'Refresh',
        refreshing: 'Refreshing',
        accountHeading: 'Account',
        advancedHeading: 'Advanced',
        advancedNote: 'Optional capabilities',
        accountOauthMeta: 'Subscription · no API key',
        accountApiMeta: 'API Key · saved keys are never echoed',
        expandAll: 'Expand all',
        collapseAll: 'Collapse all',
        modelIdLabel: 'Model ID',
        modelNameLabel: 'Display name',
        addModelLabel: 'Add model manually',
        removeModelLabel: 'Remove',
        dragModelLabel: 'Reorder',
        modelsHeading: 'Models',
        modelsCount: '{n}',
        modelsHint: 'Names and IDs always show; expand a row for capacity and capability parameters.',
        sortModels: 'Sort',
        chooseFromAccount: 'Choose from account',
        addModel: 'Add model manually',
    },
};
//# sourceMappingURL=provider-section.js.map