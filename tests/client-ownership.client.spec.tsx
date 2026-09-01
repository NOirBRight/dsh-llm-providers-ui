// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { Context, Service } from '@deepseek-ai/cordis'
import { apply as applyOwner, inject as ownerInject } from '../src/client/index.ts'
import { disposeAfterSetup, disposeReverse } from '../src/client/cleanup.ts'
import { PROVIDERS_ITEM_SLOT, PROVIDERS_SECTION_ID } from '../src/order.ts'

interface SlotOptions {
  name: string
  id?: string
  key?: string
  children?: Record<string, unknown>
}
interface SlotEntry { options: SlotOptions, component: unknown }
interface Injection { name: string, callback: () => () => void, active?: () => void, stopped: boolean }


class FakeSlots extends Service {
  private readonly declared = new Set<string>(['root'])
  private readonly entries = new Set<SlotEntry>()
  private readonly injections = new Set<Injection>()
  private readonly listeners = new Map<string, Set<() => void>>()

  constructor(ctx: Context) {
    super(ctx, 'slots')
  }

  inject(name: string, callback: () => () => void): () => void {
    const injection: Injection = { name, callback, stopped: false }
    const disposeEffect = this.ctx.effect(() => {
      this.injections.add(injection)
      this.reconcile(injection)
      return () => {
        injection.stopped = true
        this.injections.delete(injection)
        const dispose = injection.active
        injection.active = undefined
        dispose?.()
      }
    })
    return () => { void disposeEffect() }
  }

  register(options: SlotOptions, component: unknown): () => void {
    const duplicate = [...this.entries].find(entry => entry.options.name === options.name
      && ((options.id !== undefined && entry.options.id === options.id)
        || (options.key !== undefined && entry.options.key === options.key)))
    if (duplicate !== undefined) throw new Error('slot cell already registered')
    const entry: SlotEntry = { options, component }
    this.entries.add(entry)
    try {
      for (const child of Object.keys(options.children ?? {})) this.declare(child)
    } catch (error) {
      this.entries.delete(entry)
      for (const child of Object.keys(options.children ?? {})) this.undeclare(child)
      throw error
    }
    this.notify(options.name)
    return () => {
      if (!this.entries.delete(entry)) return
      for (const child of Object.keys(options.children ?? {})) this.undeclare(child)
      this.notify(options.name)
    }
  }

  entriesOfSlot(name: string): readonly SlotEntry[] {
    return [...this.entries].filter(entry => entry.options.name === name)
  }

  spec(name: string): object | undefined {
    return this.declared.has(name) ? { kind: 'single', scope: 'root' } : undefined
  }

  subscribe(name: string, listener: () => void): () => void {
    const listeners = this.listeners.get(name) ?? new Set<() => void>()
    listeners.add(listener)
    this.listeners.set(name, listeners)
    return () => { listeners.delete(listener) }
  }

  declare(name: string): void {
    if (this.declared.has(name)) return
    this.declared.add(name)
    for (const injection of this.injections) if (injection.name === name) this.reconcile(injection)
    this.notify(name)
  }

  private undeclare(name: string): void {
    if (!this.declared.delete(name)) return
    for (const injection of this.injections) if (injection.name === name) this.reconcile(injection)
    this.notify(name)
  }

  private reconcile(injection: Injection): void {
    if (injection.stopped) return
    if (this.declared.has(injection.name)) {
      if (injection.active === undefined) injection.active = injection.callback()
    } else {
      const dispose = injection.active
      injection.active = undefined
      dispose?.()
    }
  }

  private notify(name: string): void {
    for (const listener of this.listeners.get(name) ?? []) listener()
  }

  count(name: string): number {
    return this.entriesOfSlot(name).length
  }

  find(name: string, id: string): SlotEntry | undefined {
    return this.entriesOfSlot(name).find(entry => entry.options.id === id)
  }
}

class FakeLocale extends Service {
  private readonly dictionaries = new Map<string, unknown>()

  constructor(ctx: Context) {
    super(ctx, 'locale')
  }

  register(namespace: string, dictionaries: unknown): () => void {
    if (this.dictionaries.has(namespace)) throw new Error('locale namespace "' + namespace + '" is already registered')
    this.dictionaries.set(namespace, dictionaries)
    this.ctx.effect(() => () => {
      if (this.dictionaries.get(namespace) === dictionaries) this.dictionaries.delete(namespace)
    })
    return () => { this.dictionaries.delete(namespace) }
  }

  bind(namespace: string): (key: string) => string {
    return key => String((this.dictionaries.get(namespace) as { en?: Record<string, string> } | undefined)?.en?.[key] ?? key)
  }

  count(): number {
    return this.dictionaries.size
  }
}

type ScopeStatus = 'loading' | 'ready' | 'unavailable'

