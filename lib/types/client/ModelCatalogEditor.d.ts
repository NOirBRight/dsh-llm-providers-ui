/** Generic model catalog list and details editor. Callers own discovery and persistence. */
import type { ReactNode } from 'react';
/** One catalog row the editor can display and patch. */
export interface ModelCatalogDraft {
    readonly rowId: string;
    readonly id: string;
    readonly name?: string;
    readonly contextWindow?: string;
    readonly inputLimit?: string;
    readonly output?: string;
    readonly vision?: boolean;
    readonly thinking?: boolean;
    readonly defaultEffort?: string;
    readonly efforts?: readonly {
        readonly id: string;
        readonly name: string;
    }[];
    readonly sources?: Readonly<Record<string, string>>;
    readonly overrides?: Readonly<Record<string, boolean>>;
}
/** Which details the caller wants rendered. Extra numeric fields stay hidden unless enabled. */
export interface ModelCatalogFields {
    readonly vision?: boolean;
    readonly thinking?: boolean;
    readonly defaultEffort?: boolean;
    readonly context?: boolean;
    readonly inputLimit?: boolean;
    readonly output?: boolean;
    readonly triState?: boolean;
    readonly restoreAuto?: boolean;
}
/** Copy owned by the caller so this module stays locale-free. */
export interface ModelCatalogLabels {
    readonly modelId: string;
    readonly modelName: string;
    readonly modelDetails: string;
    readonly remove: string;
    readonly drag: string;
    readonly moveUp: string;
    readonly moveDown: string;
    readonly vision: string;
    readonly thinking: string;
    readonly defaultEffort: string;
    readonly contextWindow: string;
    readonly contextWindowDefault: string;
    readonly inputLimit?: string;
    readonly output?: string;
    readonly unknown?: string;
    readonly supported?: string;
    readonly unsupported?: string;
    readonly restoreAuto?: string;
    readonly source?: string;
}
/** Patch that may delete a field by sending explicit undefined. */
export type CatalogPatch<T> = {
    [K in keyof T]?: T[K] | undefined;
};
/** Copy declared draft keys, including contextWindow. Thinking false clears defaultEffort. */
export declare function applyCatalogPatch<T extends ModelCatalogDraft>(model: T, patch: CatalogPatch<T>): T;
/** Sortable catalog rows with optional vision, thinking, effort, and capacity fields. */
export declare function ModelCatalogEditor<T extends ModelCatalogDraft>(props: {
    readonly items: readonly T[];
    readonly fields: ModelCatalogFields;
    readonly labels: ModelCatalogLabels;
    readonly disabled?: boolean;
    readonly sorting?: boolean;
    readonly expanded: ReadonlySet<string>;
    readonly onReorder: (items: T[]) => void;
    readonly onPatch: (index: number, patch: CatalogPatch<T>) => void;
    readonly onRemove?: (index: number) => void;
    readonly onToggle: (rowId: string) => void;
    readonly onRestore?: (index: number, field: string) => void;
}): ReactNode;
//# sourceMappingURL=ModelCatalogEditor.d.ts.map