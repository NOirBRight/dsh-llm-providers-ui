// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { installProvidersNavIcon } from '../src/client/nav-icon.ts'

const ICON_MARK = 'data-dsh-providers-icon'
const OWNER_MARK = 'data-dsh-providers-icon-owner'
const REGISTRY_KEY = Symbol.for('dsh-llm-providers-ui.nav-icon.registry')

type RegistryProbe = { states: WeakMap<SVGElement, { records: readonly unknown[] }> }

type FeatureName = 'MutationObserver' | 'requestAnimationFrame' | 'cancelAnimationFrame'

const originalFeatures = new Map<FeatureName, PropertyDescriptor | undefined>()

function overrideFeature(name: FeatureName, value: unknown): void {
  if (!originalFeatures.has(name)) originalFeatures.set(name, Object.getOwnPropertyDescriptor(window, name))
  Object.defineProperty(window, name, { configurable: true, writable: true, value })
}

function restoreFeatures(): void {
  for (const [name, descriptor] of originalFeatures) {
    if (descriptor === undefined) delete (window as unknown as Record<string, unknown>)[name]
    else Object.defineProperty(window, name, descriptor)
  }
  originalFeatures.clear()
}

function registryProbe(): RegistryProbe {
  return (globalThis as unknown as Record<symbol, RegistryProbe>)[REGISTRY_KEY]
}

function addNavRows(count = 1): { buttons: HTMLButtonElement[], svgs: SVGElement[] } {
  const nav = document.createElement('nav')
  const buttons: HTMLButtonElement[] = []
  const svgs: SVGElement[] = []
  for (let index = 0; index < count; index += 1) {
    const button = document.createElement('button')
    const label = document.createElement('span')
    label.textContent = 'LLM Providers'
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('class', 'original-icon')
    svg.setAttribute('viewBox', '1 2 3 4')
    svg.setAttribute('fill', 'currentColor')
    svg.setAttribute('data-original', 'keep-me')
    svg.innerHTML = '<path data-original-path="yes"></path>'
    button.append(label, svg)
    nav.append(button)
    buttons.push(button)
    svgs.push(svg)
  }
  document.body.append(nav)
  return { buttons, svgs }
}

class ControlledObserver {
  static instances: ControlledObserver[] = []
  readonly observe = vi.fn()
  readonly disconnect = vi.fn()
  constructor(readonly callback: MutationCallback) {
    ControlledObserver.instances.push(this)
  }
}

afterEach(() => {
  document.body.replaceChildren()
  restoreFeatures()
  ControlledObserver.instances = []
  vi.restoreAllMocks()
})

