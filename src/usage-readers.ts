/** Bundle-safe quota decoders, RPC readers, and browser cache helpers; no ModuleLoader wrapper or reactive store. */

import type { ClientConnectionRpc } from '@deepseek-ai/dsh-client-connection/client'

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

export interface UsageRecordValue { [key: string]: unknown }

/** Plain-object guard shared by the reader factories and the sidebar cache validator. */
export function recordUsageValue(value: unknown): UsageRecordValue | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as UsageRecordValue : undefined
}

const SECRET_KEY = /^(?:accessToken|refreshToken|access_token|refresh_token|id_token|idToken|token|apiKey|api_key)$/iu

/** Reject any secret-shaped field before a provider response enters UI state. */
function secretFree(value: unknown): boolean {
  if (Array.isArray(value)) return value.every(secretFree)
  const item = recordUsageValue(value)
  if (item === undefined) return true
  return Object.entries(item).every(([key, child]) => !SECRET_KEY.test(key) && secretFree(child))
}

/** Non-empty string guard shared by the reader factories and the sidebar cache validator. */
export function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function finiteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/** Non-negative finite number guard shared by the reader factories and the sidebar cache validator. */
export function nonNegativeNumber(value: unknown): value is number {
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

const PERIOD_RANK: Readonly<Record<string, number>> = { M: 6, W: 5, D: 4, CURS: 3, S: 1, A: 0, L: 0, CR: -1 }

function periodRank(shortLabelValue: string): number {
  const normalized = shortLabelValue.toUpperCase()
  return PERIOD_RANK[normalized] ?? (/^\d+H$/.test(normalized) ? 2 : 0)
}

/** Headline window: longest remaining-percent period. Text-only windows are skipped. */
export function pickPrimaryWindow(windows: readonly UsageWindowSummary[]): UsageWindowSummary | undefined {
  let best: UsageWindowSummary | undefined
  for (const quotaWindow of windows) {
    if (quotaWindow.remainingPercent === undefined) continue
    if (best === undefined || periodRank(quotaWindow.shortLabel) > periodRank(best.shortLabel)) best = quotaWindow
  }
  return best
}

function formatRemainingDuration(ms: number): string {
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'always' })
  const days = Math.round(ms / 86_400_000)
  if (Math.abs(days) >= 1) return rtf.format(days, 'day')
  const hours = Math.round(ms / 3_600_000)
  if (Math.abs(hours) >= 1) return rtf.format(hours, 'hour')
  const minutes = Math.max(1, Math.round(Math.abs(ms) / 60_000))
  return rtf.format(ms < 0 ? -minutes : minutes, 'minute')
}

export interface ResetCopy {
  at: string
  overdue: string
  missing: string
}

/** System-zone instant for a reset ISO. Language copy stays in the UI. */
export function formatResetInstant(resetsAt: string | undefined): { when: string, overdue: boolean, relative: string } | undefined {
  if (!nonEmptyString(resetsAt)) return undefined
  const time = Date.parse(resetsAt)
  if (!Number.isFinite(time)) return undefined
  const when = new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(time))
  const delta = time - Date.now()
  return { when, overdue: delta <= 0, relative: formatRemainingDuration(delta) }
}

