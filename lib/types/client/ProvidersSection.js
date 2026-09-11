import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Settings > LLM Providers page shell. Provider cards arrive through settings.provider.item. */
import { useEffect, useState } from 'react';
import { applySavedOrder, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS } from '../order.js';
import { SortableList } from './SortableList.js';
import { providerUiCss, ProviderRoleBadge } from './provider-ui.js';
const pageStyle = {
    display: 'flex', flexDirection: 'column', gap: 16, width: '100%',
};
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
const titleStyle = {
    margin: 0, color: 'var(--dsw-alias-label-primary)', fontSize: 16, fontWeight: 500, lineHeight: '24px',
};
const toolbarStyle = { display: 'flex', justifyContent: 'flex-end' };
const sortButtonStyle = {
    minHeight: 34, border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 18,
    padding: '6px 14px', background: 'var(--dsw-alias-bg-layer-1)',
    color: 'var(--dsw-alias-label-primary)', fontSize: 13, lineHeight: '20px', cursor: 'pointer',
};
const emptyStyle = { color: 'var(--dsw-alias-label-tertiary)', fontSize: 13, lineHeight: '20px' };
const fallbackWrapStyle = { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 };
const fallbackBadgeAlign = { alignSelf: 'flex-start' };
/** Bind the shared page to live keyed-slot and settings snapshots. */
export function bindProvidersSection(listRegisteredKeys, subscribe, readOrder, onReorder, roleOf, headerOf) {
    return function BoundProvidersSection(props) {
        const [, bump] = useState(0);
        useEffect(() => subscribe(() => { bump(value => value + 1); }), [subscribe]);
        const order = readOrder();
        return (_jsx(ProvidersSection, { renderSlot: props.renderSlot, t: props.t, registeredKeys: listRegisteredKeys(), savedOrder: order.keys, disabled: order.disabled, onReorder: onReorder, roleOf: roleOf, ...(headerOf === undefined ? {} : { headerOf }) }));
    };
}
/**
 * Render installed provider cards as a plain divider list. Sorting is an
 * explicit mode: one SortableList stays mounted in both modes with the same
 * keyed rows, so live slot state (authentication, drafts) survives the mode
 * toggle and every reorder.
 */
export function ProvidersSection(props) {
    const t = props.t ?? ((key) => key);
    const keys = applySavedOrder(props.registeredKeys ?? [], props.savedOrder ?? []);
    const items = keys.map(key => ({ key }));
    const [sorting, setSorting] = useState(false);
    const showToggle = keys.length > 1 && props.disabled !== true;
    const sortable = sorting && showToggle;
    const renderCard = (item) => {
        const node = props.renderSlot?.(PROVIDERS_ITEM_SLOT, {}, { entryKey: item.key });
        if (node == null)
            return null;
        const role = props.roleOf?.(item.key) ?? 'llm';
        if (props.headerOf?.(item.key) === 'shared')
            return _jsx("div", { "data-provider-slot": "", "data-provider-role": role, children: node });
        return (_jsxs("div", { "data-provider-slot": "", "data-provider-role": role, style: fallbackWrapStyle, children: [_jsx("span", { style: fallbackBadgeAlign, children: _jsx(ProviderRoleBadge, { ...(role === 'llm' ? {} : { role }) }) }), node] }));
    };
    const body = keys.length === 0
        ? _jsx("p", { style: emptyStyle, children: t('empty') })
        : (_jsx("div", { "data-providers-list": "", children: _jsx(SortableList, { chrome: "plain", items: items, getId: item => item.key, dragLabel: item => t('drag') + ': ' + item.key, moveButtons: true, moveUpLabel: item => t('moveUp') + ': ' + item.key, moveDownLabel: item => t('moveDown') + ': ' + item.key, sorting: sortable, ...(props.disabled === undefined ? {} : { disabled: props.disabled }), onReorder: next => { props.onReorder?.(next.map(item => item.key)); }, renderItem: item => renderCard(item) }) }));
    return (_jsxs("div", { "data-providers-section": PROVIDERS_LOCALE_NS, style: pageStyle, children: [_jsx("style", { children: providerUiCss + providerShellCss }), _jsx("header", { children: _jsx("h2", { style: titleStyle, children: t('title') }) }), showToggle
                ? (_jsx("div", { style: toolbarStyle, children: _jsx("button", { type: "button", style: sortButtonStyle, "aria-expanded": sorting, onClick: () => { setSorting(value => !value); }, children: sorting ? t('done') : t('sort') }) }))
                : null, body] }));
}
//# sourceMappingURL=ProvidersSection.js.map