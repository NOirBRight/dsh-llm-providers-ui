/** Open port: LLM and native-agent plugins declare role and quota readers here. */

import type { ProviderUsageReader } from './usage.ts'

export type ProviderRole = 'llm' | 'agent'

export interface ProviderDeclaration {
  key: string
  role?: ProviderRole
  usage?: ProviderUsageReader
}

/** Client service named providerDirectory. */
export class ProviderDirectory {
  private readonly items = new Map<string, { role: ProviderRole; usage?: ProviderUsageReader }>()
  private readonly listeners = new Set<() => void>()

  register(declaration: ProviderDeclaration): () => void {
    this.items.set(declaration.key, {
      role: declaration.role ?? 'llm',
      ...(declaration.usage === undefined ? {} : { usage: declaration.usage }),
    })
    this.emit()
    return () => {
      this.items.delete(declaration.key)
      this.emit()
    }
  }

  roleOf(key: string): ProviderRole {
    return this.items.get(key)?.role ?? 'llm'
  }

  reader(key: string): ProviderUsageReader | undefined {
    return this.items.get(key)?.usage
  }

  hasReader(key: string): boolean {
    return this.items.get(key)?.usage !== undefined
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  private emit(): void {
    for (const listener of this.listeners) listener()
  }
}
