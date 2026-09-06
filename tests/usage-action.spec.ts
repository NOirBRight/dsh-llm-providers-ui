import { describe, expect, it, vi } from 'vitest'
import type { ClientConnectionRpc } from '@deepseek-ai/dsh-client-connection/client'
import { ProviderDirectory } from '../src/client/directory.ts'
import { installProviderUsage } from '../src/client/usage-action.tsx'
import { createCursorUsageReader, type ProviderUsageStore } from '../src/client/usage.ts'

async function flush(): Promise<void> {
  for (let index = 0; index < 5; index += 1) await Promise.resolve()
}

describe('Provider Usage directory registration', () => {
  it('reads a reader registered after its card is already configured', async () => {
    const rpc = {
      call: vi.fn(async () => ({
        ok: true,
        value: { status: 'ok', usage: { fetchedAt: 'now', windows: [{ id: 'weekly', used: 10, limit: 100, unit: 'percent' }] } },
      })),
    } as unknown as ClientConnectionRpc
    const directory = new ProviderDirectory()
    const slotListeners = new Set<() => void>()
    const context = {
      get: () => ({ rpc }),
      slots: {
        entriesOfSlot: () => [{ options: { key: 'llm-cursor' } }],
        inject: () => () => undefined,
        subscribe: (_name: string, listener: () => void) => {
          slotListeners.add(listener)
          return () => { slotListeners.delete(listener) }
        },
      },
    }
    const orderScope = {
      getSnapshot: () => ({ status: 'ready', writable: true, value: { usageOrder: [], hiddenUsageProviders: [] } }),
      subscribe: () => () => undefined,
      set: async () => undefined,
    }

    const dispose = installProviderUsage(context as never, orderScope as never, directory)
    await flush()
    expect(rpc.call).not.toHaveBeenCalled()

    directory.register({ key: 'llm-cursor', usage: createCursorUsageReader() })
    await flush()

    expect(rpc.call).toHaveBeenCalledWith('/cursor', 'usage/read', {}, expect.any(AbortSignal))
    dispose()
  })
})
describe('Provider Usage sign-out invalidation', () => {
  it('purges sidebar quota through directory.invalidateUsage', async () => {
    let mode: 'ready' | 'broken' = 'ready'
    const rpc = {
      call: vi.fn(async () => {
        if (mode === 'ready') {
          return { ok: true, value: { status: 'ok', usage: { fetchedAt: 'now', windows: [{ id: 'weekly', used: 10, limit: 100, unit: 'percent' }] } } }
        }
        throw new Error('signed out')
      }),
    } as unknown as ClientConnectionRpc
    const directory = new ProviderDirectory()
    let face: { usage: ProviderUsageStore } | undefined
    const context = {
      get: () => ({ rpc }),
      slots: {
        entriesOfSlot: () => [{ options: { key: 'llm-cursor' } }],
        register: (spec: { inject?: () => { usage: ProviderUsageStore } }) => {
          const next = spec.inject?.()
          if (next !== undefined) face = next
          return () => undefined
        },
        inject: (_name: string, setup: () => unknown) => { setup(); return () => undefined },
        subscribe: () => () => undefined,
      },
    }
    const orderScope = {
      getSnapshot: () => ({ status: 'ready', writable: true, value: { usageOrder: [], hiddenUsageProviders: [] } }),
      subscribe: () => () => undefined,
      set: async () => undefined,
    }

    const dispose = installProviderUsage(context as never, orderScope as never, directory)
    directory.register({ key: 'llm-cursor', usage: createCursorUsageReader() })
    await flush()
    expect(face?.usage.getSnapshot().providers[0]).toMatchObject({ status: 'ready', windows: [{ remainingPercent: 90 }] })

    mode = 'broken'
    directory.invalidateUsage('llm-cursor')
    await flush()
    expect(face?.usage.getSnapshot().providers[0]).toEqual({ providerKey: 'llm-cursor', name: 'Cursor', status: 'error', windows: [] })
    dispose()
  })
})
