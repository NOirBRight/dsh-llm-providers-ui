/** Settings > LLM Providers page shell. Provider cards arrive through settings.provider.item. */
import type { ReactNode } from 'react';
export interface ProvidersSectionProps {
    renderSlot?: (name: string, slotProps: object, opts?: {
        entryKey?: string;
    }) => ReactNode;
    t?: (key: 'title' | 'subtitle' | 'empty' | 'drag') => string;
    /** Live keyed contributions. */
    registeredKeys?: readonly string[];
    /** Saved order from llm-providers settings. */
    savedOrder?: readonly string[];
    /** Persist a new card order. */
    onReorder?: (keys: string[]) => void;
    /** Disable dragging while settings are not writable. */
    disabled?: boolean;
}
/** Bind the shared page to live keyed-slot ledger and saved order. */
export declare function bindProvidersSection(listRegisteredKeys: () => readonly string[], subscribe?: (listener: () => void) => (() => void) | undefined, readOrder?: () => {
    keys: readonly string[];
    disabled: boolean;
}, onReorder?: (keys: string[]) => void): (props: ProvidersSectionProps) => ReactNode;
/** Render installed provider cards. Two or more cards grow a left drag handle. */
export declare function ProvidersSection(props: ProvidersSectionProps): ReactNode;
//# sourceMappingURL=ProvidersSection.d.ts.map