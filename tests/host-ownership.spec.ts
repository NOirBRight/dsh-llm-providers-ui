import { afterEach, describe, expect, it } from 'vitest'
import { Context, Service, type Fiber } from '@deepseek-ai/cordis'
import * as ProvidersUi from '../src/index.ts'

class FakeSettings extends Service {
  readonly policies = new Map<Fiber, { auto?: boolean }>()

  constructor(ctx: Context) {
    super(ctx, 'settings')
  }

  configure(presentation: { auto?: boolean }, owner: Fiber = this.ctx.fiber): () => void {
    const policy = { ...presentation }
    if (this.policies.has(owner)) throw new Error('settings presentation is already configured')
    this.policies.set(owner, policy)
    return () => {
      if (this.policies.get(owner) === policy) this.policies.delete(owner)
    }
  }
}

const contexts: Context[] = []
afterEach(async () => {
  await Promise.all(contexts.splice(0).map(ctx => ctx.fiber.dispose()))
})

function providerPlugin(key: string) {
  return {
    name: 'provider-' + key,
    apply(ctx: Context): void {
      ctx.provide(key, { key })
    },
  }
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

  it('disables only the generated Settings page and releases that policy with its owner', async () => {
    const ctx = new Context()
    contexts.push(ctx)
    await ctx.plugin(FakeSettings).await()
    const settings = ctx.reflect.get('settings') as FakeSettings
    const owner = ctx.plugin(ProvidersUi)
    await owner.await()

    expect([...settings.policies.values()]).toEqual([{ auto: false }])
    await owner.dispose()
    expect(settings.policies.size).toBe(0)
  })

  it('keeps provider Host routes independent of the owner lifecycle', async () => {
    const ctx = new Context()
    contexts.push(ctx)
    const provider = ctx.plugin(providerPlugin('llm-cursor'))
    const owner = ctx.plugin(ProvidersUi)
    await Promise.all([provider.await(), owner.await()])
    expect(ctx.reflect.get('llm-cursor')).toEqual({ key: 'llm-cursor' })

    await owner.dispose()
    expect(ctx.reflect.get('llm-cursor')).toEqual({ key: 'llm-cursor' })
    await provider.dispose()
  })

  it('keeps all six provider routes when the owner is absent', async () => {
    const ctx = new Context()
    contexts.push(ctx)
    const keys = ['llm-cursor', 'llm-grok', 'llm-codex', 'llm-ollama', 'llm-commandcode', 'llm-opencode-go']
    const providers = keys.map(key => ctx.plugin(providerPlugin(key)))
    await Promise.all(providers.map(provider => provider.await()))
    for (const key of keys) expect(ctx.reflect.get(key)).toEqual({ key })
    await Promise.all(providers.map(provider => provider.dispose()))
  })
})
