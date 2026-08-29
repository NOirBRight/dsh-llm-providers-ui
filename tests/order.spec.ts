import { describe, expect, it } from 'vitest'
import { applySavedOrder, decodeProviderOrder, PROVIDER_ITEM_ORDER, sortCatalogGroups } from '../src/order.ts'

describe('applySavedOrder', () => {
  it('returns the preferred catalog when nothing is installed', () => {
    expect(applySavedOrder([])).toEqual([...PROVIDER_ITEM_ORDER])
  })

  it('drops saved keys that are not installed and appends new ones', () => {
    expect(applySavedOrder(
      ['llm-grok', 'llm-cursor', 'llm-new'],
      ['llm-codex', 'llm-cursor', 'llm-grok'],
    )).toEqual(['llm-cursor', 'llm-grok', 'llm-new'])
  })
})

describe('decodeProviderOrder', () => {
  it('reads string keys and ignores junk', () => {
    expect(decodeProviderOrder({ order: ['llm-grok', 1, '', 'llm-cursor'] })).toEqual({
      order: ['llm-grok', 'llm-cursor'],
    })
    expect(decodeProviderOrder(null)).toEqual({ order: [] })
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
  })
})
