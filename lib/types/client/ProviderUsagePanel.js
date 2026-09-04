import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Sidebar Provider Usage panel, prototype B (two-column minis). Controlled and UI-only: no RPC, no persistence. */
import { useEffect, useRef, useState } from 'react';
import { ProviderMark } from './provider-marks.js';
const PERIOD_RANK = { M: 6, W: 5, D: 4, CURS: 3, S: 1, A: 0, L: 0, CR: -1 };
function periodRank(shortLabel) {
    const normalized = shortLabel.toUpperCase();
    return PERIOD_RANK[normalized] ?? (/^\d+H$/.test(normalized) ? 2 : 0);
}
/** Headline window: longest percentage period, else the first text-only window. */
function pickPrimaryWindow(windows) {
    let best;
    for (const quotaWindow of windows) {
        if (quotaWindow.remainingPercent === undefined)
            continue;
        if (best === undefined || periodRank(quotaWindow.shortLabel) > periodRank(best.shortLabel))
            best = quotaWindow;
    }
    return best ?? windows[0];
}
function windowValueText(quotaWindow) {
    return quotaWindow.remainingPercent === undefined ? quotaWindow.valueText : String(Math.round(quotaWindow.remainingPercent)) + '%';
}
function usageTone(remainingPercent) {
    if (remainingPercent !== undefined && remainingPercent <= 20)
        return 'low';
    if (remainingPercent !== undefined && remainingPercent <= 40)
        return 'warn';
    return undefined;
}
function providerInitial(name) {
    return name.trim().charAt(0);
}
const STATUS_TEXT = {
    loading: '加载中…',
    ready: '暂无额度数据',
    'logged-out': '未登录',
    unsupported: '不支持查询',
    stale: '额度已过期',
    error: '加载失败',
};
const panelCss = [
    '[data-provider-usage-panel]{display:flex;flex-direction:column;position:relative;width:100%;min-width:0;padding:6px 6px 8px;background:transparent}',
    '[data-provider-usage-panel] .pu-head{display:flex;align-items:center;height:32px;padding:0 2px 7px}',
    '[data-provider-usage-panel] .pu-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:680;letter-spacing:.01em;color:var(--dsw-alias-label-primary)}',
    '[data-provider-usage-panel] .pu-actions{display:flex;gap:2px;margin-left:auto}',
    '[data-provider-usage-panel] .pu-mini-spin{display:inline-block;width:9px;height:9px;border:1.5px solid currentColor;border-right-color:transparent;border-radius:50%;vertical-align:middle;animation:pu-spin .55s linear infinite}',
    '[data-provider-usage-panel] .pu-row-refresh{position:absolute;top:3px;right:3px;width:18px;height:18px}',
    '[data-provider-usage-panel] .pu-detail-head .pu-icon-btn:last-child{margin-left:auto}',
    '[data-provider-usage-panel] .pu-icon-btn{display:grid;place-items:center;width:25px;height:25px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}',
    '[data-provider-usage-panel] .pu-icon-btn:hover{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary)}',
    '[data-provider-usage-panel] .pu-icon-btn:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}',
    '[data-provider-usage-panel] .pu-icon-btn svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.7}',
    '[data-provider-usage-panel] .pu-spinning svg{animation:pu-spin .55s ease}',
    '@keyframes pu-spin{to{transform:rotate(360deg)}}',
    '[data-provider-usage-panel] .pu-stage{width:100%;min-width:0;height:132px;overflow:hidden;padding:1px;margin:-1px}',
    '[data-provider-usage-panel] .pu-rows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px}',
    '[data-provider-usage-panel] .pu-row{box-sizing:border-box;position:relative;display:flex;align-items:center;gap:8px;width:100%;min-width:0;min-height:40px;padding:5px 22px 5px 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:inherit;text-align:left;cursor:pointer}',
    '[data-provider-usage-panel] .pu-row:hover{border-color:var(--dsw-alias-label-tertiary)}',
    '[data-provider-usage-panel] .pu-active{border-color:var(--dsw-alias-state-business-primary);box-shadow:0 0 0 1px var(--dsw-alias-state-business-primary)}',
    '[data-provider-usage-panel] .pu-mark{display:grid;place-items:center;flex:none;width:18px;height:18px;overflow:hidden}',
    '[data-provider-usage-panel] .pu-logo{display:block;width:18px;height:18px;color:var(--dsw-alias-label-primary)}',
    '[data-provider-usage-panel] .pu-copy{display:flex;flex-direction:column;gap:0;min-width:0}',
    '[data-provider-usage-panel] .pu-icon{display:grid;place-items:center;flex:none;width:14px;height:14px;border-radius:4px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-module-platform);font-size:8px;font-weight:750}',
    '[data-provider-usage-panel] .pu-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary);font-size:10px;font-weight:620;line-height:12px}',
    '[data-provider-usage-panel] .pu-stale{flex:none;margin-left:auto;color:var(--dsw-alias-label-tertiary);font-size:8px}',
    '[data-provider-usage-panel] .pu-primary{color:inherit;font-size:12px;font-weight:730;line-height:14px;font-variant-numeric:tabular-nums}',
    '[data-provider-usage-panel] .pu-low .pu-primary,[data-provider-usage-panel] .pu-tip-value.pu-low{color:#d94848}',
    '[data-provider-usage-panel] .pu-warn .pu-primary,[data-provider-usage-panel] .pu-tip-value.pu-warn{color:#c47b08}',
    '[data-provider-usage-panel] .pu-empty-text{color:var(--dsw-alias-label-tertiary);font-weight:550}',
    '[data-provider-usage-panel] .pu-detail{box-sizing:border-box;display:block;width:100%;min-width:0;height:100%;overflow:auto;padding:10px 12px 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);scrollbar-width:thin}',
    '[data-provider-usage-panel] .pu-detail-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}',
    '[data-provider-usage-panel] .pu-detail-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:700;color:var(--dsw-alias-label-primary)}',
    '[data-provider-usage-panel] .pu-detail-sub{margin-bottom:6px;color:var(--dsw-alias-label-tertiary);font-size:11px}',
    '[data-provider-usage-panel] .pu-tip-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:baseline;gap:8px;min-height:22px;font-size:12px}',
    '[data-provider-usage-panel] .pu-tip-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary)}',
    '[data-provider-usage-panel] .pu-tip-value{font-variant-numeric:tabular-nums;font-weight:700;color:var(--dsw-alias-label-primary)}',
    '[data-provider-usage-panel] .pu-tip-reset{grid-column:1/-1;margin:-2px 0 6px;color:var(--dsw-alias-label-tertiary);font-size:11px}',
    '[data-provider-usage-panel] .pu-tip-empty{color:var(--dsw-alias-label-secondary);font-size:12px}',
    '[data-provider-usage-panel] .pu-empty{padding:22px 8px;color:var(--dsw-alias-label-tertiary);text-align:center;font-size:11px;line-height:18px}',
    '[data-provider-usage-panel] .pu-empty-btn{margin-top:8px;padding:4px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-state-business-primary);font-size:11px;cursor:pointer}',
    '[data-provider-usage-panel] .pu-popover{position:absolute;z-index:20;right:4px;bottom:44px;left:4px;max-height:min(520px,calc(100vh - 100px));overflow:hidden;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-shadow-lv2,0 10px 30px rgba(0,0,0,0.18))}',
    '[data-provider-usage-panel] .pu-popover-head{display:flex;align-items:center;padding:12px 12px 8px}',
    '[data-provider-usage-panel] .pu-popover-title{font-size:13px;font-weight:700;color:var(--dsw-alias-label-primary)}',
    '[data-provider-usage-panel] .pu-popover-sub{margin-top:2px;color:var(--dsw-alias-label-tertiary);font-size:10.5px}',
    '[data-provider-usage-panel] .pu-popover-close{margin-left:auto}',
    '[data-provider-usage-panel] .pu-search{width:calc(100% - 20px);height:30px;margin:0 10px 6px;padding:0 9px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;outline:none;background:transparent;color:var(--dsw-alias-label-primary);font-size:12px}',
    '[data-provider-usage-panel] .pu-search:focus{border-color:var(--dsw-alias-state-business-primary)}',
    '[data-provider-usage-panel] .pu-filter-list{max-height:330px;overflow:auto;padding:2px 8px 8px}',
    '[data-provider-usage-panel] .pu-filter-item{display:flex;align-items:center;gap:8px;min-height:34px;padding:0 5px;border-radius:7px;font-size:12px;color:var(--dsw-alias-label-primary);cursor:pointer}',
    '[data-provider-usage-panel] .pu-filter-item:hover{background:var(--dsw-alias-bg-module-platform)}',
    '[data-provider-usage-panel] .pu-filter-all{width:100%;border:0;border-bottom:1px solid var(--dsw-alias-border-l2);background:transparent;text-align:left;font-weight:650}',
    '[data-provider-usage-panel] .pu-filter-all:disabled{cursor:default;opacity:.55}',
    '[data-provider-usage-panel] .pu-filter-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '[data-provider-usage-panel] .pu-no-match{padding:16px 8px;color:var(--dsw-alias-label-tertiary);text-align:center;font-size:11px}',
    '@media (max-width:640px){[data-provider-usage-panel] .pu-name{font-size:11px;line-height:13px}}',
].join('\n');
function localReset(value) {
    if (value === undefined)
        return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.valueOf()))
        return undefined;
    return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function headlineOf(summary) {
    const hasData = summary.status === 'ready' || summary.status === 'stale';
    const primary = hasData ? pickPrimaryWindow(summary.windows) : undefined;
    if (primary === undefined)
        return summary.status === 'ready' ? '—' : STATUS_TEXT[summary.status];
    return windowValueText(primary);
}
/** One compact two-column mini. Tap/click opens the detail card. */
function RefreshIcon() {
    return _jsxs("svg", { viewBox: "0 0 20 20", "aria-hidden": "true", children: [_jsx("path", { d: "M16.2 7A6.5 6.5 0 1 0 16 13.5" }), _jsx("path", { d: "M16.2 3.8V7H13" })] });
}
function ProviderRow(props) {
    const summary = props.summary;
    const hasData = summary.status === 'ready' || summary.status === 'stale';
    const primary = hasData ? pickPrimaryWindow(summary.windows) : undefined;
    const headline = headlineOf(summary);
    const tone = usageTone(primary?.remainingPercent);
    return (_jsxs("div", { role: "button", tabIndex: 0, className: 'pu-row' + (tone === undefined ? '' : ' pu-' + tone) + (props.active ? ' pu-active' : ''), "aria-label": summary.name + ' ' + (primary === undefined ? STATUS_TEXT[summary.status] : headline), "aria-expanded": props.selected, onClick: props.onSelect, onKeyDown: event => { if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            props.onSelect();
        } }, children: [_jsx("span", { className: "pu-mark", children: _jsx(ProviderMark, { providerKey: summary.providerKey, fallback: providerInitial(summary.name) }) }), _jsxs("span", { className: "pu-copy", children: [_jsxs("span", { className: "pu-name", children: [summary.name, summary.status === 'stale' ? ' · 已过期' : ''] }), _jsx("b", { className: 'pu-primary' + (primary === undefined ? ' pu-empty-text' : ''), children: headline })] }), _jsx("button", { type: "button", className: 'pu-icon-btn pu-row-refresh' + (summary.refreshing === true ? ' pu-spinning' : ''), "aria-label": '刷新 ' + summary.name, onClick: event => { event.stopPropagation(); props.onRefresh(); }, children: summary.refreshing === true ? _jsx("span", { className: "pu-mini-spin" }) : _jsx(RefreshIcon, {}) })] }));
}
function UsageDetail(props) {
    const summary = props.summary;
    return (_jsxs("div", { className: "pu-detail", "aria-label": summary.name + ' 额度详情', children: [_jsxs("div", { className: "pu-detail-head", children: [_jsx("button", { type: "button", className: "pu-icon-btn", "aria-label": "\u8FD4\u56DE\u5168\u90E8 Provider", onClick: props.onBack, children: _jsx("svg", { viewBox: "0 0 20 20", "aria-hidden": "true", children: _jsx("path", { d: "M12.5 4.5 7 10l5.5 5.5" }) }) }), _jsx("span", { className: "pu-mark", children: _jsx(ProviderMark, { providerKey: summary.providerKey, fallback: providerInitial(summary.name) }) }), _jsx("span", { className: "pu-detail-name", children: summary.name }), _jsx("button", { type: "button", className: 'pu-icon-btn' + (summary.refreshing === true ? ' pu-spinning' : ''), "aria-label": '刷新 ' + summary.name, onClick: props.onRefresh, children: summary.refreshing === true ? _jsx("span", { className: "pu-mini-spin" }) : _jsx(RefreshIcon, {}) })] }), _jsx("div", { className: "pu-detail-sub", children: "\u5269\u4F59\u989D\u5EA6" }), summary.windows.length === 0
                ? _jsx("div", { className: "pu-tip-empty", children: STATUS_TEXT[summary.status] })
                : summary.windows.map(quotaWindow => {
                    const reset = localReset(quotaWindow.resetsAt);
                    const tone = usageTone(quotaWindow.remainingPercent);
                    return (_jsxs("div", { children: [_jsxs("div", { className: "pu-tip-row", children: [_jsx("span", { className: "pu-tip-label", children: quotaWindow.label }), _jsx("span", { className: 'pu-tip-value' + (tone === undefined ? '' : ' pu-' + tone), children: windowValueText(quotaWindow) })] }), reset === undefined ? null : _jsxs("div", { className: "pu-tip-reset", children: ["\u91CD\u7F6E ", reset] })] }, quotaWindow.id));
                })] }));
}
/** Controlled sidebar Provider Usage panel (two-column minis, tap for details). */
export function ProviderUsagePanel(props) {
    const hidden = new Set(props.hiddenKeys ?? []);
    const visible = props.providers.filter(summary => !hidden.has(summary.providerKey));
    const [filterOpen, setFilterOpen] = useState(false);
    const [detailKey, setDetailKey] = useState();
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
            setDetailKey(undefined); };
        document.addEventListener('keydown', onKey);
        return () => { document.removeEventListener('keydown', onKey); };
    }, [detailKey]);
    const normalizedQuery = query.trim().toLowerCase();
    const matches = normalizedQuery === ''
        ? props.providers
        : props.providers.filter(summary => summary.name.toLowerCase().includes(normalizedQuery));
    const allVisible = props.providers.length > 0 && visible.length === props.providers.length;
    let body;
    if (visible.length === 0) {
        body = (_jsxs("div", { className: "pu-empty", children: [_jsx("div", { children: props.providers.length === 0 ? '暂无可查询的 Provider' : '没有显示的 Provider' }), _jsx("div", { children: "\u4F7F\u7528\u7B5B\u9009\u6309\u94AE\u9009\u62E9\u8981\u5728\u4FA7\u680F\u663E\u793A\u7684 Provider" }), _jsx("button", { type: "button", className: "pu-empty-btn", onClick: () => { setFilterOpen(true); }, children: "\u6253\u5F00\u7B5B\u9009" })] }));
    }
    else {
        body = (_jsx("div", { className: "pu-rows", children: visible.map(summary => (_jsx(ProviderRow, { summary: summary, active: summary.providerKey === props.currentProviderKey, selected: false, onSelect: () => { setFilterOpen(false); setDetailKey(summary.providerKey); }, onRefresh: () => { props.onRefresh(summary.providerKey); } }, summary.providerKey))) }));
    }
    return (_jsxs("section", { "data-provider-usage-panel": true, "aria-label": "Provider Usage", children: [_jsx("style", { children: panelCss }), _jsxs("div", { className: "pu-head", children: [_jsx("span", { className: "pu-title", children: "Provider Usage" }), _jsxs("span", { className: "pu-actions", children: [_jsx("button", { type: "button", className: "pu-icon-btn", "aria-label": "\u9009\u62E9\u4FA7\u680F\u663E\u793A\u7684 Provider", "aria-expanded": filterOpen, title: "\u9009\u62E9\u663E\u793A\u7684 Provider", onClick: () => { setFilterOpen(open => !open); }, children: _jsxs("svg", { viewBox: "0 0 20 20", "aria-hidden": "true", children: [_jsx("path", { d: "M3 5h8M15 5h2M9 10h8M3 10h2M3 15h6M13 15h4" }), _jsx("circle", { cx: "13", cy: "5", r: "2" }), _jsx("circle", { cx: "7", cy: "10", r: "2" }), _jsx("circle", { cx: "11", cy: "15", r: "2" })] }) }), _jsx("button", { type: "button", className: 'pu-icon-btn' + (props.refreshing === true ? ' pu-spinning' : ''), "aria-label": "\u5237\u65B0\u7528\u91CF", title: "\u5237\u65B0\u5168\u90E8", onClick: () => { props.onRefresh(); }, children: _jsxs("svg", { viewBox: "0 0 20 20", "aria-hidden": "true", children: [_jsx("path", { d: "M16.2 7A6.5 6.5 0 1 0 16 13.5" }), _jsx("path", { d: "M16.2 3.8V7H13" })] }) })] })] }), _jsx("div", { className: "pu-stage", children: detail === undefined ? body : _jsx(UsageDetail, { summary: detail, onBack: () => { setDetailKey(undefined); }, onRefresh: () => { props.onRefresh(detail.providerKey); } }) }), filterOpen
                ? (_jsxs("section", { className: "pu-popover", role: "dialog", "aria-label": "\u4FA7\u680F\u663E\u793A", onKeyDown: event => { if (event.key === 'Escape') {
                        setFilterOpen(false);
                        setDetailKey(undefined);
                    } }, children: [_jsxs("div", { className: "pu-popover-head", children: [_jsxs("div", { children: [_jsx("div", { className: "pu-popover-title", children: "\u4FA7\u680F\u663E\u793A" }), _jsx("div", { className: "pu-popover-sub", children: "\u53EA\u5F71\u54CD Provider Usage\uFF0C\u4E0D\u5F71\u54CD\u6A21\u578B\u5217\u8868" })] }), _jsx("button", { type: "button", className: "pu-icon-btn pu-popover-close", "aria-label": "\u5173\u95ED\u7B5B\u9009", onClick: () => { setFilterOpen(false); }, children: "\u00D7" })] }), _jsx("input", { ref: searchRef, className: "pu-search", type: "search", "aria-label": "\u641C\u7D22 Provider", placeholder: "\u641C\u7D22 Provider", value: query, onChange: event => { setQuery(event.target.value); } }), _jsxs("div", { className: "pu-filter-list", children: [_jsx("button", { type: "button", className: "pu-filter-item pu-filter-all", disabled: allVisible, onClick: props.onShowAll, children: '显示全部 ' + String(props.providers.length) + ' 个' }), matches.map(summary => (_jsxs("label", { className: "pu-filter-item", children: [_jsx("input", { type: "checkbox", "aria-label": '在侧栏显示 ' + summary.name, checked: !hidden.has(summary.providerKey), onChange: event => { props.onToggleVisibility(summary.providerKey, event.target.checked); } }), _jsx("span", { className: "pu-mark", children: _jsx(ProviderMark, { providerKey: summary.providerKey, fallback: providerInitial(summary.name) }) }), _jsx("span", { className: "pu-filter-name", children: summary.name })] }, summary.providerKey))), matches.length === 0 ? _jsx("p", { className: "pu-no-match", children: "\u6CA1\u6709\u5339\u914D\u7684 Provider" }) : null] })] }))
                : null] }));
}
//# sourceMappingURL=ProviderUsagePanel.js.map