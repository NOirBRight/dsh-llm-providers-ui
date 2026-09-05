/** Secret-free subscription usage readers and an abortable sidebar store. */

import type { ClientConnectionRpc } from '@deepseek-ai/dsh-client-connection/client'
import { applySavedOrder } from '../order.js'

import type { ProviderUsageReader, ProviderUsageSummary, UsageWindowSummary } from '../usage-readers.js'
import { recordUsageValue, nonEmptyString, nonNegativeNumber } from '../usage-readers.js'

export type { ProviderUsageReader, ProviderUsageStatus, ProviderUsageSummary, UsageWindowSummary } from '../usage-readers.js'
export { createCodexUsageReader, createCommandCodeUsageReader, createCursorUsageReader, createGrokUsageReader, createOllamaUsageReader, createOpenCodeGoUsageReader, pickPrimaryWindow } from '../usage-readers.js'
export interface ProviderUsageStoreSnapshot {
  providers: readonly ProviderUsageSummary[]
  hiddenKeys: readonly string[]
  refreshing: boolean
}

export interface ProviderUsageConfig {
  registeredKeys: readonly string[]
  savedOrder: readonly string[]
  hiddenKeys: readonly string[]
}

export const USAGE_POLL_MS = 15 * 60 * 1000
export const USAGE_MIN_REFETCH_MS = 5 * 60 * 1000
export const USAGE_READ_TIMEOUT_MS = 20_000
const USAGE_CACHE_KEY = 'dsh-llm-providers-ui:usage-cache'
const USAGE_MAX_IN_FLIGHT = 3

export interface ProviderUsageStore {
  getSnapshot(): ProviderUsageStoreSnapshot
  subscribe(listener: () => void): () => void
  configure(config: ProviderUsageConfig): void
  refresh(keys?: readonly string[]): void
  dispose(): void
}

function hasUsageData(summary: ProviderUsageSummary | undefined): summary is ProviderUsageSummary {
  return summary !== undefined && summary.windows.length > 0 && (summary.status === 'ready' || summary.status === 'stale')
}

function cachedSummary(value: unknown): ProviderUsageSummary | undefined {
  const item = recordUsageValue(value)
  if (item === undefined || !nonEmptyString(item.providerKey) || !nonEmptyString(item.name)) return undefined
  const status = item.status
  if (status !== 'ready' && status !== 'stale') return undefined
  if (!Array.isArray(item.windows) || item.windows.length === 0) return undefined
  const windows: UsageWindowSummary[] = []
  for (const windowValue of item.windows) {
    const quotaWindow = recordUsageValue(windowValue)
    if (quotaWindow === undefined || !nonEmptyString(quotaWindow.id) || !nonEmptyString(quotaWindow.label) || !nonEmptyString(quotaWindow.shortLabel) || !nonEmptyString(quotaWindow.valueText)) return undefined
    if (quotaWindow.remainingPercent !== undefined && (!nonNegativeNumber(quotaWindow.remainingPercent) || quotaWindow.remainingPercent > 100)) return undefined
    if (quotaWindow.resetsAt !== undefined && !nonEmptyString(quotaWindow.resetsAt)) return undefined
    windows.push({
      id: quotaWindow.id,
      label: quotaWindow.label,
      shortLabel: quotaWindow.shortLabel,
      valueText: quotaWindow.valueText,
      ...(quotaWindow.remainingPercent === undefined ? {} : { remainingPercent: quotaWindow.remainingPercent }),
      ...(quotaWindow.resetsAt === undefined ? {} : { resetsAt: quotaWindow.resetsAt }),
    })
  }
  return {
    providerKey: item.providerKey,
    name: item.name,
    status: 'ready',
    windows,
    ...(nonEmptyString(item.fetchedAt) ? { fetchedAt: item.fetchedAt } : {}),
  }
}

let memoryUsageCache = new Map<string, ProviderUsageSummary>()

function storageGet(): string | null {
  try {
    return globalThis.localStorage?.getItem(USAGE_CACHE_KEY) ?? globalThis.sessionStorage?.getItem(USAGE_CACHE_KEY) ?? null
  } catch { return null }
}

