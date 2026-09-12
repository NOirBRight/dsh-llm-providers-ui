/** Settings > LLM Providers page shell. Provider cards arrive through settings.provider.item. */
import type { ReactNode } from 'react';
import type { PropsLocale, PropsRenderSlots, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { SettingsSectionOwnerProps } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { ProviderSectionLocaleKey } from './provider-section.js';
import { PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS } from '../order.js';
import { type ProviderUsageSummary } from './usage.js';
import type { ProviderDetailOwnership, ProviderHeaderOwnership, ProviderRole } from './directory.js';
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
    /** Resolve who renders the expanded detail. Shared cards render it themselves. */
    detailOf?: (key: string) => ProviderDetailOwnership;
    /** Resolve the provider display name the plugin published. */
    nameOf?: (key: string) => string | undefined;
    /** Resolve the active model count the plugin published. */
    modelCountOf?: (key: string) => number | undefined;
    showSidebarUsage?: boolean;
    onShowSidebarUsage?: (show: boolean) => void;
    usageSummaries?: readonly ProviderUsageSummary[];
    accountOf?: (key: string) => {
        state: 'connected' | 'configured' | 'unconnected';
    } | undefined;
    onRefresh?: (key?: string) => void;
}
export declare function bindProvidersSection(listRegisteredKeys: () => readonly string[], subscribe: (listener: () => void) => () => void, readPage: () => {
    keys: readonly string[];
    disabled: boolean;
    showSidebarUsage: boolean;
}, onReorder: (keys: string[]) => void, roleOf: (key: string) => ProviderRole, onShowSidebarUsage: (show: boolean) => void, headerOf?: (key: string) => ProviderHeaderOwnership, readUsage?: () => readonly ProviderUsageSummary[], subscribeUsage?: (listener: () => void) => () => void, accountOf?: (key: string) => {
    state: 'connected' | 'configured' | 'unconnected';
} | undefined, onRefresh?: (key?: string) => void, detailOf?: (key: string) => ProviderDetailOwnership, nameOf?: (key: string) => string | undefined, modelCountOf?: (key: string) => number | undefined): (props: ProvidersSectionSlotProps) => ReactNode;
/**
 * Settings C: compact quota ledger on overview; the plugin item slot mounts
 * only in the independent detail view. Sorting reorders ledger rows in place.
 */
export declare function ProvidersSection(props: ProvidersSectionProps): ReactNode;
export {};
//# sourceMappingURL=ProvidersSection.d.ts.map