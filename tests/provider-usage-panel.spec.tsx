// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createRoot, type Root } from 'react-dom/client'
import {
  ProviderUsagePanel,
  type ProviderUsagePanelProps,
  type ProviderUsageSummary,
} from '../src/client/ProviderUsagePanel.tsx'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const mounted: Root[] = []
afterEach(() => {
  act(() => { while (mounted.length > 0) mounted.pop()?.unmount() })
  document.body.innerHTML = ''
})

const SIX: readonly ProviderUsageSummary[] = [
  {
    providerKey: 'codex', name: 'Codex', status: 'ready', windows: [
      { id: 'w-5h', label: '5h', shortLabel: '5h', remainingPercent: 72, valueText: '72%', resetsAt: '2026-09-05T00:00:00Z' },
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

  it('renders 20 providers in the same internally scrollable responsive grid', () => {
    const providers = Array.from({ length: 20 }, (_, index): ProviderUsageSummary => ({
      providerKey: 'provider-' + String(index),
      name: 'Provider ' + String(index),
      status: 'ready',
      windows: [{ id: 'week', label: 'Week', shortLabel: 'W', remainingPercent: 50, valueText: '50%' }],
    }))
    const container = mount({ providers })
    expect(container.querySelectorAll('.pu-row')).toHaveLength(20)
    expect(container.querySelector('.pu-scroll')).not.toBeNull()
    const html = staticHtml({ providers })
    expect(html).toContain('max-height:280px;overflow:auto')
    expect(html).toContain('@media (max-width:640px)')
  })

  it('uses the longest-period quota as the headline and still shows every window', () => {
    const html = staticHtml()
    expect(html).toContain('aria-label="Cursor 61%"')
    expect(html).toContain('aria-label="Grok 80%"')
    expect(html).toContain('aria-label="OpenCode Go 93%"')
    expect(html).toContain('<small>S</small><b>90%</b>')
    expect(html).toContain('<small>W</small><b>66%</b>')
    expect(html).toContain('<small class="pu-primary-label">M</small><b class="pu-primary">44%</b>')
  })

  it('prefers a provider-specific subscription cycle over a short hourly window', () => {
    const providers: readonly ProviderUsageSummary[] = [{
      providerKey: 'cursor',
      name: 'Cursor',
      status: 'ready',
      windows: [
        { id: 'cursor-cycle', label: 'Cursor cycle', shortLabel: 'Curs', remainingPercent: 62.7, valueText: '62.7%' },
        { id: 'five-hour', label: '5h', shortLabel: '5h', remainingPercent: 0, valueText: '0%' },
      ],
    }]
    expect(staticHtml({ providers })).toContain('aria-label="Cursor 62.7%"')
  })

  it('removes aggregate tooltips and uses a compact reset tooltip per quota', () => {
    const container = mount()
    expect(container.querySelector('.pu-row')?.getAttribute('title')).toBeNull()
    expect(container.querySelector('.pu-window')?.getAttribute('title')).toBe('5h · 72% · 9/5 00:00 UTC 重置')
  })

  it('uses semantic metric cards with a period label, meter, and no duplicated headline window', () => {
    const container = mount()
    const openCode = container.querySelector('[aria-label="OpenCode Go 93%"]')
    expect(openCode?.tagName).toBe('DIV')
    expect(openCode?.querySelector('.pu-primary-label')?.textContent).toBe('M')
    expect(openCode?.querySelector('.pu-meter-fill')?.getAttribute('style')).toContain('width: 93%')
    expect(openCode?.querySelectorAll('.pu-window')).toHaveLength(2)
    expect(openCode?.querySelectorAll('.pu-window-low')).toHaveLength(1)
    expect(staticHtml()).toContain('.pu-rows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px')
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

  it('keeps a low short-window warning visible without replacing the long-period headline', () => {
    const container = mount()
    expect(container.querySelectorAll('.pu-row.pu-low')).toHaveLength(0)
    expect(container.querySelectorAll('.pu-window-low')).toHaveLength(1)
    expect(staticHtml()).toContain('aria-label="OpenCode Go 93%"')
  })
})

describe('ProviderUsagePanel states', () => {
  it('shows an empty state with a filter entry when nothing is visible', () => {
    const html = staticHtml({ hiddenKeys: SIX.map(summary => summary.providerKey) })
    expect(html).toContain('没有显示的 Provider')
    expect(html).toContain('打开筛选')
    expect(html).toContain('0 / 6')
  })

  it('shows an empty state when no provider is queryable', () => {
    expect(staticHtml({ providers: [] })).toContain('暂无可查询的 Provider')
  })

  it('gives a ready provider without windows an accessible fallback', () => {
    expect(staticHtml({ providers: [{ providerKey: 'empty', name: 'Empty', status: 'ready', windows: [] }] })).toContain('aria-label="Empty 暂无额度数据"')
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
    expect(container.querySelector('button.pu-filter-all')).not.toBeNull()
  })

  it('enables show-all only while something is hidden', () => {
    const onShowAll = vi.fn()
    const visibleContainer = mount({ onShowAll })
    openPopover(visibleContainer)
    const disabled = visibleContainer.querySelector('button.pu-filter-all')
    expect(disabled).toHaveProperty('disabled', true)

    const hiddenContainer = mount({ hiddenKeys: ['grok'], onShowAll })
    openPopover(hiddenContainer)
    const enabled = hiddenContainer.querySelector('button.pu-filter-all')
    expect(enabled).toHaveProperty('disabled', false)
    click(enabled)
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
