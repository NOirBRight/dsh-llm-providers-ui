/** Shared model catalog layout used by provider settings cards. */
import type { CSSProperties, ReactNode } from 'react';
declare const inputStyle: CSSProperties;
declare const rowInputStyle: CSSProperties;
declare const selectStyle: CSSProperties;
declare const rowStyle: CSSProperties;
declare const modelContentStyle: CSSProperties;
declare const modelDetailStyle: CSSProperties;
declare const capabilitiesStyle: CSSProperties;
declare const fieldStyle: CSSProperties;
declare const labelStyle: CSSProperties;
/** Expanded model details spanning the sortable row. */
export declare function ModelCatalogDetails({ children }: {
    children: ReactNode;
}): ReactNode;
/** Two-column field row inside model details. */
export declare function ModelCatalogRow({ children }: {
    children: ReactNode;
}): ReactNode;
/** Capability and default-effort cluster. */
export declare function ModelCatalogCapabilities({ children }: {
    children: ReactNode;
}): ReactNode;
/** Header grid for id, name, and row actions. */
export declare function ModelCatalogRowGrid({ children }: {
    children: ReactNode;
}): ReactNode;
export declare const catalogStyles: {
    readonly inputStyle: CSSProperties;
    readonly rowInputStyle: CSSProperties;
    readonly selectStyle: CSSProperties;
    readonly rowStyle: CSSProperties;
    readonly modelContentStyle: CSSProperties;
    readonly modelDetailStyle: CSSProperties;
    readonly capabilitiesStyle: CSSProperties;
    readonly fieldStyle: CSSProperties;
    readonly labelStyle: CSSProperties;
};
export { inputStyle, rowInputStyle, selectStyle, rowStyle, modelContentStyle, modelDetailStyle, capabilitiesStyle, fieldStyle, labelStyle };
//# sourceMappingURL=model-catalog-ui.d.ts.map