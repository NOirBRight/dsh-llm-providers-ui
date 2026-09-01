/**
 * Patches the LLM Providers navigation row with its globe icon.
 *
 * The adapter owns only the SVG attributes and markup it writes. Each install
 * receives a distinct marker so overlapping installs can restore in order.
 * @module dsh-llm-providers-ui/client/nav-icon
 */

const LABELS = new Set(['LLM 供应商', 'LLM Providers', '供应商', 'Providers'])
const ICON_MARK = 'data-dsh-providers-icon'
const OWNER_MARK = 'data-dsh-providers-icon-owner'
const GLOBE_PATH = 'M7.00018 0.353516C10.6708 0.353535 13.6468 3.32958 13.6469 7.00018C13.6468 10.6708 10.6708 13.6468 7.00018 13.6469C3.32957 13.6468 0.353535 10.6708 0.353516 7.00018C0.353535 3.32957 3.32957 0.353531 7.00018 0.353516ZM5.44643 7.59661C5.49463 8.97506 5.70762 10.191 6.02136 11.0793C6.20141 11.5891 6.40328 11.9585 6.59898 12.1889C6.79501 12.4196 6.93213 12.454 7.00018 12.454C7.06822 12.454 7.20533 12.4197 7.40138 12.1889C7.59708 11.9585 7.79895 11.589 7.979 11.0793C8.29274 10.191 8.50574 8.97506 8.55394 7.59661H5.44643ZM1.57861 7.59661C1.80785 9.70467 3.2386 11.4509 5.1715 12.1388C5.07135 11.9317 4.97972 11.7098 4.89746 11.477C4.53084 10.4391 4.30224 9.0828 4.25357 7.59661H1.57861ZM9.74679 7.59661C9.69813 9.0828 9.46952 10.4391 9.1029 11.477C9.0206 11.7099 8.92818 11.9316 8.82797 12.1388C10.7613 11.4511 12.1925 9.70496 12.4218 7.59661H9.74679ZM5.1706 1.8616C3.23814 2.54963 1.80876 4.29604 1.5795 6.40376H4.25357C4.30224 4.91756 4.53083 3.56129 4.89746 2.5234C4.97968 2.29066 5.07051 2.0686 5.1706 1.8616ZM7.00018 1.54637C6.93213 1.54638 6.79503 1.5807 6.59898 1.81145C6.40332 2.04177 6.20139 2.41058 6.02136 2.92012C5.70754 3.80851 5.49461 5.02499 5.44643 6.40376H8.55394C8.50575 5.025 8.29282 3.80851 7.979 2.92012C7.79898 2.41059 7.59705 2.04177 7.40138 1.81145C7.20531 1.58067 7.06823 1.54637 7.00018 1.54637ZM8.82887 1.8616C8.92902 2.0687 9.02064 2.29053 9.1029 2.5234C9.46953 3.56129 9.69812 4.91756 9.74679 6.40376H12.4209C12.1916 4.29575 10.7618 2.54943 8.82887 1.8616Z'
const NAV = '<path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" d="' + GLOBE_PATH + '"/>'
const REGISTRY_KEY = Symbol.for('dsh-llm-providers-ui.nav-icon.registry')

type MutationObserverConstructor = new (callback: MutationCallback) => MutationObserver
type RequestFrame = (callback: FrameRequestCallback) => number
type CancelFrame = (handle: number) => void

interface AttributeSnapshot {
  name: string
  namespace: string | null
  value: string
}

interface SvgSnapshot {
  attributes: AttributeSnapshot[]
  innerHTML: string
}

interface PatchRecord {
  marker: string
  button: Element
  svg: SVGElement
  original: SvgSnapshot
  owned: SvgSnapshot
  previous: PatchRecord | undefined
  active: boolean
}

interface SvgState {
  records: PatchRecord[]
}

interface Registry {
  nextOwner: number
  states: WeakMap<SVGElement, SvgState>
}

interface Installation {
  marker: string
  records: Set<PatchRecord>
  observer: MutationObserver | undefined
  requestFrame: RequestFrame | undefined
  cancelFrame: CancelFrame | undefined
  frame: number | undefined
  scheduled: boolean
  disposed: boolean
}

