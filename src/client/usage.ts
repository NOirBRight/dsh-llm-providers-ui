/** Secret-free subscription usage readers and an abortable sidebar store. */

import type { ClientConnectionRpc } from '@deepseek-ai/dsh-client-connection/client'
import { applySavedOrder } from '../order.js'

export type ProviderUsageStatus = 'loading' | 'ready' | 'logged-out' | 'unsupported' | 'stale' | 'error'

export interface UsageWindowSummary {
  id: string
  label: string
  shortLabel: string
  remainingPercent?: number
  valueText: string
  resetsAt?: string
}

export interface ProviderUsageSummary {
  providerKey: string
  name: string
  status: ProviderUsageStatus
  fetchedAt?: string
  windows: readonly UsageWindowSummary[]
  refreshing?: boolean
}

type ProviderUsageRead =
  | { status: 'ready', fetchedAt: string, windows: readonly UsageWindowSummary[] }
  | { status: 'logged-out' }
  | { status: 'unsupported' }
  | { status: 'error', message?: string }

export interface ProviderUsageReader {
  providerKey: string
  name: string
  read(rpc: ClientConnectionRpc, refresh: boolean, signal: AbortSignal): Promise<ProviderUsageRead>
}

interface RecordValue { [key: string]: unknown }

function record(value: unknown): RecordValue | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as RecordValue : undefined
}

const SECRET_KEY = /^(?:accessToken|refreshToken|access_token|refresh_token|id_token|idToken|token|apiKey|api_key)$/iu

