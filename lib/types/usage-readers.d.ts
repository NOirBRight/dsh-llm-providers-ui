/** Bundle-safe quota decoders, RPC readers, and browser cache helpers; no ModuleLoader wrapper or reactive store. */
import type { ClientConnectionRpc } from '@deepseek-ai/dsh-client-connection/client';
export type ProviderUsageStatus = 'loading' | 'ready' | 'logged-out' | 'unsupported' | 'stale' | 'error';
export interface UsageWindowSummary {
    id: string;
    label: string;
    shortLabel: string;
    remainingPercent?: number;
    valueText: string;
    resetsAt?: string;
}
export interface ProviderUsageSummary {
    providerKey: string;
    name: string;
    status: ProviderUsageStatus;
    fetchedAt?: string;
    windows: readonly UsageWindowSummary[];
    refreshing?: boolean;
}
type ProviderUsageRead = {
    status: 'ready';
    fetchedAt: string;
    windows: readonly UsageWindowSummary[];
} | {
    status: 'logged-out';
} | {
    status: 'unsupported';
} | {
    status: 'error';
    message?: string;
};
export interface ProviderUsageReader {
    providerKey: string;
    name: string;
    read(rpc: ClientConnectionRpc, refresh: boolean, signal: AbortSignal): Promise<ProviderUsageRead>;
}
export interface UsageRecordValue {
    [key: string]: unknown;
}
/** Plain-object guard shared by the reader factories and the sidebar cache validator. */
export declare function recordUsageValue(value: unknown): UsageRecordValue | undefined;
/** Non-empty string guard shared by the reader factories and the sidebar cache validator. */
export declare function nonEmptyString(value: unknown): value is string;
/** Non-negative finite number guard shared by the reader factories and the sidebar cache validator. */
export declare function nonNegativeNumber(value: unknown): value is number;
/** Headline window: longest percentage period, else the first text-only window. */
export declare function pickPrimaryWindow(windows: readonly UsageWindowSummary[]): UsageWindowSummary | undefined;
/** Create the Codex quota reader declared by the Codex client plugin. */
export declare function createCodexUsageReader(): ProviderUsageReader;
/** Create the Cursor quota reader declared by the Cursor client plugin. */
export declare function createCursorUsageReader(): ProviderUsageReader;
/** Create the Grok quota reader declared by the Grok client plugin. */
export declare function createGrokUsageReader(): ProviderUsageReader;
/** Create the Ollama Cloud quota reader declared by the Ollama client plugin. */
export declare function createOllamaUsageReader(): ProviderUsageReader;
/** Create the CommandCode quota reader declared by the CommandCode client plugin. */
export declare function createCommandCodeUsageReader(): ProviderUsageReader;
/** Create the OpenCode Go quota reader declared by the OpenCode Go client plugin. */
export declare function createOpenCodeGoUsageReader(): ProviderUsageReader;
/** Whether a ready or stale summary retains displayable usage windows.
 * @param summary - Current or retained provider usage.
 * @returns Whether its windows can be displayed and persisted.
 */
export declare function hasUsageData(summary: ProviderUsageSummary | undefined): summary is ProviderUsageSummary;
export declare function readUsageCache(): Map<string, ProviderUsageSummary>;
export declare function writeUsageCache(current: Map<string, ProviderUsageSummary>): void;
export declare function dropPersistedUsageKeys(keys: readonly string[]): void;
export declare function clearProviderUsageCache(): void;
/** Last-good quota for a Provider card header, available on first paint. */
export declare function peekCachedUsage(providerKey: string): ProviderUsageSummary | undefined;
export declare function rememberCachedUsage(summary: ProviderUsageSummary): void;
/**
 * Collapsed-header last-good quota for first paint. Ignores headlines without
 * a finite in-range remaining percent so missing quota renders no meter, never
 * a zero bar. Never replaces a cached full multi-window summary, and records
 * no fetchedAt: a headline is display data, not a fetch, so freshness checks
 * treat it as expired and refetch.
 */
export declare function rememberHeadlineQuota(providerKey: string, name: string, quota: {
    label?: string;
    remainingPercent?: number;
} | null | undefined): void;
export declare function headerQuotaFromCache(summary: ProviderUsageSummary | undefined): {
    label: string;
    remainingPercent?: number;
    detail?: string;
} | undefined;
export {};
//# sourceMappingURL=usage-readers.d.ts.map