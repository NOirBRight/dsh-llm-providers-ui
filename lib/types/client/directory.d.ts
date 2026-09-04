/** Open port: LLM and native-agent plugins declare role and quota readers here. */
import type { ProviderUsageReader } from './usage.ts';
export type ProviderRole = 'llm' | 'agent';
export interface ProviderDeclaration {
    key: string;
    role?: ProviderRole;
    usage?: ProviderUsageReader;
}
/** Client service named providerDirectory. */
export declare class ProviderDirectory {
    private readonly items;
    private readonly listeners;
    register(declaration: ProviderDeclaration): () => void;
    roleOf(key: string): ProviderRole;
    reader(key: string): ProviderUsageReader | undefined;
    hasReader(key: string): boolean;
    subscribe(listener: () => void): () => void;
    private emit;
}
//# sourceMappingURL=directory.d.ts.map