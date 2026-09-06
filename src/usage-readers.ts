/** Bundle-safe quota reader factories: pure decode plus RPC reads. No ModuleLoader wrapper, no store. */

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

/** Headline window: longest percentage period, else the first text-only window. */
export function pickPrimaryWindow(windows: readonly UsageWindowSummary[]): UsageWindowSummary | undefined {
  let best: UsageWindowSummary | undefined
  for (const quotaWindow of windows) {
    if (quotaWindow.remainingPercent === undefined) continue
    if (best === undefined || periodRank(quotaWindow.shortLabel) > periodRank(best.shortLabel)) best = quotaWindow
  }
  return best ?? windows[0]
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

function decodeCommandCodeUsage(usage: UsageRecordValue): { fetchedAt: string, windows: readonly UsageWindowSummary[] } | undefined {
  if (!nonEmptyString(usage.fetchedAt)) return undefined
  if (usage.failures !== undefined && (!Array.isArray(usage.failures) || usage.failures.some(item => typeof item !== 'string'))) return undefined
  const credits = usage.credits
  if (credits === undefined) return { fetchedAt: usage.fetchedAt, windows: [] }
  const value = recordUsageValue(credits)
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
  const credits = recordUsageValue(usage.credits)
  if (usage.credits !== undefined && (credits === undefined || typeof credits.unlimited !== 'boolean' || (credits.balance !== undefined && !nonEmptyString(credits.balance)))) return { status: 'error', message: 'malformed usage response' }
  if (credits !== undefined) windows.push({ id: 'credits', label: 'Credits', shortLabel: 'Cr', valueText: credits.unlimited ? 'Unlimited' : String(credits.balance ?? 'Credits') })
  const individual = recordUsageValue(usage.individualLimit)
  if (usage.individualLimit !== undefined && individual === undefined) return { status: 'error', message: 'malformed usage response' }
  if (individual !== undefined) {
    const remainingPercent = individual.remainingPercent
    const remainingText = individual.remaining
    if (!nonNegativeNumber(remainingPercent) || remainingPercent > 100 || !nonEmptyString(remainingText)) return { status: 'error', message: 'malformed usage response' }
    if (credits === undefined) windows.push({ id: 'individual', label: 'Credits', shortLabel: 'Cr', remainingPercent: percentage(remainingPercent), valueText: remainingText })
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
