/** Secret-free subscription usage readers and an abortable sidebar store. */
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
export declare const PROVIDER_USAGE_READERS: readonly ProviderUsageReader[];
export interface ProviderUsageStoreSnapshot {
    providers: readonly ProviderUsageSummary[];
    hiddenKeys: readonly string[];
    refreshing: boolean;
}
export interface ProviderUsageConfig {
    registeredKeys: readonly string[];
    savedOrder: readonly string[];
    hiddenKeys: readonly string[];
}
export declare const USAGE_POLL_MS: number;
export declare const USAGE_MIN_REFETCH_MS: number;
export declare const USAGE_READ_TIMEOUT_MS = 16000;
export interface ProviderUsageStore {
    getSnapshot(): ProviderUsageStoreSnapshot;
    subscribe(listener: () => void): () => void;
    configure(config: ProviderUsageConfig): void;
    refresh(keys?: readonly string[]): void;
    dispose(): void;
}
/** External store: one request per visible Provider, stale data survives failures, and dispose aborts every request. */
export declare function createProviderUsageStore(rpc: ClientConnectionRpc): ProviderUsageStore;
export {};
//# sourceMappingURL=usage.d.ts.map