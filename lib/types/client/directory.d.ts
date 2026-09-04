/** Open registration service for Provider card roles and quota readers. */
import type { ProviderUsageReader } from './usage.ts';
export type ProviderRole = 'llm' | 'agent';
export interface ProviderDeclaration {
    key: string;
    role?: ProviderRole;
    usage?: ProviderUsageReader;
}
/** Lets client plugins publish their Provider card role and optional quota reader. */
export declare class ProviderDirectory {
    private readonly entries;
    private readonly listeners;
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
    private notify;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        providerDirectory: ProviderDirectory;
    }
}
//# sourceMappingURL=directory.d.ts.map