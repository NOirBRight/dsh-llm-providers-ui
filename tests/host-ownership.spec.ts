import { afterEach, describe, expect, it } from 'vitest'
import { Context, Service } from '@deepseek-ai/cordis'
import * as ProvidersUi from '../src/index.ts'
import { PROVIDERS_SETTINGS_NS } from '../src/order.ts'

class FakeSettings extends Service {
  private readonly namespaces = new Map<string, unknown>()

  constructor(ctx: Context) {
    super(ctx, 'settings')
  }

  register(namespace: unknown, _schema: unknown, options: { base: unknown }): { get: () => unknown, dispose: () => void } {
    const key = String(namespace)
    if (this.namespaces.has(key)) throw new Error('settings namespace "' + key + '" is already registered')
    this.namespaces.set(key, options.base)
    const dispose = (): void => {
      if (this.namespaces.get(key) === options.base) this.namespaces.delete(key)
    }
    this.ctx.effect(() => () => {
      dispose()
    })
    return { get: () => options.base, dispose }
  }

  installSection(
    owner: Context,
    namespace: unknown,
    schema: unknown,
    entry: unknown,
    hooks: { setSource: (source: () => unknown) => void, onChange: () => void },
  ): void {
    const registration = this.register(namespace, schema, { base: entry })
    hooks.setSource(() => registration.get())
    hooks.onChange()
    owner.effect(() => registration.dispose)
  }

  has(namespace: string): boolean {
    return this.namespaces.has(namespace)
  }

  count(): number {
    return this.namespaces.size
  }
}

class FailingSettings extends FakeSettings {
  override register(namespace: unknown, schema: unknown, options: { base: unknown }): { get: () => unknown, dispose: () => void } {
    super.register(namespace, schema, options)
    throw new Error('settings fixture failed after registration')
  }
}

const contexts: Context[] = []
afterEach(async () => {
  await Promise.all(contexts.splice(0).map(ctx => ctx.fiber.dispose()))
})

async function makeContext(Settings = FakeSettings): Promise<{ ctx: Context, settings: FakeSettings }> {
  const ctx = new Context()
  contexts.push(ctx)
  await ctx.plugin(Settings).await()
  return { ctx, settings: ctx.reflect.get('settings') as FakeSettings }
}

function providerPlugin(key: string) {
  return {
    name: 'provider-' + key,
    apply(ctx: Context): void {
      ctx.provide(key, { key })
    },
  }
}

async function expectFailure(fiber: { await: () => Promise<unknown> }, message: RegExp): Promise<void> {
  let reason: unknown
  try {
    await fiber.await()
  } catch (error) {
    reason = error
  }
  expect(reason).toBeInstanceOf(Error)
  if (reason instanceof Error) expect(reason.message).toMatch(message)
}

describe('providers-ui Host ownership', () => {
  it('starts without the optional Settings service', async () => {
    const ctx = new Context()
    contexts.push(ctx)
    const owner = ctx.plugin(ProvidersUi)
    await owner.await()
    expect(ctx.get('settings')).toBeUndefined()
    await owner.dispose()
  })

  it('owns one effect-scoped settings namespace and recreates it after reload', async () => {
    const { ctx, settings } = await makeContext()
    const owner = ctx.plugin(ProvidersUi)
    await owner.await()
    expect(settings.has(PROVIDERS_SETTINGS_NS)).toBe(true)
    expect(settings.count()).toBe(1)

    await owner.dispose()
    expect(settings.has(PROVIDERS_SETTINGS_NS)).toBe(false)
    expect(settings.count()).toBe(0)

    const reloaded = ctx.plugin(ProvidersUi)
    await reloaded.await()
    expect(settings.has(PROVIDERS_SETTINGS_NS)).toBe(true)
    await reloaded.dispose()
  })

  it('rejects a duplicate owner instead of selecting a winner', async () => {
    const { ctx, settings } = await makeContext()
    const first = ctx.plugin(ProvidersUi)
    await first.await()
    const second = ctx.plugin(ProvidersUi)
    await expectFailure(second, /already registered/)
    expect(settings.count()).toBe(1)
    await first.dispose()
  })

  it('rolls back a registration that fails after its namespace is published', async () => {
    const { ctx, settings } = await makeContext(FailingSettings)
    const owner = ctx.plugin(ProvidersUi)
    await expectFailure(owner, /failed after registration/)
    expect(settings.count()).toBe(0)
  })

  it.each([
    ['owner-first', true],
    ['provider-first', false],
  ] as const)('keeps provider Host routes independent of %s', async (_order, ownerFirst) => {
    const { ctx, settings } = await makeContext()
    const provider = ctx.plugin(providerPlugin('llm-cursor'))
    const owner = ctx.plugin(ProvidersUi)
    if (ownerFirst) {
      await owner.await()
      await provider.await()
    } else {
      await provider.await()
      await owner.await()
    }
    expect(ctx.reflect.get('llm-cursor')).toEqual({ key: 'llm-cursor' })
    expect(settings.has(PROVIDERS_SETTINGS_NS)).toBe(true)

    await owner.dispose()
    expect(ctx.reflect.get('llm-cursor')).toEqual({ key: 'llm-cursor' })
    expect(settings.has(PROVIDERS_SETTINGS_NS)).toBe(false)
    await provider.dispose()
  })

  it('keeps all six provider routes when the owner is absent', async () => {
    const { ctx, settings } = await makeContext()
    const keys = ['llm-cursor', 'llm-grok', 'llm-codex', 'llm-ollama', 'llm-commandcode', 'llm-opencode-go']
    const providers = keys.map(key => ctx.plugin(providerPlugin(key)))
    await Promise.all(providers.map(provider => provider.await()))
    expect(settings.has(PROVIDERS_SETTINGS_NS)).toBe(false)
    for (const key of keys) expect(ctx.reflect.get(key)).toEqual({ key })
    await Promise.all(providers.map(provider => provider.dispose()))
  })
})
