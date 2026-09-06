/** Open registration service for Provider card roles and quota readers. */

import type { ProviderUsageReader } from './usage.ts'

export type ProviderRole = 'llm' | 'agent'

/** Who renders the provider card header. Shared cards use the provider-ui header; legacy cards keep the shell fallback badge. */
export type ProviderHeaderOwnership = 'shared' | 'legacy'

export interface ProviderDeclaration {
  key: string
  role?: ProviderRole
  header?: ProviderHeaderOwnership
  usage?: ProviderUsageReader
}

interface ProviderEntry {
  role: ProviderRole
  header: ProviderHeaderOwnership
  usage?: ProviderUsageReader
}

/** Lets client plugins publish their Provider card role and optional quota reader. */
export class ProviderDirectory {
  private readonly entries = new Map<string, ProviderEntry>()
  private readonly listeners = new Set<() => void>()

  /**
   * Publish a Provider declaration.
   * @param declaration - Card key, role, and optional quota reader.
   * @returns A disposer that removes the declaration.
   */
  register(declaration: ProviderDeclaration): () => void {
    this.entries.set(declaration.key, {
      role: declaration.role ?? 'llm',
      header: declaration.header ?? 'legacy',
      ...(declaration.usage === undefined ? {} : { usage: declaration.usage }),
    })
    this.notify()
    return () => {
      if (!this.entries.delete(declaration.key)) return
      this.notify()
    }
  }

  /**
   * Read a Provider role, defaulting undeclared cards to LLM.
   * @param key - Provider card key.
   * @returns The published role or LLM for an undeclared card.
   */
  roleOf(key: string): ProviderRole {
    return this.entries.get(key)?.role ?? 'llm'
  }

  /**
   * Read who renders a Provider header, defaulting undeclared cards to legacy.
   * The shell renders its fallback badge only for legacy cards.
   * @param key - Provider card key.
   * @returns shared for migrated cards, legacy otherwise.
   */
  headerOf(key: string): ProviderHeaderOwnership {
    return this.entries.get(key)?.header ?? 'legacy'
  }

  /**
   * Read the optional quota reader for a Provider card.
   * @param key - Provider card key.
   * @returns The published reader, if any.
   */
  reader(key: string): ProviderUsageReader | undefined {
    return this.entries.get(key)?.usage
  }

  /**
   * Subscribe to changes in registered Providers.
   * @param listener - Called after a declaration is added or removed.
   * @returns A disposer that stops notifications.
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  private notify(): void {
    for (const listener of this.listeners) listener()
  }
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    providerDirectory: ProviderDirectory
  }
}