function sharedRegistry(): Registry {
  const holder = globalThis as unknown as Record<symbol, Registry | undefined>
  const existing = holder[REGISTRY_KEY]
  if (existing !== undefined) return existing
  const created: Registry = { nextOwner: 0, states: new WeakMap() }
  holder[REGISTRY_KEY] = created
  return created
}

function newOwnerMarker(registry: Registry): string {
  registry.nextOwner += 1
  return 'owner-' + registry.nextOwner.toString(36)
}

function flattenFailure(failures: unknown[], error: unknown): void {
  if (error instanceof AggregateError && error.errors.length > 0) {
    for (const nested of error.errors) flattenFailure(failures, nested)
  } else {
    failures.push(error)
  }
}

function throwFailures(failures: unknown[], message: string): void {
  if (failures.length > 0) throw new AggregateError(failures, message)
}

function snapshotSvg(svg: SVGElement): SvgSnapshot {
  const attributes: AttributeSnapshot[] = []
  for (let index = 0; index < svg.attributes.length; index += 1) {
    const attribute = svg.attributes.item(index)
    if (attribute === null) continue
    attributes.push({ name: attribute.name, namespace: attribute.namespaceURI, value: attribute.value })
  }
  return { attributes, innerHTML: svg.innerHTML }
}

function snapshotsEqual(left: SvgSnapshot, right: SvgSnapshot): boolean {
  if (left.innerHTML !== right.innerHTML || left.attributes.length !== right.attributes.length) return false
  for (let index = 0; index < left.attributes.length; index += 1) {
    const a = left.attributes[index]!
    const b = right.attributes[index]!
    if (a.name !== b.name || a.namespace !== b.namespace || a.value !== b.value) return false
  }
  return true
}

function restoreSvg(svg: SVGElement, original: SvgSnapshot): void {
  const failures: unknown[] = []
  const current: AttributeSnapshot[] = []
  try {
    for (let index = 0; index < svg.attributes.length; index += 1) {
      const attribute = svg.attributes.item(index)
      if (attribute !== null) current.push({ name: attribute.name, namespace: attribute.namespaceURI, value: attribute.value })
    }
  } catch (error) {
    failures.push(error)
  }
  for (const attribute of current) {
    try {
      if (attribute.namespace === null) svg.removeAttribute(attribute.name)
      else svg.removeAttributeNS(attribute.namespace, attribute.name)
    } catch (error) {
      failures.push(error)
    }
  }
  for (const attribute of original.attributes) {
    try {
      if (attribute.namespace === null) svg.setAttribute(attribute.name, attribute.value)
      else svg.setAttributeNS(attribute.namespace, attribute.name, attribute.value)
    } catch (error) {
      failures.push(error)
    }
  }
  try {
    svg.innerHTML = original.innerHTML
  } catch (error) {
    failures.push(error)
  }
  throwFailures(failures, 'navigation icon restore failed')
}

function writeIcon(svg: SVGElement, marker: string): SvgSnapshot {
  const failures: unknown[] = []
  try { svg.setAttribute(ICON_MARK, 'globe') } catch (error) { failures.push(error) }
  try { svg.setAttribute(OWNER_MARK, marker) } catch (error) { failures.push(error) }
  try { svg.setAttribute('viewBox', '0 0 14 14') } catch (error) { failures.push(error) }
  try { svg.setAttribute('fill', 'none') } catch (error) { failures.push(error) }
  try { svg.innerHTML = NAV } catch (error) { failures.push(error) }
  throwFailures(failures, 'navigation icon patch failed')
  return snapshotSvg(svg)
}

function ownerMarker(svg: SVGElement): string | undefined {
  return svg.getAttribute(OWNER_MARK) ?? undefined
}

function latestActive(state: SvgState): PatchRecord | undefined {
  for (let index = state.records.length - 1; index >= 0; index -= 1) {
    const record = state.records[index]!
    if (record.active) return record
  }
  return undefined
}

function latestInstallRecord(installation: Installation, svg: SVGElement): PatchRecord | undefined {
  let latest: PatchRecord | undefined
  for (const record of installation.records) {
    if (record.svg === svg && record.active) latest = record
  }
  return latest
}

function sameTarget(record: PatchRecord): boolean {
  return record.button.isConnected
    && record.svg.isConnected
    && record.button.querySelector('svg') === record.svg
}

