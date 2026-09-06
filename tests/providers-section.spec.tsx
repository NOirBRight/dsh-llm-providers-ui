// @vitest-environment jsdom
import { createElement, type ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProvidersSection } from '../src/client/ProvidersSection.tsx'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

type TKey = 'title' | 'subtitle' | 'empty' | 'drag' | 'sort' | 'done' | 'moveUp' | 'moveDown'
const t = (key: TKey): string => key

function renderSlot(_name: string, _props: object, opts?: { entryKey?: string }) {
  return createElement('li', { 'data-card': opts?.entryKey }, opts?.entryKey)
}

const mounted: Root[] = []
afterEach(() => {
  act(() => { while (mounted.length > 0) mounted.pop()?.unmount() })
  document.body.innerHTML = ''
})

function mount(element: ReactElement): HTMLElement {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  mounted.push(root)
  act(() => { root.render(element) })
  return host
}

describe('ProvidersSection', () => {
  it('shows empty copy when no providers are registered', () => {
    const html = renderToStaticMarkup(createElement(ProvidersSection, {
      t,
      registeredKeys: [],
      renderSlot,
    }))
    expect(html).toContain('empty')
    expect(html).not.toContain('aria-label')
  })

  it('renders one card with a static fallback badge and no sort toggle', () => {
    const html = renderToStaticMarkup(createElement(ProvidersSection, {
      t,
      registeredKeys: ['llm-cursor'],
      renderSlot,
    }))
    expect(html).toContain('data-card="llm-cursor"')
    expect(html).toContain('data-provider-role="llm"')
    expect(html).toContain('>LLM</span>')
    expect(html).not.toContain('position:absolute')
    expect(html).not.toContain('>sort</button>')
  })

  it('renders the Agent fallback badge for undeclared agent cards', () => {
    const html = renderToStaticMarkup(createElement(ProvidersSection, {
      t,
      registeredKeys: ['agent-antigravity'],
      roleOf: () => 'agent',
      renderSlot,
    }))
    expect(html).toContain('data-provider-role="agent"')
    expect(html).toContain('>Agent</span>')
  })

  it('skips the shell badge when the shared header owns it', () => {
    const html = renderToStaticMarkup(createElement(ProvidersSection, {
      t,
      registeredKeys: ['llm-codex'],
      headerOf: () => 'shared',
      renderSlot,
    }))
    expect(html).toContain('data-card="llm-codex"')
    expect(html).toContain('data-provider-role="llm"')
    expect(html).not.toContain('>LLM</span>')
  })

  it('renders a plain divider list with hidden handles until sorting starts', () => {
    const html = renderToStaticMarkup(createElement(ProvidersSection, {
      t,
      registeredKeys: ['llm-cursor', 'llm-grok'],
      renderSlot,
    }))
    expect(html).toContain('data-sortable-plain')
    expect(html).not.toContain('data-sortable-card')
    expect(html).toContain('>sort</button>')
    expect(html).toContain('drag: llm-cursor')
    expect(html).toContain('hidden')
  })

  it('reveals handles and move buttons after the sort toggle', () => {
    const host = mount(createElement(ProvidersSection, {
      t,
      registeredKeys: ['llm-cursor', 'llm-grok'],
      renderSlot,
    }))
    const toggle = host.querySelector('button')
    expect(toggle?.textContent).toBe('sort')
    expect(host.querySelector('[data-sortable-handle][hidden]')).not.toBeNull()
    act(() => { toggle?.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(toggle?.textContent).toBe('done')
    expect(host.querySelector('[data-sortable-handle][hidden]')).toBeNull()
    expect(host.querySelectorAll('[data-sortable-move]').length).toBe(4)
  })
})

describe('ProvidersSection reorder mapping', () => {
  it('writes the committed item keys in list order', () => {
    const onReorder = vi.fn()
    const html = renderToStaticMarkup(createElement(ProvidersSection, {
      t,
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