/** Compose a reset caption. Missing ISO never becomes a fake calendar date. */
export function formatResetLabel(resetsAt: string | undefined, period?: string, copy?: ResetCopy): string | undefined {
  const instant = formatResetInstant(resetsAt)
  if (instant !== undefined) {
    const lead = copy === undefined ? '' : (instant.overdue ? copy.overdue : copy.at)
    return (lead + instant.when + ' · ' + instant.relative).replace(/^ · /, '')
  }
  if (period === undefined || period.length === 0) return undefined
  return copy === undefined ? period : copy.missing.replace('{period}', period)
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

function usageResult(value: unknown, decode: (usage: UsageRecordValue) => { fetchedAt: string, windows: readonly UsageWindowSummary[] } | undefined): ProviderUsageRead {
  const response = recordUsageValue(value)
  if (response === undefined || !secretFree(response)) return { status: 'error', message: 'malformed usage response' }
  if (response.status === 'unsupported') return { status: 'unsupported' }
  if (response.status === 'logged-out') return { status: 'logged-out' }
  if (response.status !== 'ok') return { status: 'error', message: 'unknown usage status' }
  const usage = recordUsageValue(response.usage)
  const decoded = usage === undefined ? undefined : decode(usage)
  return decoded === undefined ? { status: 'error', message: 'malformed usage response' } : { status: 'ready', ...decoded }
}

function decodePercentUsage(usage: UsageRecordValue): { fetchedAt: string, windows: readonly UsageWindowSummary[] } | undefined {
  if (!nonEmptyString(usage.fetchedAt) || !Array.isArray(usage.windows) || usage.windows.length === 0) return undefined
  const viewReset = usage.resetsAt
  if (viewReset !== undefined && !nonEmptyString(viewReset)) return undefined
  const windows: UsageWindowSummary[] = []
  for (const value of usage.windows) {
    const item = recordUsageValue(value)
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

function decodeFractionUsage(keys: readonly ('session' | 'weekly' | 'monthly')[], usage: UsageRecordValue): { fetchedAt: string, windows: readonly UsageWindowSummary[] } | undefined {
  if (!nonEmptyString(usage.fetchedAt)) return undefined
  const windows: UsageWindowSummary[] = []
  for (const key of keys) {
    const value = usage[key]
    if (value === undefined) continue
    const item = recordUsageValue(value)
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

// Published Command Code plan allotments (commandcode.ai/docs/plans). First matching key in this longest-first list wins.
const COMMAND_CODE_MONTHLY_USD: ReadonlyArray<readonly [string, number]> = [
  ['individual-max-20', 300],
  ['individual-goat', 70],
  ['individual-pro', 80],
  ['individual-max', 150],
  ['individual-go', 10],
  ['max-20', 300],
  ['20x', 300],
]

function commandCodeMonthlyCap(planId: string | undefined): number | undefined {
  if (planId === undefined) return undefined
  const id = planId.toLowerCase()
  const match = COMMAND_CODE_MONTHLY_USD.find(([key]) => id.startsWith(key) || id.includes(key))
  return match?.[1]
}

function decodeCommandCodeUsage(usage: UsageRecordValue): { fetchedAt: string, windows: readonly UsageWindowSummary[] } | undefined {
  if (!nonEmptyString(usage.fetchedAt)) return undefined
  if (usage.failures !== undefined && (!Array.isArray(usage.failures) || usage.failures.some(item => typeof item !== 'string'))) return undefined
  const credits = usage.credits
  if (credits === undefined) return { fetchedAt: usage.fetchedAt, windows: [] }
  const value = recordUsageValue(credits)
  if (value === undefined) return undefined
  const windows: UsageWindowSummary[] = []
  const monthly = value.monthlyCredits
  const plan = recordUsageValue(usage.plan)
  const planId = plan !== undefined && nonEmptyString(plan.planId) ? plan.planId : undefined
  if (monthly !== undefined) {
    if (!nonNegativeNumber(monthly)) return undefined
    const cap = commandCodeMonthlyCap(planId)
    if (cap !== undefined && cap > 0 && monthly <= cap) {
      windows.push(remainingWindow({ id: 'monthly', label: 'Month', used: cap - monthly, limit: cap }))
    }
  }
  for (const [key, label] of [['fiveHour', '5-hour'], ['weekly', 'Week']] as const) {
    const raw = value[key]
    if (raw === undefined) continue
    const item = recordUsageValue(raw)
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
  const response = recordUsageValue(value)
  if (response === undefined || !secretFree(response)) return { status: 'error', message: 'malformed usage response' }
  if (response.status === 'signed-out' || response.status === 'signing-in' || response.status === 'reauth-required') return { status: 'logged-out' }
  if (response.status !== 'signed-in') return { status: 'error', message: 'Codex usage unavailable' }
  const usage = recordUsageValue(response.usage)
  if (usage === undefined || !Array.isArray(usage.rateLimits)) return { status: 'error', message: 'malformed usage response' }
  const windows: UsageWindowSummary[] = []
  for (const rateLimitValue of usage.rateLimits) {
    const rateLimit = recordUsageValue(rateLimitValue)
    if (rateLimit === undefined || !nonEmptyString(rateLimit.id) || !Array.isArray(rateLimit.windows)) return { status: 'error', message: 'malformed usage response' }
    if (rateLimit.name !== undefined && !nonEmptyString(rateLimit.name)) return { status: 'error', message: 'malformed usage response' }
    for (const [index, windowValue] of rateLimit.windows.entries()) {
      const quotaWindow = recordUsageValue(windowValue)
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
  return { status: 'ready', fetchedAt: new Date().toISOString(), windows }
}

const CODEX_USAGE_WAIT_MS = 15_000

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
    // The UI store owns freshness; auth/status otherwise retains nonempty quota indefinitely.
    const result = await rpc.call('/codex', 'auth/status', { refresh: true }, signal)
    last = result.ok ? decodeCodexAuthStatus(result.value) : { status: 'error', message: result.error.message }
    if (last.status !== 'ready' || last.windows.length > 0 || Date.now() >= deadline) return last
    await waitForCodexUsage(signal)
  }
  return last
}

type UsageDecoder = (usage: UsageRecordValue) => { fetchedAt: string, windows: readonly UsageWindowSummary[] } | undefined

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

/** Create the Codex quota reader declared by the Codex client plugin. */
export function createCodexUsageReader(): ProviderUsageReader {
  return { providerKey: 'llm-codex', name: 'Codex', read: (rpc, _refresh, signal) => readCodexUsage(rpc, signal) }
}

/** Create the Cursor quota reader declared by the Cursor client plugin. */
export function createCursorUsageReader(): ProviderUsageReader {
  return { providerKey: 'llm-cursor', name: 'Cursor', read: async (rpc, refresh, signal) => {
    const first = await readUsage(rpc, '/cursor', refresh ? { refresh: true } : {}, signal, decodePercentUsage)
    if (first.status !== 'unsupported') return first
    return readUsage(rpc, '/cursor', { refresh: true }, signal, decodePercentUsage)
  } }
}

/** Create the Grok quota reader declared by the Grok client plugin. */
export function createGrokUsageReader(): ProviderUsageReader {
  return { providerKey: 'llm-grok', name: 'Grok', read: (rpc, _refresh, signal) => readUsage(rpc, '/grok', {}, signal, decodePercentUsage) }
}

/** Create the Ollama Cloud quota reader declared by the Ollama client plugin. */
export function createOllamaUsageReader(): ProviderUsageReader {
  return { providerKey: 'llm-ollama', name: 'Ollama Cloud', read: (rpc, _refresh, signal) => readUsage(rpc, '/ollama-cloud', {}, signal, value => decodeFractionUsage(['session', 'weekly'], value)) }
}

/** Create the CommandCode quota reader declared by the CommandCode client plugin. */
export function createCommandCodeUsageReader(): ProviderUsageReader {
  return { providerKey: 'llm-commandcode', name: 'CommandCode', read: (rpc, _refresh, signal) => readUsage(rpc, '/commandcode', {}, signal, decodeCommandCodeUsage) }
}

/** Create the OpenCode Go quota reader declared by the OpenCode Go client plugin. */
export function createOpenCodeGoUsageReader(): ProviderUsageReader {
  return { providerKey: 'llm-opencode-go', name: 'OpenCode Go', read: (rpc, _refresh, signal) => readUsage(rpc, '/opencode-go', {}, signal, value => decodeFractionUsage(['session', 'weekly', 'monthly'], value)) }
}

const USAGE_CACHE_KEY = 'dsh-llm-providers-ui:usage-cache'
/**
 * Browser last-good usage cache shared across bundles: the sidebar store and
 * each provider Settings card bundle their own copy of this module, so the
 * module-level memory map below is per-bundle while storage is shared.
 * Readable storage is authoritative, including empty after invalidation; memory
 * is only a fallback while storage is unavailable. Stale status persists
 * honestly, and collapsed-header headlines never replace a full multi-window
 * summary (a later full read upgrades a headline).
 */
let memoryUsageCache = new Map<string, ProviderUsageSummary>()

/** Whether a ready or stale summary retains displayable usage windows.
 * @param summary - Current or retained provider usage.
 * @returns Whether its windows can be displayed and persisted.
 */
export function hasUsageData(summary: ProviderUsageSummary | undefined): summary is ProviderUsageSummary {
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
    status,
    windows,
    ...(nonEmptyString(item.fetchedAt) ? { fetchedAt: item.fetchedAt } : {}),
  }
}

interface UsageStorageBackend {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem?(key: string): void
}

/** Readable storage backends. A backend that throws on read is unusable and skipped. */
function usageStorageBackends(): UsageStorageBackend[] {
  const backends: UsageStorageBackend[] = []
  for (const name of ['localStorage', 'sessionStorage'] as const) {
    try {
      const backend = globalThis[name] as UsageStorageBackend | undefined | null
      if (backend === undefined || backend === null) continue
      backend.getItem(USAGE_CACHE_KEY)
      backends.push(backend)
    } catch { /* unreadable backend */ }
  }
  return backends
}

function storageRead(): { available: boolean, raw: string | null } {
  const backends = usageStorageBackends()
  if (backends.length === 0) return { available: false, raw: null }
  for (const backend of backends) {
    try {
      const raw = backend.getItem(USAGE_CACHE_KEY)
      if (raw !== null) return { available: true, raw }
    } catch { /* unreadable backend; try the next one */ }
  }
  return { available: true, raw: null }
}

function storageWrite(value: string): void {
  for (const backend of usageStorageBackends()) {
    try { backend.setItem(USAGE_CACHE_KEY, value) } catch { /* quota */ }
  }
}

function storageRemove(): void {
  for (const backend of usageStorageBackends()) {
    try { backend.removeItem?.(USAGE_CACHE_KEY) } catch { /* ignore */ }
  }
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

export function readUsageCache(): Map<string, ProviderUsageSummary> {
  const { available, raw } = storageRead()
  if (!available) return new Map(memoryUsageCache)
  const fromStorage = parseUsageCache(raw)
  memoryUsageCache = new Map(fromStorage)
  return fromStorage
}

/** Persistable copy: status stays ready/stale as the caller holds it, never laundered to ready. */
function persistableUsage(summary: ProviderUsageSummary): ProviderUsageSummary {
  return {
    providerKey: summary.providerKey,
    name: summary.name,
    status: summary.status,
    windows: summary.windows,
    ...(summary.fetchedAt === undefined ? {} : { fetchedAt: summary.fetchedAt }),
  }
}

/** A collapsed-header single window, never a full multi-window summary. */
function isHeadlineOnly(summary: ProviderUsageSummary): boolean {
  return summary.windows.length === 1 && summary.windows[0]?.id === 'headline'
}

export function writeUsageCache(current: Map<string, ProviderUsageSummary>): void {
  const entries = [...current.values()].filter(hasUsageData)
  const { available, raw } = storageRead()
  if (!available) {
    for (const item of entries) memoryUsageCache.set(item.providerKey, persistableUsage(item))
    return
  }
  const merged = parseUsageCache(raw)
  for (const item of entries) {
    const previous = merged.get(item.providerKey)
    if (previous !== undefined && !isHeadlineOnly(previous) && isHeadlineOnly(item)) continue
    merged.set(item.providerKey, persistableUsage(item))
  }
  memoryUsageCache = new Map(merged)
  if (merged.size === 0) return
  storageWrite(JSON.stringify([...merged.values()]))
}

export function dropPersistedUsageKeys(keys: readonly string[]): void {
  const drop = new Set(keys)
  for (const key of drop) memoryUsageCache.delete(key)
  const { available, raw } = storageRead()
  if (!available || raw === null) return
  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch { return }
  if (!Array.isArray(parsed)) return
  const kept = parsed.filter(value => {
    const item = recordUsageValue(value)
    return item === undefined || !nonEmptyString(item.providerKey) || !drop.has(item.providerKey)
  })
  if (kept.length === parsed.length) return
  storageWrite(JSON.stringify(kept))
}

export function clearProviderUsageCache(): void {
  memoryUsageCache = new Map()
  storageRemove()
}

/** Last-good quota for a Provider card header, available on first paint. */
export function peekCachedUsage(providerKey: string): ProviderUsageSummary | undefined {
  return readUsageCache().get(providerKey)
}

export function rememberCachedUsage(summary: ProviderUsageSummary): void {
  if (!hasUsageData(summary)) return
  writeUsageCache(new Map([[summary.providerKey, summary]]))
}

/**
 * Collapsed-header last-good quota for first paint. Ignores headlines without
 * a finite in-range remaining percent so missing quota renders no meter, never
 * a zero bar. Never replaces a cached full multi-window summary, and records
 * no fetchedAt: a headline is display data, not a fetch, so freshness checks
 * treat it as expired and refetch.
 */
export function rememberHeadlineQuota(providerKey: string, name: string, quota: { label?: string, remainingPercent?: number } | null | undefined): void {
  if (quota?.remainingPercent === undefined || !Number.isFinite(quota.remainingPercent)) return
  const remainingPercent = Math.round(quota.remainingPercent * 10) / 10
  if (remainingPercent < 0 || remainingPercent > 100) return
  const label = quota.label ?? 'Quota'
  rememberCachedUsage({
    providerKey,
    name,
    status: 'ready',
    windows: [{ id: 'headline', label, shortLabel: label, valueText: String(remainingPercent) + '%', remainingPercent }],
  })
}

export function headerQuotaFromCache(summary: ProviderUsageSummary | undefined): { label: string, remainingPercent?: number, detail?: string } | undefined {
  if (summary === undefined) return undefined
  const quotaWindow = pickPrimaryWindow(summary.windows)
  if (quotaWindow === undefined) return undefined
  const instant = formatResetInstant(quotaWindow.resetsAt)
  const detail = instant === undefined ? undefined : instant.when
  return {
    label: quotaWindow.shortLabel || quotaWindow.label,
    ...(quotaWindow.remainingPercent === undefined ? {} : { remainingPercent: quotaWindow.remainingPercent }),
    ...(detail === undefined ? {} : { detail }),
  }
}