function storageSet(value: string): void {
  try { globalThis.localStorage?.setItem(USAGE_CACHE_KEY, value) } catch { /* quota */ }
  try { globalThis.sessionStorage?.setItem(USAGE_CACHE_KEY, value) } catch { /* quota */ }
}

function parseUsageCache(raw: string | null): Map<string, ProviderUsageSummary> {
  const cached = new Map<string, ProviderUsageSummary>()
  if (raw === null) return cached
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return cached
    for (const value of parsed) {
      const item = cachedSummary(value)
      if (item !== undefined) cached.set(item.providerKey, item)
    }
  } catch { /* malformed */ }
  return cached
}

function readUsageCache(): Map<string, ProviderUsageSummary> {
  const fromStorage = parseUsageCache(storageGet())
  if (fromStorage.size > 0) {
    memoryUsageCache = new Map(fromStorage)
    return fromStorage
  }
  return new Map(memoryUsageCache)
}

export function clearProviderUsageCache(): void {
  memoryUsageCache = new Map()
  try { globalThis.localStorage?.removeItem(USAGE_CACHE_KEY) } catch { /* ignore */ }
  try { globalThis.sessionStorage?.removeItem(USAGE_CACHE_KEY) } catch { /* ignore */ }
}

function writeUsageCache(current: Map<string, ProviderUsageSummary>): void {
  const merged = parseUsageCache(storageGet())
  for (const [key, item] of memoryUsageCache) merged.set(key, item)
  for (const item of current.values()) if (hasUsageData(item)) merged.set(item.providerKey, {
    providerKey: item.providerKey,
    name: item.name,
    status: 'ready',
    windows: item.windows,
    ...(item.fetchedAt === undefined ? {} : { fetchedAt: item.fetchedAt }),
  })
  if (merged.size === 0) return
  memoryUsageCache = merged
  storageSet(JSON.stringify([...merged.values()]))
}

function keepUsage(old: ProviderUsageSummary | undefined, next: ProviderUsageSummary): ProviderUsageSummary {
  if (next.status === 'logged-out') return next
  if (!hasUsageData(next) && hasUsageData(old)) return { ...old, status: 'stale' }
  return next
}

function isFresh(summary: ProviderUsageSummary | undefined, now: number): boolean {
  if (!hasUsageData(summary) || summary.fetchedAt === undefined) return false
  const fetched = Date.parse(summary.fetchedAt)
  return Number.isFinite(fetched) && now - fetched < USAGE_MIN_REFETCH_MS
}

