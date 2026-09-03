import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Sidebar Provider Usage panel, prototype B (two-column digest). Controlled and UI-only: no RPC, no persistence. */
import { useEffect, useRef, useState } from 'react';
/** Headline window: smallest remainingPercent, else the first window. Never ranks providers. */
function pickPrimaryWindow(windows) {
    let best;
    for (const window of windows) {
        const remaining = window.remainingPercent;
        if (remaining === undefined)
            continue;
        if (best === undefined || remaining < (best.remainingPercent ?? Number.POSITIVE_INFINITY))
            best = window;
    }
    return best ?? windows[0];
}
/** Headline text: percent when known, otherwise the window's own text. */
function primaryValueText(window) {
    if (window === undefined)
        return '';
    return window.remainingPercent === undefined ? window.valueText : String(window.remainingPercent) + '%';
}
/** Only low/warn headlines take red/amber; everything else stays neutral. */
function usageTone(remainingPercent) {
    if (remainingPercent === undefined)
        return 'neutral';
    if (remainingPercent <= 15)
        return 'low';
    if (remainingPercent <= 35)
        return 'warn';
    return 'ok';
}
const STATUS_TEXT = {
    loading: '加载中…',
    'logged-out': '未登录',
    unsupported: '不支持查询',
    error: '加载失败',
};
const panelCss = [
    '[data-provider-usage-panel]{display:flex;flex-direction:column;position:relative;min-width:0;padding:7px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1)}',
    '[data-provider-usage-panel] .pu-head{display:flex;align-items:center;height:28px;padding:0 1px 5px}',
    '[data-provider-usage-panel] .pu-title{font-size:12.5px;font-weight:650;color:var(--dsw-alias-label-primary)}',
    '[data-provider-usage-panel] .pu-count{margin-left:6px;color:var(--dsw-alias-label-tertiary);font-size:11px;font-variant-numeric:tabular-nums}',
    '[data-provider-usage-panel] .pu-actions{display:flex;gap:2px;margin-left:auto}',
    '[data-provider-usage-panel] .pu-icon-btn{display:grid;place-items:center;width:25px;height:25px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}',
    '[data-provider-usage-panel] .pu-icon-btn:hover{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary)}',
    '[data-provider-usage-panel] .pu-icon-btn svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.7}',
    '[data-provider-usage-panel] .pu-spinning svg{animation:pu-spin .55s ease}',
    '@keyframes pu-spin{to{transform:rotate(360deg)}}',
    '[data-provider-usage-panel] .pu-scroll{max-height:170px;overflow:auto;scrollbar-width:thin}',
    '[data-provider-usage-panel] .pu-rows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));overflow:hidden;border:1px solid var(--dsw-alias-border-l2);border-radius:9px;background:var(--dsw-alias-bg-layer-1)}',
    '[data-provider-usage-panel] .pu-row{display:flex;flex-direction:column;align-items:stretch;gap:5px;width:100%;min-width:0;min-height:51px;padding:7px 8px 6px;border:0;border-right:1px solid var(--dsw-alias-border-l2);border-bottom:1px solid var(--dsw-alias-border-l2);border-radius:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}',
    '[data-provider-usage-panel] .pu-row:nth-child(even){border-right:0}',
    '[data-provider-usage-panel] .pu-row:nth-last-child(-n+2){border-bottom:0}',
    '[data-provider-usage-panel] .pu-row:hover{background:var(--dsw-alias-bg-module-platform)}',
    '[data-provider-usage-panel] .pu-active{background:var(--dsw-alias-bg-module-platform);box-shadow:inset 2px 0 var(--dsw-alias-state-business-primary)}',
    '[data-provider-usage-panel] .pu-top{display:flex;align-items:center;gap:5px;min-width:0}',
    '[data-provider-usage-panel] .pu-id{display:flex;align-items:center;gap:5px;min-width:0}',
    '[data-provider-usage-panel] .pu-icon{display:grid;place-items:center;flex:none;width:16px;height:16px;border-radius:5px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-module-platform);font-size:9px;font-weight:700}',
    '[data-provider-usage-panel] .pu-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary);font-size:10.5px;font-weight:650}',
    '[data-provider-usage-panel] .pu-primary{flex:none;margin-left:auto;color:var(--dsw-alias-label-secondary);font-size:10.5px;font-variant-numeric:tabular-nums}',
    '[data-provider-usage-panel] .pu-low .pu-primary{color:#d94848}',
    '[data-provider-usage-panel] .pu-warn .pu-primary{color:#c47b08}',
    '[data-provider-usage-panel] .pu-stale{flex:none;padding:0 3px;border:1px solid var(--dsw-alias-border-l2);border-radius:4px;color:var(--dsw-alias-label-tertiary);font-size:8px;line-height:12px;white-space:nowrap}',
    '[data-provider-usage-panel] .pu-windows{display:grid;gap:2px;min-width:0;color:var(--dsw-alias-label-secondary);font-size:8px;line-height:11px;white-space:nowrap}',
    '[data-provider-usage-panel] .pu-window{display:flex;justify-content:center;gap:2px;min-width:0;overflow:hidden}',
    '[data-provider-usage-panel] .pu-window small{flex:none;color:var(--dsw-alias-label-tertiary);font-size:inherit;text-transform:uppercase}',
    '[data-provider-usage-panel] .pu-window b{overflow:hidden;color:var(--dsw-alias-label-secondary);font-weight:600;font-variant-numeric:tabular-nums}',
    '[data-provider-usage-panel] .pu-empty{padding:22px 8px;color:var(--dsw-alias-label-tertiary);text-align:center;font-size:11px;line-height:18px}',
    '[data-provider-usage-panel] .pu-empty-btn{margin-top:8px;padding:4px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;background:transparent;color:var(--dsw-alias-state-business-primary);font-size:11px;cursor:pointer}',
    '[data-provider-usage-panel] .pu-popover{position:absolute;z-index:20;right:4px;bottom:44px;left:4px;max-height:min(520px,calc(100vh - 100px));overflow:hidden;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-shadow-lv2,0 10px 30px rgba(0,0,0,0.18))}',
    '[data-provider-usage-panel] .pu-popover-head{display:flex;align-items:center;padding:12px 12px 8px}',
    '[data-provider-usage-panel] .pu-popover-title{font-size:13px;font-weight:700;color:var(--dsw-alias-label-primary)}',
    '[data-provider-usage-panel] .pu-popover-sub{margin-top:2px;color:var(--dsw-alias-label-tertiary);font-size:10.5px}',
    '[data-provider-usage-panel] .pu-popover-close{margin-left:auto}',
    '[data-provider-usage-panel] .pu-search{width:calc(100% - 20px);height:30px;margin:0 10px 6px;padding:0 9px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;outline:none;background:transparent;color:var(--dsw-alias-label-primary);font-size:12px}',
    '[data-provider-usage-panel] .pu-filter-list{max-height:330px;overflow:auto;padding:2px 8px 8px}',
    '[data-provider-usage-panel] .pu-filter-item{display:flex;align-items:center;gap:8px;min-height:34px;padding:0 5px;border-radius:7px;font-size:12px;color:var(--dsw-alias-label-primary);cursor:pointer}',
    '[data-provider-usage-panel] .pu-filter-item:hover{background:var(--dsw-alias-bg-module-platform)}',
    '[data-provider-usage-panel] .pu-filter-all{border-bottom:1px solid var(--dsw-alias-border-l2);font-weight:650}',
    '[data-provider-usage-panel] .pu-filter-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '[data-provider-usage-panel] .pu-no-match{padding:16px 8px;color:var(--dsw-alias-label-tertiary);text-align:center;font-size:11px}',
    '@media (max-width:640px){[data-provider-usage-panel] .pu-rows{grid-template-columns:1fr}[data-provider-usage-panel] .pu-row{min-height:45px;border-right:0}[data-provider-usage-panel] .pu-row:nth-last-child(-n+2){border-bottom:1px solid var(--dsw-alias-border-l2)}[data-provider-usage-panel] .pu-row:last-child{border-bottom:0}[data-provider-usage-panel] .pu-windows{gap:8px;font-size:9px}}',
].join('\n');
function windowTooltip(windows) {
    return windows
        .map(window => window.label + ' ' + (window.remainingPercent === undefined ? window.valueText : String(window.remainingPercent) + '%')
        + (window.resetsAt === undefined ? '' : ' · 重置 ' + window.resetsAt))
        .join('；');
}
/** One compact two-line provider cell. Statuses without data show a single status line. */
function ProviderRow(props) {
    const summary = props.summary;
    const hasData = summary.status === 'ready' || summary.status === 'stale';
    const primary = hasData ? pickPrimaryWindow(summary.windows) : undefined;
    const tone = primary === undefined ? 'neutral' : usageTone(primary.remainingPercent);
    const headline = primary === undefined ? (STATUS_TEXT[summary.status] ?? '') : primaryValueText(primary);
    const shown = summary.windows.slice(0, 3);
    const toneClass = tone === 'low' ? ' pu-low' : tone === 'warn' ? ' pu-warn' : '';
    return (_jsxs("button", { type: "button", className: 'pu-row' + toneClass + (props.active ? ' pu-active' : ''), "aria-label": summary.name + ' ' + headline, title: summary.windows.length > 0 ? windowTooltip(summary.windows) : headline, children: [_jsxs("span", { className: "pu-top", children: [_jsxs("span", { className: "pu-id", children: [_jsx("span", { className: "pu-icon", "aria-hidden": true, children: summary.name.trim().charAt(0) }), _jsx("span", { className: "pu-name", children: summary.name })] }), _jsx("b", { className: "pu-primary", children: headline }), summary.status === 'stale'
                        ? _jsx("span", { className: "pu-stale", title: '上次更新 ' + (summary.fetchedAt ?? '未知'), children: "\u5DF2\u8FC7\u671F" })
                        : null] }), shown.length > 0
                ? (_jsx("span", { className: "pu-windows", style: { gridTemplateColumns: 'repeat(' + String(shown.length) + ', minmax(0, 1fr))' }, children: shown.map(window => (_jsxs("span", { className: "pu-window", title: window.label + (window.resetsAt === undefined ? '' : ' · 重置 ' + window.resetsAt), children: [_jsx("small", { children: window.shortLabel }), _jsx("b", { children: window.remainingPercent === undefined ? window.valueText : String(window.remainingPercent) + '%' })] }, window.id))) }))
                : null] }));
}
/** Controlled sidebar Provider Usage panel (desktop two columns, mobile one column). */
export function ProviderUsagePanel(props) {
    const hidden = new Set(props.hiddenKeys ?? []);
    const visible = props.providers.filter(summary => !hidden.has(summary.providerKey));
    const [filterOpen, setFilterOpen] = useState(false);
    const [query, setQuery] = useState('');
    const searchRef = useRef(null);
    useEffect(() => {
        if (filterOpen)
            searchRef.current?.focus();
        else
            setQuery('');
    }, [filterOpen]);
    const normalizedQuery = query.trim().toLowerCase();
    const matches = normalizedQuery === ''
        ? props.providers
        : props.providers.filter(summary => summary.name.toLowerCase().includes(normalizedQuery));
    const allVisible = props.providers.length > 0 && visible.length === props.providers.length;
    let body;
    if (props.unavailable === true) {
        body = _jsx("p", { className: "pu-empty", children: "Provider \u7528\u91CF\u6682\u4E0D\u53EF\u7528\uFF0C\u8BF7\u7A0D\u540E\u5237\u65B0\u91CD\u8BD5\u3002" });
    }
    else if (props.loading === true && visible.length === 0) {
        body = _jsx("p", { className: "pu-empty", children: "\u6B63\u5728\u52A0\u8F7D Provider \u7528\u91CF\u2026" });
    }
    else if (visible.length === 0) {
        body = (_jsxs("div", { className: "pu-empty", children: [_jsx("div", { children: props.providers.length === 0 ? '暂无可查询的 Provider' : '没有显示的 Provider' }), _jsx("div", { children: "\u4F7F\u7528\u7B5B\u9009\u6309\u94AE\u9009\u62E9\u8981\u5728\u4FA7\u680F\u663E\u793A\u7684 Provider" }), _jsx("button", { type: "button", className: "pu-empty-btn", onClick: () => { setFilterOpen(true); }, children: "\u6253\u5F00\u7B5B\u9009" })] }));
    }
    else {
        body = (_jsx("div", { className: "pu-rows", children: visible.map(summary => (_jsx(ProviderRow, { summary: summary, active: summary.providerKey === props.currentProviderKey }, summary.providerKey))) }));
    }
    return (_jsxs("section", { "data-provider-usage-panel": true, "aria-label": "Provider Usage", children: [_jsx("style", { children: panelCss }), _jsxs("div", { className: "pu-head", children: [_jsx("span", { className: "pu-title", children: "Provider Usage" }), _jsx("span", { className: "pu-count", "aria-label": '已显示 ' + String(visible.length) + ' / 可查询 ' + String(props.providers.length), children: String(visible.length) + ' / ' + String(props.providers.length) }), _jsxs("span", { className: "pu-actions", children: [_jsx("button", { type: "button", className: "pu-icon-btn", "aria-label": "\u9009\u62E9\u4FA7\u680F\u663E\u793A\u7684 Provider", "aria-expanded": filterOpen, title: "\u9009\u62E9\u663E\u793A\u7684 Provider", onClick: () => { setFilterOpen(open => !open); }, children: _jsxs("svg", { viewBox: "0 0 20 20", "aria-hidden": "true", children: [_jsx("path", { d: "M3 5h8M15 5h2M9 10h8M3 10h2M3 15h6M13 15h4" }), _jsx("circle", { cx: "13", cy: "5", r: "2" }), _jsx("circle", { cx: "7", cy: "10", r: "2" }), _jsx("circle", { cx: "11", cy: "15", r: "2" })] }) }), _jsx("button", { type: "button", className: 'pu-icon-btn' + (props.refreshing === true ? ' pu-spinning' : ''), "aria-label": "\u5237\u65B0\u7528\u91CF", title: "\u5237\u65B0\u5168\u90E8", onClick: props.onRefresh, children: _jsxs("svg", { viewBox: "0 0 20 20", "aria-hidden": "true", children: [_jsx("path", { d: "M16.2 7A6.5 6.5 0 1 0 16 13.5" }), _jsx("path", { d: "M16.2 3.8V7H13" })] }) })] })] }), _jsx("div", { className: "pu-scroll", children: body }), filterOpen
                ? (_jsxs("section", { className: "pu-popover", role: "dialog", "aria-label": "\u4FA7\u680F\u663E\u793A", onKeyDown: event => { if (event.key === 'Escape')
                        setFilterOpen(false); }, children: [_jsxs("div", { className: "pu-popover-head", children: [_jsxs("div", { children: [_jsx("div", { className: "pu-popover-title", children: "\u4FA7\u680F\u663E\u793A" }), _jsx("div", { className: "pu-popover-sub", children: "\u53EA\u5F71\u54CD Provider Usage\uFF0C\u4E0D\u5F71\u54CD\u6A21\u578B\u5217\u8868" })] }), _jsx("button", { type: "button", className: "pu-icon-btn pu-popover-close", "aria-label": "\u5173\u95ED\u7B5B\u9009", onClick: () => { setFilterOpen(false); }, children: "\u00D7" })] }), _jsx("input", { ref: searchRef, className: "pu-search", type: "search", "aria-label": "\u641C\u7D22 Provider", placeholder: "\u641C\u7D22 Provider", value: query, onChange: event => { setQuery(event.target.value); } }), _jsxs("div", { className: "pu-filter-list", children: [_jsxs("label", { className: "pu-filter-item pu-filter-all", children: [_jsx("input", { type: "checkbox", "aria-label": "\u663E\u793A\u5168\u90E8 Provider", checked: allVisible, onChange: event => { if (event.target.checked)
                                                props.onShowAll();
                                            else
                                                props.onHideAll(); } }), _jsx("span", { className: "pu-filter-name", children: '显示全部 ' + String(props.providers.length) + ' 个' })] }), matches.map(summary => (_jsxs("label", { className: "pu-filter-item", children: [_jsx("input", { type: "checkbox", "aria-label": '在侧栏显示 ' + summary.name, checked: !hidden.has(summary.providerKey), onChange: event => { props.onToggleVisibility(summary.providerKey, event.target.checked); } }), _jsx("span", { className: "pu-icon", "aria-hidden": true, children: summary.name.trim().charAt(0) }), _jsx("span", { className: "pu-filter-name", children: summary.name })] }, summary.providerKey))), matches.length === 0 ? _jsx("p", { className: "pu-no-match", children: "\u6CA1\u6709\u5339\u914D\u7684 Provider" }) : null] })] }))
                : null] }));
}
//# sourceMappingURL=ProviderUsagePanel.js.map