function makeSettingsScope(initialStatus: ScopeStatus = 'ready') {
  let order: string[] = []
  let status = initialStatus
  const listeners = new Set<() => void>()
  const scope = {
    getSnapshot: () => ({
      value: status === 'ready' ? { order } : undefined,
      writable: status === 'ready',
      status,
    }),
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    set: async (_key: string, next: string[]) => {
      order = [...next]
      for (const listener of listeners) listener()
    },
  }
  return {
    bind: () => scope,
    setStatus(next: ScopeStatus): void {
      status = next
      for (const listener of listeners) listener()
    },
  }
}

async function makeContext(initialStatus: ScopeStatus = 'ready'): Promise<{
  ctx: Context,
  slots: FakeSlots,
  locale: FakeLocale,
  settingsScope: ReturnType<typeof makeSettingsScope>,
}> {
  const ctx = new Context()
  await ctx.plugin(FakeSlots).await()
  await ctx.plugin(FakeLocale).await()
  const settingsScope = makeSettingsScope(initialStatus)
  ctx.provide('settingsScope', settingsScope)
  return {
    ctx,
    slots: ctx.reflect.get('slots') as FakeSlots,
    locale: ctx.reflect.get('locale') as FakeLocale,
    settingsScope,
  }
}

function installOwner(ctx: Context) {
  return ctx.plugin({ inject: [...ownerInject], apply: applyOwner })
}

function installProvider(ctx: Context, key: string) {
  return ctx.plugin({
    inject: ['slots'],
    apply(providerContext: Context): void {
      providerContext.slots.inject(PROVIDERS_ITEM_SLOT, () => providerContext.slots.register(
        { name: PROVIDERS_ITEM_SLOT, key },
        () => null,
      ))
    },
  })
}

