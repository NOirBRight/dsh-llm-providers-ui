// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { act } from 'react-dom/test-utils'
import { createRoot, type Root } from 'react-dom/client'
import {
  ProviderUsagePanel,
  type ProviderUsagePanelProps,
  type ProviderUsageSummary,
} from '../src/client/ProviderUsagePanel.tsx'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const mounted: Root[] = []
afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
  document.body.innerHTML = ''
})

const SIX: readonly ProviderUsageSummary[] = [
  {
    providerKey: 'codex', name: 'Codex', status: 'ready', windows: [
      { id: 'w-5h', label: '5h', shortLabel: '5h', remainingPercent: 72, valueText: '72%' },
      { id: 'w-week', label: 'Week', shortLabel: 'W', remainingPercent: 38, valueText: '38%' },
    ],
  },
  {
    providerKey: 'cursor', name: 'Cursor', status: 'ready', windows: [
      { id: 'w-month', label: 'Month', shortLabel: 'M', remainingPercent: 61, valueText: '61%' },
      { id: 'w-agent', label: 'Agent', shortLabel: 'A', remainingPercent: 88, valueText: '88%' },
    ],
  },
  {
    providerKey: 'grok', name: 'Grok', status: 'ready', windows: [
      { id: 'w-2h', label: '2h', shortLabel: '2h', remainingPercent: 26, valueText: '26%' },
      { id: 'w-week', label: 'Week', shortLabel: 'W', remainingPercent: 80, valueText: '80%' },
    ],
  },
  {
    providerKey: 'ollama', name: 'Ollama Cloud', status: 'ready', windows: [
      { id: 'w-session', label: 'Session', shortLabel: 'S', remainingPercent: 90, valueText: '90%' },
      { id: 'w-week', label: 'Week', shortLabel: 'W', remainingPercent: 66, valueText: '66%' },
      { id: 'w-month', label: 'Month', shortLabel: 'M', remainingPercent: 44, valueText: '44%' },
    ],
  },
  {
    providerKey: 'commandcode', name: 'CommandCode', status: 'ready', windows: [
      { id: 'w-credits', label: 'Credits', shortLabel: 'Cr', valueText: '$8.42' },
      { id: 'w-month', label: 'Month', shortLabel: 'M', remainingPercent: 70, valueText: '70%' },
    ],
  },
  {
    providerKey: 'opencode', name: 'OpenCode Go', status: 'ready', windows: [
      { id: 'w-session', label: 'Session', shortLabel: 'S', remainingPercent: 15, valueText: '15%' },
      { id: 'w-week', label: 'Week', shortLabel: 'W', remainingPercent: 52, valueText: '52%' },
      { id: 'w-month', label: 'Month', shortLabel: 'M', remainingPercent: 93, valueText: '93%' },
    ],
  },
]

function props(overrides: Partial<ProviderUsagePanelProps> = {}): ProviderUsagePanelProps {
  return {
    providers: SIX,
    onRefresh: vi.fn(),
    onToggleVisibility: vi.fn(),
    onShowAll: vi.fn(),
    onHideAll: vi.fn(),
    ...overrides,
  }
}

function staticHtml(overrides: Partial<ProviderUsagePanelProps> = {}): string {
  return renderToStaticMarkup(createElement(ProviderUsagePanel, props(overrides)))
}

function mount(overrides: Partial<ProviderUsagePanelProps> = {}): HTMLElement {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  mounted.push(root)
  act(() => { root.render(createElement(ProviderUsagePanel, props(overrides))) })
  return container
}

function click(element: Element | null): void {
  if (!(element instanceof HTMLElement)) throw new Error('click target is missing')
  act(() => { element.click() })
}

function openPopover(container: HTMLElement): void {
  click(container.querySelector('button[aria-label="选择侧栏显示的 Provider"]'))
}

