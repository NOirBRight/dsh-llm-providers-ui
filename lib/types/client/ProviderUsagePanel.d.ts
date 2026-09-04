/** Sidebar Provider Usage panel, prototype B (two-column digest). Controlled and UI-only: no RPC, no persistence. */
import type { ReactNode } from 'react';
import type { ProviderUsageSummary } from './usage.js';
export type { ProviderUsageStatus, ProviderUsageSummary, UsageWindowSummary } from './usage.js';
/** Controlled props: normalized summaries in display order plus visibility callbacks. */
export interface ProviderUsagePanelProps {
    /** All queryable providers in display order; hiddenKeys filters the grid. */
    providers: readonly ProviderUsageSummary[];
    /** Hidden provider keys (e.g. from llm-providers settings). Defaults to visible-all. */
    hiddenKeys?: readonly string[];
    /** Provider key of the current session; gets the active highlight. */
    currentProviderKey?: string;
    /** Spins the refresh icon while a parent-driven refresh is in flight. */
    refreshing?: boolean;
    onRefresh: () => void;
    onToggleVisibility: (providerKey: string, visible: boolean) => void;
    onShowAll: () => void;
}
/** Controlled sidebar Provider Usage panel (desktop two columns, mobile one column). */
export declare function ProviderUsagePanel(props: ProviderUsagePanelProps): ReactNode;
//# sourceMappingURL=ProviderUsagePanel.d.ts.map