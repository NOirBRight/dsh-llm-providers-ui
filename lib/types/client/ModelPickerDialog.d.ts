/** Presentation-only model picker overlay. Callers supply grouped candidates. */
import { type ReactNode } from 'react';
export interface ModelPickerCandidate {
    readonly id: string;
    readonly name?: string;
    readonly hint?: string;
}
export interface ModelPickerSection {
    readonly id: string;
    readonly label: string;
    readonly models: readonly ModelPickerCandidate[];
}
export interface ModelPickerLabels {
    readonly title: string;
    readonly description: string;
    readonly search: string;
    readonly loading: string;
    readonly empty: string;
    readonly cancel: string;
    readonly apply: string;
    readonly close: string;
}
/** Searchable grouped checkbox dialog. Does not own discovery or brand rules. */
export declare function ModelPickerDialog(props: {
    readonly open: boolean;
    readonly loading: boolean;
    readonly error?: string;
    readonly labels: ModelPickerLabels;
    readonly sections: readonly ModelPickerSection[];
    readonly picked: ReadonlySet<string>;
    readonly onClose: () => void;
    readonly onToggle: (id: string) => void;
    readonly onApply: () => void;
}): ReactNode;
//# sourceMappingURL=ModelPickerDialog.d.ts.map