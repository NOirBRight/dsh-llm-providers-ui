/** Sidebar Provider Usage panel, four-column icon strip. Controlled and UI-only: no RPC, no persistence. */
import type { ReactNode } from 'react';
import type { ProviderSectionLocaleKey } from './provider-section.js';
import { type ProviderUsageSummary } from './usage.js';
export type { ProviderUsageStatus, ProviderUsageSummary, UsageWindowSummary } from './usage.js';
type Translate = (key: ProviderSectionLocaleKey) => string;
/** Controlled props: normalized summaries in display order plus visibility callbacks. */
export interface ProviderUsagePanelProps {
    /** Translator supplied by the registered settings.providers locale namespace. */
    t: Translate;
    /** All queryable providers in display order; hiddenKeys filters the grid. */
    providers: readonly ProviderUsageSummary[];
    /** Hidden provider keys (e.g. from provider Loader Config). Defaults to visible-all. */
    hiddenKeys?: readonly string[];
    /** Spins the refresh icon while a parent-driven refresh is in flight. */
    refreshing?: boolean;
    onRefresh: (providerKey?: string) => void;
    onToggleVisibility: (providerKey: string, visible: boolean) => void;
    onShowAll: () => void;
    onReorder?: (keys: readonly string[]) => void;
}
/** Controlled sidebar Provider Usage panel (four-column icon strip, tap for details). */
export declare function ProviderUsagePanel(props: ProviderUsagePanelProps): ReactNode;
//# sourceMappingURL=ProviderUsagePanel.d.ts.map