function typeSearch(container: HTMLElement, value: string): void {
  const input = container.querySelector('input.pu-search')
  if (!(input instanceof HTMLInputElement)) throw new Error('search input is missing')
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
  if (setter === undefined) throw new Error('value setter is missing')
  act(() => {
    setter.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

describe('ProviderUsagePanel six-provider grid', () => {
  it('renders all six providers in one grid with a 6 / 6 title count', () => {
    const html = staticHtml()
    for (const name of ['Codex', 'Cursor', 'Grok', 'Ollama Cloud', 'CommandCode', 'OpenCode Go']) {
      expect(html).toContain(name)
    }
    expect(html).toContain('6 / 6')
    const container = mount()
    expect(container.querySelectorAll('.pu-row').length).toBe(6)
    expect(container.querySelectorAll('.pu-rows').length).toBe(1)
  })

  it('shows every window of a three-window provider without truncation', () => {
    const html = staticHtml()
    // Ollama Cloud: S 90% · W 66% · M 44%, headline is the tightest window (44%).
    expect(html).toContain('aria-label="Ollama Cloud 44%"')
    expect(html).toContain('<small>S</small><b>90%</b>')
    expect(html).toContain('<small>W</small><b>66%</b>')
    expect(html).toContain('<small>M</small><b>44%</b>')
  })

  it('shows Credits text as-is instead of deriving a percent', () => {
    const html = staticHtml()
    expect(html).toContain('aria-label="CommandCode 70%"')
    expect(html).toContain('<small>Cr</small><b>$8.42</b>')
  })

  it('highlights only the current provider', () => {
    const container = mount({ currentProviderKey: 'codex' })
    expect(container.querySelectorAll('.pu-active').length).toBe(1)
    expect(staticHtml({ currentProviderKey: 'codex' })).toContain('aria-label="Codex 38%"')
  })

  it('marks low headlines while keeping the row content visible', () => {
    const container = mount()
    expect(container.querySelectorAll('.pu-low').length).toBe(1)
    expect(staticHtml()).toContain('aria-label="OpenCode Go 15%"')
  })
})

describe('ProviderUsagePanel states', () => {
  it('shows a loading state before any data arrives', () => {
    expect(staticHtml({ providers: [], loading: true })).toContain('正在加载')
  })

  it('shows an empty state with a filter entry when nothing is visible', () => {
    const html = staticHtml({ hiddenKeys: SIX.map(summary => summary.providerKey) })
    expect(html).toContain('没有显示的 Provider')
    expect(html).toContain('打开筛选')
    expect(html).toContain('0 / 6')
  })

  it('shows an empty state when no provider is queryable', () => {
    expect(staticHtml({ providers: [] })).toContain('暂无可查询的 Provider')
  })

  it('shows an unavailable state when the usage channel is down', () => {
    expect(staticHtml({ unavailable: true })).toContain('暂不可用')
  })

  it('renders per-provider logged-out, unsupported, error, loading and stale states', () => {
    const html = staticHtml({
      providers: [
        { providerKey: 'a', name: 'Logged', status: 'logged-out', windows: [] },
        { providerKey: 'b', name: 'Unsupported', status: 'unsupported', windows: [] },
        { providerKey: 'c', name: 'Failed', status: 'error', windows: [] },
        { providerKey: 'd', name: 'Pending', status: 'loading', windows: [] },
        {
          providerKey: 'e', name: 'Stale', status: 'stale', fetchedAt: '2026-09-03T00:00:00Z', windows: [
            { id: 'w-week', label: 'Week', shortLabel: 'W', remainingPercent: 50, valueText: '50%' },
          ],
        },
      ],
    })
    expect(html).toContain('aria-label="Logged 未登录"')
    expect(html).toContain('aria-label="Unsupported 不支持查询"')
    expect(html).toContain('aria-label="Failed 加载失败"')
    expect(html).toContain('aria-label="Pending 加载中…"')
    // Stale keeps its old value and adds an expiry marker.
    expect(html).toContain('aria-label="Stale 50%"')
    expect(html).toContain('已过期')
  })

  it('filters hidden providers and updates the title count', () => {
    const html = staticHtml({ hiddenKeys: ['grok', 'cursor'] })
    expect(html).not.toContain('Grok')
    expect(html).not.toContain('Cursor')
    expect(html).toContain('Codex')
    expect(html).toContain('4 / 6')
  })
})

describe('ProviderUsagePanel callbacks', () => {
  it('calls onRefresh from the refresh button', () => {
    const onRefresh = vi.fn()
    const container = mount({ onRefresh })
    click(container.querySelector('button[aria-label="刷新用量"]'))
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it('opens the empty-state filter entry point', () => {
    const container = mount({ hiddenKeys: SIX.map(summary => summary.providerKey) })
    click(container.querySelector('.pu-empty-btn'))
    expect(container.querySelector('.pu-popover')).not.toBeNull()
  })

  it('toggles one provider from the visibility popover', () => {
    const onToggleVisibility = vi.fn()
    const container = mount({ onToggleVisibility })
    openPopover(container)
    click(container.querySelector('input[aria-label="在侧栏显示 Codex"]'))
    expect(onToggleVisibility).toHaveBeenCalledWith('codex', false)
  })

  it('searches the visibility list without losing the select-all row', () => {
    const container = mount()
    openPopover(container)
    typeSearch(container, 'codex')
    expect(container.querySelector('input[aria-label="在侧栏显示 Codex"]')).not.toBeNull()
    expect(container.querySelector('input[aria-label="在侧栏显示 Cursor"]')).toBeNull()
    expect(container.querySelector('input[aria-label="显示全部 Provider"]')).not.toBeNull()
  })

  it('calls onHideAll when unchecking select-all while everything is visible', () => {
    const onHideAll = vi.fn()
    const container = mount({ onHideAll })
    openPopover(container)
    click(container.querySelector('input[aria-label="显示全部 Provider"]'))
    expect(onHideAll).toHaveBeenCalledTimes(1)
  })

  it('calls onShowAll when checking select-all while something is hidden', () => {
    const onShowAll = vi.fn()
    const container = mount({ hiddenKeys: ['grok'], onShowAll })
    openPopover(container)
    click(container.querySelector('input[aria-label="显示全部 Provider"]'))
    expect(onShowAll).toHaveBeenCalledTimes(1)
  })

  it('closes the visibility popover with Escape', () => {
    const container = mount()
    openPopover(container)
    const dialog = container.querySelector('.pu-popover')
    if (!(dialog instanceof HTMLElement)) throw new Error('popover is missing')
    act(() => { dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })) })
    expect(container.querySelector('.pu-popover')).toBeNull()
  })
})
