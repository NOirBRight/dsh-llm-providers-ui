/** Shared provider card header: monochrome role badge plus a segmented remaining-quota meter. Pure and UI-only: no RPC, no persistence, no provider knowledge. */

import type { CSSProperties, ReactNode } from 'react'

/** Card role shown as a monochrome badge. Unknown cards stay LLM. */
export type ProviderCardRole = 'llm' | 'agent'

/** Remaining quota for one window. Percent (0-100) wins; fraction (0-1) is the fallback. */
export interface ProviderQuotaState {
  /** Remaining quota, 0-100. Values outside 0-100 are unavailable, never clamped. */
  remainingPercent?: number
  /** Remaining quota, 0-1. Used only when remainingPercent is absent. */
  remainingFraction?: number
  /** Window label (for example 5h). Names the meter for assistive technology. */
  label?: string
  /** Reset caption rendered under the meter. */
  detail?: string
}

/**
 * Normalize remaining quota to a 0-100 percent value.
 * Valid readings keep their precision (99.9 stays 99.9, never rounds to 100).
 * NaN, Infinity, and out-of-range readings are unavailable, not clamped:
 * clamping would fabricate a full or empty bar from bad data.
 * @param input - percent and/or fraction quota reading.
 * @returns the 0-100 remaining value, or undefined when unavailable.
 */
export function normalizeQuotaRemaining(input: Pick<ProviderQuotaState, 'remainingPercent' | 'remainingFraction'>): number | undefined {
  const percent = input.remainingPercent
  if (percent !== undefined) {
    return Number.isFinite(percent) && percent >= 0 && percent <= 100 ? percent : undefined
  }
  const fraction = input.remainingFraction
  if (fraction !== undefined) {
    return Number.isFinite(fraction) && fraction >= 0 && fraction <= 1 ? fraction * 100 : undefined
  }
  return undefined
}

/** Props of {@link ProviderQuotaMeter}. */
export interface ProviderQuotaMeterProps {
  /** Remaining quota, 0-100. Values outside 0-100 are unavailable, never clamped. */
  remainingPercent?: number
  /** Remaining quota, 0-1. Used only when remainingPercent is absent. */
  remainingFraction?: number
  /** Window label naming the meter. Defaults to Quota. */
  label?: string
  /** Reset caption rendered under the meter. */
  detail?: string
  /** Placeholder shown when quota is unavailable. Defaults to an em dash. */
  emptyLabel?: string
  /** Optional id for the meter wrapper. */
  id?: string
}

const meterWrapStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }
const meterTopStyle: CSSProperties = { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }
const meterLabelStyle: CSSProperties = {
  minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  color: 'var(--dsw-alias-label-secondary)', fontSize: 12, lineHeight: '18px',
}
const meterValueStyle: CSSProperties = {
  flex: 'none', fontVariantNumeric: 'tabular-nums', fontWeight: 500, fontSize: 12, lineHeight: '18px',
  color: 'var(--dsw-alias-label-primary)',
}
const meterTrackStyle: CSSProperties = {
  display: 'block', width: '100%', height: 6, overflow: 'hidden', border: 0, borderRadius: 2,
  background: 'color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent)', position: 'relative',
}
const meterFillBase: CSSProperties = {
  display: 'block', height: '100%', borderRadius: 2, position: 'relative',
  background: 'color-mix(in srgb, var(--dsw-alias-label-primary) 55%, var(--dsw-alias-label-secondary))',
}
const meterKnobStyle: CSSProperties = {
  position: 'absolute', right: 0, top: 0, bottom: 0, width: 2,
  background: 'var(--dsw-alias-label-primary)',
}
const meterSegmentsStyle: CSSProperties = {
  position: 'absolute', inset: 0, pointerEvents: 'none',
  background: 'repeating-linear-gradient(to right, transparent 0, transparent calc(10% - 1px), var(--dsw-alias-bg-layer-1) calc(10% - 1px), var(--dsw-alias-bg-layer-1) 10%)',
}
/** Approved A low-quota fill: amber only, no red tier, no hardcoded hue. */
const meterWarnFill: CSSProperties = { background: 'var(--dsw-alias-state-warn-primary)' }
const meterDetailStyle: CSSProperties = { color: 'var(--dsw-alias-label-tertiary)', fontSize: 11, lineHeight: '16px' }
const meterMissingStyle: CSSProperties = { color: 'var(--dsw-alias-label-tertiary)', fontSize: 12, lineHeight: '18px' }

