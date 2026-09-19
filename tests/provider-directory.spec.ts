import { describe, expect, it, vi } from 'vitest'
import { ProviderDirectory } from '../src/client/directory.ts'

const reader = {
  providerKey: 'agent-antigravity',
  name: 'Antigravity',
  read: vi.fn(),
}

describe('ProviderDirectory', () => {
  it('publishes a registered Agent reader and removes it on dispose', () => {
    const directory = new ProviderDirectory()
    const notify = vi.fn()
    const stop = directory.subscribe(notify)

    const unregister = directory.register({ key: 'agent-antigravity', role: 'agent', usage: reader })

    expect(directory.roleOf('agent-antigravity')).toBe('agent')
    expect(directory.reader('agent-antigravity')).toBe(reader)
    expect(directory.accountOf('agent-antigravity')).toBeUndefined()
    expect(notify).toHaveBeenCalledTimes(1)

    unregister()
    expect(directory.roleOf('agent-antigravity')).toBe('llm')
    expect(directory.reader('agent-antigravity')).toBeUndefined()
    expect(notify).toHaveBeenCalledTimes(2)
    stop()
  })

  it('defaults header ownership to legacy and keeps shared registrations', () => {
    const directory = new ProviderDirectory()
    expect(directory.headerOf('llm-codex')).toBe('legacy')
    const unregister = directory.register({ key: 'llm-codex', header: 'shared' })
    expect(directory.headerOf('llm-codex')).toBe('shared')
    unregister()
    expect(directory.headerOf('llm-codex')).toBe('legacy')
  })

  it('rejects a duplicate card registration before it can replace an active declaration', () => {
    const directory = new ProviderDirectory()
    const stop = directory.register({ key: 'llm-codex', name: 'First' })
    expect(() => directory.register({ key: 'llm-codex', name: 'Second' })).toThrow(/key is already registered/)
    expect(directory.nameOf('llm-codex')).toBe('First')
    stop()
    expect(directory.nameOf('llm-codex')).toBeUndefined()
  })

  it('reads a connected snapshot without exposing account labels', () => {
    const directory = new ProviderDirectory()
    directory.register({ key: 'llm-codex', account: () => ({ state: 'connected' }), catalogId: 'codex' })
    expect(directory.accountOf('llm-codex')).toEqual({ state: 'connected' })
    expect(directory.accountOf('llm-grok')).toBeUndefined()
    expect(directory.catalogRoutes()).toEqual({ codex: 'llm-codex' })
  })

  it('rejects incomplete and duplicate catalog routing declarations', () => {
    const directory = new ProviderDirectory()
    expect(() => directory.register({ key: 'empty-route', catalogId: '' })).toThrow(/catalogId/)
    expect(() => directory.register({ key: 'empty-binding', binding: { channel: '', endpoint: 'activity/binding' } })).toThrow(/binding/)
    directory.register({ key: 'llm-codex', catalogId: 'codex' })
    expect(() => directory.register({ key: 'duplicate-codex', catalogId: 'codex' })).toThrow(/already registered/)
  })

  it('keeps an unknown account snapshot until the plugin resolves auth', () => {
    const directory = new ProviderDirectory()
    let state: 'unknown' | 'connected' = 'unknown'
    directory.register({ key: 'llm-codex', account: () => ({ state }) })
    expect(directory.accountOf('llm-codex')).toEqual({ state: 'unknown' })
    state = 'connected'
    directory.update('llm-codex')
    expect(directory.accountOf('llm-codex')).toEqual({ state: 'connected' })
  })

  it('publishes the display name and model count the plugin reports', () => {
    const directory = new ProviderDirectory()
    let models = 2
    const stop = directory.register({ key: 'llm-grok', name: 'Grok', modelCount: () => models })

    expect(directory.nameOf('llm-grok')).toBe('Grok')
    expect(directory.modelCountOf('llm-grok')).toBe(2)
    expect(directory.nameOf('llm-codex')).toBeUndefined()
    expect(directory.modelCountOf('llm-codex')).toBeUndefined()

    models = 5
    const notify = vi.fn()
    const unsubscribe = directory.subscribe(notify)
    directory.update('llm-grok')
    expect(directory.modelCountOf('llm-grok')).toBe(5)
    expect(notify).toHaveBeenCalledTimes(1)

    directory.update('llm-unknown')
    expect(notify).toHaveBeenCalledTimes(1)
    unsubscribe()
    stop()
  })

  it('notifies usage-invalidation listeners per key until disposed', () => {
    const directory = new ProviderDirectory()
    const seen: string[] = []
    const stop = directory.onInvalidateUsage(key => { seen.push(key) })
    directory.invalidateUsage('llm-codex')
    stop()
    directory.invalidateUsage('llm-codex')
    expect(seen).toEqual(['llm-codex'])
  })

  it('lists native-agent bindings from declared catalogId and binding, then drops them on dispose', () => {
    const directory = new ProviderDirectory()
    const notify = vi.fn()
    const stop = directory.subscribe(notify)
    directory.register({
      key: 'llm-codex',
      catalogId: 'codex',
      binding: { channel: '/codex', endpoint: 'activity/binding' },
    })
    expect(directory.nativeBindings()).toEqual([])

    const dropCursor = directory.register({
      key: 'cursor-agent',
      role: 'agent',
      catalogId: 'cursor-agent',
      binding: { channel: '/dsh-acp-cursor', endpoint: 'activity/binding' },
    })
    const dropAntigravity = directory.register({
      key: 'antigravity',
      role: 'agent',
      catalogId: 'antigravity',
      binding: { channel: '/dsh-acp-antigravity', endpoint: 'activity/binding' },
    })
    directory.register({ key: 'bare-agent', role: 'agent' })

    expect(directory.nativeBindings()).toEqual([
      { provider: 'cursor-agent', channel: '/dsh-acp-cursor', endpoint: 'activity/binding' },
      { provider: 'antigravity', channel: '/dsh-acp-antigravity', endpoint: 'activity/binding' },
    ])
    expect(notify).toHaveBeenCalledTimes(4)

    dropAntigravity()
    expect(directory.nativeBindings()).toEqual([
      { provider: 'cursor-agent', channel: '/dsh-acp-cursor', endpoint: 'activity/binding' },
    ])
    dropCursor()
    expect(directory.nativeBindings()).toEqual([])
    stop()
  })
})
