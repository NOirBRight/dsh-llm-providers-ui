import { describe, expect, it } from 'vitest'
import { applySavedOrder, decodeProviderOrder, providerKeyForRoute, sortCatalogGroups } from '../src/order.ts'

const live = {
  cursor: 'llm-cursor',
  grok: 'llm-grok',
  'ollama-cloud': 'llm-ollama',
  commandcode: 'llm-commandcode',
  'opencode-go': 'llm-opencode-go',
  codex: 'llm-codex',
}

describe('applySavedOrder', () => {
  it('returns empty when nothing is installed so the settings page can show empty copy', () => {
    expect(applySavedOrder([])).toEqual([])
  })

  it('drops unknown and duplicate saved keys while appending new ones', () => {
    expect(applySavedOrder(
      ['llm-grok', 'llm-cursor', 'llm-new', 'llm-cursor'],
      ['llm-codex', 'llm-cursor', 'llm-cursor', 'llm-grok'],
    )).toEqual(['llm-cursor', 'llm-grok', 'llm-new'])
  })
})

describe('decodeProviderOrder', () => {
  it('reads string keys and ignores junk', () => {
    expect(decodeProviderOrder({ order: ['llm-grok', 1, '', 'llm-cursor'] })).toEqual({
      order: ['llm-grok', 'llm-cursor'],
      hiddenUsageProviders: [],
      usageOrder: [],
      showSidebarUsage: true,
    })
    expect(decodeProviderOrder(null)).toEqual({ order: [], hiddenUsageProviders: [], usageOrder: [], showSidebarUsage: true })
    expect(decodeProviderOrder(undefined)).toEqual({ order: [], hiddenUsageProviders: [], usageOrder: [], showSidebarUsage: true })
  })

  it('defaults a missing hidden list so old saves keep showing every provider', () => {
    expect(decodeProviderOrder({ order: ['llm-grok'] })).toEqual({
      order: ['llm-grok'],
      hiddenUsageProviders: [],
      usageOrder: [],
      showSidebarUsage: true,
    })
    expect(decodeProviderOrder({
      order: ['llm-grok'],
      hiddenUsageProviders: ['llm-cursor', 1, '', 'llm-codex'],
      usageOrder: ['llm-codex', 0, 'llm-grok'],
    })).toEqual({
      order: ['llm-grok'],
      hiddenUsageProviders: ['llm-cursor', 'llm-codex'],
      usageOrder: ['llm-codex', 'llm-grok'],
      showSidebarUsage: true,
    })
  })

  it('defaults showSidebarUsage on so old saves keep the Task Panel quota block', () => {
    expect(decodeProviderOrder({ order: ['llm-grok'] }).showSidebarUsage).toBe(true)
    expect(decodeProviderOrder({ showSidebarUsage: false }).showSidebarUsage).toBe(false)
    expect(decodeProviderOrder({ showSidebarUsage: 'no' }).showSidebarUsage).toBe(true)
  })
})

describe('applySavedOrder ignores hidden visibility settings', () => {
  it('still orders hidden keys because visibility filtering happens elsewhere', () => {
    expect(applySavedOrder(['llm-cursor', 'llm-grok'], ['llm-grok'])).toEqual(['llm-grok', 'llm-cursor'])
  })
})

describe('provider route mapping', () => {
  it('maps an llm route back to its provider key', () => {
    expect(providerKeyForRoute('ollama-cloud')).toBe('llm-ollama')
    expect(providerKeyForRoute('unknown')).toBeUndefined()
  })
})

describe('sortCatalogGroups', () => {
  const groups = [
    { id: 'deepseek-official', name: 'DeepSeek' },
    { id: 'commandcode', name: 'Command Code' },
    { id: 'cursor', name: 'Cursor' },
    { id: 'grok', name: 'Grok' },
    { id: 'ollama-cloud', name: 'Ollama Cloud' },
  ]

  it('keeps catalog order when no live routes are declared', () => {
    expect(sortCatalogGroups(groups, ['llm-grok', 'llm-cursor']).map(group => group.id)).toEqual([
      'deepseek-official',
      'commandcode',
      'cursor',
      'grok',
      'ollama-cloud',
    ])
  })

  it('orders declared routes by saved card keys and appends unknown groups', () => {
    expect(sortCatalogGroups(groups, ['llm-grok', 'llm-cursor'], live).map(group => group.id)).toEqual([
      'grok',
      'cursor',
      'ollama-cloud',
      'commandcode',
      'deepseek-official',
    ])
  })

  it('maps ollama-cloud through llm-ollama rather than stripping a prefix', () => {
    expect(sortCatalogGroups(groups, ['llm-ollama'], live).map(group => group.id)[0]).toBe('ollama-cloud')
  })

  it('keeps catalog order when saved card order is empty', () => {
    expect(sortCatalogGroups(groups, [], live).map(group => group.id)).toEqual([
      'deepseek-official',
      'commandcode',
      'cursor',
      'grok',
      'ollama-cloud',
    ])
  })

  it('does not treat Object.prototype names as live catalog keys', () => {
    expect(sortCatalogGroups(
      [{ id: 'toString' }, { id: 'cursor' }],
      ['llm-cursor'],
      { cursor: 'llm-cursor' },
    ).map(group => group.id)).toEqual(['cursor', 'toString'])
  })

  it('ranks a live catalog id by saved card order even when it is not in PROVIDER_ROUTES', () => {
    expect(sortCatalogGroups(
      [{ id: 'codex' }, { id: 'antigravity' }],
      ['antigravity', 'llm-codex'],
      { antigravity: 'antigravity', ...live },
    ).map(group => group.id)).toEqual(['antigravity', 'codex'])
  })
})