function pruneState(registry: Registry, svg: SVGElement, state: SvgState): void {
  state.records = state.records.filter(record => record.active)
  if (state.records.length === 0) registry.states.delete(svg)
}

function rootRecord(record: PatchRecord): PatchRecord {
  let root = record
  while (root.previous !== undefined) root = root.previous
  return root
}

function restorePrunedRecord(record: PatchRecord): void {
  restoreSvg(record.svg, rootRecord(record).original)
}

function pruneDetachedRecords(registry: Registry, installation: Installation, failures: unknown[]): void {
  for (const record of installation.records) {
    if (sameTarget(record)) continue
    const state = registry.states.get(record.svg)
    if (state !== undefined && latestActive(state) === record && ownerMarker(record.svg) === record.marker) {
      try {
        restorePrunedRecord(record)
      } catch (error) {
        flattenFailure(failures, error)
      }
    }
    record.active = false
    installation.records.delete(record)
    if (state !== undefined) pruneState(registry, record.svg, state)
  }
}

function rollbackNewRecord(registry: Registry, record: PatchRecord, setupError: unknown): never {
  record.active = false
  const state = registry.states.get(record.svg)
  if (state !== undefined) pruneState(registry, record.svg, state)
  const failures: unknown[] = []
  if (sameTarget(record)) {
    try {
      restoreSvg(record.svg, record.original)
    } catch (error) {
      flattenFailure(failures, error)
    }
  }
  if (failures.length === 0) throw setupError
  throw new AggregateError([setupError, ...failures], 'navigation icon setup rollback failed')
}

function patchSvg(
  registry: Registry,
  installation: Installation,
  button: Element,
  svg: SVGElement,
  force: boolean,
): void {
  const current = snapshotSvg(svg)
  const state = registry.states.get(svg) ?? { records: [] }
  registry.states.set(svg, state)
  const top = latestActive(state)
  const own = latestInstallRecord(installation, svg)
  if (!force && top !== undefined && top.marker !== installation.marker) return
  if (own !== undefined && own === top) {
    if (snapshotsEqual(current, own.owned)) return
    own.owned = writeIcon(svg, installation.marker)
    return
  }
  if (own !== undefined) {
    own.active = false
    state.records = state.records.filter(record => record.active)
  }
  const record: PatchRecord = {
    marker: installation.marker,
    button,
    svg,
    original: current,
    owned: current,
    previous: top,
    active: true,
  }
  state.records.push(record)
  installation.records.add(record)
  try {
    record.owned = writeIcon(svg, installation.marker)
  } catch (error) {
    rollbackNewRecord(registry, record, error)
  }
}

function patchNav(registry: Registry, installation: Installation, force: boolean): void {
  if (typeof document === 'undefined') return
  const failures: unknown[] = []
  pruneDetachedRecords(registry, installation, failures)
  const buttons = document.querySelectorAll('nav button')
  for (let index = 0; index < buttons.length; index += 1) {
    const button = buttons[index]!
    const spans = button.querySelectorAll('span')
    let label: Element | undefined
    for (let spanIndex = 0; spanIndex < spans.length; spanIndex += 1) {
      const span = spans[spanIndex]!
      if (LABELS.has(span.textContent?.trim() ?? '')) {
        label = span
        break
      }
    }
    if (label === undefined) continue
    const svg = button.querySelector('svg')
    if (svg === null) continue
    try {
      patchSvg(registry, installation, button, svg, force)
    } catch (error) {
      flattenFailure(failures, error)
    }
  }
  throwFailures(failures, 'navigation icon patch failed')
}

function mutationObserverConstructor(): MutationObserverConstructor | undefined {
  if (typeof document === 'undefined') return undefined
  const view = document.defaultView
  if (view !== null && view !== undefined) {
    const candidate = view.MutationObserver
    return typeof candidate === 'function' ? candidate : undefined
  }
  const candidate = (globalThis as unknown as { MutationObserver?: MutationObserverConstructor }).MutationObserver
  return typeof candidate === 'function' ? candidate : undefined
}

