import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Sidebar Provider Usage panel, four-column icon strip. Controlled and UI-only: no RPC, no persistence. */
import { useEffect, useRef, useState } from 'react';
import { ProviderMark } from './provider-marks.js';
import { SortableList } from './SortableList.js';
import { formatResetLabel, pickPrimaryWindow } from './usage.js';
import { ProviderQuotaMeter, providerUiCss } from './provider-ui.js';
function windowValueText(quotaWindow) {
    return quotaWindow.remainingPercent === undefined ? quotaWindow.valueText : String(Math.round(quotaWindow.remainingPercent)) + '%';
}
function usageLow(remainingPercent) {
    return remainingPercent !== undefined && remainingPercent <= 20;
}
function FilterRow(props) {
    return (_jsxs("label", { className: "pu-filter-item", children: [_jsx("input", { type: "checkbox", "aria-label": props.t('usageShowProvider').replace('{name}', props.summary.name), checked: !props.hidden, onChange: event => { props.onToggle(event.target.checked); } }), _jsx("span", { className: "pu-mark", children: _jsx(ProviderMark, { providerKey: props.summary.providerKey }) }), _jsx("span", { className: "pu-filter-name", children: props.summary.name })] }));
}
const STATUS_KEY = {
    loading: 'usageLoading',
    ready: 'usageEmptyQuota',
    'logged-out': 'usageLoggedOut',
    unsupported: 'usageUnsupported',
    stale: 'usageStale',
    error: 'usageError',
};
const panelCss = [
    '[data-provider-usage-panel]{display:flex;flex-direction:column;position:relative;width:100%;min-width:0;padding:6px 6px 8px;background:transparent}',
    '[data-provider-usage-panel] .pu-head{display:flex;align-items:center;height:24px;padding:0 2px 4px}',
    '[data-provider-usage-panel] .grow{flex:1;min-width:0}',
    '[data-provider-usage-panel] .pu-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:550;letter-spacing:.01em;color:color-mix(in srgb,var(--dsw-alias-label-primary) 62%,var(--dsw-alias-label-secondary))}',
    '[data-provider-usage-panel] .pu-actions{display:flex;gap:2px;margin-left:auto}',
    '[data-provider-usage-panel] .pu-mini-spin{display:inline-block;width:9px;height:9px;border:1.5px solid currentColor;border-right-color:transparent;border-radius:50%;vertical-align:middle;animation:pu-spin .55s linear infinite}',
    '[data-provider-usage-panel] .pu-detail-head .pu-icon-btn:last-child{margin-left:auto}',
    '[data-provider-usage-panel] .pu-icon-btn{display:grid;place-items:center;width:25px;height:25px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}',
    '[data-provider-usage-panel] .pu-icon-btn:hover{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary)}',
    '[data-provider-usage-panel] .pu-icon-btn:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}',
    '[data-provider-usage-panel] .pu-icon-btn svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.7}',
    '[data-provider-usage-panel] .pu-spinning svg{animation:pu-spin .55s ease}',
    '@keyframes pu-spin{to{transform:rotate(360deg)}}',
    '[data-provider-usage-panel] .pu-stage{width:100%;min-width:0;height:auto;max-height:min(70dvh,420px);overflow:auto;padding:1px;margin:-1px;scrollbar-width:thin}',
    '[data-provider-usage-panel] .pu-stage-open{max-height:none;overflow:visible}',
    '[data-provider-usage-panel] .pu-rows{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}',
    '[data-provider-usage-panel] .pu-cell{position:relative;min-width:0}',
    '[data-provider-usage-panel] .pu-row{box-sizing:border-box;display:flex;align-items:center;gap:3px;width:100%;min-width:0;min-height:32px;padding:4px 0;border:0;border-radius:5px;background:transparent;color:inherit;text-align:left;cursor:pointer;outline:none}',
    '[data-provider-usage-panel] .pu-row:hover{background:var(--dsw-alias-bg-module-platform)}',
    '[data-provider-usage-panel] .pu-row:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:-2px}',
    '[data-provider-usage-panel] .pu-mark{display:grid;place-items:center;flex:none;width:18px;height:18px;overflow:visible}',
    '[data-provider-usage-panel] .pu-logo{display:block;width:100%;height:100%;color:var(--dsw-alias-label-secondary)}',
    '[data-provider-usage-panel] .pu-row .pu-mark{position:relative;width:16px;height:16px}',
    '[data-provider-usage-panel] .pu-stale{position:absolute;right:-3px;top:-7px;font-size:12px;color:var(--dsw-alias-label-secondary)}',
    '[data-provider-usage-panel] .pu-primary{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary);font-size:12px;font-weight:650;line-height:16px;font-variant-numeric:tabular-nums}',
    '[data-provider-usage-panel] .pu-warn .pu-primary{color:color-mix(in srgb,#c47b08 58%,var(--dsw-alias-label-secondary))}',
    '[data-provider-usage-panel] .pu-empty-text{color:var(--dsw-alias-label-tertiary);font-weight:550}',
    '[data-provider-usage-panel] .pu-detail{box-sizing:border-box;display:flex;flex-direction:column;width:100%;min-width:0;padding:0;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);overflow:hidden}',
    '[data-provider-usage-panel] .pu-detail-head{display:flex;align-items:center;gap:6px;padding:0 6px;border-bottom:1px solid var(--dsw-alias-border-l2);flex:none}',
    '[data-provider-usage-panel] .pu-detail-head .pu-icon-btn{width:32px;height:32px;flex:none}',
    '[data-provider-usage-panel] .pu-detail-body{padding:8px 10px;display:grid;gap:10px}',
    '[data-provider-usage-panel] .pu-detail-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:550;color:color-mix(in srgb,var(--dsw-alias-label-primary) 62%,var(--dsw-alias-label-secondary))}',
    '[data-provider-usage-panel] .pu-detail-sub{margin:0;color:var(--dsw-alias-label-tertiary);font-size:11px}',
    '[data-provider-usage-panel] .pu-tip-empty{padding:8px 0;color:var(--dsw-alias-label-secondary);font-size:12px}',
    '[data-provider-usage-panel] .pu-empty{padding:22px 8px;color:var(--dsw-alias-label-tertiary);text-align:center;font-size:11px;line-height:18px}',
    '[data-provider-usage-panel] .pu-empty-btn{margin-top:8px;padding:4px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-state-business-primary);font-size:11px;cursor:pointer}',
    '[data-provider-usage-panel] .pu-popover{position:absolute;z-index:20;right:4px;bottom:44px;left:4px;max-height:min(520px,calc(100vh - 100px));overflow:hidden;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-shadow-lv2,0 10px 30px rgba(0,0,0,0.18))}',
    '[data-provider-usage-panel] .pu-popover-head{display:flex;align-items:center;padding:12px 12px 8px}',
    '[data-provider-usage-panel] .pu-popover-title{font-size:13px;font-weight:500;color:var(--dsw-alias-label-secondary)}',
    '[data-provider-usage-panel] .pu-popover-sub{margin-top:2px;color:var(--dsw-alias-label-tertiary);font-size:10.5px}',
    '[data-provider-usage-panel] .pu-popover-close{margin-left:auto}',
    '[data-provider-usage-panel] .pu-search{width:calc(100% - 20px);height:30px;margin:0 10px 6px;padding:0 9px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;outline:none;background:transparent;color:var(--dsw-alias-label-primary);font-size:12px}',
    '[data-provider-usage-panel] .pu-search:focus{border-color:var(--dsw-alias-state-business-primary)}',
    '[data-provider-usage-panel] .pu-filter-list{max-height:330px;overflow:auto;padding:2px 8px 8px}',
    '[data-provider-usage-panel] .pu-filter-item{display:flex;align-items:center;gap:8px;min-height:34px;padding:0 5px;border-radius:7px;font-size:12px;color:var(--dsw-alias-label-primary);cursor:pointer}',
    '[data-provider-usage-panel] .pu-filter-list [data-sortable-row="true"]{grid-template-columns:16px minmax(0,1fr)!important;border:0;background:transparent;border-radius:7px}',
    '[data-provider-usage-panel] .pu-filter-list [data-sortable-handle]{width:16px!important;min-height:28px!important;border-right:0!important;opacity:.65}',
    '[data-provider-usage-panel] .pu-filter-item:hover{background:var(--dsw-alias-bg-module-platform)}',
    '[data-provider-usage-panel] .pu-filter-all{width:100%;border:0;border-bottom:1px solid var(--dsw-alias-border-l2);background:transparent;text-align:left;font-weight:500}',
    '[data-provider-usage-panel] .pu-filter-all:disabled{cursor:default;opacity:.55}',
    '[data-provider-usage-panel] .pu-filter-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '[data-provider-usage-panel] .pu-no-match{padding:16px 8px;color:var(--dsw-alias-label-tertiary);text-align:center;font-size:11px}',
    '@media (pointer:coarse){[data-provider-usage-panel] .pu-row{min-height:44px}[data-provider-usage-panel] .pu-icon-btn,[data-provider-usage-panel] .pu-detail-head .pu-icon-btn{width:44px;height:44px}[data-provider-usage-panel] .pu-head{height:44px;padding-bottom:0}}',
].join('\n');
/** Shared refresh glyph. */
function RefreshIcon() {
    return _jsxs("svg", { viewBox: "0 0 20 20", "aria-hidden": "true", children: [_jsx("path", { d: "M16.2 7A6.5 6.5 0 1 0 16 13.5" }), _jsx("path", { d: "M16.2 3.8V7H13" })] });
}
function ProviderRow(props) {
    const summary = props.summary;
    const hasData = summary.status === 'ready' || summary.status === 'stale';
    const primary = hasData ? pickPrimaryWindow(summary.windows) ?? summary.windows[0] : undefined;
    const headline = primary === undefined ? (summary.status === 'loading' ? '…' : '—') : windowValueText(primary);
    const label = summary.name + ' ' + (primary === undefined ? props.t(STATUS_KEY[summary.status]) : headline) + (summary.status === 'stale' ? ' · ' + props.t('usageExpired') : '');
    const low = usageLow(primary?.remainingPercent);
    return (_jsx("div", { className: "pu-cell", children: _jsxs("button", { type: "button", className: 'pu-row' + (low ? ' pu-warn' : ''), "data-usage-key": summary.providerKey, "aria-label": label, title: label, onClick: props.onSelect, children: [_jsxs("span", { className: "pu-mark", children: [_jsx(ProviderMark, { providerKey: summary.providerKey }), summary.status === 'stale' && _jsx("span", { className: "pu-stale", "aria-hidden": "true", children: "*" })] }), _jsx("span", { className: 'pu-primary' + (primary === undefined ? ' pu-empty-text' : ''), children: headline })] }) }));
}
function UsageDetail(props) {
    const summary = props.summary;
    return (_jsxs("div", { className: "pu-detail", "aria-label": props.t('usageDetails').replace('{name}', summary.name), children: [_jsxs("div", { className: "pu-detail-head", children: [_jsx("button", { type: "button", className: "pu-icon-btn", "aria-label": props.t('usageBack'), autoFocus: true, onClick: props.onBack, children: _jsx("svg", { viewBox: "0 0 20 20", "aria-hidden": "true", children: _jsx("path", { d: "M12.5 4.5 7 10l5.5 5.5" }) }) }), _jsx("span", { className: "pu-mark", children: _jsx(ProviderMark, { providerKey: summary.providerKey }) }), _jsx("span", { className: "pu-detail-name grow", children: summary.name }), _jsx("button", { type: "button", className: 'pu-icon-btn' + (summary.refreshing === true ? ' pu-spinning' : ''), "aria-label": props.t('usageRefreshProvider').replace('{name}', summary.name), onClick: props.onRefresh, children: summary.refreshing === true ? _jsx("span", { className: "pu-mini-spin" }) : _jsx(RefreshIcon, {}) })] }), _jsxs("div", { className: "pu-detail-body", children: [_jsx("div", { className: "pu-detail-sub", children: props.t('quotaHeading') + (summary.status === 'stale' ? ' · ' + props.t('usageExpired') : '') }), summary.windows.length === 0
                        ? _jsx("div", { className: "pu-tip-empty", children: props.t(STATUS_KEY[summary.status]) })
                        : summary.windows.map(quotaWindow => {
                            const reset = formatResetLabel(quotaWindow.resetsAt, quotaWindow.label, { at: props.t('resetAt'), overdue: props.t('resetOverdue'), missing: props.t('resetMissing') });
                            return (_jsx(ProviderQuotaMeter, { label: quotaWindow.label, ...(quotaWindow.remainingPercent === undefined ? {} : { remainingPercent: quotaWindow.remainingPercent }), emptyLabel: quotaWindow.valueText, ...(reset === undefined ? {} : { detail: reset }) }, quotaWindow.id));
                        })] })] }));
}
/** Controlled sidebar Provider Usage panel (four-column icon strip, tap for details). */
export function ProviderUsagePanel(props) {
    const providers = props.providers.filter(summary => summary.status !== 'logged-out');
    const hidden = new Set(props.hiddenKeys ?? []);
    const visible = providers.filter(summary => !hidden.has(summary.providerKey));
    const [filterOpen, setFilterOpen] = useState(false);
    const [detailKey, setDetailKey] = useState();
    const closeDetail = () => {
        const key = detailKey;
        setDetailKey(undefined);
        queueMicrotask(() => {
            const row = document.querySelector('[data-provider-usage-panel] [data-usage-key="' + key + '"]');
            if (row instanceof HTMLElement)
                row.focus();
        });
    };
    const [query, setQuery] = useState('');
    const searchRef = useRef(null);
    const detail = visible.find(summary => summary.providerKey === detailKey);
    useEffect(() => {
        if (filterOpen)
            searchRef.current?.focus();
        else
            setQuery('');
    }, [filterOpen]);
    useEffect(() => {
        if (detailKey === undefined)
            return;
        const onKey = (event) => { if (event.key === 'Escape')
            closeDetail(); };
        document.addEventListener('keydown', onKey);
        return () => { document.removeEventListener('keydown', onKey); };
    }, [detailKey]);
    const normalizedQuery = query.trim().toLowerCase();
    const matches = normalizedQuery === ''
        ? providers
        : providers.filter(summary => summary.name.toLowerCase().includes(normalizedQuery));
    const allVisible = providers.length > 0 && visible.length === providers.length;
    let body;
    if (visible.length === 0) {
        body = (_jsxs("div", { className: "pu-empty", children: [_jsx("div", { children: providers.length === 0 ? props.t('usageNoProviders') : props.t('usageNoneVisible') }), _jsx("div", { children: props.t('usageFilterHint') }), _jsx("button", { type: "button", className: "pu-empty-btn", onClick: () => { setFilterOpen(true); }, children: props.t('usageOpenFilter') })] }));
    }
    else {
        body = (_jsx("div", { className: "pu-rows", children: visible.map(summary => (_jsx(ProviderRow, { t: props.t, summary: summary, onSelect: () => { setFilterOpen(false); setDetailKey(summary.providerKey); } }, summary.providerKey))) }));
    }
    return (_jsxs("section", { "data-provider-usage-panel": true, "aria-label": "Provider Usage", children: [_jsx("style", { children: providerUiCss + panelCss }), detail === undefined && _jsxs("div", { className: "pu-head", children: [_jsx("span", { className: "pu-title", children: "Provider Usage" }), _jsxs("span", { className: "pu-actions", children: [_jsx("button", { type: "button", className: "pu-icon-btn", "aria-label": props.t('usageChooseProviders'), "aria-expanded": filterOpen, onClick: () => { setFilterOpen(open => !open); }, children: _jsxs("svg", { viewBox: "0 0 20 20", "aria-hidden": "true", children: [_jsx("path", { d: "M3 5h8M15 5h2M9 10h8M3 10h2M3 15h6M13 15h4" }), _jsx("circle", { cx: "13", cy: "5", r: "2" }), _jsx("circle", { cx: "7", cy: "10", r: "2" }), _jsx("circle", { cx: "11", cy: "15", r: "2" })] }) }), _jsx("button", { type: "button", className: 'pu-icon-btn' + (props.refreshing === true ? ' pu-spinning' : ''), "aria-label": props.t('usageRefreshAll'), onClick: () => { props.onRefresh(); }, children: _jsx(RefreshIcon, {}) })] })] }), _jsx("div", { className: 'pu-stage' + (detail === undefined ? '' : ' pu-stage-open'), children: detail === undefined ? body : _jsx(UsageDetail, { t: props.t, summary: detail, onBack: closeDetail, onRefresh: () => { props.onRefresh(detail.providerKey); } }) }), filterOpen
                ? (_jsxs("section", { className: "pu-popover", role: "dialog", "aria-label": props.t('usageVisibility'), onKeyDown: event => { if (event.key === 'Escape') {
                        setFilterOpen(false);
                        setDetailKey(undefined);
                    } }, children: [_jsxs("div", { className: "pu-popover-head", children: [_jsxs("div", { children: [_jsx("div", { className: "pu-popover-title", children: props.t('usageVisibility') }), _jsx("div", { className: "pu-popover-sub", children: props.t('usageVisibilityHint') })] }), _jsx("button", { type: "button", className: "pu-icon-btn pu-popover-close", "aria-label": props.t('usageCloseFilter'), onClick: () => { setFilterOpen(false); }, children: "\u00D7" })] }), _jsx("input", { ref: searchRef, className: "pu-search", type: "search", "aria-label": props.t('usageSearch'), placeholder: props.t('usageSearch'), value: query, onChange: event => { setQuery(event.target.value); } }), _jsxs("div", { className: "pu-filter-list", children: [_jsx("button", { type: "button", className: "pu-filter-item pu-filter-all", disabled: allVisible, onClick: props.onShowAll, children: props.t('usageShowAll').replace('{n}', String(providers.length)) }), matches.length === 0 ? _jsx("p", { className: "pu-no-match", children: props.t('usageNoMatch') }) : query.trim() === '' && props.onReorder !== undefined && matches.length > 1
                                    ? (_jsx(SortableList, { items: [...matches], getId: summary => summary.providerKey, dragLabel: summary => props.t('usageReorder').replace('{name}', summary.name), onReorder: next => { props.onReorder?.(next.map(summary => summary.providerKey)); }, renderItem: summary => (_jsx(FilterRow, { t: props.t, summary: summary, hidden: hidden.has(summary.providerKey), onToggle: visible => { props.onToggleVisibility(summary.providerKey, visible); } })) }))
                                    : matches.map(summary => (_jsx(FilterRow, { t: props.t, summary: summary, hidden: hidden.has(summary.providerKey), onToggle: visible => { props.onToggleVisibility(summary.providerKey, visible); } }, summary.providerKey)))] })] }))
                : null] }));
}
//# sourceMappingURL=ProviderUsagePanel.js.map