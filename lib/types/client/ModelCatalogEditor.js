import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { SortableList } from './SortableList.js';
import { ModelCatalogCapabilities, ModelCatalogDetails, ModelCatalogRow, catalogStyles, } from './model-catalog-ui.js';
const iconButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    border: 0,
    borderRadius: 8,
    background: 'transparent',
    color: 'var(--dsw-alias-label-secondary)',
    cursor: 'pointer',
};
/** Copy declared draft keys, including contextWindow. Thinking false clears defaultEffort. */
export function applyCatalogPatch(model, patch) {
    const next = {};
    for (const [key, value] of Object.entries(model))
        next[key] = value;
    for (const [key, value] of Object.entries(patch)) {
        if (value === undefined)
            delete next[key];
        else
            next[key] = value;
    }
    if (patch.thinking === false)
        delete next.defaultEffort;
    return next;
}
function IconChevron({ open }) {
    return (_jsx("svg", { width: "12", height: "12", viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, style: { flex: 'none', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 120ms ease' }, children: _jsx("path", { d: "M6 3.5L10.5 8L6 12.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) }));
}
function IconTrash() {
    return (_jsx("svg", { width: "14", height: "14", viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, children: _jsx("path", { d: "M2.5 4h11M6.5 4V2.5h3V4M4 4l.7 9a1 1 0 001 .9h4.6a1 1 0 001-.9L12 4M6.5 6.8v4.4M9.5 6.8v4.4", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round" }) }));
}
function Capability({ label, value, disabled, triState, unknownLabel, supportedLabel, unsupportedLabel, onChange, }) {
    if (!triState) {
        return (_jsxs("label", { style: { ...catalogStyles.labelStyle, display: 'inline-flex', alignItems: 'center', gap: 6 }, children: [_jsx("input", { type: "checkbox", checked: value === true, disabled: disabled, onChange: event => { onChange(event.target.checked); } }), label] }));
    }
    const selected = value === true ? 'yes' : value === false ? 'no' : 'unknown';
    return (_jsxs("label", { style: { ...catalogStyles.labelStyle, display: 'inline-flex', alignItems: 'center', gap: 6 }, children: [label, _jsxs("select", { style: catalogStyles.selectStyle, value: selected, disabled: disabled, "aria-label": label, onChange: event => {
                    const next = event.target.value;
                    onChange(next === 'yes' ? true : next === 'no' ? false : undefined);
                }, children: [_jsx("option", { value: "unknown", children: unknownLabel }), _jsx("option", { value: "yes", children: supportedLabel }), _jsx("option", { value: "no", children: unsupportedLabel })] })] }));
}
function Source({ labels, sources, field }) {
    const source = sources?.[field];
    if (source === undefined || labels.source === undefined)
        return null;
    return _jsx("span", { style: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' }, children: labels.source.replace('{source}', source) });
}
function Restore({ labels, field, overrides, disabled, onRestore }) {
    if (labels.restoreAuto === undefined || onRestore === undefined || overrides?.[field] !== true)
        return null;
    return _jsx("button", { type: "button", style: { ...iconButtonStyle, width: 'auto', padding: '0 8px', fontSize: 12 }, disabled: disabled, onClick: () => { onRestore(field); }, children: labels.restoreAuto });
}
/** Sortable catalog rows with optional vision, thinking, effort, and capacity fields. */
export function ModelCatalogEditor(props) {
    const { items, fields, labels, disabled = false, sorting = false, expanded, onRestore } = props;
    return (_jsx(SortableList, { items: [...items], getId: model => model.rowId, disabled: disabled, sorting: sorting, chrome: "row", moveButtons: true, dragLabel: (model, index) => labels.drag + ': ' + (model.id.trim() || String(index + 1)), moveUpLabel: (model, index) => labels.moveUp + ': ' + (model.id.trim() || String(index + 1)), moveDownLabel: (model, index) => labels.moveDown + ': ' + (model.id.trim() || String(index + 1)), onReorder: props.onReorder, renderItem: (model, index) => {
            const label = model.id.trim() || String(index + 1);
            const open = expanded.has(model.rowId);
            const efforts = model.efforts ?? [];
            const patch = (next) => { props.onPatch(index, next); };
            return (_jsxs("div", { "data-model-row": label, "data-provider-model": "", style: catalogStyles.modelContentStyle, children: [_jsx("input", { style: catalogStyles.rowInputStyle, value: model.id, placeholder: labels.modelId, "aria-label": labels.modelId + ' ' + String(index + 1), disabled: disabled, onChange: event => { patch({ id: event.target.value }); } }), _jsx("input", { style: catalogStyles.rowInputStyle, value: model.name ?? '', placeholder: labels.modelName, "aria-label": labels.modelName + ' ' + String(index + 1), disabled: disabled, onChange: event => { patch({ name: event.target.value || undefined }); } }), _jsx("button", { type: "button", style: iconButtonStyle, "aria-label": labels.modelDetails + ': ' + label, "aria-expanded": open, title: labels.modelDetails, onClick: () => { props.onToggle(model.rowId); }, children: _jsx(IconChevron, { open: open }) }), props.onRemove === undefined ? null : (_jsx("button", { type: "button", style: iconButtonStyle, "aria-label": labels.remove + ' ' + label, title: labels.remove, disabled: disabled, onClick: () => { props.onRemove?.(index); }, children: _jsx(IconTrash, {}) })), open ? (_jsxs(ModelCatalogDetails, { children: [(fields.context || fields.inputLimit || fields.output) ? (_jsxs(ModelCatalogRow, { children: [fields.context ? (_jsxs("label", { style: catalogStyles.fieldStyle, children: [_jsx("span", { style: catalogStyles.labelStyle, children: labels.contextWindow }), _jsx("input", { style: catalogStyles.inputStyle, inputMode: "numeric", placeholder: labels.contextWindowDefault, value: model.contextWindow ?? '', disabled: disabled, "aria-label": labels.contextWindow, onChange: event => { patch({ contextWindow: event.target.value }); } }), _jsx(Source, { labels: labels, sources: model.sources, field: "contextWindow" }), _jsx(Restore, { labels: labels, field: "contextWindow", overrides: model.overrides, disabled: disabled, onRestore: field => { onRestore?.(index, field); } })] })) : null, fields.inputLimit ? (_jsxs("label", { style: catalogStyles.fieldStyle, children: [_jsx("span", { style: catalogStyles.labelStyle, children: labels.inputLimit ?? labels.contextWindow }), _jsx("input", { style: catalogStyles.inputStyle, inputMode: "numeric", placeholder: labels.contextWindowDefault, value: model.inputLimit ?? '', disabled: disabled, "aria-label": labels.inputLimit ?? labels.contextWindow, onChange: event => { patch({ inputLimit: event.target.value }); } }), _jsx(Source, { labels: labels, sources: model.sources, field: "inputLimit" }), _jsx(Restore, { labels: labels, field: "inputLimit", overrides: model.overrides, disabled: disabled, onRestore: field => { onRestore?.(index, field); } })] })) : null, fields.output ? (_jsxs("label", { style: catalogStyles.fieldStyle, children: [_jsx("span", { style: catalogStyles.labelStyle, children: labels.output ?? labels.contextWindow }), _jsx("input", { style: catalogStyles.inputStyle, inputMode: "numeric", placeholder: labels.contextWindowDefault, value: model.output ?? '', disabled: disabled, "aria-label": labels.output ?? labels.contextWindow, onChange: event => { patch({ output: event.target.value }); } }), _jsx(Source, { labels: labels, sources: model.sources, field: "output" }), _jsx(Restore, { labels: labels, field: "output", overrides: model.overrides, disabled: disabled, onRestore: field => { onRestore?.(index, field); } })] })) : null] })) : null, _jsxs(ModelCatalogCapabilities, { children: [fields.vision ? (_jsxs(_Fragment, { children: [_jsx(Capability, { label: labels.vision, value: model.vision, disabled: disabled, triState: fields.triState === true, unknownLabel: labels.unknown ?? labels.contextWindowDefault, supportedLabel: labels.supported ?? labels.vision, unsupportedLabel: labels.unsupported ?? labels.thinking, onChange: vision => { patch({ vision }); } }), _jsx(Source, { labels: labels, sources: model.sources, field: "vision" }), _jsx(Restore, { labels: labels, field: "vision", overrides: model.overrides, disabled: disabled, onRestore: field => { onRestore?.(index, field); } })] })) : null, fields.thinking ? (_jsxs(_Fragment, { children: [_jsx(Capability, { label: labels.thinking, value: model.thinking, disabled: disabled, triState: fields.triState === true, unknownLabel: labels.unknown ?? labels.contextWindowDefault, supportedLabel: labels.supported ?? labels.vision, unsupportedLabel: labels.unsupported ?? labels.thinking, onChange: thinking => { patch({ thinking }); } }), _jsx(Source, { labels: labels, sources: model.sources, field: "thinking" }), _jsx(Restore, { labels: labels, field: "thinking", overrides: model.overrides, disabled: disabled, onRestore: field => { onRestore?.(index, field); } })] })) : null, fields.defaultEffort && efforts.length > 0 ? (_jsxs("label", { style: { ...catalogStyles.labelStyle, display: 'inline-flex', alignItems: 'center', gap: 6 }, children: [labels.defaultEffort, _jsxs("select", { style: catalogStyles.selectStyle, value: model.defaultEffort ?? (fields.triState ? '' : efforts[0]?.id ?? ''), disabled: disabled || model.thinking === false, "aria-label": labels.defaultEffort + ' ' + label, onChange: event => {
                                                    const value = event.target.value;
                                                    patch({ defaultEffort: value === '' ? undefined : efforts.find(entry => entry.id === value)?.id });
                                                }, children: [fields.triState ? _jsx("option", { value: "", children: labels.unknown ?? labels.contextWindowDefault }) : null, efforts.map(effort => _jsx("option", { value: effort.id, children: effort.name }, effort.id))] }), _jsx(Source, { labels: labels, sources: model.sources, field: "defaultEffort" }), _jsx(Restore, { labels: labels, field: "defaultEffort", overrides: model.overrides, disabled: disabled, onRestore: field => { onRestore?.(index, field); } })] })) : null] })] })) : null] }));
        } }));
}
//# sourceMappingURL=ModelCatalogEditor.js.map