describe('Providers navigation icon owner', () => {
  it('uses a unique owner marker and restores the complete original snapshot', () => {
    const { svgs } = addNavRows()
    const svg = svgs[0]!
    const original = svg.outerHTML

    const firstDispose = installProvidersNavIcon()
    const firstOwner = svg.getAttribute(OWNER_MARK)
    expect(firstOwner).toMatch(/^owner-/u)
    expect(svg.getAttribute(ICON_MARK)).toBe('globe')

    const secondDispose = installProvidersNavIcon()
    const secondOwner = svg.getAttribute(OWNER_MARK)
    expect(secondOwner).toMatch(/^owner-/u)
    expect(secondOwner).not.toBe(firstOwner)

    firstDispose()
    expect(svg.getAttribute(OWNER_MARK)).toBe(secondOwner)
    expect(registryProbe().states.get(svg)?.records).toHaveLength(1)
    secondDispose()
    expect(registryProbe().states.get(svg)).toBeUndefined()
    expect(svg.outerHTML).toBe(original)
  })

  it('does not roll back a replaced SVG pointer', () => {
    const { buttons, svgs } = addNavRows()
    const svg = svgs[0]!
    const dispose = installProvidersNavIcon()
    const replacement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    replacement.setAttribute('data-replacement', 'untouched')
    buttons[0]!.replaceChild(replacement, svg)

    dispose()

    expect(replacement.outerHTML).toBe('<svg data-replacement="untouched"></svg>')
  })

  it('restores the original snapshot after external SVG mutation', () => {
    const { svgs } = addNavRows()
    const svg = svgs[0]!
    const original = svg.outerHTML
    const dispose = installProvidersNavIcon()

    svg.setAttribute('data-external', 'must-not-survive-owner-cleanup')
    svg.innerHTML = '<circle data-external-child="yes"></circle>'
    dispose()

    expect(svg.outerHTML).toBe(original)
  })

  it.each([
    'MutationObserver',
    'requestAnimationFrame',
    'cancelAnimationFrame',
  ] as const)('patches once when %s is unavailable', feature => {
    const { svgs } = addNavRows()
    const svg = svgs[0]!
    overrideFeature(feature, undefined)
    const request = vi.fn()
    const cancel = vi.fn()
    if (feature !== 'requestAnimationFrame') overrideFeature('requestAnimationFrame', request)
    if (feature !== 'cancelAnimationFrame') overrideFeature('cancelAnimationFrame', cancel)
    if (feature === 'MutationObserver') overrideFeature('MutationObserver', undefined)
    else overrideFeature('MutationObserver', ControlledObserver)

    const dispose = installProvidersNavIcon()

    expect(svg.getAttribute(ICON_MARK)).toBe('globe')
    expect(ControlledObserver.instances).toHaveLength(0)
    expect(request).not.toHaveBeenCalled()
    expect(cancel).not.toHaveBeenCalled()
    dispose()
  })

  it('observes with request-frame coalescing when every feature is available', () => {
    const { svgs } = addNavRows()
    const first = svgs[0]!
    let frame: FrameRequestCallback | undefined
    const request = vi.fn((callback: FrameRequestCallback) => {
      frame = callback
      return 23
    })
    const cancel = vi.fn()
    overrideFeature('MutationObserver', ControlledObserver)
    overrideFeature('requestAnimationFrame', request)
    overrideFeature('cancelAnimationFrame', cancel)
    const dispose = installProvidersNavIcon()
    const observer = ControlledObserver.instances[0]!
    const { svgs: added } = addNavRows()

    observer.callback([], observer as unknown as MutationObserver)
    observer.callback([], observer as unknown as MutationObserver)
    expect(request).toHaveBeenCalledTimes(1)
    dispose()
    expect(cancel).toHaveBeenCalledWith(23)
    frame?.(0)
    expect(added[0]!.getAttribute(ICON_MARK)).toBeNull()
    expect(first.getAttribute(ICON_MARK)).toBeNull()
  })

  it('prunes records for SVGs removed by a nav rerender', () => {
    const { svgs } = addNavRows()
    const oldSvg = svgs[0]!
    let frame: FrameRequestCallback | undefined
    const request = vi.fn((callback: FrameRequestCallback) => {
      frame = callback
      return 41
    })
    overrideFeature('MutationObserver', ControlledObserver)
    overrideFeature('requestAnimationFrame', request)
    overrideFeature('cancelAnimationFrame', vi.fn())
    const dispose = installProvidersNavIcon()
    const observer = ControlledObserver.instances[0]!

    document.body.replaceChildren()
    addNavRows()
    observer.callback([], observer as unknown as MutationObserver)
    frame?.(0)

    expect(registryProbe().states.get(oldSvg)).toBeUndefined()
    dispose()
  })

  it('restores a detached SVG before reattaching and repatching it', () => {
    const { svgs } = addNavRows()
    const svg = svgs[0]!
    const original = svg.outerHTML
    let frame: FrameRequestCallback | undefined
    const request = vi.fn((callback: FrameRequestCallback) => {
      frame = callback
      return 37
    })
    overrideFeature('MutationObserver', ControlledObserver)
    overrideFeature('requestAnimationFrame', request)
    overrideFeature('cancelAnimationFrame', vi.fn())
    const dispose = installProvidersNavIcon()
    const observer = ControlledObserver.instances[0]!

    document.body.replaceChildren()
    observer.callback([], observer as unknown as MutationObserver)
    frame?.(0)
    expect(svg.outerHTML).toBe(original)

    const nav = document.createElement('nav')
    const button = document.createElement('button')
    const label = document.createElement('span')
    label.textContent = 'LLM Providers'
    button.append(label, svg)
    nav.append(button)
    document.body.append(nav)
    observer.callback([], observer as unknown as MutationObserver)
    frame?.(0)

    expect(svg.getAttribute(ICON_MARK)).toBe('globe')
    dispose()
    expect(svg.outerHTML).toBe(original)
  })

  it('restores a moved-but-connected SVG before repatching it', () => {
    const { buttons, svgs } = addNavRows()
    const svg = svgs[0]!
    const original = svg.outerHTML
    let frame: FrameRequestCallback | undefined
    const request = vi.fn((callback: FrameRequestCallback) => {
      frame = callback
      return 43
    })
    overrideFeature('MutationObserver', ControlledObserver)
    overrideFeature('requestAnimationFrame', request)
    overrideFeature('cancelAnimationFrame', vi.fn())
    const dispose = installProvidersNavIcon()
    const observer = ControlledObserver.instances[0]!

    const movedButton = document.createElement('button')
    const movedLabel = document.createElement('span')
    movedLabel.textContent = 'LLM Providers'
    movedButton.append(movedLabel, svg)
    buttons[0]!.replaceWith(movedButton)
    observer.callback([], observer as unknown as MutationObserver)
    frame?.(0)

    expect(svg.getAttribute(ICON_MARK)).toBe('globe')
    dispose()
    expect(svg.outerHTML).toBe(original)
  })

  it('attempts observer, frame, and every SVG cleanup after failures', () => {
    const { svgs } = addNavRows(2)
    const originals = svgs.map(svg => svg.outerHTML)
    let frame: FrameRequestCallback | undefined
    const observerError = new Error('observer disconnect failed')
    const cancelError = new Error('frame cancel failed')
    const restoreError = new Error('first SVG restore failed')
    const request = vi.fn((callback: FrameRequestCallback) => {
      frame = callback
      return 31
    })
    const cancel = vi.fn(() => { throw cancelError })
    class FailingObserver extends ControlledObserver {
      override readonly disconnect = vi.fn(() => { throw observerError })
    }
    overrideFeature('MutationObserver', FailingObserver)
    overrideFeature('requestAnimationFrame', request)
    overrideFeature('cancelAnimationFrame', cancel)
    const dispose = installProvidersNavIcon()
    const observer = FailingObserver.instances[0]!
    observer.callback([], observer as unknown as MutationObserver)
    const first = svgs[0]!
    const removeAttribute = first.removeAttribute.bind(first)
    Object.defineProperty(first, 'removeAttribute', {
      configurable: true,
      value: (name: string): void => {
        if (name === OWNER_MARK) throw restoreError
        removeAttribute(name)
      },
    })

    let failure: unknown
    try {
      dispose()
    } catch (error) {
      failure = error
    }

    expect(failure).toBeInstanceOf(AggregateError)
    expect((failure as AggregateError).errors).toEqual(expect.arrayContaining([observerError, cancelError, restoreError]))
    expect(svgs[1]!.outerHTML).toBe(originals[1])
    expect(cancel).toHaveBeenCalledWith(31)
    expect(() => dispose()).not.toThrow()
  })
})
