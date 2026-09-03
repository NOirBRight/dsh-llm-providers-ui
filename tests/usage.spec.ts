import { describe, expect, it, vi } from 'vitest'
import type { ClientConnectionRpc } from '@deepseek-ai/dsh-client-connection/client'
import { PROVIDER_USAGE_READERS, createProviderUsageStore } from '../src/client/usage.ts'

const cursorReader = PROVIDER_USAGE_READERS.find(reader => reader.providerKey === 'llm-cursor')!

function rpcFor(handler: (channel: string, payload: unknown, signal?: AbortSignal) => Promise<unknown>): ClientConnectionRpc {
  return { call: vi.fn((channel, _endpoint, payload, signal) => handler(channel, payload, signal)) } as unknown as ClientConnectionRpc
}

async function flush(): Promise<void> {
  for (let index = 0; index < 5; index += 1) await Promise.resolve()
}

describe('Provider Usage readers', () => {
  it('normalizes Cursor windows and passes refresh without exposing raw data', async () => {
    let request: { channel: string, payload: unknown, signal?: AbortSignal } | undefined
    const signal = new AbortController().signal
    const rpc = rpcFor(async (channel, payload, receivedSignal) => {
      request = { channel, payload, signal: receivedSignal }
      return {
        ok: true,
        value: {
          status: 'ok',
          usage: {
            fetchedAt: '2026-09-02T00:00:00Z',
            resetsAt: '2026-09-02T05:00:00Z',
            windows: [
              { id: 'five-hour', used: 25, limit: 100, unit: 'percent' },
              { id: 'weekly', used: 20, limit: 100, unit: 'percent' },
            ],
          },
        },
      }
    })

    const result = await cursorReader.read(rpc, true, signal)
    expect(request).toEqual({ channel: '/cursor', payload: { refresh: true }, signal })
    expect(result).toEqual({
      status: 'ready',
      fetchedAt: '2026-09-02T00:00:00Z',
      windows: [
        { id: 'five-hour', label: 'five-hour', shortLabel: '5h', remainingPercent: 75, valueText: '75%', resetsAt: '2026-09-02T05:00:00Z' },
        { id: 'weekly', label: 'weekly', shortLabel: 'W', remainingPercent: 80, valueText: '80%', resetsAt: '2026-09-02T05:00:00Z' },
      ],
    })
  })

  it('maps the documented Agent, Day and Local labels', async () => {
    const rpc = rpcFor(async () => ({
      ok: true,
      value: {
        status: 'ok',
        usage: {
          fetchedAt: 'now',
          windows: [
            { id: 'agent', period: 'Agent', used: 10, limit: 100, unit: 'percent' },
            { id: 'day', period: 'Day', used: 20, limit: 100, unit: 'percent' },
            { id: 'local', period: 'Local', used: 30, limit: 100, unit: 'percent' },
          ],
        },
      },
    }))
    const result = await cursorReader.read(rpc, false, new AbortController().signal)
    expect(result).toMatchObject({ status: 'ready', windows: [{ shortLabel: 'A' }, { shortLabel: 'D' }, { shortLabel: 'L' }] })
  })

  it('rejects secret-shaped fields in a successful provider view', async () => {
    const rpc = rpcFor(async () => ({
      ok: true,
      value: {
        status: 'ok',
        usage: {
          fetchedAt: '2026-09-02T00:00:00Z',
          token: 'must not cross the UI boundary',
          windows: [{ id: 'weekly', used: 10, limit: 100, unit: 'percent' }],
        },
      },
    }))
    await expect(cursorReader.read(rpc, false, new AbortController().signal)).resolves.toEqual({ status: 'error', message: 'malformed usage response' })
  })

  it('keeps a successful window as stale when only that refresh fails', async () => {
    let cursorReads = 0
    const rpc = rpcFor(async () => {
      cursorReads += 1
      if (cursorReads === 1) return { ok: true, value: { status: 'ok', usage: { fetchedAt: 'now', windows: [{ id: 'weekly', used: 10, limit: 100, unit: 'percent' }] } } }
      throw new Error('network')
    })
    const store = createProviderUsageStore(rpc)
    store.configure(['llm-cursor'], [], [])
    await flush()
    expect(store.getSnapshot().providers[0]).toMatchObject({ status: 'ready', windows: [{ remainingPercent: 90 }] })
    store.refresh()
    await flush()
    expect(store.getSnapshot().providers[0]).toMatchObject({ status: 'stale', fetchedAt: 'now', windows: [{ remainingPercent: 90 }] })
    store.dispose()
  })

  it('keeps explicit login states instead of relabeling them stale', async () => {
    let reads = 0
    const rpc = rpcFor(async () => {
      reads += 1
      if (reads === 1) return { ok: true, value: { status: 'ok', usage: { fetchedAt: 'now', windows: [{ id: 'weekly', used: 10, limit: 100, unit: 'percent' }] } } }
      return { ok: true, value: { status: 'logged-out' } }
    })
    const store = createProviderUsageStore(rpc)
    store.configure(['llm-cursor'], [], [])
    await flush()
    store.refresh()
    await flush()
    expect(store.getSnapshot().providers[0]).toEqual({ providerKey: 'llm-cursor', name: 'Cursor', status: 'logged-out', windows: [] })
    store.dispose()
  })

  it('exposes an unavailable state when no connection RPC exists', () => {
    const store = createProviderUsageStore(undefined)
    store.configure(['llm-cursor'], [], [])
    expect(store.getSnapshot()).toMatchObject({ unavailable: true, providers: [{ providerKey: 'llm-cursor', status: 'loading' }] })
    store.dispose()
  })

  it('isolates a provider failure and only reads visible providers', async () => {
    const rpc = rpcFor(async (channel) => {
      if (channel === '/grok') throw new Error('grok unavailable')
      return { ok: true, value: { status: 'ok', usage: { fetchedAt: 'now', session: { usage: 0.25 } } } }
    })
    const store = createProviderUsageStore(rpc)
    store.configure(['llm-grok', 'llm-ollama', 'llm-codex'], ['llm-ollama', 'llm-grok'], ['llm-grok'])
    await flush()
    expect(store.getSnapshot().providers.map(provider => provider.providerKey)).toEqual(['llm-ollama', 'llm-grok'])
    expect(store.getSnapshot().providers.find(provider => provider.providerKey === 'llm-ollama')).toMatchObject({ status: 'ready' })
    expect(store.getSnapshot().providers.find(provider => provider.providerKey === 'llm-grok')).toMatchObject({ status: 'loading' })
    expect(rpc.call).toHaveBeenCalledTimes(1)
    store.configure(['llm-grok', 'llm-ollama', 'llm-codex'], ['llm-ollama', 'llm-grok'], [])
    await flush()
    expect(store.getSnapshot().providers.find(provider => provider.providerKey === 'llm-grok')).toMatchObject({ status: 'error' })
    store.dispose()
  })
})
