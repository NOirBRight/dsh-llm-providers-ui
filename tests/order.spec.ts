import { describe, expect, it } from 'vitest'
import { applySavedOrder, providerKeyForRoute, sortCatalogGroups } from '../src/order.ts'

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
