/** Settings > LLM Providers page shell. Provider cards arrive through settings.provider.item. */
import type { ReactNode } from 'react';
import type { PropsLocale, PropsRenderSlots, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { SettingsSectionOwnerProps } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { ProviderSectionLocaleKey } from './provider-section.js';
import { PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS } from '../order.js';
import type { ProviderHeaderOwnership, ProviderRole } from './directory.js';
/** Props composed by the official settings.section and child-slot contracts. */
type ProvidersSectionSlotProps = PropsRuntime<'settings.section'> & PropsRenderSlots<typeof PROVIDERS_ITEM_SLOT> & PropsLocale<typeof PROVIDERS_LOCALE_NS>;
type ProviderRenderSlot = ProvidersSectionSlotProps['renderSlot'];
type ProviderTranslate = ProvidersSectionSlotProps['t'] & ((key: ProviderSectionLocaleKey) => string);
/** Direct-render props retained for focused component tests and previews. */
export interface ProvidersSectionProps {
    renderSlot?: ProviderRenderSlot;
    t?: ProviderTranslate;
    /** Live keyed contributions. */
    registeredKeys?: readonly string[];
    /** Saved order from llm-providers settings. */
    savedOrder?: readonly string[];
    /** Persist a new card order. */
    onReorder?: (keys: string[]) => void;
    /** Disable sorting while settings are not writable. */
    disabled?: boolean;
    /** Shell close affordance from the official settings.section owner props. */
    close?: SettingsSectionOwnerProps['close'];
    /** Resolve the shell-owned badge for a Provider card. */
    roleOf?: (key: string) => ProviderRole;
    /** Resolve who renders a Provider header. Shared cards own their badge; legacy cards keep the shell fallback. */
    headerOf?: (key: string) => ProviderHeaderOwnership;
}
/** Bind the shared page to live keyed-slot and settings snapshots. */
export declare function bindProvidersSection(listRegisteredKeys: () => readonly string[], subscribe: (listener: () => void) => () => void, readOrder: () => {
    keys: readonly string[];
    disabled: boolean;
}, onReorder: (keys: string[]) => void, roleOf: (key: string) => ProviderRole, headerOf?: (key: string) => ProviderHeaderOwnership): (props: ProvidersSectionSlotProps) => ReactNode;
/**
 * Render installed provider cards as a plain divider list. Sorting is an
 * explicit mode: one SortableList stays mounted in both modes with the same
 * keyed rows, so live slot state (authentication, drafts) survives the mode
 * toggle and every reorder.
 */
export declare function ProvidersSection(props: ProvidersSectionProps): ReactNode;
export {};
//# sourceMappingURL=ProvidersSection.d.ts.map