function frameFunctions(): { request: RequestFrame | undefined, cancel: CancelFrame | undefined } {
  if (typeof document === 'undefined') return { request: undefined, cancel: undefined }
  const view = document.defaultView
  if (view !== null && view !== undefined) {
    const request = view.requestAnimationFrame
    const cancel = view.cancelAnimationFrame
    if (typeof request === 'function' && typeof cancel === 'function') {
      return { request: request.bind(view), cancel: cancel.bind(view) }
    }
    return { request: undefined, cancel: undefined }
  }
  const globalObject = globalThis as unknown as {
    requestAnimationFrame?: RequestFrame
    cancelAnimationFrame?: CancelFrame
  }
  const request = globalObject.requestAnimationFrame
  const cancel = globalObject.cancelAnimationFrame
  if (typeof request === 'function' && typeof cancel === 'function') {
    return { request: request.bind(globalThis), cancel: cancel.bind(globalThis) }
  }
  return { request: undefined, cancel: undefined }
}

function restoreRecord(registry: Registry, record: PatchRecord): void {
  const state = registry.states.get(record.svg)
  if (state === undefined) {
    record.active = false
    return
  }
  const top = latestActive(state)
  record.active = false
  if (top === record && !sameTarget(record) && ownerMarker(record.svg) === record.marker) {
    try {
      restorePrunedRecord(record)
    } finally {
      pruneState(registry, record.svg, state)
    }
    return
  }
  pruneState(registry, record.svg, state)
  if (top !== record || !sameTarget(record) || ownerMarker(record.svg) !== record.marker) return

  let child = record
  let previous = record.previous
  while (previous !== undefined && !previous.active) {
    child = previous
    previous = previous.previous
  }
  if (previous !== undefined && previous.active) {
    restoreSvg(record.svg, child.original)
    return
  }
  restoreSvg(record.svg, rootRecord(child).original)
}

function disposeInstallation(registry: Registry, installation: Installation): void {
  if (installation.disposed) return
  installation.disposed = true
  const failures: unknown[] = []
  const observer = installation.observer
  installation.observer = undefined
  if (observer !== undefined) {
    try { observer.disconnect() } catch (error) { flattenFailure(failures, error) }
  }
  const frame = installation.frame
  installation.frame = undefined
  installation.scheduled = false
  if (frame !== undefined && installation.cancelFrame !== undefined) {
    try { installation.cancelFrame(frame) } catch (error) { flattenFailure(failures, error) }
  }
  for (const record of installation.records) {
    try { restoreRecord(registry, record) } catch (error) { flattenFailure(failures, error) }
  }
  installation.records.clear()
  throwFailures(failures, 'navigation icon cleanup failed')
}

/**
 * Install the navigation icon adapter.
 * @returns An idempotent disposer for the observer, frame, and owned SVG state.
 */
export function installProvidersNavIcon(): () => void {
  if (typeof document === 'undefined' || document.body === null) return () => {}
  const registry = sharedRegistry()
  const installation: Installation = {
    marker: newOwnerMarker(registry),
    records: new Set(),
    observer: undefined,
    requestFrame: undefined,
    cancelFrame: undefined,
    frame: undefined,
    scheduled: false,
    disposed: false,
  }
  const frame = frameFunctions()
  installation.requestFrame = frame.request
  installation.cancelFrame = frame.cancel
  const flush = (): void => {
    installation.frame = undefined
    installation.scheduled = false
    if (installation.disposed) return
    patchNav(registry, installation, false)
  }
  const schedule = (): void => {
    if (installation.disposed || installation.scheduled || installation.requestFrame === undefined) return
    installation.scheduled = true
    try {
      const handle = installation.requestFrame(flush)
      if (installation.scheduled) installation.frame = handle
    } catch (error) {
      installation.scheduled = false
      installation.frame = undefined
      throw error
    }
  }
  try {
    const observerConstructor = mutationObserverConstructor()
    if (observerConstructor !== undefined && installation.requestFrame !== undefined && installation.cancelFrame !== undefined) {
      const observer = new observerConstructor(schedule)
      installation.observer = observer
      observer.observe(document.body, { childList: true, subtree: true })
    }
    patchNav(registry, installation, true)
  } catch (setupError) {
    const failures: unknown[] = []
    try {
      disposeInstallation(registry, installation)
    } catch (cleanupError) {
      flattenFailure(failures, cleanupError)
    }
    if (failures.length === 0) throw setupError
    throw new AggregateError([setupError, ...failures], 'navigation icon setup failed')
  }
  return () => { disposeInstallation(registry, installation) }
}
