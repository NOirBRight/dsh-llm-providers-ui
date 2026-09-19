/** Open registration service for Provider card roles and quota readers. */

import type { ProviderUsageReader } from './usage.ts'

export type ProviderRole = 'llm' | 'agent'

/** Who renders the provider card header. Shared cards use the provider-ui header; legacy cards keep the shell fallback badge. */
export type ProviderHeaderOwnership = 'shared' | 'legacy'

/** Who owns the expanded Provider detail layout. */
export type ProviderDetailOwnership = 'shared' | 'legacy'

/** Overview connection only. Never carries an email. `unknown` means the plugin has not resolved auth or credential status yet. */
export interface ProviderAccountSnapshot {
  state: 'connected' | 'configured' | 'unconnected' | 'unknown'
}

/** Native-agent RPC descriptor published by an Agent plugin. Not an execution registry. */
export interface ProviderNativeBinding {
  readonly provider: string
  readonly channel: string
  readonly endpoint: string
}

export interface ProviderDeclaration {
  key: string
  /** Display name for the overview and detail title; falls back to the card key. */
  name?: string
  role?: ProviderRole
  header?: ProviderHeaderOwnership
  /** Who renders the expanded detail: the shared template, or the legacy card. */
  detail?: ProviderDetailOwnership
  usage?: ProviderUsageReader
  account?: () => ProviderAccountSnapshot
  /** Catalog group id used by the model picker; omit when the card has no picker group. */
  catalogId?: string
  /** Native-agent binding lookup; omit for LLM cards. */
  binding?: { channel: string; endpoint: string }
  /** Active model count for the overview subline; omit when the plugin reports none. */
  modelCount?: () => number | undefined
}

interface ProviderEntry {
  name?: string
  role: ProviderRole
  header: ProviderHeaderOwnership
  detail: ProviderDetailOwnership
  usage?: ProviderUsageReader
  account?: () => ProviderAccountSnapshot
  catalogId?: string
  binding?: { channel: string; endpoint: string }
  modelCount?: () => number | undefined
}

/** Lets client plugins publish their Provider card role and optional quota reader. */
export class ProviderDirectory {
  private readonly entries = new Map<string, ProviderEntry>()
  private readonly listeners = new Set<() => void>()
  private readonly invalidationListeners = new Set<(key: string) => void>()

  /**
  * Publish a Provider declaration.
  * @param declaration - Card key, role, and optional quota reader.
  * @returns A disposer that removes the declaration.
   * @throws {Error} When the card key, catalog route, or native binding descriptor conflicts with an active registration.
   */
  register(declaration: ProviderDeclaration): () => void {
    if (this.entries.has(declaration.key)) throw new Error('Provider key is already registered: ' + declaration.key)
    if (declaration.catalogId === '') throw new Error('Provider catalogId must not be empty')
    if (declaration.binding !== undefined && (declaration.binding.channel === '' || declaration.binding.endpoint === '')) {
      throw new Error('Provider binding channel and endpoint must not be empty')
    }
    if (declaration.catalogId !== undefined) {
      for (const [key, entry] of this.entries) {
        if (key !== declaration.key && entry.catalogId === declaration.catalogId) {
          throw new Error('Provider catalogId is already registered: ' + declaration.catalogId)
        }
      }
    }
    const entry: ProviderEntry = {
      ...(declaration.name === undefined ? {} : { name: declaration.name }),
      role: declaration.role ?? 'llm',
      header: declaration.header ?? 'legacy',
      detail: declaration.detail ?? 'legacy',
      ...(declaration.usage === undefined ? {} : { usage: declaration.usage }),
      ...(declaration.account === undefined ? {} : { account: declaration.account }),
      ...(declaration.catalogId === undefined ? {} : { catalogId: declaration.catalogId }),
      ...(declaration.binding === undefined ? {} : { binding: { channel: declaration.binding.channel, endpoint: declaration.binding.endpoint } }),
      ...(declaration.modelCount === undefined ? {} : { modelCount: declaration.modelCount }),
    }
    this.entries.set(declaration.key, entry)
    this.notify()
    return () => {
      if (this.entries.get(declaration.key) !== entry) return
      this.entries.delete(declaration.key)
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
   * Read who renders the expanded detail.
   * @param key - Provider card key.
   * @returns shared for migrated cards, legacy otherwise.
   */
  detailOf(key: string): ProviderDetailOwnership {
    return this.entries.get(key)?.detail ?? 'legacy'
  }

  /** Display name for the overview and detail title. */
  nameOf(key: string): string | undefined {
    return this.entries.get(key)?.name
  }

  /** Active model count, or undefined when the plugin does not report one. */
  modelCountOf(key: string): number | undefined {
    return this.entries.get(key)?.modelCount?.()
  }

  /**
   * Tell listeners a provider's reported state changed (auth, models, label).
   * @param key - provider card key whose metadata changed.
   */
  update(key: string): void {
    if (!this.entries.has(key)) return
    this.notify()
  }

  /** Overview connection only. Never returns an email. */
  accountOf(key: string): ProviderAccountSnapshot | undefined {
    return this.entries.get(key)?.account?.()
  }

  /** Live catalog-group-id → card-key map for picker/settings sort. */
  catalogRoutes(): Record<string, string> {
    const routes: Record<string, string> = {}
    for (const [key, entry] of this.entries) {
      if (entry.catalogId !== undefined) routes[entry.catalogId] = key
    }
    return routes
  }

  /**
   * Native-agent binding descriptors. Derived from Agent entries that published both `catalogId` and `binding`.
   * @returns One descriptor per registered native agent; empty when none are declared.
   */
  nativeBindings(): readonly ProviderNativeBinding[] {
    const bindings: ProviderNativeBinding[] = []
    for (const entry of this.entries.values()) {
      if (entry.role !== 'agent' || entry.catalogId === undefined || entry.binding === undefined) continue
      bindings.push({ provider: entry.catalogId, channel: entry.binding.channel, endpoint: entry.binding.endpoint })
    }
    return bindings
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

  /**
   * Signal that cached quota for a key is no longer valid. Providers call
   * this immediately after sign-out or account switch; the shell purges the
   * sidebar cache and refetches, so the previous account's quota never lingers
   * as a stale tile. Transient read errors still show stale data by design.
   * @param key - Provider card key whose quota cache must drop.
   */
  invalidateUsage(key: string): void {
    for (const listener of this.invalidationListeners) listener(key)
  }

  /**
   * Subscribe to quota-invalidation signals.
   * @param listener - Called with the key whose cache must drop.
   * @returns A disposer that stops notifications.
   */
  onInvalidateUsage(listener: (key: string) => void): () => void {
    this.invalidationListeners.add(listener)
    return () => { this.invalidationListeners.delete(listener) }
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
