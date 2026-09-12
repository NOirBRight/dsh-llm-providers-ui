import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { applyCatalogPatch, ModelCatalogEditor, type ModelCatalogDraft, type ModelCatalogLabels } from '../src/client/ModelCatalogEditor.tsx'

const labels: ModelCatalogLabels = {
  modelId: 'Model ID',
  modelName: 'Name',
  modelDetails: 'Details',
  remove: 'Remove',
  drag: 'Drag',
  moveUp: 'Up',
  moveDown: 'Down',
  vision: 'Vision',
  thinking: 'Thinking',
  defaultEffort: 'Default effort',
  contextWindow: 'Context',
  contextWindowDefault: 'Unknown',
  inputLimit: 'Input limit',
  output: 'Output',
  unknown: 'Unknown',
  supported: 'Yes',
  unsupported: 'No',
  restoreAuto: 'Restore auto',
  source: 'Source: {source}',
}

const row: ModelCatalogDraft = {
  rowId: 'r1',
  id: 'gemini-3.8-flash',
  name: 'Gemini 3.8 Flash',
  contextWindow: '1000',
  vision: true,
  thinking: true,
  defaultEffort: 'high',
  efforts: [{ id: 'high', name: 'High' }, { id: 'low', name: 'Low' }],
}

describe('applyCatalogPatch', () => {
  it('writes contextWindow instead of dropping it', () => {
    expect(applyCatalogPatch(row, { contextWindow: '2000' }).contextWindow).toBe('2000')
  })

  it('clears defaultEffort when thinking becomes false', () => {
    const next = applyCatalogPatch(row, { thinking: false })
    expect(next.thinking).toBe(false)
    expect(next.defaultEffort).toBeUndefined()
  })

  it('treats explicit undefined as a delete', () => {
    expect(applyCatalogPatch(row, { vision: undefined }).vision).toBeUndefined()
  })
})

describe('ModelCatalogEditor', () => {
  const expanded = new Set(['r1'])
  const noop = (): void => undefined

  it('renders opted-in input and output fields with the context value', () => {
    const html = renderToStaticMarkup(createElement(ModelCatalogEditor, {
      items: [row],
      fields: { vision: true, thinking: true, defaultEffort: true, context: true, inputLimit: true, output: true },
      labels,
      expanded,
      onReorder: noop,
      onPatch: noop,
      onToggle: noop,
    }))
    expect(html).toContain('Input limit')
    expect(html).toContain('Output')
    expect(html).toContain('aria-label="Context"')
    expect(html).toContain('value="1000"')
  })

  it('hides extra numeric fields unless the caller opts in', () => {
    const html = renderToStaticMarkup(createElement(ModelCatalogEditor, {
      items: [row],
      fields: { vision: true, thinking: true, defaultEffort: true, context: true },
      labels,
      expanded,
      onReorder: noop,
      onPatch: noop,
      onToggle: noop,
    }))
    expect(html).toContain('Context')
    expect(html).not.toContain('Input limit')
    expect(html).not.toContain('>Output<')
  })

  it('renders unknown instead of an unchecked box when tri-state is on and vision is absent', () => {
    const html = renderToStaticMarkup(createElement(ModelCatalogEditor, {
      items: [{ rowId: 'r2', id: 'gpt-oss' }],
      fields: { vision: true, triState: true },
      labels,
      expanded: new Set(['r2']),
      onReorder: noop,
      onPatch: noop,
      onToggle: noop,
    }))
    expect(html).toContain('Unknown')
    expect(html).not.toContain('type="checkbox"')
  })
})
