import { jsx as _jsx } from "react/jsx-runtime";
const inputStyle = {
    boxSizing: 'border-box',
    width: '100%',
    minHeight: 36,
    border: '1px solid var(--dsw-alias-border-l2)',
    borderRadius: 8,
    padding: '7px 10px',
    background: 'var(--dsw-alias-bg-layer-1)',
    color: 'var(--dsw-alias-label-primary)',
    font: 'inherit',
};
const rowInputStyle = { ...inputStyle, minHeight: 32, padding: '4px 10px' };
const selectStyle = {
    boxSizing: 'border-box',
    minHeight: 32,
    border: '1px solid var(--dsw-alias-border-l2)',
    borderRadius: 8,
    padding: '4px 28px 4px 10px',
    backgroundColor: 'var(--dsw-alias-bg-layer-1)',
    color: 'var(--dsw-alias-label-primary)',
    font: 'inherit',
    appearance: 'none',
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
};
const rowStyle = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 };
const modelContentStyle = {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr) auto auto',
    alignItems: 'center',
    gap: 6,
    padding: '6px 8px',
};
const modelDetailStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    borderTop: '1px solid var(--dsw-alias-border-l2)',
    padding: '10px 4px 4px',
};
const capabilitiesStyle = { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14 };
const fieldStyle = { display: 'flex', flexDirection: 'column', gap: 6 };
const labelStyle = { fontSize: 13, color: 'var(--dsw-alias-label-secondary)' };
/** Expanded model details spanning the sortable row. */
export function ModelCatalogDetails({ children }) {
    return _jsx("div", { style: { ...modelDetailStyle, gridColumn: '1 / -1' }, children: children });
}
/** Two-column field row inside model details. */
export function ModelCatalogRow({ children }) {
    return _jsx("div", { style: rowStyle, children: children });
}
/** Capability and default-effort cluster. */
export function ModelCatalogCapabilities({ children }) {
    return _jsx("div", { style: capabilitiesStyle, children: children });
}
/** Header grid for id, name, and row actions. */
export function ModelCatalogRowGrid({ children }) {
    return _jsx("div", { style: modelContentStyle, children: children });
}
export const catalogStyles = {
    inputStyle,
    rowInputStyle,
    selectStyle,
    rowStyle,
    modelContentStyle,
    modelDetailStyle,
    capabilitiesStyle,
    fieldStyle,
    labelStyle,
};
export { inputStyle, rowInputStyle, selectStyle, rowStyle, modelContentStyle, modelDetailStyle, capabilitiesStyle, fieldStyle, labelStyle };
//# sourceMappingURL=model-catalog-ui.js.map