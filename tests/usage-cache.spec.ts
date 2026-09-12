import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearProviderUsageCache, headerQuotaFromCache, peekCachedUsage, rememberCachedUsage, rememberHeadlineQuota } from '../src/usage-readers.ts'
import type { ProviderUsageSummary } from '../src/usage-readers.ts'

function stubStorage(store: Record<string, string>): void {
  vi.stubGlobal('localStorage', { getItem: (key: string) => store[key] ?? null, setItem: (key: string, value: string) => { store[key] = value }, removeItem: (key: string) => { delete store[key] } })
  vi.stubGlobal('sessionStorage', { getItem: () => null, setItem: () => {}, removeItem: () => {} })
}

const fullCursor: ProviderUsageSummary = {
  providerKey: 'llm-cursor',
  name: 'Cursor',
  status: 'ready',
  fetchedAt: '2026-09-02T00:00:00.000Z',
  windows: [
    { id: 'weekly', label: 'Week', shortLabel: 'W', valueText: '70%', remainingPercent: 70, resetsAt: '2026-09-09T00:00:00.000Z' },
    { id: 'monthly', label: 'Month', shortLabel: 'M', valueText: '40%', remainingPercent: 40 },
  ],
}

afterEach(() => {
  clearProviderUsageCache()
  vi.unstubAllGlobals()
})

describe('collapsed quota cache', () => {
  it('paints a header meter from persisted last-good usage', () => {
    stubStorage({})
    rememberHeadlineQuota('llm-cursor', 'Cursor', { label: 'W', remainingPercent: 73 })
    expect(headerQuotaFromCache(peekCachedUsage('llm-cursor'))).toEqual({ label: 'W', remainingPercent: 73 })
  })

  it('ignores empty headlines so a missing query still renders no meter', () => {
    rememberHeadlineQuota('llm-cursor', 'Cursor', { label: 'W' })
    expect(peekCachedUsage('llm-cursor')).toBeUndefined()
  })

  it('reorders a cached Command Code summary to 5-hour, week, month', () => {
    stubStorage({})
    rememberCachedUsage({
      providerKey: 'llm-commandcode',
      name: 'CommandCode',
      status: 'ready',
      windows: [
        { id: 'monthly', label: 'Month', shortLabel: 'M', valueText: '7%', remainingPercent: 7, resetsAt: '2026-09-26T00:00:00.000Z' },
        { id: 'fiveHour', label: '5-hour', shortLabel: '5h', valueText: '100%', remainingPercent: 100 },
        { id: 'weekly', label: 'Week', shortLabel: 'W', valueText: '91%', remainingPercent: 91, resetsAt: '2026-09-17T03:38:00.000Z' },
      ],
    })
    expect(peekCachedUsage('llm-commandcode')?.windows.map(window => window.id)).toEqual(['fiveHour', 'weekly', 'monthly'])
  })

  it('keeps stale status across a storage round-trip', () => {
    stubStorage({})
    rememberCachedUsage({ ...fullCursor, status: 'stale' })
    expect(peekCachedUsage('llm-cursor')).toMatchObject({ status: 'stale', windows: [{ id: 'weekly' }, { id: 'monthly' }] })
  })

  it('never lets a headline replace cached full windows and resets', () => {
    stubStorage({})
    rememberCachedUsage(fullCursor)
    rememberHeadlineQuota('llm-cursor', 'Cursor', { label: 'W', remainingPercent: 73 })
    expect(peekCachedUsage('llm-cursor')).toMatchObject({
      status: 'ready',
      fetchedAt: '2026-09-02T00:00:00.000Z',
      windows: [
        { id: 'weekly', remainingPercent: 70, resetsAt: '2026-09-09T00:00:00.000Z' },
        { id: 'monthly', remainingPercent: 40 },
      ],
    })
    expect(headerQuotaFromCache(peekCachedUsage('llm-cursor'))).toEqual({ label: 'M', remainingPercent: 40 })
  })

  it('lets a full summary upgrade a cached headline', () => {
    stubStorage({})
    rememberHeadlineQuota('llm-cursor', 'Cursor', { label: 'W', remainingPercent: 73 })
    rememberCachedUsage(fullCursor)
    expect(peekCachedUsage('llm-cursor')?.windows.map(window => window.id)).toEqual(['weekly', 'monthly'])
  })

  it('rounds the headline display text and records no fetch time', () => {
    stubStorage({})
    rememberHeadlineQuota('llm-cursor', 'Cursor', { label: 'W', remainingPercent: 73.45 })
    const cached = peekCachedUsage('llm-cursor')
    expect(cached?.windows[0]).toMatchObject({ remainingPercent: 73.5, valueText: '73.5%' })
    expect(cached?.fetchedAt).toBeUndefined()
  })

  it('does not restore an invalidated key when another bundle writes a different provider', async () => {
    stubStorage({})
    vi.resetModules()
    const bundleA = await import('../src/usage-readers.ts')
    vi.resetModules()
    const bundleB = await import('../src/usage-readers.ts')
    bundleA.rememberHeadlineQuota('llm-a', 'A', { label: 'W', remainingPercent: 50 })
    bundleB.rememberHeadlineQuota('llm-b', 'B', { label: 'W', remainingPercent: 60 })
    expect(bundleB.peekCachedUsage('llm-a')?.windows[0]?.remainingPercent).toBe(50)
    bundleA.dropPersistedUsageKeys(['llm-a'])
    expect(bundleA.peekCachedUsage('llm-a')).toBeUndefined()
    bundleB.rememberHeadlineQuota('llm-b', 'B', { label: 'W', remainingPercent: 30 })
    expect(bundleB.peekCachedUsage('llm-a')).toBeUndefined()
    expect(bundleA.peekCachedUsage('llm-a')).toBeUndefined()
    expect(bundleB.peekCachedUsage('llm-b')?.windows[0]?.remainingPercent).toBe(30)
  })
})
