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
  return Math.round(Math.max(0, Math.min(100, value)) * 10) / 10
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
  return windows.length === 0 ? undefined : { fetchedAt: usage.fetchedAt, windows }
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
  if (response.quotaError !== undefined) return nonEmptyString(response.quotaError)
    ? { status: 'error', message: response.quotaError }
    : { status: 'error', message: 'malformed usage response' }
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

async function readCodexUsage(rpc: ClientConnectionRpc, signal: AbortSignal): Promise<ProviderUsageRead> {
  const result = await rpc.call('/codex', 'auth/status', {}, signal)
  return result.ok ? decodeCodexAuthStatus(result.value) : { status: 'error', message: result.error.message }
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
  { providerKey: 'llm-cursor', name: 'Cursor', read: (rpc, refresh, signal) => readUsage(rpc, '/cursor', refresh ? { refresh: true } : {}, signal, decodePercentUsage) },
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

export interface ProviderUsageStore {
  getSnapshot(): ProviderUsageStoreSnapshot
  subscribe(listener: () => void): () => void
  configure(config: ProviderUsageConfig): void
  refresh(): void
  dispose(): void
}

function hasUsageData(summary: ProviderUsageSummary | undefined): summary is ProviderUsageSummary {
  return summary !== undefined && summary.windows.length > 0 && (summary.status === 'ready' || summary.status === 'stale')
}

/** External store: one request per visible Provider, stale data survives failures, and dispose aborts every request. */
export function createProviderUsageStore(rpc: ClientConnectionRpc): ProviderUsageStore {
  let snapshot: ProviderUsageStoreSnapshot = { providers: [], hiddenKeys: [], refreshing: false }
  let configuredKeys: string[] = []
  const current = new Map<string, ProviderUsageSummary>()
  const active = new Map<string, AbortController>()
  const listeners = new Set<() => void>()
  let disposed = false
  let refreshGeneration = 0

  const notify = (): void => { for (const listener of listeners) listener() }
  const publish = (): void => {
    snapshot = { providers: configuredKeys.map(key => current.get(key)).filter((item): item is ProviderUsageSummary => item !== undefined), hiddenKeys: [...snapshot.hiddenKeys], refreshing: active.size > 0 }
    notify()
  }
  const read = (key: string, refresh: boolean): void => {
    const reader = readerByKey.get(key)
    if (reader === undefined || active.has(key) || disposed) return
    const previous = current.get(key)
    if (previous === undefined || !hasUsageData(previous)) {
      current.set(key, { providerKey: key, name: reader.name, status: 'loading', windows: [] })
      publish()
    }
    const controller = new AbortController()
    active.set(key, controller)
    const generation = refreshGeneration
    void reader.read(rpc, refresh, controller.signal).then(result => {
      if (disposed || controller.signal.aborted || generation !== refreshGeneration) return
      const old = current.get(key)
      const next: ProviderUsageSummary = result.status === 'ready'
        ? { providerKey: key, name: reader.name, status: 'ready', fetchedAt: result.fetchedAt, windows: result.windows }
        : result.status === 'error' && hasUsageData(old)
          ? { ...old, status: 'stale' }
          : { providerKey: key, name: reader.name, status: result.status, windows: [] }
      current.set(key, next)
    }).catch(() => {
      if (disposed || controller.signal.aborted || generation !== refreshGeneration) return
      const old = current.get(key)
      current.set(key, hasUsageData(old) ? { ...old, status: 'stale' } : { providerKey: key, name: reader.name, status: 'error', windows: [] })
    }).finally(() => {
      if (active.get(key) === controller) active.delete(key)
      if (!disposed) publish()
    })
  }
  const sync = (refresh = false): void => {
    for (const key of configuredKeys) if (!snapshot.hiddenKeys.includes(key)) read(key, refresh)
    publish()
  }
  return {
    getSnapshot: () => snapshot,
    subscribe: listener => { listeners.add(listener); return () => { listeners.delete(listener) } },
    configure: config => {
      const ordered = applySavedOrder(config.registeredKeys, config.savedOrder).filter(key => readerByKey.has(key))
      configuredKeys = [...new Set(ordered)]
      snapshot = { ...snapshot, hiddenKeys: [...new Set(config.hiddenKeys)] }
      for (const [key, controller] of active) if (!configuredKeys.includes(key) || snapshot.hiddenKeys.includes(key)) { controller.abort(); active.delete(key) }
      for (const key of [...current.keys()]) if (!configuredKeys.includes(key)) { current.delete(key) }
      for (const key of configuredKeys) if (!current.has(key)) {
        const reader = readerByKey.get(key)
        if (reader !== undefined) current.set(key, { providerKey: key, name: reader.name, status: 'loading', windows: [] })
      }
      sync()
    },
    refresh: () => {
      refreshGeneration += 1
      for (const controller of active.values()) controller.abort()
      active.clear()
      for (const key of configuredKeys) if (!snapshot.hiddenKeys.includes(key)) {
        const reader = readerByKey.get(key)
        const previous = current.get(key)
        if (reader !== undefined && !hasUsageData(previous)) current.set(key, { providerKey: key, name: reader.name, status: 'loading', windows: [] })
      }
      sync(true)
    },
    dispose: () => { disposed = true; for (const controller of active.values()) controller.abort(); active.clear(); listeners.clear(); current.clear(); configuredKeys = [] },
  }
}
