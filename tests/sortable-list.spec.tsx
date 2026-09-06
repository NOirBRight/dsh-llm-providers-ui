// @vitest-environment jsdom
import { act, createElement, type ReactElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
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

function list(onReorder: (items: Item[]) => void, extra?: object): ReactElement {
  return createElement(SortableList<Item>, {
    items: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    getId: item => item.id,
    renderItem: item => createElement('span', {}, item.id),
    dragLabel: item => 'drag ' + item.id,
    onReorder,
    moveButtons: true,
    ...(extra ?? {}),
  })
}

describe('SortableList keyboard and move-button sorting', () => {
  it('moves a row down through its move button', () => {
    const onReorder = vi.fn()
    const host = mount(list(onReorder))
    const down = host.querySelector('[data-sortable-move="down"]')
    act(() => { down?.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(onReorder).toHaveBeenCalledTimes(1)
    expect(onReorder.mock.calls[0]?.[0].map((item: Item) => item.id)).toEqual(['b', 'a', 'c'])
  })

  it('moves a row up through ArrowUp on its handle', () => {
    const onReorder = vi.fn()
    const host = mount(list(onReorder))
    const handles = host.querySelectorAll('[data-sortable-handle]')
    const second = handles[1]
    expect(second).not.toBeUndefined()
    act(() => { second?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })) })
    expect(onReorder).toHaveBeenCalledTimes(1)
    expect(onReorder.mock.calls[0]?.[0].map((item: Item) => item.id)).toEqual(['b', 'a', 'c'])
  })

  it('ignores moves past either end', () => {
    const onReorder = vi.fn()
    const host = mount(list(onReorder))
    const ups = host.querySelectorAll('[data-sortable-move="up"]')
    expect(ups[0]?.hasAttribute('disabled')).toBe(true)
    const handles = host.querySelectorAll('[data-sortable-handle]')
    act(() => { handles[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })) })
    expect(onReorder).not.toHaveBeenCalled()
  })

  it('hides handles and move buttons while sorting is off', () => {
    const onReorder = vi.fn()
    const host = mount(list(onReorder, { sorting: false }))
    expect(host.querySelector('[data-sortable-handle]:not([hidden])')).toBeNull()
    expect(host.querySelector('[data-sortable-move]:not([hidden])')).toBeNull()
    expect(host.textContent).toContain('a')
  })

  it('keeps handles visible by default for existing consumers', () => {
    const onReorder = vi.fn()
    const host = mount(createElement(SortableList<Item>, {
      items: [{ id: 'a' }, { id: 'b' }],
      getId: item => item.id,
      renderItem: item => createElement('span', {}, item.id),
      dragLabel: item => 'drag ' + item.id,
      onReorder,
    }))
    expect(host.querySelector('[data-sortable-handle][hidden]')).toBeNull()
    expect(host.querySelector('[data-sortable-move]')).toBeNull()
  })
})