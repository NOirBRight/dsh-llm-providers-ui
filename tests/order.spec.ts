import { describe, expect, it } from 'vitest'
import { applySavedOrder, decodeProviderOrder, PROVIDER_ITEM_ORDER, sortCatalogGroups } from '../src/order.ts'

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
    })
    expect(decodeProviderOrder(null)).toEqual({ order: [], hiddenUsageProviders: [] })
  })

  it('defaults a missing hidden list so old saves keep showing every provider', () => {
    expect(decodeProviderOrder({ order: ['llm-grok'] })).toEqual({
      order: ['llm-grok'],
      hiddenUsageProviders: [],
    })
    expect(decodeProviderOrder({
      order: ['llm-grok'],
      hiddenUsageProviders: ['llm-cursor', 1, '', 'llm-codex'],
    })).toEqual({
      order: ['llm-grok'],
      hiddenUsageProviders: ['llm-cursor', 'llm-codex'],
    })
  })
})

describe('decodeProviderOrder hiddenUsageProviders (sidebar provider usage contract)', () => {
  it('defaults both lists on undefined input', () => {
    expect(decodeProviderOrder(undefined)).toEqual({ order: [], hiddenUsageProviders: [] })
  })

  it('filters hidden strings while preserving order', () => {
    expect(decodeProviderOrder({
      order: ['llm-grok'],
      hiddenUsageProviders: ['llm-codex', 1, '', 'llm-grok'],
    })).toEqual({ order: ['llm-grok'], hiddenUsageProviders: ['llm-codex', 'llm-grok'] })
  })
})

describe('applySavedOrder ignores hidden visibility settings', () => {
  it('still orders hidden keys because visibility filtering happens elsewhere', () => {
    expect(applySavedOrder(['llm-cursor', 'llm-grok'], ['llm-grok'])).toEqual(['llm-grok', 'llm-cursor'])
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

  it('orders mapped routes by saved card keys and appends unknown groups', () => {
    expect(sortCatalogGroups(groups, ['llm-grok', 'llm-cursor']).map(group => group.id)).toEqual([
      'grok',
      'cursor',
      'ollama-cloud',
      'commandcode',
      'deepseek-official',
    ])
  })

  it('maps ollama-cloud through llm-ollama rather than stripping a prefix', () => {
    expect(sortCatalogGroups(groups, ['llm-ollama']).map(group => group.id)[0]).toBe('ollama-cloud')
  })

  it('falls back to PROVIDER_ITEM_ORDER for mapped routes when saved order is empty', () => {
    expect(sortCatalogGroups(groups, []).map(group => group.id)).toEqual([
      'cursor',
      'grok',
      'ollama-cloud',
      'commandcode',
      'deepseek-official',
    ])
    expect(PROVIDER_ITEM_ORDER[0]).toBe('llm-cursor')
  })
})
