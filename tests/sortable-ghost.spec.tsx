// @vitest-environment jsdom
import { act, createElement, type ReactElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { SortableList } from '../src/client/SortableList.tsx'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

interface Item { id: string }

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

/** Start a pointer drag on the nth visible handle, as a mouse user would. */
function dragHandle(host: HTMLElement, index: number): void {
  const handles = host.querySelectorAll('[data-sortable-row="true"]:not([data-sortable-ghost]) [data-sortable-handle]')
  const target = handles[index]
  if (!(target instanceof Element)) throw new Error('drag handle is missing')
  let event: Event
  try {
    event = new window.PointerEvent('pointerdown', {
      bubbles: true, cancelable: true, clientX: 20, clientY: 20, button: 0, pointerId: 1, pointerType: 'mouse',
    })
  } catch {
    event = new Event('pointerdown', { bubbles: true, cancelable: true })
    Object.defineProperties(event, {
      clientX: { value: 20 }, clientY: { value: 20 }, button: { value: 0 }, pointerId: { value: 1 },
    })
  }
  act(() => { target.dispatchEvent(event) })
}

/** Panel-shaped filter row: all sizing arrives through ancestor-scoped CSS. */
function filterRow(item: Item): ReactElement {
  return createElement('label', { className: 'pu-filter-item' },
    createElement('input', { type: 'checkbox', 'aria-label': 'show ' + item.id }),
    createElement('span', { className: 'pu-mark' },
      createElement('svg', { className: 'pu-logo', viewBox: '0 0 24 24' })),
    createElement('span', { className: 'pu-filter-name' }, item.id))
}

const panelCss = [
  '[data-provider-usage-panel] .pu-filter-item{display:flex;align-items:center;gap:8px;min-height:34px}',
  '[data-provider-usage-panel] .pu-mark{display:grid;place-items:center;flex:none;width:18px;height:18px;overflow:hidden}',
  '[data-provider-usage-panel] .pu-logo{display:block;width:18px;height:18px}',
  '[data-provider-usage-panel] .pu-filter-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
].join('\n')

function panelList(): ReactElement {
  return createElement('section', { 'data-provider-usage-panel': '' },
    createElement('style', {}, panelCss),
    createElement('div', { className: 'pu-filter-list' },
      createElement(SortableList<Item>, {
        items: [{ id: 'cursor' }, { id: 'codex' }],
        getId: item => item.id,
        renderItem: filterRow,
        dragLabel: item => 'drag ' + item.id,
        onReorder() {},
      })))
}

describe('SortableList drag ghost keeps its row layout', () => {
  it('renders the ghost inside the list scope with row selectors intact', () => {
    const host = mount(panelList())
    dragHandle(host, 0)
    const ghost = host.querySelector('[data-sortable-ghost="true"]')
    expect(ghost).not.toBeNull()
    // Ancestor-scoped panel CSS can only match inside the panel ancestry.
    expect(ghost?.closest('[data-provider-usage-panel]')).not.toBeNull()
    // Row- and handle-scoped ancestor selectors keep matching the ghost.
    expect(ghost?.getAttribute('data-sortable-row')).toBe('true')
    expect(ghost?.querySelector('[data-sortable-handle]')).not.toBeNull()
    // The scoped filter row reaches the ghost copy, so it lays out as a row.
    const panel = host.querySelector('[data-provider-usage-panel]')
    expect(panel?.querySelectorAll('.pu-filter-item').length).toBe(3)
    expect(ghost?.querySelector('.pu-filter-item')).not.toBeNull()
  })

  it('lays the ghost out as the same horizontal row, not a stacked column', () => {
    const host = mount(panelList())
    dragHandle(host, 0)
    const ghostItem = host.querySelector('[data-sortable-ghost="true"] .pu-filter-item')
    expect(ghostItem).not.toBeNull()
    expect(getComputedStyle(ghostItem as Element).display).toBe('flex')
    const logo = host.querySelector('[data-sortable-ghost="true"] .pu-logo')
    expect(logo).not.toBeNull()
    expect(getComputedStyle(logo as Element).width).toBe('18px')
  })

  it('keeps the ghost out of assistive tech, focus, and pointer input', () => {
    // jsdom implements no inert flag: stage a writable one so the guarded
    // branch executes here exactly as it does in real browsers.
    const proto = window.HTMLElement.prototype as unknown as Record<string, unknown>
    const hadInert = 'inert' in proto
    const previous = proto['inert']
    proto['inert'] = false
    let host: HTMLElement
    try {
    host = mount(panelList())
    dragHandle(host, 0)
    const ghost = host.querySelector('[data-sortable-ghost="true"]') as HTMLElement | null
    expect(ghost).not.toBeNull()
    // The ghost clones live row controls (the visibility checkbox): the copy
    // must never answer to AT, keyboard, or pointer.
    expect(ghost?.getAttribute('aria-hidden')).toBe('true')
    expect(ghost?.style.pointerEvents).toBe('none')
    expect(ghost?.style.boxSizing).toBe('border-box')
    const focusables = ghost?.querySelectorAll('input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])')
    expect(focusables?.length).toBeGreaterThan(0)
    for (const control of focusables ?? []) expect(control.closest('[aria-hidden="true"]')).toBe(ghost)
    expect('inert' in (ghost as object)).toBe(true)
    expect((ghost as unknown as { inert: boolean }).inert).toBe(true)
    } finally {
      if (hadInert) proto['inert'] = previous
      else Reflect.deleteProperty(proto, 'inert')
    }
  })

  it('mirrors the dragged row geometry inline', () => {
    const host = mount(panelList())
    dragHandle(host, 0)
    const rows = host.querySelectorAll('[data-sortable-row="true"]:not([data-sortable-ghost])')
    const ghost = host.querySelector('[data-sortable-ghost="true"]') as HTMLElement | null
    expect(rows.length).toBe(2)
    expect(ghost).not.toBeNull()
    const dragged = rows[0] as HTMLElement
    expect(ghost?.style.gridTemplateColumns).toBe(dragged.style.gridTemplateColumns)
    expect(ghost?.style.width).toBe(dragged.getBoundingClientRect().width + 'px')
    expect(ghost?.querySelector('[data-sortable-item]')?.innerHTML)
      .toBe(dragged.querySelector('[data-sortable-item]')?.innerHTML)
  })

  it('keeps plain chrome borderless with move-button columns occupied', () => {
    const host = mount(createElement(SortableList<Item>, {
      items: [{ id: 'a' }, { id: 'b' }],
      getId: item => item.id,
      renderItem: item => createElement('span', {}, item.id),
      dragLabel: item => 'drag ' + item.id,
      onReorder() {},
      chrome: 'plain',
      moveButtons: true,
    }))
    dragHandle(host, 0)
    const ghost = host.querySelector('[data-sortable-ghost="true"]') as HTMLElement | null
    const dragged = host.querySelector('[data-sortable-row="true"]:not([data-sortable-ghost])') as HTMLElement | null
    expect(ghost).not.toBeNull()
    expect(dragged).not.toBeNull()
    // Plain rows are divider rows: the ghost must not regain the card border.
    expect(ghost?.style.border).toBe(dragged?.style.border)
    expect(ghost?.style.background).toBe(dragged?.style.background)
    expect(ghost?.style.gridTemplateColumns).toBe(dragged?.style.gridTemplateColumns)
    expect(ghost?.childElementCount).toBe(dragged?.childElementCount)
  })
})