/** Reject any secret-shaped field before a provider response enters UI state. */
function secretFree(value: unknown): boolean {
  if (Array.isArray(value)) return value.every(secretFree)
  const item = record(value)
  if (item === undefined) return true
  return Object.entries(item).every(([key, child]) => !SECRET_KEY.test(key) && secretFree(child))
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function finiteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function nonNegativeNumber(value: unknown): value is number {
  return finiteNumber(value) && value >= 0
}

function displayNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

function percentage(value: number): number {
  return Math.round(Math.max(0, Math.min(100, value)))
}

function percentageText(value: number): string {
  return displayNumber(percentage(value)) + '%'
}

const SHORT_LABELS: readonly [pattern: RegExp, label: string][] = [
  [/five|5h|5-hour/u, '5h'],
  [/two-hour|2-hour|2h/u, '2h'],
  [/session/u, 'S'],
  [/week/u, 'W'],
  [/month/u, 'M'],
  [/credit/u, 'Cr'],
  [/agent/u, 'A'],
  [/daily|day/u, 'D'],
  [/local/u, 'L'],
  [/other/u, 'Oth'],
]

function shortLabel(value: string): string {
  const normalized = value.toLowerCase()
  if (/^\d+h$/u.test(normalized)) return normalized
  return SHORT_LABELS.find(([pattern]) => pattern.test(normalized))?.[1] ?? value.slice(0, 4)
}

function windowLabel(id: string, period: unknown): string {
  return nonEmptyString(period) ? period : id
}

interface RemainingWindowInput {
  id: string
  label: string
  used: number
  limit: number
  resetsAt?: string
}

function remainingWindow(input: RemainingWindowInput): UsageWindowSummary {
  const remaining = input.limit === 0 ? undefined : percentage(100 * (1 - input.used / input.limit))
  return {
    id: input.id,
    label: input.label,
    shortLabel: shortLabel(input.label),
    ...(remaining === undefined
      ? { valueText: displayNumber(Math.max(0, input.limit - input.used)) + ' / ' + displayNumber(input.limit) }
      : { remainingPercent: remaining, valueText: percentageText(remaining) }),
    ...(input.resetsAt === undefined ? {} : { resetsAt: input.resetsAt }),
  }
}

function usageResult(value: unknown, decode: (usage: RecordValue) => { fetchedAt: string, windows: readonly UsageWindowSummary[] } | undefined): ProviderUsageRead {
  const response = record(value)
  if (response === undefined || !secretFree(response)) return { status: 'error', message: 'malformed usage response' }
  if (response.status === 'unsupported') return { status: 'unsupported' }
  if (response.status === 'logged-out') return { status: 'logged-out' }
  if (response.status !== 'ok') return { status: 'error', message: 'unknown usage status' }
  const usage = record(response.usage)
  const decoded = usage === undefined ? undefined : decode(usage)
  return decoded === undefined ? { status: 'error', message: 'malformed usage response' } : { status: 'ready', ...decoded }
}

function decodePercentUsage(usage: RecordValue): { fetchedAt: string, windows: readonly UsageWindowSummary[] } | undefined {
  if (!nonEmptyString(usage.fetchedAt) || !Array.isArray(usage.windows) || usage.windows.length === 0) return undefined
  const viewReset = usage.resetsAt
  if (viewReset !== undefined && !nonEmptyString(viewReset)) return undefined
  const windows: UsageWindowSummary[] = []
  for (const value of usage.windows) {
    const item = record(value)
    if (item === undefined || !nonEmptyString(item.id) || !nonNegativeNumber(item.used) || !nonNegativeNumber(item.limit)) return undefined
    if (item.period !== undefined && !nonEmptyString(item.period)) return undefined
    if (item.unit !== undefined && item.unit !== 'percent') return undefined
    if (item.resetsAt !== undefined && !nonEmptyString(item.resetsAt)) return undefined
    const resetsAt = item.resetsAt ?? viewReset
    windows.push(remainingWindow({
      id: item.id,
      label: windowLabel(item.id, item.period),
      used: item.used,
      limit: item.unit === 'percent' ? 100 : item.limit,
      ...(resetsAt === undefined ? {} : { resetsAt }),
    }))
  }
  return { fetchedAt: usage.fetchedAt, windows }
}

function decodeFractionUsage(keys: readonly ('session' | 'weekly' | 'monthly')[], usage: RecordValue): { fetchedAt: string, windows: readonly UsageWindowSummary[] } | undefined {
  if (!nonEmptyString(usage.fetchedAt)) return undefined
  const windows: UsageWindowSummary[] = []
  for (const key of keys) {
    const value = usage[key]
    if (value === undefined) continue
    const item = record(value)
    if (item === undefined || !nonNegativeNumber(item.usage)) return undefined
    if (item.resetsAt !== undefined && !nonEmptyString(item.resetsAt)) return undefined
    windows.push(remainingWindow({
      id: key,
      label: key === 'session' ? 'Session' : key === 'weekly' ? 'Week' : 'Month',
      used: item.usage,
      limit: 1,
      ...(item.resetsAt === undefined ? {} : { resetsAt: item.resetsAt }),
    }))
  }
  return { fetchedAt: usage.fetchedAt, windows }
}

function decodeCommandCodeUsage(usage: RecordValue): { fetchedAt: string, windows: readonly UsageWindowSummary[] } | undefined {
  if (!nonEmptyString(usage.fetchedAt)) return undefined
  if (usage.failures !== undefined && (!Array.isArray(usage.failures) || usage.failures.some(item => typeof item !== 'string'))) return undefined
  const credits = usage.credits
  if (credits === undefined) return { fetchedAt: usage.fetchedAt, windows: [] }
  const value = record(credits)
  if (value === undefined) return undefined
  const windows: UsageWindowSummary[] = []
  const monthly = value.monthlyCredits
  if (monthly !== undefined) {
    if (!nonNegativeNumber(monthly)) return undefined
    windows.push({ id: 'monthly-credits', label: 'Credits', shortLabel: 'Cr', valueText: displayNumber(monthly) })
  }
  for (const [key, label] of [['fiveHour', '5-hour'], ['weekly', 'Week']] as const) {
    const raw = value[key]
    if (raw === undefined) continue
    const item = record(raw)
    if (item === undefined || !nonNegativeNumber(item.used) || !nonNegativeNumber(item.cap)) return undefined
    if (item.resetAt !== undefined && !nonEmptyString(item.resetAt)) return undefined
    windows.push(remainingWindow({
      id: key,
      label,
      used: item.used,
      limit: item.cap,
      ...(item.resetAt === undefined ? {} : { resetsAt: item.resetAt }),
    }))
  }
  return { fetchedAt: usage.fetchedAt, windows }
}

function codexWindowLabel(seconds: number): string {
  if (seconds === 18_000) return '5h'
  if (seconds === 604_800) return 'Week'
  const hours = seconds / 3_600
  return Number.isInteger(hours) ? String(hours) + 'h' : 'Usage'
}

function decodeCodexAuthStatus(value: unknown): ProviderUsageRead {
  const response = record(value)
  if (response === undefined || !secretFree(response)) return { status: 'error', message: 'malformed usage response' }
  if (response.status === 'signed-out' || response.status === 'signing-in' || response.status === 'reauth-required') return { status: 'logged-out' }
  if (response.status !== 'signed-in') return { status: 'error', message: 'Codex usage unavailable' }
  const usage = record(response.usage)
  if (usage === undefined || !Array.isArray(usage.rateLimits)) return { status: 'error', message: 'malformed usage response' }
  const windows: UsageWindowSummary[] = []
  for (const rateLimitValue of usage.rateLimits) {
    const rateLimit = record(rateLimitValue)
    if (rateLimit === undefined || !nonEmptyString(rateLimit.id) || !Array.isArray(rateLimit.windows)) return { status: 'error', message: 'malformed usage response' }
    if (rateLimit.name !== undefined && !nonEmptyString(rateLimit.name)) return { status: 'error', message: 'malformed usage response' }
    for (const [index, windowValue] of rateLimit.windows.entries()) {
      const quotaWindow = record(windowValue)
      if (quotaWindow === undefined || !nonNegativeNumber(quotaWindow.remainingPercent) || quotaWindow.remainingPercent > 100 || !nonNegativeNumber(quotaWindow.windowSeconds) || quotaWindow.windowSeconds === 0) return { status: 'error', message: 'malformed usage response' }
      if (quotaWindow.resetsAt !== undefined && !nonEmptyString(quotaWindow.resetsAt)) return { status: 'error', message: 'malformed usage response' }
      const duration = codexWindowLabel(quotaWindow.windowSeconds)
      const label = rateLimit.name === undefined || rateLimit.windows.length === 1 ? rateLimit.name ?? duration : rateLimit.name + ' · ' + duration
      windows.push({
        id: rateLimit.id + '-' + String(index),
        label,
        shortLabel: shortLabel(duration),
        remainingPercent: percentage(quotaWindow.remainingPercent),
        valueText: percentageText(quotaWindow.remainingPercent),
        ...(quotaWindow.resetsAt === undefined ? {} : { resetsAt: quotaWindow.resetsAt }),
      })
    }
  }
  const credits = record(usage.credits)
  if (usage.credits !== undefined && (credits === undefined || typeof credits.unlimited !== 'boolean' || (credits.balance !== undefined && !nonEmptyString(credits.balance)))) return { status: 'error', message: 'malformed usage response' }
  if (credits !== undefined) windows.push({ id: 'credits', label: 'Credits', shortLabel: 'Cr', valueText: credits.unlimited ? 'Unlimited' : String(credits.balance ?? 'Credits') })
  const individual = record(usage.individualLimit)
  if (usage.individualLimit !== undefined && individual === undefined) return { status: 'error', message: 'malformed usage response' }
  if (individual !== undefined) {
    const remainingPercent = individual.remainingPercent
    const remainingText = individual.remaining
    if (!nonNegativeNumber(remainingPercent) || remainingPercent > 100 || !nonEmptyString(remainingText)) return { status: 'error', message: 'malformed usage response' }
    if (credits === undefined) windows.push({ id: 'individual', label: 'Credits', shortLabel: 'Cr', remainingPercent: percentage(remainingPercent), valueText: remainingText })
  }
  return { status: 'ready', fetchedAt: new Date().toISOString(), windows }
}

async function waitForCodexUsage(signal: AbortSignal): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 150)
    const onAbort = (): void => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')) }
    if (signal.aborted) { onAbort(); return }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

