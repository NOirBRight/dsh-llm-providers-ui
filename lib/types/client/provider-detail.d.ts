/** Prototype C provider detail: one shared layout for every provider plugin. */
import type { ReactNode } from 'react';
import type { ProviderRoleBadgeProps } from './provider-ui.js';
import type { UsageWindowSummary } from '../usage-readers.js';
/** Account block: plugin owns the business state, the template owns the card. */
export interface ProviderDetailAccount {
    readonly state: 'connected' | 'configured' | 'unconnected';
    /** Primary line, for example the signed-in label or the configured key name. */
    readonly label?: ReactNode;
    /** Secondary muted line such as "Subscription · no API key". */
    readonly meta?: ReactNode;
    /** Right-aligned actions (sign in, sign out, manage). */
    readonly actions?: ReactNode;
    /** Extra rows under the card: API key field, endpoint, read-only hints. */
    readonly body?: ReactNode;
}
/** Quota block: values come from the shared usage snapshot, never from the plugin card. */
export interface ProviderDetailQuota {
    readonly status: 'ready' | 'stale' | 'loading' | 'error' | 'unsupported' | 'logged-out';
    readonly windows: readonly UsageWindowSummary[];
    /** Caption under the meters, for example "Updated 22:10". */
    readonly updatedLabel?: ReactNode;
    readonly refreshing?: boolean;
    readonly onRefresh?: () => void;
}
/** Models block: the shared header, toolbar, and the rows the template renders from provider data. */
export interface ProviderDetailModels {
    readonly count?: number;
    /** Extra header actions after the shared three. */
    readonly actions?: ReactNode;
    /** Hint line under the header. Defaults to the shared copy. */
    readonly hint?: ReactNode;
    /** Expand-all switch state and handler. */
    readonly allOpen?: boolean;
    readonly onToggleAll?: () => void;
    readonly sorting?: boolean;
    readonly onToggleSorting?: () => void;
    /** Sort needs at least two models in most catalogs. */
    readonly sortDisabled?: boolean;
    readonly onChooseFromAccount?: () => void;
    readonly chooseDisabled?: boolean;
    /**
     * Rows the template renders itself. Providers hand over data and handlers so
     * every card shows the same row chrome; `extra` carries provider-specific fields.
     */
    readonly items?: readonly ProviderDetailModelRow[];
    readonly expanded?: readonly string[];
    readonly onPatch?: (rowId: string, patch: {
        id?: string;
        name?: string;
    }) => void;
    readonly onRemove?: (rowId: string) => void;
    readonly onToggle?: (rowId: string) => void;
    readonly onReorder?: (rowIds: readonly string[]) => void;
    /** Renders the shared "add model" button when provided. */
    readonly onAdd?: () => void;
    readonly addDisabled?: boolean;
    /** Provider-specific fields for an expanded row. */
    readonly extra?: (row: ProviderDetailModelRow) => ReactNode;
}
/** One editable model row rendered by the shared template. */
export interface ProviderDetailModelRow {
    readonly rowId: string;
    readonly id: string;
    readonly name?: string;
}
/** Locale copy contract so the template stays locale-free. */
export interface ProviderDetailCopy {
    readonly details: string;
    readonly connected: string;
    readonly configured: string;
    readonly unconnected: string;
    readonly modelCount: string;
    readonly quotaHeading: string;
    readonly quotaMeta: string;
    readonly refresh: string;
    readonly refreshing: string;
    readonly accountHeading: string;
    readonly modelsHeading: string;
    readonly modelsCount: string;
    readonly modelsHint: string;
    readonly expandAll: string;
    readonly modelIdLabel: string;
    readonly modelNameLabel: string;
    readonly addModelLabel: string;
    readonly removeModelLabel: string;
    readonly dragModelLabel: string;
    readonly collapseAll: string;
    readonly sort: string;
    readonly done: string;
    readonly chooseFromAccount: string;
    readonly addModel: string;
    readonly advancedHeading: string;
    readonly advancedNote: string;
    readonly resetAt: string;
    readonly resetOverdue: string;
    readonly resetMissing: string;
    readonly connectToSee: string;
    readonly windowHour: string;
    readonly windowWeek: string;
    readonly windowMonth: string;
    readonly unsupportedQuota: string;
    readonly loadingQuota: string;
    readonly errorQuota: string;
}
/**
 * What the settings page hands to a provider card through the item slot.
 * Plugins that migrate to the shared template read this; older cards ignore it.
 */
export interface ProviderItemSlotContext {
    /** Which surface renders the card right now. */
    readonly mode: 'overview' | 'detail';
    /** Live shared usage snapshot for this provider, when one exists. */
    readonly usage?: {
        readonly status: 'ready' | 'stale' | 'loading' | 'error' | 'unsupported' | 'logged-out';
        readonly windows: readonly UsageWindowSummary[];
        readonly fetchedAt?: string;
    };
    /** Business account state the plugin published on the directory. */
    readonly accountState?: 'connected' | 'configured' | 'unconnected';
    /** Shared copy in the page's active locale, so every provider reads the same. */
    readonly copy?: ProviderDetailCopy;
    /**
     * Shared detail template, injected by the settings page so provider plugins
     * never bundle their own copy: one rebuild of the UI updates every provider.
     */
    readonly template?: (props: ProviderDetailProps) => ReactNode;
    /** Manual quota refresh; only the detail surface offers it. */
    readonly onRefresh?: () => void;
}
/** Shared detail copy so every plugin renders the same words. */
export declare const providerDetailCopy: Readonly<Record<'zh' | 'en', ProviderDetailCopy>>;
export interface ProviderDetailProps {
    readonly name: string;
    readonly role?: ProviderRoleBadgeProps['role'];
    readonly mark?: ReactNode;
    readonly copy: ProviderDetailCopy;
    readonly account?: ProviderDetailAccount;
    readonly quota: ProviderDetailQuota;
    readonly models?: ProviderDetailModels;
    /** Notice or risk copy shown above the account card. */
    readonly notice?: ReactNode;
    /** Folded, closed by default; the template never reopens or force-closes it. */
    readonly advanced?: ReactNode;
    readonly footer?: ReactNode;
    /** Unsaved-changes bar; rendered only when the plugin has a draft. */
    readonly draft?: ReactNode;
}
/**
 * The single provider detail layout: identity, notice, account, quota, models,
 * advanced, footer. Plugins pass data and content; geometry and copy live here so
 * every provider looks and reads the same.
 */
export declare function ProviderDetail(props: ProviderDetailProps): ReactNode;
//# sourceMappingURL=provider-detail.d.ts.map