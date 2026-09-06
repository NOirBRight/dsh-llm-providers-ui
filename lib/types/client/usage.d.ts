/** Secret-free subscription usage readers and an abortable sidebar store. */
import type { ClientConnectionRpc } from '@deepseek-ai/dsh-client-connection/client';
import type { ProviderUsageReader, ProviderUsageSummary } from '../usage-readers.js';
export type { ProviderUsageReader, ProviderUsageStatus, ProviderUsageSummary, UsageWindowSummary } from '../usage-readers.js';
export { createCodexUsageReader, createCommandCodeUsageReader, createCursorUsageReader, createGrokUsageReader, createOllamaUsageReader, createOpenCodeGoUsageReader, pickPrimaryWindow } from '../usage-readers.js';
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
export declare const USAGE_READ_TIMEOUT_MS = 20000;
export interface ProviderUsageStore {
    getSnapshot(): ProviderUsageStoreSnapshot;
    subscribe(listener: () => void): () => void;
    configure(config: ProviderUsageConfig): void;
    refresh(keys?: readonly string[]): void;
    /**
     * Drop cached quota for keys and refetch. Unlike refresh, invalidation
     * purges stored windows first, so a failed reread reports an error instead
     * of resurrecting the previous account's quota as stale. Providers call this
     * (via providerDirectory.invalidateUsage) after sign-out or account switch.
     * @param keys - provider keys to invalidate; every configured key when omitted.
     */
    invalidate(keys?: readonly string[]): void;
    dispose(): void;
}
export declare function clearProviderUsageCache(): void;
/** External store: one request per visible Provider, stale data survives failures, and dispose aborts every request. */
export declare function createProviderUsageStore(rpc: ClientConnectionRpc, readerForKey: (key: string) => ProviderUsageReader | undefined): ProviderUsageStore;
//# sourceMappingURL=usage.d.ts.map