async function readCodexUsage(rpc: ClientConnectionRpc, signal: AbortSignal): Promise<ProviderUsageRead> {
  const deadline = Date.now() + CODEX_USAGE_WAIT_MS
  let last: ProviderUsageRead = { status: 'error', message: 'Codex usage unavailable' }
  while (!signal.aborted) {
    const result = await rpc.call('/codex', 'auth/status', {}, signal)
    last = result.ok ? decodeCodexAuthStatus(result.value) : { status: 'error', message: result.error.message }
    if (last.status !== 'ready' || last.windows.length > 0 || Date.now() >= deadline) return last
    await waitForCodexUsage(signal)
  }
  return last
}

type UsageDecoder = (usage: RecordValue) => { fetchedAt: string, windows: readonly UsageWindowSummary[] } | undefined

async function readUsage(
  rpc: ClientConnectionRpc,
  channel: string,
  payload: Record<string, unknown>,
  signal: AbortSignal,
  decode: UsageDecoder,
): Promise<ProviderUsageRead> {
  const result = await rpc.call(channel, 'usage/read', payload, signal)
  return result.ok ? usageResult(result.value, decode) : { status: 'error', message: result.error.message }
}

// RC1 Codex exposes secret-free quota through auth/status rather than usage/read.
const readerDefinitions: readonly ProviderUsageReader[] = [
  { providerKey: 'llm-codex', name: 'Codex', read: (rpc, _refresh, signal) => readCodexUsage(rpc, signal) },
  { providerKey: 'llm-cursor', name: 'Cursor', read: async (rpc, refresh, signal) => {
    const first = await readUsage(rpc, '/cursor', refresh ? { refresh: true } : {}, signal, decodePercentUsage)
    if (first.status !== 'unsupported') return first
    return readUsage(rpc, '/cursor', { refresh: true }, signal, decodePercentUsage)
  } },
  { providerKey: 'llm-grok', name: 'Grok', read: (rpc, _refresh, signal) => readUsage(rpc, '/grok', {}, signal, decodePercentUsage) },
  { providerKey: 'llm-ollama', name: 'Ollama Cloud', read: (rpc, _refresh, signal) => readUsage(rpc, '/ollama-cloud', {}, signal, value => decodeFractionUsage(['session', 'weekly'], value)) },
  { providerKey: 'llm-commandcode', name: 'CommandCode', read: (rpc, _refresh, signal) => readUsage(rpc, '/commandcode', {}, signal, decodeCommandCodeUsage) },
  { providerKey: 'llm-opencode-go', name: 'OpenCode Go', read: (rpc, _refresh, signal) => readUsage(rpc, '/opencode-go', {}, signal, value => decodeFractionUsage(['session', 'weekly', 'monthly'], value)) },
]

