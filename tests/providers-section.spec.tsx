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
    expect(html).toContain('role="switch"')
  })

  it('renders one card with a static fallback badge and no sort toggle', () => {
    const html = renderToStaticMarkup(createElement(ProvidersSection, {
      t,
      registeredKeys: ['llm-cursor'],
      renderSlot,
    }))
    expect(html).toContain('data-provider-row="llm-cursor"')
    expect(html).toContain('data-provider-role="llm"')
    expect(html).toContain('>LLM</span>')
    expect(html).toContain('>details</button>')
    expect(html).toContain('data-model-probe="llm-cursor"')
    expect(html).not.toContain('class="c-btn c-sort"')
    expect(html).toContain('>subtitle</p>')
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
    expect(html).toContain('data-provider-row="llm-codex"')
    expect(html).toContain('data-provider-role="llm"')
    expect(html).toContain('role="switch"')
    expect(html).toContain('>details</button>')
  })

  it('renders a plain divider list with hidden handles until sorting starts', () => {
    const html = renderToStaticMarkup(createElement(ProvidersSection, {
      t,
      registeredKeys: ['llm-cursor', 'llm-grok'],
      renderSlot,
    }))
    expect(html).toContain('data-sortable-plain')
    expect(html).not.toContain('data-sortable-card')
    expect(html).toContain('c-sort')
    expect(html).toContain('sort</button>')
    expect(html).toContain('drag: llm-cursor')
    expect(html).toContain('hidden')
  })

  it('reveals handles and move buttons after the sort toggle', () => {
    const host = mount(createElement(ProvidersSection, {
      t,
      registeredKeys: ['llm-cursor', 'llm-grok'],
      renderSlot,
    }))
    const toggle = host.querySelector('button[aria-expanded]')
    expect(toggle?.textContent?.replace(/\s+/g, ' ').trim()).toBe('sort')
    expect(host.querySelector('[data-sortable-handle][hidden]')).not.toBeNull()
    act(() => { toggle?.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(toggle?.textContent?.replace(/\s+/g, ' ').trim()).toBe('done')
    expect(host.querySelector('[data-sortable-handle][hidden]')).toBeNull()
    expect(host.querySelectorAll('[data-sortable-move]').length).toBe(0)
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
/** Detail slot content shaped like a plugin card: account, usage, models, capabilities. */
function pluginCard(): ReactElement {
  const toggle = createElement('button', { type: 'button', 'aria-expanded': 'false' }, 'Model catalog')
  return createElement('li', { 'data-provider-card': '' },
    createElement('div', { 'data-provider-body': '' },
      createElement('p', null, 'intro'),
      createElement('section', { 'aria-label': 'Signed in as demo@example.com.' },
        createElement('p', null, 'Signed in as demo@example.com.'),
        createElement('button', { type: 'button' }, 'Sign out')),
      createElement('section', { 'aria-label': 'Subscription usage' },
        createElement('div', { 'data-provider-quota-mini': '' }, 'skeleton')),
      createElement('section', { 'aria-label': 'Model catalog' },
        createElement('div', null, toggle),
        createElement('button', { type: 'button' }, 'Sort'),
        createElement('button', { type: 'button' }, 'Fetch available models'),
        createElement('button', { type: 'button' }, 'Add model manually')),
      createElement('section', { 'aria-label': 'Capabilities' },
        createElement('label', null, createElement('input', { type: 'checkbox' }), 'Enable tool'))))
}

describe('ProvidersSection refresh policy and detail normalizer', () => {
  it('refreshes every provider once when the overview opens', () => {
    const onRefresh = vi.fn()
    mount(createElement(ProvidersSection, { t, registeredKeys: ['llm-cursor'], renderSlot, onRefresh }))
    expect(onRefresh).toHaveBeenCalledTimes(1)
    expect(onRefresh).toHaveBeenCalledWith()
  })

  it('opens a detail cache-first and refreshes only on demand', () => {
    const onRefresh = vi.fn()
    const host = mount(createElement(ProvidersSection, { t, registeredKeys: ['llm-cursor'], renderSlot, onRefresh }))
    onRefresh.mockClear()
    act(() => { host.querySelector('[data-action="open-provider"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(host.querySelector('.c-full')).not.toBeNull()
    expect(onRefresh).not.toHaveBeenCalled()
    act(() => { host.querySelector('.c-quota-head button')?.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(onRefresh).toHaveBeenCalledWith('llm-cursor')
  })

  it('normalizes a plugin card into account, quota, models, and one closed advanced block', () => {
    const tallies = { toggle: 0 }
    const renderPlugin = (): ReactElement => {
      const card = pluginCard()
      return card
    }
    const host = mount(createElement(ProvidersSection, {
      t,
      registeredKeys: ['llm-cursor'],
      renderSlot: () => renderPlugin(),
    }))
    act(() => { host.querySelector('[data-action="open-provider"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    const toggle = host.querySelector('[aria-label="Model catalog"] button')
    toggle?.addEventListener('click', () => { tallies.toggle += 1 })
    act(() => { host.querySelector('.c-crumb')?.dispatchEvent(new MouseEvent('click', { bubbles: true })) })

    const usage = host.querySelector('section[aria-label="Subscription usage"]')
    expect(usage?.getAttribute('data-c-hide')).toBe('')
    const account = host.querySelector('section[aria-label="Signed in as demo@example.com."]')
    expect(account?.classList.contains('c-account')).toBe(true)
    expect(host.querySelector('.c-account-head')?.textContent).toBe('accountHeading')
    const advanced = host.querySelector('details[data-c-advanced]')
    expect(advanced).not.toBeNull()
    expect((advanced as HTMLDetailsElement).open).toBe(false)
    expect(advanced?.querySelector('summary')?.textContent).toContain('advancedHeading')
    expect(advanced?.querySelector('section[aria-label="Capabilities"]')).not.toBeNull()
    const addButtons = [...host.querySelectorAll('button')].filter(button => /add model/iu.test(button.textContent ?? ''))
    expect(addButtons.filter(button => button.getAttribute('data-c-own') === 'add')).toHaveLength(1)
    expect(addButtons.filter(button => button.getAttribute('data-c-plugin-chrome') === 'add')).toHaveLength(1)
    expect(tallies.toggle).toBeLessThanOrEqual(1)
  })
})