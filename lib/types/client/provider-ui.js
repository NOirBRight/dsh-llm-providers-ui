import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Normalize remaining quota to a 0-100 percent value.
 * Valid readings keep their precision (99.9 stays 99.9, never rounds to 100).
 * NaN, Infinity, and out-of-range readings are unavailable, not clamped:
 * clamping would fabricate a full or empty bar from bad data.
 * @param input - percent and/or fraction quota reading.
 * @returns the 0-100 remaining value, or undefined when unavailable.
 */
export function normalizeQuotaRemaining(input) {
    const percent = input.remainingPercent;
    if (percent !== undefined) {
        return Number.isFinite(percent) && percent >= 0 && percent <= 100 ? percent : undefined;
    }
    const fraction = input.remainingFraction;
    if (fraction !== undefined) {
        return Number.isFinite(fraction) && fraction >= 0 && fraction <= 1 ? fraction * 100 : undefined;
    }
    return undefined;
}
const meterWrapStyle = { display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 };
const meterTopStyle = { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 };
const meterLabelStyle = {
    minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    color: 'var(--dsw-alias-label-secondary)', fontSize: 12, lineHeight: '18px',
};
const meterValueStyle = {
    flex: 'none', fontVariantNumeric: 'tabular-nums', fontWeight: 500, fontSize: 12, lineHeight: '18px',
    color: 'var(--dsw-alias-label-primary)',
};
const meterTrackStyle = {
    display: 'block', width: '100%', height: 6, overflow: 'hidden', border: 0, borderRadius: 2,
    background: 'color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent)', position: 'relative',
};
const meterFillBase = {
    display: 'block', height: '100%', borderRadius: 2, position: 'relative',
    background: 'color-mix(in srgb, var(--dsw-alias-label-primary) 55%, var(--dsw-alias-label-secondary))',
};
const meterKnobStyle = {
    position: 'absolute', right: 0, top: 0, bottom: 0, width: 2,
    background: 'var(--dsw-alias-label-primary)',
};
const meterSegmentsStyle = {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: 'repeating-linear-gradient(to right, transparent 0, transparent calc(10% - 1px), var(--dsw-alias-bg-layer-1) calc(10% - 1px), var(--dsw-alias-bg-layer-1) 10%)',
};
const meterWarnFill = { background: 'color-mix(in srgb, #c47b08 55%, var(--dsw-alias-label-secondary))' };
const meterLowFill = { background: 'color-mix(in srgb, #d94848 55%, var(--dsw-alias-label-secondary))' };
const meterDetailStyle = { color: 'var(--dsw-alias-label-tertiary)', fontSize: 11, lineHeight: '16px' };
const meterMissingStyle = { color: 'var(--dsw-alias-label-tertiary)', fontSize: 12, lineHeight: '18px' };
/** Segmented remaining-quota meter. Unavailable quota renders a placeholder, never a zero bar. */
export function ProviderQuotaMeter(props) {
    const remaining = normalizeQuotaRemaining(props);
    const label = props.label ?? 'Quota';
    if (remaining === undefined) {
        return _jsx("span", { "data-provider-quota-missing": "", style: meterMissingStyle, children: props.emptyLabel ?? '\u2014' });
    }
    const low = remaining <= 5;
    const warn = remaining < 20 && !low;
    const text = String(remaining);
    return (_jsxs("span", { "data-provider-quota": "", style: meterWrapStyle, ...(props.id === undefined ? {} : { id: props.id }), children: [_jsxs("span", { style: meterTopStyle, children: [_jsx("span", { style: meterLabelStyle, children: label }), _jsx("span", { style: meterValueStyle, children: text + '%' })] }), _jsxs("span", { "data-provider-quota-meter": "", role: "meter", "aria-label": label, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": remaining, style: meterTrackStyle, children: [_jsx("span", { style: { ...meterFillBase, ...(low ? meterLowFill : warn ? meterWarnFill : {}), width: text + '%' }, children: _jsx("span", { style: meterKnobStyle }) }), _jsx("span", { "aria-hidden": "true", style: meterSegmentsStyle })] }), props.detail === undefined ? null : _jsx("span", { style: meterDetailStyle, children: props.detail })] }));
}
const headerMainStyle = { display: 'flex', minWidth: 0, flex: 1, flexDirection: 'column', gap: 4 };
const headerTitleStyle = { display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, lineHeight: 1 };
const headerMarkStyle = { width: 18, height: 18, flex: 'none', display: 'block', overflow: 'visible' };
const headerNameStyle = { lineHeight: '20px' };
const headerBadgeBase = {
    display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
    fontSize: 10, fontWeight: 500, lineHeight: '16px', padding: '0 5px', borderRadius: 3,
    border: '1px solid transparent',
};
const headerBadgeLlm = {
    color: 'var(--dsw-alias-label-secondary)',
    borderColor: 'var(--dsw-alias-border-secondary)',
    background: 'transparent',
};
const headerBadgeAgent = {
    color: 'var(--dsw-alias-bg-layer-1)',
    borderColor: 'var(--dsw-alias-label-primary)',
    background: 'var(--dsw-alias-label-primary)',
};
const headerSummaryStyle = {
    fontSize: 13, lineHeight: '18px', color: 'var(--dsw-alias-label-tertiary)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
};
const headerStatusStyle = { fontSize: 12, lineHeight: '18px', color: 'var(--dsw-alias-label-secondary)' };
const headerSideStyle = { display: 'inline-flex', alignItems: 'center', gap: 10, flex: 'none' };
const headerUnsavedStyle = { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' };
const headerChevronStyle = { fontSize: 18, lineHeight: 1 };
const headerMiniStyle = { minWidth: 0, maxWidth: 220, paddingTop: 2 };
/**
 * Collapsed header contents: mark, title, monochrome role badge, provider
 * summary, optional caller status, and an optional compact quota meter.
 * Renders a fragment for the caller-owned header button, matching the legacy
 * codex provider-chrome layout so existing call sites keep working.
 */
export function ProviderCardHeader(props) {
    const role = props.role ?? 'llm';
    const quota = props.quota === undefined || props.quota === null ? undefined : {
        ...(props.quota.remainingPercent === undefined ? {} : { remainingPercent: props.quota.remainingPercent }),
        ...(props.quota.remainingFraction === undefined ? {} : { remainingFraction: props.quota.remainingFraction }),
        ...(props.quota.label === undefined ? {} : { label: props.quota.label }),
        ...(props.quota.detail === undefined ? {} : { detail: props.quota.detail }),
    };
    return (_jsxs(_Fragment, { children: [_jsxs("span", { "data-provider-header-main": "", style: headerMainStyle, children: [_jsxs("span", { style: headerTitleStyle, children: [_jsx("span", { style: headerMarkStyle, children: props.mark }), _jsx("span", { style: headerNameStyle, children: props.title }), _jsx("span", { "data-provider-role-badge": role, style: { ...headerBadgeBase, ...(role === 'agent' ? headerBadgeAgent : headerBadgeLlm) }, children: role === 'agent' ? 'Agent' : 'LLM' })] }), _jsx("span", { "data-provider-header-summary": "", style: headerSummaryStyle, children: props.summary }), props.status === undefined ? null : _jsx("span", { "data-provider-header-status": "", style: headerStatusStyle, children: props.status }), quota === undefined
                        ? null
                        : (_jsx("span", { "data-provider-quota-mini": "", style: headerMiniStyle, children: _jsx(ProviderQuotaMeter, { ...quota }) }))] }), _jsxs("span", { style: headerSideStyle, children: [props.unsaved === true && props.unsavedLabel !== undefined
                        ? _jsx("span", { style: headerUnsavedStyle, children: props.unsavedLabel })
                        : null, _jsx("span", { "data-provider-header-chevron": "", "aria-hidden": "true", style: { ...headerChevronStyle, transform: props.open ? 'rotate(180deg)' : 'none' }, children: "\\u2304" })] })] }));
}
/**
 * Scoped provider chrome CSS: plain card reset, header button layout, body and
 * model rows, quota meter responsive rules, and coarse-pointer touch targets.
 * The shell injects it once per page; provider cards may also inject it once
 * for standalone use. Duplicate style tags are harmless: every rule is scoped
 * to a data-provider-* attribute and only narrows unstyled markup.
 */
export const providerUiCss = [
    '[data-provider-card]{margin:0;border:0;border-radius:0;background:none;box-shadow:none;overflow:visible}',
    '[data-provider-card-header]{box-sizing:border-box;width:100%;min-height:68px;display:flex;align-items:center;justify-content:space-between;gap:16px;border:0;padding:12px 14px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer}',
    '[data-provider-card-header]:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent)}',
    '[data-provider-body]{display:flex;flex-direction:column;gap:18px;border-top:1px solid var(--dsw-alias-border-l2);padding:16px 14px 18px}',
    '[data-provider-model]{display:flex;align-items:center;gap:9px;min-height:40px}',
    '[data-provider-quota-mini]{display:block}',
    '[data-providers-list]{display:flex;flex-direction:column}',
    '[data-providers-list] [data-sortable-row]+[data-sortable-row]{border-top:1px solid var(--dsw-alias-border-l2)}',
    '@media (max-width:680px){[data-provider-card-header]{min-height:76px;padding:14px 4px}[data-provider-quota-mini]{max-width:none}[data-provider-model]{min-height:48px}[data-provider-model] input{width:17px;height:17px}[data-providers-section] button,[data-provider-card] button{min-height:44px}}',
    '@media (pointer:coarse){[data-sortable-handle],[data-sortable-move]{min-width:44px;min-height:44px}}',
].join('\n');
//# sourceMappingURL=provider-ui.js.map