describe('providers-ui Web ownership', () => {
  it('waits for settings.section and declares the keyed child slot', async () => {
    const { ctx, slots, locale } = await makeContext()
    const owner = installOwner(ctx)
    await owner.await()
    expect(slots.count('settings.section')).toBe(0)
    expect(locale.count()).toBe(1)

    slots.declare('settings.section')
    const section = slots.find('settings.section', PROVIDERS_SECTION_ID)
    expect(section?.options.children?.[PROVIDERS_ITEM_SLOT]).toBeDefined()

    await owner.dispose()
    expect(slots.count('settings.section')).toBe(0)
    expect(slots.count(PROVIDERS_ITEM_SLOT)).toBe(0)
    expect(locale.count()).toBe(0)
    await owner.dispose()
    await ctx.fiber.dispose()
  })

  it('warns once when settings.section stays undeclared', async () => {
    const { ctx } = await makeContext()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const owner = installOwner(ctx)
    await owner.await()
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toContain('settings.section')
    await owner.dispose()
    warn.mockRestore()
    await ctx.fiber.dispose()
  })

  it('suppresses the diagnostic when settings.section declares later', async () => {
    const { ctx, slots } = await makeContext()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const owner = installOwner(ctx)
    await owner.await()
    slots.declare('settings.section')
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    expect(warn).not.toHaveBeenCalled()
    await owner.dispose()
    warn.mockRestore()
    await ctx.fiber.dispose()
  })

  it('omits the page and cards when the Host settings owner is unavailable', async () => {
    const { ctx, slots, settingsScope } = await makeContext('unavailable')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const provider = installProvider(ctx, 'llm-cursor')
    const owner = installOwner(ctx)
    await provider.await()
    await owner.await()
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    slots.declare('settings.section')
    expect(slots.count('settings.section')).toBe(0)
    expect(slots.count(PROVIDERS_ITEM_SLOT)).toBe(0)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toContain('settings owner')

    settingsScope.setStatus('ready')
    expect(slots.count('settings.section')).toBe(1)
    expect(slots.count(PROVIDERS_ITEM_SLOT)).toBe(1)

    await owner.dispose()
    await provider.dispose()
    warn.mockRestore()
    await ctx.fiber.dispose()
  })

  it('unmounts and remounts the page across Host unload and reload', async () => {
    const { ctx, slots, settingsScope } = await makeContext()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const provider = installProvider(ctx, 'llm-cursor')
    const owner = installOwner(ctx)
    await Promise.all([provider.await(), owner.await()])
    slots.declare('settings.section')
    expect(slots.count('settings.section')).toBe(1)
    expect(slots.count(PROVIDERS_ITEM_SLOT)).toBe(1)

    settingsScope.setStatus('unavailable')
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toContain('settings owner')
    expect(slots.count('settings.section')).toBe(0)
    expect(slots.count(PROVIDERS_ITEM_SLOT)).toBe(0)

    settingsScope.setStatus('ready')
    expect(slots.count('settings.section')).toBe(1)
    expect(slots.count(PROVIDERS_ITEM_SLOT)).toBe(1)

    await owner.dispose()
    await provider.dispose()
    warn.mockRestore()
    await ctx.fiber.dispose()
  })

  it.each(['owner-first', 'provider-first'] as const)('supports %s load order', async order => {
    const { ctx, slots } = await makeContext()
    const owner = order === 'owner-first' ? installOwner(ctx) : undefined
    const provider = installProvider(ctx, 'llm-cursor')
    if (owner === undefined) {
      const loadedOwner = installOwner(ctx)
      await provider.await()
      await loadedOwner.await()
      slots.declare('settings.section')
      expect(slots.count(PROVIDERS_ITEM_SLOT)).toBe(1)
      await loadedOwner.dispose()
    } else {
      await owner.await()
      const providerReady = provider
      slots.declare('settings.section')
      await providerReady.await()
      expect(slots.count(PROVIDERS_ITEM_SLOT)).toBe(1)
      await owner.dispose()
    }
    expect(slots.count('settings.section')).toBe(0)
    expect(slots.count(PROVIDERS_ITEM_SLOT)).toBe(0)
    await provider.dispose()
    await ctx.fiber.dispose()
  })

  it('recreates all provider cards when the owner section reloads', async () => {
    const { ctx, slots } = await makeContext()
    const providers = ['llm-cursor', 'llm-grok', 'llm-codex', 'llm-ollama', 'llm-commandcode', 'llm-opencode-go']
      .map(key => installProvider(ctx, key))
    const owner = installOwner(ctx)
    await Promise.all([...providers, owner].map(fiber => fiber.await()))
    slots.declare('settings.section')
    expect(slots.count(PROVIDERS_ITEM_SLOT)).toBe(6)

    await providers[0]!.dispose()
    expect(slots.count(PROVIDERS_ITEM_SLOT)).toBe(5)
    await owner.dispose()
    expect(slots.count('settings.section')).toBe(0)
    expect(slots.count(PROVIDERS_ITEM_SLOT)).toBe(0)

    const reloaded = installOwner(ctx)
    await reloaded.await()
    expect(slots.count(PROVIDERS_ITEM_SLOT)).toBe(5)
    await Promise.all(providers.slice(1).map(provider => provider.dispose()))
    await reloaded.dispose()
    await ctx.fiber.dispose()
  })

  it('rejects a duplicate owner and rolls back its locale', async () => {
    const { ctx, slots, locale } = await makeContext()
    slots.declare('settings.section')
    const first = installOwner(ctx)
    await first.await()
    const second = installOwner(ctx)
    await expect(second.await()).rejects.toThrow(/already registered/)
    expect(locale.count()).toBe(1)
    expect(slots.count('settings.section')).toBe(1)
    await first.dispose()
    await ctx.fiber.dispose()
  })

  it('rolls back locale and the section injection after a slot collision', async () => {
    const { ctx, slots, locale } = await makeContext()
    slots.declare('settings.section')
    const occupied = slots.register({ name: 'settings.section', id: PROVIDERS_SECTION_ID }, () => null)
    const owner = installOwner(ctx)
    await expect(owner.await()).rejects.toThrow(/already registered/)
    expect(locale.count()).toBe(0)
    expect(slots.count('settings.section')).toBe(1)
    occupied()
    await ctx.fiber.dispose()
  })

  it('attempts every cleanup in reverse order and flattens nested failures', () => {
    const events: string[] = []
    const first = new Error('first cleanup failure')
    const second = new Error('second cleanup failure')
    const nested = new AggregateError([second, new AggregateError([new Error('third cleanup failure')])], 'nested cleanup')
    let failure: unknown
    try {
      disposeReverse([
        () => { events.push('first') },
        () => { events.push('second'); throw nested },
        () => { events.push('third'); throw first },
      ], 'page cleanup failed')
    } catch (error) {
      failure = error
    }
    expect(events).toEqual(['third', 'second', 'first'])
    expect(failure).toBeInstanceOf(AggregateError)
    expect((failure as AggregateError).errors).toEqual([first, second, expect.any(Error)])
    expect(((failure as AggregateError).errors as unknown[])[2]).toMatchObject({ message: 'third cleanup failure' })
  })

  it('keeps the setup failure first when rollback cleanup also fails', () => {
    const setup = new Error('setup failure')
    const rollback = new Error('rollback failure')
    let failure: unknown
    try {
      disposeAfterSetup(setup, [() => { throw new AggregateError([rollback], 'rollback') }], 'setup rollback failed')
    } catch (error) {
      failure = error
    }
    expect(failure).toBeInstanceOf(AggregateError)
    expect((failure as AggregateError).errors).toEqual([setup, rollback])
  })

  it('preserves an empty AggregateError as a cleanup failure', () => {
    const setup = new Error('setup failure')
    const empty = new AggregateError([], 'empty cleanup')
    let failure: unknown
    try {
      disposeAfterSetup(setup, [() => { throw empty }], 'setup rollback failed')
    } catch (error) {
      failure = error
    }
    expect(failure).toBeInstanceOf(AggregateError)
    expect((failure as AggregateError).errors).toEqual([setup, empty])
  })
})
