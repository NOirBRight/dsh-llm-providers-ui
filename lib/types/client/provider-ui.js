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
/** Approved A low-quota fill: amber only, no red tier, no hardcoded hue. */
const meterWarnFill = { background: 'var(--dsw-alias-state-warn-primary)' };
const meterDetailStyle = { color: 'var(--dsw-alias-label-tertiary)', fontSize: 11, lineHeight: '16px' };
const meterMissingStyle = { color: 'var(--dsw-alias-label-tertiary)', fontSize: 12, lineHeight: '18px' };
/** Segmented remaining-quota meter. Unavailable quota renders a placeholder, never a zero bar. */
export function ProviderQuotaMeter(props) {
    const remaining = normalizeQuotaRemaining(props);
    const label = props.label ?? 'Quota';
    if (remaining === undefined) {
        return _jsx("span", { "data-provider-quota-missing": "", style: meterMissingStyle, children: props.emptyLabel ?? '\u2014' });
    }
    const warn = remaining < 20;
    const text = String(remaining);
    return (_jsxs("span", { "data-provider-quota": "", style: meterWrapStyle, ...(props.id === undefined ? {} : { id: props.id }), children: [_jsxs("span", { style: meterTopStyle, children: [_jsx("span", { style: meterLabelStyle, children: label }), _jsx("span", { style: meterValueStyle, children: text + '%' })] }), _jsxs("span", { "data-provider-quota-meter": "", role: "meter", "aria-label": label, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": remaining, style: meterTrackStyle, children: [_jsx("span", { style: { ...meterFillBase, ...(warn ? meterWarnFill : {}), width: text + '%' }, children: _jsx("span", { style: meterKnobStyle }) }), _jsx("span", { "aria-hidden": "true", style: meterSegmentsStyle })] }), props.detail === undefined ? null : _jsx("span", { style: meterDetailStyle, children: props.detail })] }));
}
const headerMainStyle = { display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 };
const headerIdentityStyle = { display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 };
const headerMarkStyle = { width: 28, height: 28, flex: 'none', display: 'grid', placeItems: 'center', overflow: 'visible' };
const headerTitleColStyle = { display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 };
const headerTitleStyle = { display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, lineHeight: '20px' };
const headerBadgeBase = {
    display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
    fontSize: 10, fontWeight: 500, lineHeight: '16px', padding: '0 5px', borderRadius: 3,
    border: '1px solid transparent',
};
const headerBadgeLlm = {
    color: 'var(--dsw-alias-label-secondary)',
    borderColor: 'var(--dsw-alias-border-l2)',
    background: 'transparent',
};
const headerBadgeAgent = {
    color: 'var(--dsw-alias-bg-layer-1)',
    borderColor: 'var(--dsw-alias-label-primary)',
    background: 'var(--dsw-alias-label-primary)',
};
const headerSummaryStyle = {
    fontSize: 11, lineHeight: '16px', color: 'var(--dsw-alias-label-tertiary)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
};
const headerMiniStyle = { width: 172, flex: 'none', minWidth: 0 };
const headerStatusStyle = {
    width: 96, flex: 'none', textAlign: 'right', fontSize: 11, lineHeight: '16px',
    color: 'var(--dsw-alias-label-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
};
const headerSideStyle = { display: 'inline-flex', alignItems: 'center', gap: 10, flex: 'none' };
const headerUnsavedStyle = { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' };
const headerChevronStyle = { width: 15, fontSize: 20, lineHeight: 1, textAlign: 'center', color: 'var(--dsw-alias-label-tertiary)' };
/**
 * Monochrome role badge: outlined message glyph for LLM, filled terminal glyph
 * for Agent. Shared by migrated card headers and the shell legacy fallback.
 */
export function ProviderRoleBadge(props) {
    const agent = (props.role ?? 'llm') === 'agent';
    return (_jsxs("span", { "data-provider-role-badge": agent ? 'agent' : 'llm', style: { ...headerBadgeBase, ...(agent ? headerBadgeAgent : headerBadgeLlm) }, children: [_jsx("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.4, "aria-hidden": "true", children: agent
                    ? _jsxs(_Fragment, { children: [_jsx("rect", { x: "1.5", y: "2", width: "13", height: "12", rx: "2" }), _jsx("path", { d: "m4 5 3 3-3 3m5 0h3" })] })
                    : _jsxs(_Fragment, { children: [_jsx("rect", { x: "2", y: "2", width: "12", height: "9", rx: "3" }), _jsx("path", { d: "m5 11-1 3 5-3M5 6h6" })] }) }), agent ? 'Agent' : 'LLM'] }));
}
/**
 * Approved A header geometry in one row: identity (mark beside title, badge,
 * and count) on the left, headline quota at the right, caller status, and the
 * chevron. Narrow screens stack identity plus chevron over quota plus status.
 * Renders a fragment for the caller-owned header button; props keep the legacy
 * codex provider-chrome signature so existing call sites keep working.
 */
export function ProviderCardHeader(props) {
    const quota = props.quota === undefined || props.quota === null ? undefined : {
        ...(props.quota.remainingPercent === undefined ? {} : { remainingPercent: props.quota.remainingPercent }),
        ...(props.quota.remainingFraction === undefined ? {} : { remainingFraction: props.quota.remainingFraction }),
        ...(props.quota.label === undefined ? {} : { label: props.quota.label }),
        ...(props.quota.detail === undefined ? {} : { detail: props.quota.detail }),
    };
    return (_jsxs("span", { "data-provider-header-main": "", style: headerMainStyle, children: [_jsxs("span", { "data-provider-header-identity": "", style: headerIdentityStyle, children: [_jsx("span", { "data-provider-header-mark": "", style: headerMarkStyle, children: props.mark }), _jsxs("span", { style: headerTitleColStyle, children: [_jsxs("span", { style: headerTitleStyle, children: [_jsx("span", { children: props.title }), _jsx(ProviderRoleBadge, { ...(props.role === undefined ? {} : { role: props.role }) })] }), _jsx("span", { "data-provider-header-summary": "", style: headerSummaryStyle, children: props.summary })] })] }), quota === undefined
                ? null
                : (_jsx("span", { "data-provider-quota-mini": "", style: headerMiniStyle, children: _jsx(ProviderQuotaMeter, { ...quota }) })), props.status === undefined ? null : _jsx("span", { "data-provider-header-status": "", style: headerStatusStyle, children: props.status }), _jsxs("span", { "data-provider-header-side": "", style: headerSideStyle, children: [props.unsaved === true && props.unsavedLabel !== undefined
                        ? _jsx("span", { style: headerUnsavedStyle, children: props.unsavedLabel })
                        : null, _jsx("span", { "data-provider-header-chevron": "", "aria-hidden": "true", style: { ...headerChevronStyle, transform: props.open ? 'rotate(180deg)' : 'none' }, children: "\u2304" })] })] }));
}
/**
 * Scoped provider chrome CSS: plain card reset, header button layout, body and
 * model rows, quota meter responsive rules, and coarse-pointer touch targets.
 * The shell injects it once per page; provider cards may also inject it once
 * for standalone use. Duplicate style tags are harmless: every rule is scoped
 * to a data-provider-* attribute and only narrows unstyled markup.
 */
export const providerUiCss = [
    '[data-provider-card]{box-sizing:border-box;width:100%;min-width:0;list-style:none;margin:0!important;border:0!important;border-radius:0!important;background:none!important;box-shadow:none!important;overflow:visible}',
    '[data-provider-card-header]{box-sizing:border-box;width:100%;min-height:76px;display:flex;align-items:center;justify-content:space-between;gap:16px;border:0;padding:12px 14px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer}',
    '[data-provider-body][hidden]{display:none!important}',
    '[data-provider-role-badge] svg{width:12px;height:12px}',
    '[data-provider-card-header]:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent)}',
    '[data-provider-body]{display:flex;flex-direction:column;gap:18px;border-top:1px solid var(--dsw-alias-border-l2);padding:16px 14px 18px}',
    '[data-provider-model]{display:flex;align-items:center;gap:9px;min-height:40px}',
    '[data-provider-quota-mini]{display:block}',
    '[data-providers-list]{display:flex;flex-direction:column}',
    '[data-providers-list] [data-sortable-row]+[data-sortable-row]{border-top:1px solid var(--dsw-alias-border-l2)}',
    '[data-providers-section]{container-type:inline-size}',
    '@media (max-width:680px){[data-provider-card-header]{min-height:106px;padding:17px 4px}[data-provider-header-main]{display:grid!important;grid-template-columns:minmax(0,1fr) auto;gap:7px 9px!important;align-items:center}[data-provider-header-identity]{grid-column:1;grid-row:1;gap:9px!important}[data-provider-header-mark]{width:25px!important;height:25px!important}[data-provider-role-badge]{margin-left:4px;font-size:9px!important}[data-provider-role-badge] svg{width:11px!important;height:11px!important}[data-provider-header-side]{grid-column:2;grid-row:1}[data-provider-header-side] [data-provider-header-chevron]{width:18px}[data-provider-quota-mini]{grid-column:1;grid-row:2;width:auto!important;max-width:none!important;text-align:left;padding-left:34px!important}[data-provider-header-status]{grid-column:2;grid-row:2;width:auto!important}[data-provider-model]{min-height:48px}[data-provider-model] input[type=checkbox]{width:17px;height:17px}[data-providers-section] button,[data-provider-card] button{min-height:44px}}',
    '@container (max-width:540px){[data-provider-card-header]{min-height:106px;padding:17px 4px}[data-provider-header-main]{display:grid!important;grid-template-columns:minmax(0,1fr) auto;gap:7px 9px!important;align-items:center}[data-provider-header-identity]{grid-column:1;grid-row:1;gap:9px!important}[data-provider-header-mark]{width:25px!important;height:25px!important}[data-provider-role-badge]{margin-left:4px;font-size:9px!important}[data-provider-role-badge] svg{width:11px!important;height:11px!important}[data-provider-header-side]{grid-column:2;grid-row:1}[data-provider-header-side] [data-provider-header-chevron]{width:18px}[data-provider-quota-mini]{grid-column:1;grid-row:2;width:auto!important;max-width:none!important;text-align:left;padding-left:34px!important}[data-provider-header-status]{grid-column:2;grid-row:2;width:auto!important}[data-provider-model]{min-height:48px}[data-provider-model] input[type=checkbox]{width:17px;height:17px}[data-providers-section] button,[data-provider-card] button{min-height:44px}}',
    '@media (pointer:coarse){[data-sortable-handle],[data-sortable-move]{min-width:44px;min-height:44px}}',
].join('\n');
//# sourceMappingURL=provider-ui.js.map