export const PROVIDER_USAGE_READERS: readonly ProviderUsageReader[] = readerDefinitions
const readerByKey = new Map(readerDefinitions.map(reader => [reader.providerKey, reader]))

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
const CODEX_USAGE_WAIT_MS = 15_000
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
  const item = record(value)
  if (item === undefined || !nonEmptyString(item.providerKey) || !nonEmptyString(item.name)) return undefined
  const status = item.status
  if (status !== 'ready' && status !== 'stale') return undefined
  if (!Array.isArray(item.windows) || item.windows.length === 0) return undefined
  const windows: UsageWindowSummary[] = []
  for (const windowValue of item.windows) {
    const quotaWindow = record(windowValue)
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
  if (!hasUsageData(next) && hasUsageData(old)) return { ...old, status: 'ready' }
  return next
}

function isFresh(summary: ProviderUsageSummary | undefined, now: number): boolean {
  if (!hasUsageData(summary) || summary.fetchedAt === undefined) return false
  const fetched = Date.parse(summary.fetchedAt)
  return Number.isFinite(fetched) && now - fetched < USAGE_MIN_REFETCH_MS
}

/** External store: one request per visible Provider, stale data survives failures, and dispose aborts every request. */
export function createProviderUsageStore(rpc: ClientConnectionRpc): ProviderUsageStore {
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
    const reader = readerByKey.get(key)
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
      current.set(key, hasUsageData(old) ? { ...old, status: 'stale' } : { providerKey: key, name: reader.name, status: 'error', windows: [] })
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
      const ordered = applySavedOrder(config.registeredKeys, config.savedOrder).filter(key => readerByKey.has(key))
      configuredKeys = [...new Set(ordered)]
      snapshot = { ...snapshot, hiddenKeys: [...new Set(config.hiddenKeys)] }
      for (const [key, controller] of active) if (!configuredKeys.includes(key) || snapshot.hiddenKeys.includes(key)) { controller.abort(); active.delete(key) }
      for (let index = queued.length - 1; index >= 0; index -= 1) {
        const item = queued[index]
        if (item !== undefined && (!configuredKeys.includes(item.key) || snapshot.hiddenKeys.includes(item.key))) queued.splice(index, 1)
      }
      for (const key of [...current.keys()]) if (!configuredKeys.includes(key)) { current.delete(key) }
      for (const key of configuredKeys) if (!current.has(key)) {
        const reader = readerByKey.get(key)
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