/** External store: one request per visible Provider, stale data survives failures, and dispose aborts every request. */
export function createProviderUsageStore(
  rpc: ClientConnectionRpc,
  readerForKey: (key: string) => ProviderUsageReader | undefined,
): ProviderUsageStore {
  let snapshot: ProviderUsageStoreSnapshot = { providers: [], hiddenKeys: [], refreshing: false }
  let configuredKeys: string[] = []
  const current = readUsageCache()
  const active = new Map<string, AbortController>()
  const queued: Array<{ key: string, refresh: boolean }> = []
  const listeners = new Set<() => void>()
  let disposed = false
  let refreshGeneration = 0
  let pollTimer: ReturnType<typeof setInterval> | undefined

  const notify = (): void => { for (const listener of listeners) listener() }
  const pending = (key: string): boolean => active.has(key) || queued.some(item => item.key === key)
  const publish = (): void => {
    snapshot = {
      providers: configuredKeys.map(key => {
        const item = current.get(key)
        if (item === undefined) return undefined
        return pending(key) ? { ...item, refreshing: true } : item
      }).filter((item): item is ProviderUsageSummary => item !== undefined),
      hiddenKeys: [...snapshot.hiddenKeys],
      refreshing: active.size > 0 || queued.length > 0,
    }
    writeUsageCache(current)
    notify()
  }
  const pump = (): void => {
    while (!disposed && active.size < USAGE_MAX_IN_FLIGHT && queued.length > 0) {
      const item = queued.shift()
      if (item !== undefined) startRead(item.key, item.refresh)
    }
  }
  const enqueue = (key: string, refresh: boolean): void => {
    if (disposed || active.has(key) || queued.some(item => item.key === key)) return
    queued.push({ key, refresh })
    pump()
  }
  const startRead = (key: string, refresh: boolean): void => {
    const reader = readerForKey(key)
    if (reader === undefined || active.has(key) || disposed) return
    const previous = current.get(key)
    if (previous === undefined) {
      current.set(key, { providerKey: key, name: reader.name, status: 'loading', windows: [] })
      publish()
    }
    const controller = new AbortController()
    const failOpen = (): void => {
      if (disposed || active.get(key) !== controller) return
      const old = current.get(key)
      current.set(key, keepUsage(old, { providerKey: key, name: reader.name, status: 'error', windows: [] }))
      active.delete(key)
      publish()
      pump()
    }
    const timer = setTimeout(() => { controller.abort('timeout'); failOpen() }, USAGE_READ_TIMEOUT_MS)
    active.set(key, controller)
    const generation = refreshGeneration
    void reader.read(rpc, refresh, controller.signal).then(result => {
      if (disposed || generation !== refreshGeneration || controller.signal.aborted) return
      const old = current.get(key)
      const next: ProviderUsageSummary = result.status === 'ready'
        ? { providerKey: key, name: reader.name, status: 'ready', fetchedAt: result.fetchedAt, windows: result.windows }
        : { providerKey: key, name: reader.name, status: result.status, windows: [] }
      current.set(key, keepUsage(old, next))
    }).catch(() => {
      if (disposed || generation !== refreshGeneration || controller.signal.aborted) return
      failOpen()
    }).finally(() => {
      clearTimeout(timer)
      if (active.get(key) === controller) active.delete(key)
      if (!disposed) { publish(); pump() }
    })
  }
  const visibleKeys = (keys?: readonly string[]): string[] => {
    const wanted = keys === undefined ? configuredKeys : keys.filter(key => configuredKeys.includes(key))
    return wanted.filter(key => !snapshot.hiddenKeys.includes(key))
  }
  const sync = (force = false, keys?: readonly string[]): void => {
    const now = Date.now()
    for (const key of visibleKeys(keys)) if (force || !isFresh(current.get(key), now)) enqueue(key, force)
    publish()
  }
  const startPoll = (): void => {
    if (pollTimer !== undefined) return
    pollTimer = setInterval(() => { if (!disposed) sync(false) }, USAGE_POLL_MS)
  }
  return {
    getSnapshot: () => snapshot,
    subscribe: listener => { listeners.add(listener); return () => { listeners.delete(listener) } },
    configure: config => {
      const ordered = applySavedOrder(config.registeredKeys, config.savedOrder).filter(key => readerForKey(key) !== undefined)
      configuredKeys = [...new Set(ordered)]
      snapshot = { ...snapshot, hiddenKeys: [...new Set(config.hiddenKeys)] }
      for (const [key, controller] of active) if (!configuredKeys.includes(key) || snapshot.hiddenKeys.includes(key)) { controller.abort(); active.delete(key) }
      for (let index = queued.length - 1; index >= 0; index -= 1) {
        const item = queued[index]
        if (item !== undefined && (!configuredKeys.includes(item.key) || snapshot.hiddenKeys.includes(item.key))) queued.splice(index, 1)
      }
      for (const key of [...current.keys()]) if (!configuredKeys.includes(key)) { current.delete(key) }
      for (const key of configuredKeys) if (!current.has(key)) {
        const reader = readerForKey(key)
        if (reader !== undefined) current.set(key, { providerKey: key, name: reader.name, status: 'loading', windows: [] })
      }
      sync(false)
      startPoll()
    },
    refresh: (keys) => {
      refreshGeneration += 1
      const targets = visibleKeys(keys)
      for (const [key, controller] of active) if (targets.includes(key)) { controller.abort(); active.delete(key) }
      for (let index = queued.length - 1; index >= 0; index -= 1) {
        const item = queued[index]
        if (item !== undefined && targets.includes(item.key)) queued.splice(index, 1)
      }
      sync(true, keys)
    },
    dispose: () => {
      disposed = true
      if (pollTimer !== undefined) clearInterval(pollTimer)
      pollTimer = undefined
      for (const controller of active.values()) controller.abort()
      active.clear()
      listeners.clear()
      current.clear()
      configuredKeys = []
    },
  }
}