/** Segmented remaining-quota meter. Unavailable quota renders a placeholder, never a zero bar. */
export function ProviderQuotaMeter(props: ProviderQuotaMeterProps): ReactNode {
  const remaining = normalizeQuotaRemaining(props)
  const label = props.label ?? 'Quota'
  if (remaining === undefined) {
    return <span data-provider-quota-missing="" style={meterMissingStyle}>{props.emptyLabel ?? '\u2014'}</span>
  }
  const warn = remaining < 20
  const text = String(remaining)
  return (
    <span data-provider-quota="" style={meterWrapStyle} {...(props.id === undefined ? {} : { id: props.id })}>
      <span style={meterTopStyle}>
        <span style={meterLabelStyle}>{label}</span>
        <span style={meterValueStyle}>{text + '%'}</span>
      </span>
      <span
        data-provider-quota-meter=""
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={remaining}
        style={meterTrackStyle}
      >
        <span style={{ ...meterFillBase, ...(warn ? meterWarnFill : {}), width: text + '%' }}>
          <span style={meterKnobStyle} />
        </span>
        <span aria-hidden="true" style={meterSegmentsStyle} />
      </span>
      {props.detail === undefined ? null : <span style={meterDetailStyle}>{props.detail}</span>}
    </span>
  )
}

/** Props of {@link ProviderCardHeader}. The legacy codex signature keeps working unchanged. */
export interface ProviderCardHeaderProps {
  /** Provider display name. */
  title: string
  /** Provider brand mark. */
  mark: ReactNode
  /** Provider-supplied count line (for example models enabled). Rendered as-is. */
  summary: string
  /** Whether the card body is expanded. Rotates the chevron. */
  open: boolean
  /** Show the unsaved-changes hint. */
  unsaved?: boolean
  /** Unsaved-changes text, shown only together with unsaved. */
  unsavedLabel?: string
  /** Card role for the monochrome badge. Defaults to llm. */
  role?: ProviderCardRole
  /** Caller-supplied status node. Rendered only when provided; never defaults to summary. */
  status?: ReactNode
  /** Headline quota window. Absent quota renders no meter, never a zero bar. */
  quota?: ProviderQuotaState | null
}

