import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ProviderQuotaMeter } from './provider-ui.js';
import { ProviderRoleBadge } from './provider-ui.js';
import { settingsCCss } from './settings-c-css.js';
import { formatResetLabel } from '../usage-readers.js';
import { copy as sectionCopy } from './provider-section.js';
function detailCopyOf(locale) {
    const source = sectionCopy[locale];
    return {
        details: source.details,
        connected: source.connected,
        configured: source.configured,
        unconnected: source.unconnected,
        modelCount: source.modelCount,
        quotaHeading: source.quotaHeading,
        quotaMeta: source.quotaMeta,
        refresh: source.refresh,
        refreshing: source.refreshing,
        accountHeading: source.accountHeading,
        modelsHeading: source.modelsHeading,
        modelsCount: source.modelsCount,
        modelsHint: source.modelsHint,
        expandAll: source.expandAll,
        collapseAll: source.collapseAll,
        sort: source.sortModels,
        done: source.done,
        chooseFromAccount: source.chooseFromAccount,
        addModel: source.addModel,
        advancedHeading: source.advancedHeading,
        advancedNote: source.advancedNote,
        connectToSee: source.connectToSee,
        unsupportedQuota: source.unsupportedQuota,
        loadingQuota: source.loadingQuota,
        errorQuota: source.errorQuota,
        resetAt: source.resetAt,
        resetOverdue: source.resetOverdue,
        resetMissing: source.resetMissing,
    };
}
/** Shared detail copy so every plugin renders the same words. */
export const providerDetailCopy = {
    zh: detailCopyOf('zh'),
    en: detailCopyOf('en'),
};
function quotaEmptyLabel(status, copy) {
    if (status === 'unsupported')
        return copy.unsupportedQuota;
    if (status === 'loading')
        return copy.loadingQuota;
    if (status === 'error')
        return copy.errorQuota;
    return copy.connectToSee;
}
/**
 * The single provider detail layout: identity, notice, account, quota, models,
 * advanced, footer. Plugins pass data and content; geometry and copy live here so
 * every provider looks and reads the same.
 */
export function ProviderDetail(props) {
    const account = props.account;
    const state = account?.state ?? 'unconnected';
    const stateLabel = state === 'connected' ? props.copy.connected : state === 'configured' ? props.copy.configured : props.copy.unconnected;
    const count = props.models?.count;
    return (_jsxs("article", { className: "c-full", "data-provider-detail": "", children: [_jsx("style", { children: settingsCCss }), _jsx("div", { className: "c-detail-title", children: _jsxs("div", { className: "c-identity", children: [props.mark === undefined ? null : _jsx("span", { className: "c-brand", children: props.mark }), _jsxs("div", { children: [_jsxs("div", { className: "c-name-line", children: [_jsx("span", { className: "c-name", children: props.name }), _jsx(ProviderRoleBadge, { ...(props.role === undefined ? {} : { role: props.role }) })] }), _jsxs("div", { className: "c-sub", children: [_jsx("span", { className: 'c-dot' + (state === 'unconnected' ? '' : ' good') }), stateLabel, count === undefined ? null : (_jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": "true", children: "\u00B7" }), props.copy.modelCount.replace('{n}', String(count))] }))] })] })] }) }), props.notice === undefined ? null : _jsx("p", { className: "c-notice", children: props.notice }), account === undefined ? null : (_jsxs("div", { className: "c-account-group", children: [_jsx("div", { className: "c-account-head", children: props.copy.accountHeading }), _jsxs("section", { className: "c-account", children: [_jsxs("div", { className: "c-account-copy", children: [_jsxs("div", { className: "c-account-name", children: [_jsx("span", { className: 'c-dot' + (state === 'unconnected' ? '' : ' good') }), account.label] }), account.meta === undefined ? null : _jsx("div", { className: "c-account-meta", children: account.meta })] }), account.actions === undefined ? null : _jsx("div", { className: "c-account-actions", children: account.actions })] }), account.body === undefined ? null : _jsx("div", { className: "c-account-body", children: account.body })] })), _jsxs("section", { "data-c-quota": "", children: [_jsxs("div", { className: "c-quota-head", children: [_jsx("h3", { children: props.copy.quotaHeading }), props.quota.onRefresh === undefined ? null : (_jsx("button", { type: "button", className: "c-btn quiet", disabled: props.quota.refreshing === true, onClick: props.quota.onRefresh, children: props.quota.refreshing === true ? props.copy.refreshing : props.copy.refresh }))] }), _jsx("div", { className: "c-quota-list", children: props.quota.windows.length === 0
                            ? _jsx("div", { className: "c-missing", children: quotaEmptyLabel(props.quota.status, props.copy) })
                            : props.quota.windows.map(window => {
                                const detail = formatResetLabel(window.resetsAt, window.label, {
                                    at: props.copy.resetAt,
                                    overdue: props.copy.resetOverdue,
                                    missing: props.copy.resetMissing,
                                });
                                return (_jsx(ProviderQuotaMeter, { label: window.label, ...(window.remainingPercent === undefined ? {} : { remainingPercent: window.remainingPercent }), emptyLabel: window.valueText, ...(detail === undefined ? {} : { detail }) }, window.id));
                            }) }), _jsxs("div", { className: "c-quota-meta", children: [_jsx("span", { children: props.copy.quotaMeta }), props.quota.updatedLabel === undefined ? null : _jsx("span", { children: props.quota.updatedLabel })] })] }), props.models === undefined ? null : (_jsxs("section", { "data-provider-models": "", children: [_jsxs("div", { className: "c-models-head", children: [_jsxs("div", { className: "c-models-title", children: [_jsx("h3", { children: props.copy.modelsHeading }), _jsx("span", { className: "c-count", children: props.copy.modelsCount.replace('{n}', String(props.models.count ?? 0)) })] }), _jsxs("div", { className: "c-models-actions", children: [props.models.onToggleAll === undefined ? null : (_jsx("button", { type: "button", className: "c-btn quiet", "aria-pressed": props.models.allOpen === true, onClick: props.models.onToggleAll, children: props.models.allOpen === true ? props.copy.collapseAll : props.copy.expandAll })), props.models.onToggleSorting === undefined ? null : (_jsx("button", { type: "button", className: "c-btn quiet", "aria-pressed": props.models.sorting === true, disabled: props.models.sortDisabled === true, onClick: props.models.onToggleSorting, children: props.models.sorting === true ? props.copy.done : props.copy.sort })), props.models.onChooseFromAccount === undefined ? null : (_jsx("button", { type: "button", className: "c-btn", disabled: props.models.chooseDisabled === true, onClick: props.models.onChooseFromAccount, children: props.copy.chooseFromAccount })), props.models.actions] })] }), _jsx("p", { className: "c-models-hint", children: props.models.hint ?? props.copy.modelsHint }), props.models.list] })), props.advanced === undefined ? null : (_jsxs("details", { className: "c-advanced", children: [_jsxs("summary", { children: [_jsx("span", { children: props.copy.advancedHeading }), _jsx("span", { className: "c-advanced-note", children: props.copy.advancedNote })] }), _jsx("div", { className: "c-advanced-body", children: props.advanced })] })), props.footer === undefined ? null : _jsx("div", { className: "c-footer", children: props.footer }), props.draft === undefined ? null : _jsx("div", { className: "c-draft", children: props.draft })] }));
}
//# sourceMappingURL=provider-detail.js.map