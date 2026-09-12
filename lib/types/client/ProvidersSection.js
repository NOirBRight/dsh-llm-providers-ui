import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Settings > LLM Providers page shell. Provider cards arrive through settings.provider.item. */
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { applySavedOrder, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS } from '../order.js';
import { formatResetLabel, pickPrimaryWindow } from './usage.js';
import { ProviderQuotaMeter } from './provider-ui.js';
import { ProviderMark } from './provider-marks.js';
import { SortableList } from './SortableList.js';
import { providerUiCss, ProviderRoleBadge } from './provider-ui.js';
import { settingsCCss } from './settings-c-css.js';
import { ProviderDetail, providerDetailCopy } from './provider-detail.js';
// ponytail: the native dialog lives inside the sidebar; remove ancestry overrides once the host portals settings.
const providerShellCss = `
div:has([role="dialog"] [data-providers-section]){opacity:1!important;visibility:visible!important;z-index:1000!important;pointer-events:auto!important}
@media(max-width:680px){
 [role="dialog"]:has([data-providers-section]){flex-direction:column;width:calc(100% - 16px);max-width:calc(100% - 16px);height:calc(100dvh - 16px);max-height:calc(100dvh - 16px)}
 [role="dialog"]:has([data-providers-section])>nav{width:100%;min-width:0;flex:none;padding:8px;border-right:0;border-bottom:1px solid var(--dsw-alias-border-l2)}
 [role="dialog"]:has([data-providers-section])>nav>div:last-child{display:flex;flex-direction:row;gap:4px;overflow-x:auto}
 [role="dialog"]:has([data-providers-section])>nav button{flex:none;white-space:nowrap;min-height:44px;padding:8px 10px}
 [role="dialog"]:has([data-providers-section])>div{width:100%;min-width:0;min-height:0;flex:1}
}
`;
const fallbackWrapStyle = { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 };
const fallbackBadgeAlign = { alignSelf: 'flex-start' };
const API_KEY_AUTH = /(?:ollama|opencode-go|commandcode)$/u;
/**
 * Overview meter label: the provider's full window name, with bare abbreviations
 * replaced by the shared localized wording so every provider reads the same.
 * @param window - primary usage window.
 * @param t - section locale binding.
 * @returns the display name for the overview row.
 */
function windowName(window, t) {
    const canonical = (token) => {
        const value = token.trim().toLowerCase();
        if (/^(?:5h|5 h|5-hour|5 hour|h|hour|hourly|session)$/u.test(value))
            return t('windowHour');
        if (/^(?:w|wk|week|weekly)$/u.test(value))
            return t('windowWeek');
        if (/^(?:m|mo|month|monthly)$/u.test(value))
            return t('windowMonth');
        return undefined;
    };
    const label = window.label.trim();
    const direct = canonical(label);
    if (direct !== undefined)
        return direct;
    // "GPT-5.3-Codex-Spark · 5h" keeps its scope but spells the window out.
    const parts = label.split('\u00b7');
    const tail = parts.at(-1)?.trim() ?? '';
    const mapped = canonical(tail);
    if (mapped !== undefined && parts.length > 1)
        return [...parts.slice(0, -1).map(part => part.trim()), mapped].join(' · ');
    const short = window.shortLabel === undefined ? '' : canonical(window.shortLabel);
    return short === undefined || label.length > 0 ? label : short;
}
function linkState(key, account, summary) {
    if (account !== undefined)
        return account.state;
    if (summary === undefined || summary.status === 'logged-out')
        return 'unconnected';
    return API_KEY_AUTH.test(key) ? 'configured' : 'connected';
}
function countModels(root) {
    const rows = root.querySelectorAll('[data-provider-model]').length;
    if (rows > 0)
        return rows;
    const text = [...root.querySelectorAll('[data-provider-header-summary]')].map(node => node.textContent ?? '').join(' ');
    const match = /(\d+)\s*(?:models?|个模型)/iu.exec(text);
    return match === null ? undefined : Number(match[1]);
}
function IconSort() {
    return _jsx("svg", { className: "c-ico", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: "M5 2v12m-3-3 3 3 3-3M11 14V2m-3 3 3-3 3 3" }) });
}
function IconCheck() {
    return _jsx("svg", { className: "c-ico", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: "M3 8l3 3 7-7" }) });
}
function IconBack() {
    return _jsx("svg", { className: "c-ico", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: "M10 3 5 8l5 5" }) });
}
function IconRefresh() {
    return _jsx("svg", { className: "c-ico", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: "M13 6a5.2 5.2 0 1 0 .1 4M13 2v4H9" }) });
}
export function bindProvidersSection(listRegisteredKeys, subscribe, readPage, onReorder, roleOf, onShowSidebarUsage, headerOf, readUsage, subscribeUsage, accountOf, onRefresh, detailOf, nameOf, modelCountOf) {
    return function BoundProvidersSection(props) {
        const [, bump] = useState(0);
        useEffect(() => subscribe(() => { bump(value => value + 1); }), [subscribe]);
        const order = readPage();
        const usageSummaries = useSyncExternalStore(subscribeUsage ?? (() => () => undefined), readUsage ?? (() => []), readUsage ?? (() => []));
        return (_jsx(ProvidersSection, { renderSlot: props.renderSlot, t: props.t, registeredKeys: listRegisteredKeys(), savedOrder: order.keys, disabled: order.disabled, onReorder: onReorder, roleOf: roleOf, showSidebarUsage: order.showSidebarUsage, onShowSidebarUsage: onShowSidebarUsage, usageSummaries: usageSummaries, ...(headerOf === undefined ? {} : { headerOf }), ...(accountOf === undefined ? {} : { accountOf }), ...(onRefresh === undefined ? {} : { onRefresh }), ...(detailOf === undefined ? {} : { detailOf }), ...(nameOf === undefined ? {} : { nameOf }), ...(modelCountOf === undefined ? {} : { modelCountOf }) }));
    };
}
/**
 * Settings C: compact quota ledger on overview; the plugin item slot mounts
 * only in the independent detail view. Sorting reorders ledger rows in place.
 */
