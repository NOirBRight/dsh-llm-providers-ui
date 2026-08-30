/** Pointer-driven sortable list with a floating ghost and animated live preview. */
import type { ReactNode } from 'react';
/** Props of {@link SortableList}. */
export interface SortableListProps<T> {
    /** Items in their durable order. */
    items: readonly T[];
    /** Stable identity that survives a preview reorder. */
    getId: (item: T) => string;
    /** Row contents excluding the drag handle. */
    renderItem: (item: T, index: number) => ReactNode;
    /** Accessible handle label. */
    dragLabel: (item: T, index: number) => string;
    /** Commit the preview order when the pointer is released. */
    onReorder: (items: T[]) => void;
    /** Disable handles while the parent is busy or read-only. */
    disabled?: boolean;
    /** row = inner model-list chrome; card = handle lives inside the provider card frame. */
    chrome?: 'row' | 'card';
}
/**
 * Pointer-driven sortable list: a portal ghost follows the pointer, a preview
 * array records the prospective order, and FLIP animations move sibling rows.
 */
export declare function SortableList<T>({ items, getId, renderItem, dragLabel, onReorder, disabled, chrome, }: SortableListProps<T>): ReactNode;
//# sourceMappingURL=SortableList.d.ts.map