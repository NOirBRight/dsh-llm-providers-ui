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
    expect(notify).toHaveBeenCalledTimes(1)

    unregister()
    expect(directory.roleOf('agent-antigravity')).toBe('llm')
    expect(directory.reader('agent-antigravity')).toBeUndefined()
    expect(notify).toHaveBeenCalledTimes(2)
    stop()
  })
})
