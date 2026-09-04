import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Settings > LLM Providers page shell. Provider cards arrive through settings.provider.item. */
import { Fragment, useEffect, useState } from 'react';
import { applySavedOrder, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS } from '../order.js';
import { SortableList } from './SortableList.js';
const pageStyle = {
    display: 'flex', flexDirection: 'column', gap: 16, width: '100%',
};
const titleStyle = {
    margin: 0, color: 'var(--dsw-alias-label-primary)', fontSize: 16, fontWeight: 500, lineHeight: '24px',
};
const subtitleStyle = {
    margin: '4px 0 0', color: 'var(--dsw-alias-label-secondary)', fontSize: 13, lineHeight: '20px',
};
const listStyle = { display: 'flex', flexDirection: 'column', gap: 12 };
const emptyStyle = { color: 'var(--dsw-alias-label-tertiary)', fontSize: 13, lineHeight: '20px' };
/** Bind the shared page to live keyed-slot and settings snapshots. */
export function bindProvidersSection(listRegisteredKeys, subscribe, readOrder, onReorder) {
    return function BoundProvidersSection(props) {
        const [, bump] = useState(0);
        useEffect(() => subscribe(() => { bump(value => value + 1); }), [subscribe]);
        const order = readOrder();
        return (_jsx(ProvidersSection, { renderSlot: props.renderSlot, t: props.t, registeredKeys: listRegisteredKeys(), savedOrder: order.keys, disabled: order.disabled, onReorder: onReorder }));
    };
}
/** Render installed provider cards. Two or more cards grow a left drag handle. */
export function ProvidersSection(props) {
    const t = props.t ?? ((key) => key);
    const keys = applySavedOrder(props.registeredKeys ?? [], props.savedOrder ?? []);
    const items = keys.map(key => ({ key }));
    const renderCard = (item) => {
        const node = props.renderSlot?.(PROVIDERS_ITEM_SLOT, {}, { entryKey: item.key });
        return node == null ? null : _jsx(Fragment, { children: node });
    };
    const body = keys.length === 0
        ? _jsx("p", { style: emptyStyle, children: t('empty') })
        : keys.length < 2
            ? _jsx("div", { style: listStyle, children: items.map(item => _jsx(Fragment, { children: renderCard(item) }, item.key)) })
            : (_jsx(SortableList, { chrome: "card", items: items, getId: item => item.key, dragLabel: item => t('drag') + ': ' + item.key, disabled: props.disabled === true, onReorder: next => { props.onReorder?.(next.map(item => item.key)); }, renderItem: item => renderCard(item) }));
    return (_jsxs("div", { "data-providers-section": PROVIDERS_LOCALE_NS, style: pageStyle, children: [_jsxs("header", { children: [_jsx("h2", { style: titleStyle, children: t('title') }), _jsx("p", { style: subtitleStyle, children: t('subtitle') })] }), body] }));
}
//# sourceMappingURL=ProvidersSection.js.map