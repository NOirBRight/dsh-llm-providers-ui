/** Pointer-driven sortable list with a floating ghost and animated live preview. */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'

/** Props of {@link SortableList}. */
export interface SortableListProps<T> {
  /** Items in their durable order. */
  items: readonly T[]
  /** Stable identity that survives a preview reorder. */
  getId: (item: T) => string
  /** Row contents excluding the drag handle. */
  renderItem: (item: T, index: number) => ReactNode
  /** Accessible handle label. */
  dragLabel: (item: T, index: number) => string
  /** Commit the preview order when the pointer is released. */
  onReorder: (items: T[]) => void
  /** Disable handles while the parent is busy or read-only. */
  disabled?: boolean
  /** row = inner model-list chrome; card = handle lives inside the provider card frame. */
  chrome?: 'row' | 'card'
}

interface DragGhost {
  id: string
  x: number
  y: number
  width: number
  height: number
  offsetX: number
  offsetY: number
}

const listStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8 }
const rowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '44px minmax(0, 1fr)',
  alignItems: 'stretch',
  overflow: 'hidden',
  border: '1px solid var(--dsw-alias-border-l2)',
  borderRadius: 8,
  background: 'var(--dsw-alias-bg-layer-1)',
  transition: 'box-shadow 150ms ease, opacity 150ms ease, transform 150ms ease',
}
const handleStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 44,
  minHeight: 44,
  alignSelf: 'stretch',
  border: 0,
  borderRight: '1px solid var(--dsw-alias-border-l2)',
  padding: 0,
  flex: 'none',
  touchAction: 'none',
  userSelect: 'none',
  background: 'color-mix(in srgb, var(--dsw-alias-label-primary) 5%, transparent)',
  color: 'var(--dsw-alias-label-tertiary)',
  position: 'relative',
  zIndex: 5,
  pointerEvents: 'auto',
}
const cardRowStyle: CSSProperties = {
  ...rowStyle,
  borderRadius: 10,
  background: 'var(--dsw-alias-bg-module-platform)',
  overflow: 'hidden',
}
const cardItemStyle: CSSProperties = { minWidth: 0, display: 'flex', flexDirection: 'column' }
const cardCss = '[data-sortable-card] [data-sortable-item] li,[data-sortable-ghost] [data-sortable-item] li{border:0!important;border-radius:0!important;background:transparent!important;overflow:visible!important;list-style:none;margin:0}'
const ghostStyle: CSSProperties = {
  ...rowStyle,
  position: 'fixed',
  zIndex: 10_000,
  pointerEvents: 'none',
  opacity: 0.96,
  boxShadow: 'var(--dsw-shadow-lv2, 0 10px 30px rgba(0, 0, 0, 0.18))',
  outline: '2px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 22%, transparent)',
}

/** Grip glyph marking one row's pointer handle. */
function IconGrip(): ReactNode {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden>
      <circle cx="2.5" cy="2.5" r="1.2" /><circle cx="7.5" cy="2.5" r="1.2" />
      <circle cx="2.5" cy="7" r="1.2" /><circle cx="7.5" cy="7" r="1.2" />
      <circle cx="2.5" cy="11.5" r="1.2" /><circle cx="7.5" cy="11.5" r="1.2" />
    </svg>
  )
}

/**
 * Pointer-driven sortable list: a portal ghost follows the pointer, a preview
 * array records the prospective order, and FLIP animations move sibling rows.
 */
