/** Open registration service for Provider card roles and quota readers. */
import type { ProviderUsageReader } from './usage.ts';
export type ProviderRole = 'llm' | 'agent';
/** Who renders the provider card header. Shared cards use the provider-ui header; legacy cards keep the shell fallback badge. */
export type ProviderHeaderOwnership = 'shared' | 'legacy';
export interface ProviderDeclaration {
    key: string;
    role?: ProviderRole;
    header?: ProviderHeaderOwnership;
    usage?: ProviderUsageReader;
}
/** Lets client plugins publish their Provider card role and optional quota reader. */
export declare class ProviderDirectory {
    private readonly entries;
    private readonly listeners;
    private readonly invalidationListeners;
    /**
     * Publish a Provider declaration.
     * @param declaration - Card key, role, and optional quota reader.
     * @returns A disposer that removes the declaration.
     */
    register(declaration: ProviderDeclaration): () => void;
    /**
     * Read a Provider role, defaulting undeclared cards to LLM.
     * @param key - Provider card key.
     * @returns The published role or LLM for an undeclared card.
     */
    roleOf(key: string): ProviderRole;
    /**
     * Read who renders a Provider header, defaulting undeclared cards to legacy.
     * The shell renders its fallback badge only for legacy cards.
     * @param key - Provider card key.
     * @returns shared for migrated cards, legacy otherwise.
     */
    headerOf(key: string): ProviderHeaderOwnership;
    /**
     * Read the optional quota reader for a Provider card.
     * @param key - Provider card key.
     * @returns The published reader, if any.
     */
    reader(key: string): ProviderUsageReader | undefined;
    /**
     * Subscribe to changes in registered Providers.
     * @param listener - Called after a declaration is added or removed.
     * @returns A disposer that stops notifications.
     */
    subscribe(listener: () => void): () => void;
    /**
     * Signal that cached quota for a key is no longer valid. Providers call
     * this immediately after sign-out or account switch; the shell purges the
     * sidebar cache and refetches, so the previous account's quota never lingers
     * as a stale tile. Transient read errors still show stale data by design.
     * @param key - Provider card key whose quota cache must drop.
     */
    invalidateUsage(key: string): void;
    /**
     * Subscribe to quota-invalidation signals.
     * @param listener - Called with the key whose cache must drop.
     * @returns A disposer that stops notifications.
     */
    onInvalidateUsage(listener: (key: string) => void): () => void;
    private notify;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        providerDirectory: ProviderDirectory;
    }
}
//# sourceMappingURL=directory.d.ts.map