import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  normalizeQuotaRemaining,
  ProviderCardHeader,
  ProviderQuotaMeter,
  providerUiCss,
} from '../src/client/provider-ui.tsx'

describe('normalizeQuotaRemaining', () => {
  it('passes valid percents through with full precision', () => {
    expect(normalizeQuotaRemaining({ remainingPercent: 76 })).toBe(76)
    expect(normalizeQuotaRemaining({ remainingPercent: 99.9 })).toBe(99.9)
    expect(normalizeQuotaRemaining({ remainingPercent: 0 })).toBe(0)
    expect(normalizeQuotaRemaining({ remainingPercent: 100 })).toBe(100)
  })

  it('treats NaN, Infinity, and out-of-range percents as unavailable', () => {
    expect(normalizeQuotaRemaining({})).toBeUndefined()
    expect(normalizeQuotaRemaining({ remainingPercent: Number.NaN })).toBeUndefined()
    expect(normalizeQuotaRemaining({ remainingPercent: Number.POSITIVE_INFINITY })).toBeUndefined()
    expect(normalizeQuotaRemaining({ remainingPercent: -3 })).toBeUndefined()
    expect(normalizeQuotaRemaining({ remainingPercent: 150 })).toBeUndefined()
  })

  it('falls back to fractions only inside 0-1', () => {
    expect(normalizeQuotaRemaining({ remainingFraction: 0.5 })).toBe(50)
    expect(normalizeQuotaRemaining({ remainingFraction: 0 })).toBe(0)
    expect(normalizeQuotaRemaining({ remainingFraction: 1 })).toBe(100)
    expect(normalizeQuotaRemaining({ remainingFraction: 2 })).toBeUndefined()
    expect(normalizeQuotaRemaining({ remainingFraction: -0.5 })).toBeUndefined()
  })

  it('prefers percent over fraction', () => {
    expect(normalizeQuotaRemaining({ remainingPercent: 30, remainingFraction: 0.9 })).toBe(30)
  })
})

