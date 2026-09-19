// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ClientConnectionRpc } from '@deepseek-ai/dsh-client-connection/client'
import { ProviderDirectory } from '../src/client/directory.ts'
import { installProviderUsage } from '../src/client/usage-action.tsx'
import { peekCachedUsage, clearProviderUsageCache, type ProviderUsageStore } from '../src/client/usage.ts'

const CACHE_KEY = 'dsh-llm-providers-ui:usage-cache'

async function flush(): Promise<void> { for (let index = 0; index < 8; index += 1) await Promise.resolve() }

function seed(key: string, name: string): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify([{ providerKey: key, name, status: 'ready', fetchedAt: new Date().toISOString(), windows: [{ id: 'month', label: 'Month', shortLabel: 'M', valueText: '77%', remainingPercent: 77 }] }]))
}

function harness(account: () => { state: string }, read: (signal?: AbortSignal) => Promise<unknown>) {
  const directory = new ProviderDirectory()
  directory.register({ key: 'example', account, usage: { providerKey: 'example', name: 'Example', read: (async (_rpc: unknown, _refresh: unknown, signal: AbortSignal) => read(signal)) as never } })
  const context = { get: () => ({ rpc: {} }), slots: { entriesOfSlot: () => [{ options: { key: 'example' } }], inject: () => () => undefined, subscribe: () => () => undefined } }
  const set = vi.fn()
  const orderScope = { getSnapshot: () => ({ status: 'ready', writable: true, value: { usageOrder: [], hiddenUsageProviders: [], showSidebarUsage: true } }), subscribe: () => () => undefined, set }
  let store: ProviderUsageStore | undefined
  const dispose = installProviderUsage(context as never, orderScope as never, directory, usage => { store = usage })
  return { directory, dispose, set, store: () => store! }
}

beforeEach(() => { clearProviderUsageCache(); localStorage.clear() })

describe('login/cache adversarial', () => {
  it('purges a seeded old-account cache for an unconnected provider without reading', async () => {
    seed('example', 'Example')
    const read = vi.fn(async () => ({ status: 'ready' as const, fetchedAt: 'now', windows: [{ id: 'month', label: 'Month', shortLabel: 'M', valueText: '12%', remainingPercent: 12 }] }))
    const h = harness(() => ({ state: 'unconnected' }), read)
    await flush()
    expect(read).not.toHaveBeenCalled()
    expect(h.store().getSnapshot().providers[0]?.status).toBe('logged-out')
    expect(h.store().getSnapshot().providers[0]?.windows).toEqual([])
    expect(peekCachedUsage('example')).toBeUndefined()
    h.dispose()
  })

  it('keeps 0% windows from the reconnect read exactly once', async () => {
    let state = 'unconnected'
    const read = vi.fn(async () => ({ status: 'ready' as const, fetchedAt: new Date().toISOString(), windows: [{ id: 'month', label: 'Month', shortLabel: 'M', valueText: '0%', remainingPercent: 0 }] }))
    const h = harness(() => ({ state }), read)
    await flush()
    state = 'connected'
    h.directory.invalidateUsage('example')
    await flush()
    expect(read).toHaveBeenCalledTimes(1)
    expect(h.store().getSnapshot().providers[0]?.status).toBe('ready')
    expect(h.store().getSnapshot().providers[0]?.windows[0]?.remainingPercent).toBe(0)
    await flush()
    expect(read).toHaveBeenCalledTimes(1)
    h.dispose()
  })

  it('never resurrects old-account windows when the stale read resolves after sign-out', async () => {
    let state = 'connected'
    let release: ((value: unknown) => void) | undefined
    const read = vi.fn((_signal?: AbortSignal) => new Promise(resolve => { release = resolve }))
    const h = harness(() => ({ state }), read as never)
    await flush()
    expect(read).toHaveBeenCalledTimes(1)
    state = 'unconnected'
    h.directory.invalidateUsage('example')
    await flush()
    release?.({ status: 'ready', fetchedAt: 'old', windows: [{ id: 'month', label: 'Month', shortLabel: 'M', valueText: '88%', remainingPercent: 88 }] })
    await flush()
    expect(h.store().getSnapshot().providers[0]?.status).toBe('logged-out')
    expect(h.store().getSnapshot().providers[0]?.windows).toEqual([])
    expect(peekCachedUsage('example')).toBeUndefined()
    expect(JSON.parse(localStorage.getItem(CACHE_KEY) ?? '[]')).toEqual([])
    h.dispose()
  })

  it('retains a transient error for a connected provider instead of hiding it', async () => {
    const read = vi.fn(async () => { throw new Error('boom') })
    const h = harness(() => ({ state: 'connected' }), read as never)
    await flush()
    expect(h.store().getSnapshot().providers[0]?.status).toBe('error')
    h.dispose()
  })
})
