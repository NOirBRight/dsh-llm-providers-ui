import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ProviderQuotaMeter } from './provider-ui.js';
import { ProviderRoleBadge } from './provider-ui.js';
import { formatResetLabel } from '../usage-readers.js';
import { copy as sectionCopy } from './provider-section.js';
import { SortableList } from './SortableList.js';
/** Icon paths copied from the locked prototype so every card matches it. */
const ICON = {
    expand: 'M2 4h12M2 12h12M5 2v4M11 10v4',
    sort: 'M5 2v12m-3-3 3 3 3-3M11 14V2m-3 3 3-3 3 3',
    plus: 'M8 3v10M3 8h10',
    chevron: 'M6 3l5 5-5 5',
    trash: 'M3 4h10M6 4V2h4v2M4 4l1 10h6l1-10M7 7v4M9 7v4',
};
function modelLabelOf(row, index) {
    const id = row.id.trim();
    if (id.length > 0)
        return id;
    return index === undefined ? row.rowId : String(index + 1);
}
function DetailIcon({ path }) {
    return (_jsx("svg", { className: "c-ico", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: path }) }));
}
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
        modelIdLabel: source.modelIdLabel,
        modelNameLabel: source.modelNameLabel,
        addModelLabel: source.addModelLabel,
        removeModelLabel: source.removeModelLabel,
        dragModelLabel: source.dragModelLabel,
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
    return (_jsxs("article", { className: "c-full", "data-provider-detail": "", children: [_jsx("div", { className: "c-detail-title", children: _jsxs("div", { className: "c-identity", children: [props.mark === undefined ? null : _jsx("span", { className: "c-brand", children: props.mark }), _jsxs("div", { children: [_jsxs("div", { className: "c-name-line", children: [_jsx("span", { className: "c-name", children: props.name }), _jsx(ProviderRoleBadge, { ...(props.role === undefined ? {} : { role: props.role }) })] }), _jsxs("div", { className: "c-sub", children: [_jsx("span", { className: 'c-dot' + (state === 'unconnected' ? '' : ' good') }), stateLabel, count === undefined ? null : (_jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": "true", children: "\u00B7" }), props.copy.modelCount.replace('{n}', String(count))] }))] })] })] }) }), props.notice === undefined ? null : _jsx("p", { className: "c-notice", children: props.notice }), account === undefined ? null : (_jsxs("div", { className: "c-account-group", children: [_jsx("div", { className: "c-account-head", children: props.copy.accountHeading }), _jsxs("section", { className: "c-account", children: [_jsxs("div", { className: "c-account-copy", children: [_jsxs("div", { className: "c-account-name", children: [_jsx("span", { className: 'c-dot' + (state === 'unconnected' ? '' : ' good') }), account.label] }), account.meta === undefined ? null : _jsx("div", { className: "c-account-meta", children: account.meta })] }), account.actions === undefined ? null : _jsx("div", { className: "c-account-actions", children: account.actions })] }), account.body === undefined ? null : _jsx("div", { className: "c-account-body", children: account.body })] })), _jsxs("section", { "data-c-quota": "", children: [_jsxs("div", { className: "c-quota-head", children: [_jsx("h3", { children: props.copy.quotaHeading }), props.quota.onRefresh === undefined ? null : (_jsx("button", { type: "button", className: "c-btn quiet", disabled: props.quota.refreshing === true, onClick: props.quota.onRefresh, children: props.quota.refreshing === true ? props.copy.refreshing : props.copy.refresh }))] }), _jsx("div", { className: "c-quota-list", children: props.quota.windows.length === 0
                            ? _jsx("div", { className: "c-missing", children: quotaEmptyLabel(props.quota.status, props.copy) })
                            : props.quota.windows.map(window => {
                                const detail = formatResetLabel(window.resetsAt, window.label, {
                                    at: props.copy.resetAt,
                                    overdue: props.copy.resetOverdue,
                                    missing: props.copy.resetMissing,
                                });
                                return (_jsx(ProviderQuotaMeter, { label: window.label, ...(window.remainingPercent === undefined ? {} : { remainingPercent: window.remainingPercent }), emptyLabel: window.valueText, ...(detail === undefined ? {} : { detail }) }, window.id));
                            }) }), _jsxs("div", { className: "c-quota-meta", children: [_jsx("span", { children: props.copy.quotaMeta }), props.quota.updatedLabel === undefined ? null : _jsx("span", { children: props.quota.updatedLabel })] })] }), props.models === undefined ? null : (_jsxs("section", { "data-provider-models": "", children: [_jsxs("div", { className: "c-models-head", children: [_jsxs("div", { className: "c-models-title", children: [_jsx("h3", { children: props.copy.modelsHeading }), _jsx("span", { className: "c-count", children: props.copy.modelsCount.replace('{n}', String(props.models.count ?? 0)) })] }), _jsxs("div", { className: "c-models-actions", children: [props.models.onToggleAll === undefined ? null : (_jsxs("button", { type: "button", className: "c-btn quiet c-icon-label", "aria-pressed": props.models.allOpen === true, onClick: props.models.onToggleAll, children: [_jsx(DetailIcon, { path: ICON.expand }), props.models.allOpen === true ? props.copy.collapseAll : props.copy.expandAll] })), props.models.onToggleSorting === undefined ? null : (_jsxs("button", { type: "button", className: "c-btn quiet c-icon-label", "aria-pressed": props.models.sorting === true, disabled: props.models.sortDisabled === true, onClick: props.models.onToggleSorting, children: [_jsx(DetailIcon, { path: ICON.sort }), props.models.sorting === true ? props.copy.done : props.copy.sort] })), props.models.onChooseFromAccount === undefined ? null : (_jsxs("button", { type: "button", className: "c-btn c-icon-label", disabled: props.models.chooseDisabled === true, onClick: props.models.onChooseFromAccount, children: [_jsx(DetailIcon, { path: ICON.plus }), props.copy.chooseFromAccount] })), props.models.actions] })] }), _jsx("p", { className: "c-models-hint", children: props.models.hint ?? props.copy.modelsHint }), _jsxs("div", { className: "c-models-list", children: [props.models.list, props.models.items === undefined ? null : (_jsxs(_Fragment, { children: [_jsx(SortableList, { items: props.models.items, getId: row => row.rowId, chrome: "card", disabled: props.models.onReorder === undefined, sorting: props.models.sorting === true, moveButtons: props.models.sorting === true, dragLabel: row => props.copy.dragModelLabel + ': ' + modelLabelOf(row), moveUpLabel: row => props.copy.dragModelLabel + ': ' + modelLabelOf(row), moveDownLabel: row => props.copy.dragModelLabel + ': ' + modelLabelOf(row), onReorder: rows => { props.models?.onReorder?.(rows.map(row => row.rowId)); }, renderItem: (row, index) => {
                                            const label = modelLabelOf(row, index);
                                            const expanded = props.models?.expanded?.includes(row.rowId) === true;
                                            return (_jsxs("div", { className: "c-model-card", "data-model-row": label, "data-provider-model": "", children: [_jsxs("div", { className: "c-model-top", children: [_jsxs("label", { className: "c-field", children: [_jsx("span", { className: "c-field-label", children: props.copy.modelIdLabel }), _jsx("input", { className: "c-input", value: row.id, spellCheck: false, autoComplete: "off", placeholder: props.copy.modelIdLabel, "aria-label": props.copy.modelIdLabel + ' ' + String(index + 1), onChange: event => { props.models?.onPatch?.(row.rowId, { id: event.target.value }); } })] }), _jsxs("label", { className: "c-field", children: [_jsx("span", { className: "c-field-label", children: props.copy.modelNameLabel }), _jsx("input", { className: "c-input", value: row.name ?? '', autoComplete: "off", placeholder: props.copy.modelNameLabel, "aria-label": props.copy.modelNameLabel + ' ' + String(index + 1), onChange: event => { props.models?.onPatch?.(row.rowId, { name: event.target.value }); } })] }), props.models?.onToggle === undefined ? null : (_jsx("button", { type: "button", className: "c-btn quiet c-icon-only", "aria-expanded": expanded, "aria-label": props.copy.details + ': ' + label, onClick: () => { props.models?.onToggle?.(row.rowId); }, children: _jsx(DetailIcon, { path: ICON.chevron }) })), props.models?.onRemove === undefined ? null : (_jsx("button", { type: "button", className: "c-btn quiet c-icon-only", "aria-label": props.copy.removeModelLabel + ' ' + label, onClick: () => { props.models?.onRemove?.(row.rowId); }, children: _jsx(DetailIcon, { path: ICON.trash }) }))] }), props.models?.extra === undefined || !expanded ? null : _jsx("div", { className: "c-model-extra", children: props.models.extra(row) })] }));
                                        } }), props.models.onAdd === undefined ? null : (_jsxs("button", { type: "button", className: "c-btn c-icon-label c-add-model", disabled: props.models.addDisabled === true, onClick: props.models.onAdd, children: [_jsx(DetailIcon, { path: ICON.plus }), props.copy.addModelLabel] }))] }))] })] })), props.advanced === undefined ? null : (_jsxs("details", { className: "c-advanced", children: [_jsxs("summary", { children: [_jsx(DetailIcon, { path: ICON.chevron }), _jsx("span", { children: props.copy.advancedHeading }), _jsx("span", { className: "c-advanced-note", children: props.copy.advancedNote })] }), _jsx("div", { className: "c-advanced-body", children: props.advanced })] })), props.footer === undefined ? null : _jsx("div", { className: "c-footer", children: props.footer }), props.draft === undefined ? null : _jsx("div", { className: "c-draft", children: props.draft })] }));
}
//# sourceMappingURL=provider-detail.js.map