describe('ProviderQuotaMeter', () => {
  it('renders a placeholder without a meter role when quota is missing', () => {
    const html = renderToStaticMarkup(createElement(ProviderQuotaMeter, { label: '5h' }))
    expect(html).toContain('data-provider-quota-missing')
    expect(html).not.toContain('role="meter"')
  })

  it('renders a real empty bar for zero remaining', () => {
    const html = renderToStaticMarkup(createElement(ProviderQuotaMeter, { remainingPercent: 0, label: 'Month' }))
    expect(html).toContain('role="meter"')
    expect(html).toContain('aria-valuenow="0"')
    expect(html).toContain('width:0%')
  })

  it('renders a full bar for one hundred remaining', () => {
    const html = renderToStaticMarkup(createElement(ProviderQuotaMeter, { remainingPercent: 100, label: 'Week' }))
    expect(html).toContain('aria-valuenow="100"')
    expect(html).toContain('width:100%')
  })

  it('keeps fractional precision instead of rounding to full', () => {
    const html = renderToStaticMarkup(createElement(ProviderQuotaMeter, { remainingPercent: 99.9, label: '5h' }))
    expect(html).toContain('aria-valuenow="99.9"')
    expect(html).toContain('99.9%')
  })

  it('uses one amber semantic fill below 20 with no red tier', () => {
    const low = renderToStaticMarkup(createElement(ProviderQuotaMeter, { remainingPercent: 5, label: 'Month' }))
    expect(low).toContain('var(--dsw-alias-state-warn-primary)')
    const edge = renderToStaticMarkup(createElement(ProviderQuotaMeter, { remainingPercent: 19.9, label: 'Month' }))
    expect(edge).toContain('var(--dsw-alias-state-warn-primary)')
    const ok = renderToStaticMarkup(createElement(ProviderQuotaMeter, { remainingPercent: 20, label: 'Month' }))
    expect(ok).not.toContain('var(--dsw-alias-state-warn-primary)')
  })

  it('renders header and meter without hardcoded hues', () => {
    const html = renderToStaticMarkup(createElement(ProviderCardHeader, {
      title: 'Cursor',
      mark: createElement('span', {}, 'Cu'),
      summary: '1 model',
      open: false,
      role: 'agent',
      status: 'signed in',
      quota: { remainingPercent: 8, label: 'Month' },
    }))
    expect(html).not.toMatch(/#[0-9a-f]{6}/iu)
  })
})

describe('ProviderCardHeader', () => {
  it('keeps the legacy codex layout with an LLM badge by default', () => {
    const html = renderToStaticMarkup(createElement(ProviderCardHeader, {
      title: 'Codex',
      mark: createElement('span', {}, 'C'),
      summary: 'online · 8 models',
      open: false,
    }))
    expect(html).toContain('Codex')
    expect(html).toContain('online · 8 models')
    expect(html).toContain('data-provider-role-badge="llm"')
    expect(html).toContain('>LLM</span>')
    expect(html).not.toContain('data-provider-header-status')
    expect(html).not.toContain('data-provider-quota-mini')
  })

  it('renders the monochrome Agent badge for agent cards', () => {
    const html = renderToStaticMarkup(createElement(ProviderCardHeader, {
      title: 'Antigravity',
      mark: createElement('span', {}, 'A'),
      summary: 'online · 3 models',
      open: true,
      role: 'agent',
    }))
    expect(html).toContain('data-provider-role-badge="agent"')
    expect(html).toContain('>Agent</span>')
  })

  it('renders caller status separately without duplicating the summary', () => {
    const html = renderToStaticMarkup(createElement(ProviderCardHeader, {
      title: 'Codex',
      mark: createElement('span', {}, 'C'),
      summary: '8 models',
      open: false,
      status: 'signed in',
    }))
    expect(html).toContain('data-provider-header-status')
    expect(html).toContain('signed in')
    expect(html.match(/8 models/g)?.length).toBe(1)
  })


describe('ProviderCardHeader reference geometry', () => {
  it('lays identity, quota, status, and chevron left to right', () => {
    const html = renderToStaticMarkup(createElement(ProviderCardHeader, {
      title: 'Codex',
      mark: createElement('span', {}, 'C'),
      summary: '8 models',
      open: false,
      role: 'llm',
      status: 'signed in',
      quota: { remainingPercent: 76, label: '5h' },
    }))
    const order = ['data-provider-header-identity', 'data-provider-quota-mini', 'data-provider-header-status', 'data-provider-header-chevron']
      .map(attr => html.indexOf(attr))
    expect(order.every(index => index >= 0)).toBe(true)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
  })

  it('gives LLM a message glyph and Agent a terminal glyph', () => {
    const base = { title: 'X', mark: createElement('span', {}, 'X'), summary: 's', open: false } as const
    expect(renderToStaticMarkup(createElement(ProviderCardHeader, { ...base, role: 'llm' }))).toContain('M5 6h6')
    expect(renderToStaticMarkup(createElement(ProviderCardHeader, { ...base, role: 'agent' }))).toContain('m5 0h3')
  })

  it('uses verified border-l2 on the LLM badge, never border-secondary', () => {
    const html = renderToStaticMarkup(createElement(ProviderCardHeader, {
      title: 'X', mark: createElement('span', {}, 'X'), summary: 's', open: false, role: 'llm',
    }))
    expect(html).toContain('var(--dsw-alias-border-l2)')
    expect(html).not.toContain('border-secondary')
  })

  it('sizes the header row on desktop and stacks it on mobile', () => {
    expect(providerUiCss).toContain('min-height:76px')
    expect(providerUiCss).toContain('min-height:106px')
    expect(providerUiCss).toContain('grid-template-columns:minmax(0,1fr) auto')
    expect(providerUiCss).toContain('[data-provider-quota-mini]{grid-column:1;grid-row:2')
    expect(providerUiCss).toContain('[data-provider-header-status]{grid-column:2;grid-row:2')
  })
})
  it('renders a zero quota meter without treating it as missing', () => {
    const html = renderToStaticMarkup(createElement(ProviderCardHeader, {
      title: 'Cursor',
      mark: createElement('span', {}, 'Cu'),
      summary: '1 model',
      open: false,
      quota: { remainingPercent: 0, label: 'Month' },
    }))
    expect(html).toContain('data-provider-quota-mini')
    expect(html).toContain('aria-valuenow="0"')
  })
})