export function ProvidersSection(props) {
    const t = props.t ?? ((key) => key);
    const keys = applySavedOrder(props.registeredKeys ?? [], props.savedOrder ?? []);
    const [sorting, setSorting] = useState(false);
    const [filter, setFilter] = useState('all');
    const [detail, setDetail] = useState(undefined);
    const [modelCounts, setModelCounts] = useState({});
    // Settings policy: the overview paints from cache, then refreshes once when the page opens.
    const refreshRef = useRef(props.onRefresh);
    refreshRef.current = props.onRefresh;
    useEffect(() => { refreshRef.current?.(); }, []);
    useLayoutEffect(() => {
        const next = {};
        document.querySelectorAll('[data-model-probe]').forEach(node => {
            if (!(node instanceof HTMLElement) || node.dataset.modelProbe === undefined)
                return;
            const count = countModels(node);
            if (count !== undefined)
                next[node.dataset.modelProbe] = count;
        });
        const full = document.querySelector('[data-providers-section] .c-full');
        if (full instanceof HTMLElement && detail !== undefined) {
            const count = countModels(full);
            if (count !== undefined)
                next[detail] = count;
        }
        setModelCounts(prev => {
            let changed = false;
            const merged = { ...prev };
            for (const [key, count] of Object.entries(next)) {
                if (merged[key] !== count) {
                    merged[key] = count;
                    changed = true;
                }
            }
            return changed ? merged : prev;
        });
    });
    const showToggle = keys.length > 1 && props.disabled !== true && detail === undefined;
    const sortable = sorting && showToggle;
    const orderBeforeSort = useRef(undefined);
    useEffect(() => {
        if (!sorting) {
            orderBeforeSort.current = undefined;
            return;
        }
        if (orderBeforeSort.current === undefined)
            orderBeforeSort.current = keys;
        const onKey = (event) => {
            if (event.key !== 'Escape')
                return;
            event.preventDefault();
            const previous = orderBeforeSort.current;
            setSorting(false);
            if (previous !== undefined)
                props.onReorder?.([...previous]);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [sorting, keys, props]);
    const visibleKeys = keys.filter(key => filter === 'all' || (props.roleOf?.(key) ?? 'llm') === filter);
    const items = (detail === undefined ? visibleKeys : keys.filter(key => key === detail)).map(key => ({ key }));
    const renderCard = (item) => {
        const role = props.roleOf?.(item.key) ?? 'llm';
        const summary = props.usageSummaries?.find(entry => entry.providerKey === item.key)
            ?? props.usageSummaries?.find(entry => item.key.endsWith(entry.providerKey) || entry.providerKey.endsWith(item.key));
        const account = props.accountOf?.(item.key);
        const migrated = detail !== undefined && (props.detailOf?.(item.key) ?? 'legacy') === 'shared';
        // Migrated cards read this context and render the shared template; older cards ignore it.
        const node = props.renderSlot?.(PROVIDERS_ITEM_SLOT, {
            mode: detail === undefined ? 'overview' : 'detail',
            // The page owns the active locale and the shared template: cards render it
            // instead of bundling their own copy.
            copy: props.t?.('details') === providerDetailCopy.zh.details ? providerDetailCopy.zh : providerDetailCopy.en,
            template: ProviderDetail,
            ...(summary === undefined
                ? {}
                : { usage: { status: summary.status, windows: summary.windows, ...(summary.fetchedAt === undefined ? {} : { fetchedAt: summary.fetchedAt }) } }),
            ...(account === undefined ? {} : { accountState: account.state }),
            ...(detail === undefined || props.onRefresh === undefined
                ? {}
                : { onRefresh: () => { props.onRefresh?.(item.key); } }),
        }, { entryKey: item.key });
        if (node == null)
            return null;
        const card = props.headerOf?.(item.key) === 'shared'
            ? _jsx("div", { "data-provider-slot": "", "data-provider-role": role, children: node })
            : (_jsxs("div", { "data-provider-slot": "", "data-provider-role": role, style: fallbackWrapStyle, children: [_jsx("span", { style: fallbackBadgeAlign, children: _jsx(ProviderRoleBadge, { ...(role === 'llm' ? {} : { role }) }) }), node] }));
        const linked = linkState(item.key, account, summary);
        // Prefer the count the plugin publishes; the hidden probe is the legacy fallback.
        const models = props.modelCountOf?.(item.key) ?? modelCounts[item.key];
        const copy = { at: t('resetAt'), overdue: t('resetOverdue'), missing: t('resetMissing') };
        const identity = (_jsxs("div", { className: "c-identity", children: [_jsx("span", { className: "c-brand", children: _jsx(ProviderMark, { providerKey: item.key }) }), _jsxs("div", { children: [_jsxs("div", { className: "c-name-line", children: [_jsx("span", { className: "c-name", children: summary?.name ?? item.key }), _jsx(ProviderRoleBadge, { ...(role === 'llm' ? {} : { role }) })] }), _jsxs("div", { className: "c-sub", children: [_jsx("span", { className: 'c-dot' + (linked === 'unconnected' ? '' : ' good') }), t(linked), models === undefined ? null : _jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": "true", children: "\u00B7" }), t('modelCount').replace('{n}', String(models))] })] })] })] }));
        if (detail !== undefined) {
            if (migrated) {
                // The migrated card owns the detail body; the page already renders the breadcrumb.
                return _jsx("article", { className: "c-full", children: card });
            }
            const windows = summary?.windows ?? [];
            return (_jsxs("article", { className: "c-full", children: [_jsx("div", { className: "c-detail-title", children: identity }), _jsxs("section", { "data-c-quota": "", children: [_jsxs("div", { className: "c-quota-head", children: [_jsx("h3", { children: t('quotaHeading') }), _jsx("button", { type: "button", className: "c-btn quiet", disabled: props.disabled === true || summary?.refreshing === true, onClick: () => { props.onRefresh?.(item.key); }, children: summary?.refreshing === true ? t('refreshing') : _jsxs(_Fragment, { children: [_jsx(IconRefresh, {}), " ", t('refresh')] }) })] }), _jsx("div", { className: "c-quota-list", children: windows.length === 0
                                    ? _jsx("div", { className: "c-missing", children: summary?.status === 'unsupported' ? t('unsupportedQuota') : summary?.status === 'error' ? t('errorQuota') : summary?.status === 'loading' ? t('loadingQuota') : t('connectToSee') })
                                    : windows.map(quotaWindow => {
                                        const reset = formatResetLabel(quotaWindow.resetsAt, quotaWindow.label, copy);
                                        return (_jsx(ProviderQuotaMeter, { label: quotaWindow.label, ...(quotaWindow.remainingPercent === undefined ? {} : { remainingPercent: quotaWindow.remainingPercent }), emptyLabel: quotaWindow.valueText, ...(reset === undefined ? {} : { detail: reset }) }, quotaWindow.id));
                                    }) }), _jsxs("div", { className: "c-quota-meta", children: [_jsx("span", { children: t('quotaMeta') }), _jsxs("span", { children: [t('systemZone'), " \u00B7 ", Intl.DateTimeFormat().resolvedOptions().timeZone] })] })] }), _jsx("div", { className: "c-plugin", children: card })] }));
        }
        const primary = summary === undefined ? undefined : pickPrimaryWindow(summary.windows);
        const missing = primary !== undefined
            ? undefined
            : summary === undefined || summary.status === 'logged-out'
                ? t('connectToSee')
                : summary.status === 'unsupported'
                    ? t('unsupportedQuota')
                    : summary.status === 'loading'
                        ? t('loadingQuota')
                        : summary.status === 'error'
                            ? t('errorQuota')
                            : t('connectToSee');
        const reset = primary === undefined ? undefined : formatResetLabel(primary.resetsAt, primary.label, copy);
        return (_jsxs("div", { className: "c-row-grid", "data-provider-row": item.key, "data-provider-role": role, children: [_jsx("div", { className: "c-probe", "data-model-probe": item.key, "aria-hidden": "true", children: card }), _jsx("div", { className: "c-cell", children: identity }), _jsx("div", { className: "c-mini", children: missing === undefined && primary !== undefined
                        ? _jsx(ProviderQuotaMeter, { label: windowName(primary, t), ...(primary.remainingPercent === undefined ? {} : { remainingPercent: primary.remainingPercent }), emptyLabel: primary.valueText, ...(reset === undefined ? {} : { detail: reset }) })
                        : _jsx("div", { className: "c-missing", children: missing }) }), _jsx("button", { type: "button", className: "c-btn", "data-action": "open-provider", onClick: () => { setDetail(item.key); }, children: t('details') })] }));
    };
    const linkedCount = keys.filter(key => {
        const account = props.accountOf?.(key);
        const summary = props.usageSummaries?.find(entry => entry.providerKey === key)
            ?? props.usageSummaries?.find(entry => key.endsWith(entry.providerKey) || entry.providerKey.endsWith(key));
        return linkState(key, account, summary) !== 'unconnected';
    }).length;
    const body = keys.length === 0
        ? _jsx("p", { className: "c-empty", children: t('empty') })
        : (_jsxs("div", { className: "c-ledger", "data-providers-list": "", children: [detail === undefined ? _jsxs("div", { className: "c-labels", children: [_jsx("span", { children: t('colProvider') }), _jsx("span", { children: t('colQuota') }), _jsx("span", { children: t('colConfig') })] }) : null, _jsx(SortableList, { chrome: "plain", items: items, getId: item => item.key, dragLabel: item => t('drag') + ': ' + item.key, sorting: sortable, ...(props.disabled === undefined ? {} : { disabled: props.disabled }), onReorder: next => { props.onReorder?.(next.map(item => item.key)); }, renderItem: item => renderCard(item) })] }));
    return (_jsxs("div", { "data-providers-section": PROVIDERS_LOCALE_NS, ...(sortable ? { 'data-sorting': '' } : {}), children: [_jsx("style", { children: providerUiCss + providerShellCss + settingsCCss }), detail === undefined
                ? (_jsxs(_Fragment, { children: [_jsxs("header", { className: "c-page-title", children: [_jsxs("div", { children: [_jsx("h2", { children: t('title') }), _jsx("p", { children: t('subtitle') })] }), showToggle
                                    ? _jsx("button", { type: "button", className: "c-btn c-sort", "aria-expanded": sorting, onClick: () => { setSorting(value => !value); }, children: sorting ? _jsxs(_Fragment, { children: [_jsx(IconCheck, {}), " ", t('done')] }) : _jsxs(_Fragment, { children: [_jsx(IconSort, {}), " ", t('sort')] }) })
                                    : null] }), _jsxs("div", { className: "c-note", children: [_jsx("span", { className: "c-number", children: linkedCount }), _jsxs("div", { className: "c-copy", children: [_jsx("strong", { children: t('connectedCount') }), _jsx("p", { children: t('connectedHint') })] }), _jsxs("label", { className: "c-switch", children: [_jsx("span", { children: t('sidebarToggle') }), _jsx("input", { type: "checkbox", role: "switch", "aria-label": t('sidebarToggle'), "aria-describedby": "sidebar-usage-hint", checked: props.showSidebarUsage !== false, disabled: props.disabled === true, onChange: event => { props.onShowSidebarUsage?.(event.target.checked); } })] }), _jsx("span", { id: "sidebar-usage-hint", className: "sr-only", children: t('sidebarToggleHint') })] }), _jsxs("div", { className: "c-filters", children: [_jsx("div", { className: "c-row", children: ['all', 'llm', 'agent'].map(id => (_jsx("button", { type: "button", className: 'c-btn' + (filter === id ? '' : ' quiet'), "aria-pressed": filter === id, onClick: () => { setFilter(id); }, children: t(id === 'all' ? 'filterAll' : id === 'llm' ? 'filterLlm' : 'filterAgent') }, id))) }), _jsxs("span", { className: "c-zone", children: [t('systemZone'), " \u00B7 ", Intl.DateTimeFormat().resolvedOptions().timeZone] })] })] }))
                : (_jsxs("div", { className: "c-crumb", children: [_jsxs("button", { type: "button", onClick: () => { setDetail(undefined); }, children: [_jsx(IconBack, {}), " ", t('breadcrumbOverview')] }), _jsx("span", { children: "/" }), _jsx("span", { children: props.usageSummaries?.find(entry => entry.providerKey === detail)?.name ?? props.nameOf?.(detail) ?? detail })] })), body] }));
}
//# sourceMappingURL=ProvidersSection.js.map