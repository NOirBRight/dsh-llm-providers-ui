import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Presentation-only model picker overlay. Callers supply grouped candidates. */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
const rootStyle = {
    position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', padding: 24,
};
const maskStyle = { position: 'absolute', inset: 0, background: 'var(--dsw-alias-bg-mask-1)', backdropFilter: 'var(--dsw-mask-blur)' };
const dialogStyle = {
    position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', width: 'min(520px, 100%)',
    maxHeight: 'min(680px, calc(100vh - 48px))', overflow: 'hidden', border: '1px solid var(--dsw-alias-border-inverted)',
    borderRadius: 24, background: 'var(--dsw-alias-bg-layer-2)', boxShadow: 'var(--dsw-shadow-lv3)', color: 'var(--dsw-alias-label-primary)',
};
const headerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '22px 14px 12px 24px' };
const titleStyle = { margin: 0, fontSize: 16, lineHeight: '24px', fontWeight: 500 };
const closeStyle = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, border: 0, borderRadius: 8,
    background: 'transparent', color: 'var(--dsw-alias-label-secondary)', cursor: 'pointer', fontSize: 22,
};
const descriptionStyle = { margin: 0, padding: '0 24px', fontSize: 14, lineHeight: '22px', color: 'var(--dsw-alias-label-primary)' };
const searchStyle = {
    boxSizing: 'border-box', width: 'calc(100% - 48px)', minHeight: 36, margin: '16px 24px 0',
    border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 8, padding: '7px 10px',
    background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', font: 'inherit',
};
const listStyle = { display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0, margin: '12px 24px 20px', padding: 0, overflowY: 'auto', listStyle: 'none' };
const brandHeaderStyle = { padding: '2px 0 0', fontSize: 12, lineHeight: '18px', fontWeight: 600, color: 'var(--dsw-alias-label-tertiary)' };
const brandListStyle = { display: 'flex', flexDirection: 'column', gap: 10, margin: 0, padding: 0, listStyle: 'none' };
const candidateStyle = { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, lineHeight: '22px', cursor: 'pointer' };
const footerStyle = { display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 24px 20px' };
const buttonStyle = {
    minHeight: 36, border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 8, padding: '7px 12px',
    background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', cursor: 'pointer',
};
const statusStyle = { margin: '16px 24px', fontSize: 13, color: 'var(--dsw-alias-label-secondary)' };
const errorStyle = { ...statusStyle, color: 'var(--dsw-alias-state-error-primary)' };
function matches(model, query) {
    if (query.trim() === '')
        return true;
    return ((model.name ?? '') + ' ' + model.id).toLowerCase().includes(query.trim().toLowerCase());
}
/** Searchable grouped checkbox dialog. Does not own discovery or brand rules. */
export function ModelPickerDialog(props) {
    const { open, loading, error, labels } = props;
    const [query, setQuery] = useState('');
    const searchRef = useRef(null);
    useEffect(() => { if (!open)
        setQuery(''); }, [open]);
    useEffect(() => {
        if (!open)
            return;
        const onKeyDown = (event) => { if (event.key === 'Escape')
            props.onClose(); };
        document.addEventListener('keydown', onKeyDown);
        return () => { document.removeEventListener('keydown', onKeyDown); };
    }, [open, props.onClose]);
    useEffect(() => {
        if (!open || loading || error !== undefined)
            return;
        searchRef.current?.focus();
    }, [open, loading, error]);
    if (!open || typeof document === 'undefined')
        return null;
    const visible = props.sections.map(section => ({
        ...section,
        models: section.models.filter(model => matches(model, query)),
    })).filter(section => section.models.length > 0);
    return createPortal((_jsxs("div", { style: rootStyle, role: "presentation", children: [_jsx("div", { style: maskStyle, "aria-hidden": "true", onClick: props.onClose }), _jsxs("section", { style: dialogStyle, role: "dialog", "aria-modal": "true", "aria-label": labels.title, "aria-busy": loading, children: [_jsxs("div", { style: headerStyle, children: [_jsx("h2", { style: titleStyle, children: labels.title }), _jsx("button", { type: "button", style: closeStyle, "aria-label": labels.close, onClick: props.onClose, children: "\u00D7" })] }), _jsx("p", { style: descriptionStyle, children: labels.description }), loading
                        ? _jsx("p", { style: statusStyle, role: "status", children: labels.loading })
                        : error !== undefined
                            ? _jsx("p", { style: errorStyle, role: "alert", children: error })
                            : (_jsxs(_Fragment, { children: [_jsx("input", { ref: searchRef, style: searchStyle, type: "search", value: query, placeholder: labels.search, "aria-label": labels.search, onChange: event => { setQuery(event.target.value); } }), visible.length === 0
                                        ? _jsx("p", { style: statusStyle, role: "status", children: labels.empty })
                                        : (_jsx("ul", { style: listStyle, children: visible.map(section => (_jsxs("li", { children: [_jsx("div", { style: brandHeaderStyle, children: section.label }), _jsx("ul", { style: brandListStyle, children: section.models.map(model => (_jsx("li", { children: _jsxs("label", { style: candidateStyle, children: [_jsx("input", { type: "checkbox", checked: props.picked.has(model.id), onChange: () => { props.onToggle(model.id); } }), _jsxs("span", { style: { display: 'flex', flexDirection: 'column', gap: 2 }, children: [_jsxs("span", { children: [model.name ?? model.id, model.name !== undefined && model.name !== model.id ? ' (' + model.id + ')' : ''] }), model.hint === undefined ? null : _jsx("span", { style: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' }, children: model.hint })] })] }) }, model.id))) })] }, section.id))) }))] })), _jsxs("div", { style: footerStyle, children: [_jsx("button", { type: "button", style: buttonStyle, onClick: props.onClose, children: labels.cancel }), _jsx("button", { type: "button", style: { ...buttonStyle, ...(loading || error !== undefined ? { cursor: 'not-allowed', opacity: 0.4 } : {}) }, disabled: loading || error !== undefined, onClick: props.onApply, children: labels.apply })] })] })] })), document.body);
}
//# sourceMappingURL=ModelPickerDialog.js.map