export function SortableList<T>({
  items,
  getId,
  renderItem,
  dragLabel,
  onReorder,
  disabled = false,
  chrome = 'row',
}: SortableListProps<T>): ReactNode {
  const card = chrome === 'card'
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)
  const [previewItems, setPreviewItems] = useState<T[] | null>(null)
  const [dragGhost, setDragGhost] = useState<DragGhost | null>(null)
  const rowRefs = useRef(new Map<string, HTMLDivElement>())
  const previousRects = useRef<Map<string, DOMRect> | null>(null)
  const previewRef = useRef<T[] | null>(null)
  const dragGhostRef = useRef<DragGhost | null>(null)

  const renderedItems = previewItems ?? items
  const draggedItem = draggedId === null
    ? undefined
    : renderedItems.find(item => getId(item) === draggedId) ?? items.find(item => getId(item) === draggedId)

  useEffect(() => {
    if (draggedId === null) return
    const style = document.createElement('style')
    style.textContent = 'html.providers-sortable-dragging, html.providers-sortable-dragging * { cursor: grabbing !important; user-select: none !important; }'
    const previousRootCursor = document.documentElement.style.cursor
    const previousBodyCursor = document.body.style.cursor
    document.head.appendChild(style)
    document.documentElement.classList.add('providers-sortable-dragging')
    document.documentElement.style.cursor = 'grabbing'
    document.body.style.cursor = 'grabbing'
    return () => {
      document.documentElement.classList.remove('providers-sortable-dragging')
      style.remove()
      document.documentElement.style.cursor = previousRootCursor
      document.body.style.cursor = previousBodyCursor
    }
  }, [draggedId])

  useEffect(() => {
    if (draggedId === null) return

    const handlePointerMove = (event: PointerEvent): void => {
      const currentGhost = dragGhostRef.current
      if (currentGhost === null) return
      event.preventDefault()
      const nextGhost = {
        ...currentGhost,
        x: event.clientX - currentGhost.offsetX,
        y: event.clientY - currentGhost.offsetY,
      }
      dragGhostRef.current = nextGhost
      setDragGhost(nextGhost)
      movePreviewFromPointer(nextGhost.y + nextGhost.height / 2)
    }
    const handlePointerUp = (event: PointerEvent): void => {
      event.preventDefault()
      finishDrag(true)
    }
    const handlePointerCancel = (event: PointerEvent): void => {
      event.preventDefault()
      finishDrag(false)
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      finishDrag(false)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: false })
    window.addEventListener('pointerup', handlePointerUp, { passive: false })
    window.addEventListener('pointercancel', handlePointerCancel, { passive: false })
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [draggedId])

  useLayoutEffect(() => {
    const rects = previousRects.current
    if (rects === null) return
    previousRects.current = null
    rowRefs.current.forEach((node, id) => {
      const previous = rects.get(id)
      if (previous === undefined) return
      const next = node.getBoundingClientRect()
      const deltaX = previous.left - next.left
      const deltaY = previous.top - next.top
      if ((deltaX === 0 && deltaY === 0) || typeof node.animate !== 'function') return
      node.animate([
        { transform: 'translate(' + String(deltaX) + 'px, ' + String(deltaY) + 'px)' },
        { transform: 'translate(0, 0)' },
      ], { duration: 160, easing: 'cubic-bezier(0.2, 0, 0, 1)' })
    })
  }, [renderedItems])

  const beginDrag = (row: HTMLElement, pointerId: number, clientX: number, clientY: number, id: string): void => {
    if (dragGhostRef.current !== null) return
    try { row.setPointerCapture(pointerId) } catch { /* embedded webviews may drop capture */ }
    const rect = row.getBoundingClientRect()
    const nextGhost = {
      id,
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
    }
    dragGhostRef.current = nextGhost
    const initial = [...items]
    previewRef.current = initial
    setPreviewItems(initial)
    setDragGhost(nextGhost)
    setDraggedId(id)
  }

  const startDrag = (event: ReactPointerEvent<HTMLElement>, id: string): void => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const row = event.currentTarget.closest('[data-sortable-row="true"]')
    if (!(row instanceof HTMLElement)) return
    event.preventDefault()
    beginDrag(row, event.pointerId, event.clientX, event.clientY, id)
  }

  const finishDrag = (commit: boolean): void => {
    const next = previewRef.current
    if (commit && next !== null && !sameOrder(next, items, getId)) onReorder(next)
    previewRef.current = null
    dragGhostRef.current = null
    setPreviewItems(null)
    setDragGhost(null)
    setDraggedId(null)
    setDropTargetId(null)
  }

  const captureRects = (): void => {
    previousRects.current = new Map(
      Array.from(rowRefs.current.entries()).map(([id, node]) => [id, node.getBoundingClientRect()]),
    )
  }

  const setRowRef = (id: string, node: HTMLDivElement | null): void => {
    if (node === null) rowRefs.current.delete(id)
    else rowRefs.current.set(id, node)
  }

  const movePreviewFromPointer = (pointerY: number): void => {
    if (draggedId === null) return
    const current = previewRef.current ?? [...items]
    const from = current.findIndex(item => getId(item) === draggedId)
    if (from < 0) return
    const dragged = current[from]
    if (dragged === undefined) return
    const remaining = current.filter(item => getId(item) !== draggedId)
    let insertionIndex = remaining.length
    let nextDropTargetId = remaining.length === 0 ? null : getId(remaining[remaining.length - 1] as T)
    for (let index = 0; index < remaining.length; index += 1) {
      const item = remaining[index]
      if (item === undefined) continue
      const id = getId(item)
      const node = rowRefs.current.get(id)
      if (node === undefined) continue
      const rect = node.getBoundingClientRect()
      if (pointerY < rect.top + rect.height / 2) {
        insertionIndex = index
        nextDropTargetId = id
        break
      }
    }
    const next = [
      ...remaining.slice(0, insertionIndex),
      dragged,
      ...remaining.slice(insertionIndex),
    ]
    setDropTargetId(nextDropTargetId)
    if (sameOrder(next, current, getId)) return
    captureRects()
    previewRef.current = next
    setPreviewItems(next)
  }

  return (
    <div data-sortable-card={card ? '' : undefined} style={{ ...listStyle, ...(card ? { gap: 12 } : {}) }}>
      {card ? <style>{cardCss}</style> : null}
      {renderedItems.map((item, index) => {
        const id = getId(item)
        const dragging = draggedId === id
        const targeted = dropTargetId === id && draggedId !== id
        return (
          <div
            key={id}
            ref={(node) => { setRowRef(id, node) }}
            data-sortable-row="true"
            style={{
              ...(card ? cardRowStyle : rowStyle),
              visibility: dragging ? 'hidden' : 'visible',
              pointerEvents: dragging ? 'none' : 'auto',
              borderColor: dragging ? 'transparent' : 'var(--dsw-alias-border-l2)',
              boxShadow: targeted
                ? '0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 20%, transparent)'
                : 'none',
            }}
            onPointerDown={(event) => {
              if (event.pointerType === 'mouse' && event.button !== 0) return
              const row = event.currentTarget
              const target = event.target
              if (target instanceof Element && target.closest('input, select, textarea, a') !== null) return
              const fromHandle = event.clientX - row.getBoundingClientRect().left <= 44
                || (target instanceof Element && target.closest('[data-sortable-handle]') !== null)
              if (fromHandle) {
                startDrag(event, id)
                return
              }
              const originX = event.clientX
              const originY = event.clientY
              const pointerId = event.pointerId
              const onMove = (move: PointerEvent): void => {
                if (move.pointerId !== pointerId) return
                const dx = move.clientX - originX
                const dy = move.clientY - originY
                if (dx * dx + dy * dy < 64) return
                window.removeEventListener('pointermove', onMove)
                window.removeEventListener('pointerup', onUp)
                window.removeEventListener('pointercancel', onUp)
                move.preventDefault()
                beginDrag(row, pointerId, move.clientX, move.clientY, id)
              }
              const onUp = (up: PointerEvent): void => {
                if (up.pointerId !== pointerId) return
                window.removeEventListener('pointermove', onMove)
                window.removeEventListener('pointerup', onUp)
                window.removeEventListener('pointercancel', onUp)
              }
              window.addEventListener('pointermove', onMove, { passive: false })
              window.addEventListener('pointerup', onUp)
              window.addEventListener('pointercancel', onUp)
            }}
          >
            <button
              type="button"
              data-sortable-handle=""
              style={{ ...handleStyle, cursor: disabled ? 'default' : draggedId === null ? 'grab' : 'grabbing' }}
              aria-label={dragLabel(item, index)}
              aria-grabbed={dragging}
              title={dragLabel(item, index)}
              onDragStart={(event) => { event.preventDefault() }}
              onPointerDown={(event) => { startDrag(event, id) }}
            >
              <IconGrip />
            </button>
            <div data-sortable-item="" style={card ? cardItemStyle : { minWidth: 0 }}>{renderItem(item, index)}</div>
          </div>
        )
      })}
      {dragGhost !== null && draggedItem !== undefined
        ? createPortal(
          <div
            data-sortable-ghost="true"
            style={{
              ...ghostStyle,
              ...(card ? cardRowStyle : {}),
              position: 'fixed',
              left: dragGhost.x,
              top: dragGhost.y,
              width: dragGhost.width,
              minHeight: dragGhost.height,
            }}
          >
            <div style={{ ...handleStyle, cursor: 'grabbing' }}><IconGrip /></div>
            <div data-sortable-item="" style={card ? cardItemStyle : { minWidth: 0 }}>{renderItem(draggedItem, renderedItems.findIndex(item => getId(item) === draggedId))}</div>
          </div>,
          document.body,
        )
        : null}
    </div>
  )
}

function sameOrder<T>(left: readonly T[], right: readonly T[], getId: (item: T) => string): boolean {
  return left.length === right.length && left.every((item, index) => {
    const other = right[index]
    return other !== undefined && getId(item) === getId(other)
  })
}