const headerMainStyle: CSSProperties = { display: 'flex', minWidth: 0, flex: 1, flexDirection: 'column', gap: 4 }
const headerTitleStyle: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, lineHeight: 1 }
const headerMarkStyle: CSSProperties = { width: 18, height: 18, flex: 'none', display: 'block', overflow: 'visible' }
const headerNameStyle: CSSProperties = { lineHeight: '20px' }
const headerBadgeBase: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
  fontSize: 10, fontWeight: 500, lineHeight: '16px', padding: '0 5px', borderRadius: 3,
  border: '1px solid transparent',
}
const headerBadgeLlm: CSSProperties = {
  color: 'var(--dsw-alias-label-secondary)',
  borderColor: 'var(--dsw-alias-border-secondary)',
  background: 'transparent',
}
const headerBadgeAgent: CSSProperties = {
  color: 'var(--dsw-alias-bg-layer-1)',
  borderColor: 'var(--dsw-alias-label-primary)',
  background: 'var(--dsw-alias-label-primary)',
}
const headerSummaryStyle: CSSProperties = {
  fontSize: 13, lineHeight: '18px', color: 'var(--dsw-alias-label-tertiary)',
  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
}
const headerStatusStyle: CSSProperties = { fontSize: 12, lineHeight: '18px', color: 'var(--dsw-alias-label-secondary)' }
const headerSideStyle: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 10, flex: 'none' }
const headerUnsavedStyle: CSSProperties = { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' }
const headerChevronStyle: CSSProperties = { fontSize: 18, lineHeight: 1 }
const headerMiniStyle: CSSProperties = { minWidth: 0, maxWidth: 220, paddingTop: 2 }

/**
 * Collapsed header contents: mark, title, monochrome role badge, provider
 * summary, optional caller status, and an optional compact quota meter.
 * Renders a fragment for the caller-owned header button, matching the legacy
 * codex provider-chrome layout so existing call sites keep working.
 */
export function ProviderCardHeader(props: ProviderCardHeaderProps): ReactNode {
  const role: ProviderCardRole = props.role ?? 'llm'
  const quota: ProviderQuotaMeterProps | undefined = props.quota === undefined || props.quota === null ? undefined : {
    ...(props.quota.remainingPercent === undefined ? {} : { remainingPercent: props.quota.remainingPercent }),
    ...(props.quota.remainingFraction === undefined ? {} : { remainingFraction: props.quota.remainingFraction }),
    ...(props.quota.label === undefined ? {} : { label: props.quota.label }),
    ...(props.quota.detail === undefined ? {} : { detail: props.quota.detail }),
  }
  return (
    <>
      <span data-provider-header-main="" style={headerMainStyle}>
        <span style={headerTitleStyle}>
          <span style={headerMarkStyle}>{props.mark}</span>
          <span style={headerNameStyle}>{props.title}</span>
          <span data-provider-role-badge={role} style={{ ...headerBadgeBase, ...(role === 'agent' ? headerBadgeAgent : headerBadgeLlm) }}>
            {role === 'agent' ? 'Agent' : 'LLM'}
          </span>
        </span>
        <span data-provider-header-summary="" style={headerSummaryStyle}>{props.summary}</span>
        {props.status === undefined ? null : <span data-provider-header-status="" style={headerStatusStyle}>{props.status}</span>}
        {quota === undefined
          ? null
          : (
            <span data-provider-quota-mini="" style={headerMiniStyle}>
              <ProviderQuotaMeter {...quota} />
            </span>
          )}
      </span>
      <span style={headerSideStyle}>
        {props.unsaved === true && props.unsavedLabel !== undefined
          ? <span style={headerUnsavedStyle}>{props.unsavedLabel}</span>
          : null}
        <span data-provider-header-chevron="" aria-hidden="true" style={{ ...headerChevronStyle, transform: props.open ? 'rotate(180deg)' : 'none' }}>\u2304</span>
      </span>
    </>
  )
}

/**
 * Scoped provider chrome CSS: plain card reset, header button layout, body and
 * model rows, quota meter responsive rules, and coarse-pointer touch targets.
 * The shell injects it once per page; provider cards may also inject it once
 * for standalone use. Duplicate style tags are harmless: every rule is scoped
 * to a data-provider-* attribute and only narrows unstyled markup.
 */
export const providerUiCss = [
  '[data-provider-card]{margin:0;border:0;border-radius:0;background:none;box-shadow:none;overflow:visible}',
  '[data-provider-card-header]{box-sizing:border-box;width:100%;min-height:68px;display:flex;align-items:center;justify-content:space-between;gap:16px;border:0;padding:12px 14px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer}',
  '[data-provider-card-header]:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent)}',
  '[data-provider-body]{display:flex;flex-direction:column;gap:18px;border-top:1px solid var(--dsw-alias-border-l2);padding:16px 14px 18px}',
  '[data-provider-model]{display:flex;align-items:center;gap:9px;min-height:40px}',
  '[data-provider-quota-mini]{display:block}',
  '[data-providers-list]{display:flex;flex-direction:column}',
  '[data-providers-list] [data-sortable-row]+[data-sortable-row]{border-top:1px solid var(--dsw-alias-border-l2)}',
  '@media (max-width:680px){[data-provider-card-header]{min-height:76px;padding:14px 4px}[data-provider-quota-mini]{max-width:none}[data-provider-model]{min-height:48px}[data-provider-model] input{width:17px;height:17px}[data-providers-section] button,[data-provider-card] button{min-height:44px}}',
  '@media (pointer:coarse){[data-sortable-handle],[data-sortable-move]{min-width:44px;min-height:44px}}',
].join('\n')