import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ProvidersSection } from '../src/client/ProvidersSection.tsx'

function renderSlot(_name: string, _props: object, opts?: { entryKey?: string }) {
  return createElement('li', { 'data-card': opts?.entryKey }, opts?.entryKey)
}

describe('ProvidersSection', () => {
  it('shows empty copy when no providers are registered', () => {
    const html = renderToStaticMarkup(createElement(ProvidersSection, {
      t: (key: 'title' | 'subtitle' | 'empty' | 'drag') => key,
      registeredKeys: [],
      renderSlot,
    }))
    expect(html).toContain('empty')
    expect(html).not.toContain('aria-label')
  })

  it('renders one card without a drag handle', () => {
    const html = renderToStaticMarkup(createElement(ProvidersSection, {
      t: (key: 'title' | 'subtitle' | 'empty' | 'drag') => key,
      registeredKeys: ['llm-cursor'],
      renderSlot,
    }))
    expect(html).toContain('data-card="llm-cursor"')
    expect(html).not.toContain('drag:')
  })

  it('renders a left handle per card when two or more providers are registered', () => {
    const html = renderToStaticMarkup(createElement(ProvidersSection, {
      t: (key: 'title' | 'subtitle' | 'empty' | 'drag') => key,
      registeredKeys: ['llm-cursor', 'llm-grok'],
      renderSlot,
    }))
    expect(html).toContain('drag: llm-cursor')
    expect(html).toContain('drag: llm-grok')
    expect(html).toContain('data-sortable-card')
  })
})

describe('ProvidersSection reorder mapping', () => {
  it('writes the committed item keys in list order', () => {
    const onReorder = vi.fn()
    const html = renderToStaticMarkup(createElement(ProvidersSection, {
      t: (key: 'title' | 'subtitle' | 'empty' | 'drag') => key,
      registeredKeys: ['llm-cursor', 'llm-grok'],
      onReorder,
      renderSlot,
    }))
    expect(html).toContain('drag: llm-cursor')
    expect(onReorder).not.toHaveBeenCalled()
    onReorder(['llm-grok', 'llm-cursor'])
    expect(onReorder).toHaveBeenCalledWith(['llm-grok', 'llm-cursor'])
  })
})
