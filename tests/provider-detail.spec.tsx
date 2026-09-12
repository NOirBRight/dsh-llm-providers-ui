// @vitest-environment jsdom
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ProviderDetail, providerDetailCopy } from '../src/client/provider-detail.tsx'

const copy = providerDetailCopy.en

function html(overrides: Partial<Parameters<typeof ProviderDetail>[0]> = {}): string {
  return renderToStaticMarkup(createElement(ProviderDetail, {
    name: 'Grok',
    copy,
    quota: { status: 'ready', windows: [] },
    ...overrides,
  }))
}

describe('ProviderDetail', () => {
  it('renders the prototype C block order', () => {
    const markup = html({
      notice: 'Sign in with an xAI subscription.',
      account: { state: 'connected', label: 'demo@example.com' },
      quota: { status: 'ready', windows: [{ id: 'week', label: 'Week', shortLabel: 'W', remainingPercent: 83, valueText: '83%' }] },
      models: { count: 2 },
      advanced: createElement('p', null, 'Optional capabilities'),
      footer: 'Grok · v0.3.12',
      draft: createElement('button', { type: 'button' }, 'Save'),
    })
    // The template inlines its stylesheet; drop it so class names inside CSS text
    // cannot satisfy the order check.
    const body = markup.replace(/<style>[\s\S]*?<\/style>/, '')
    const order = ['c-detail-title', 'c-notice', 'c-account-group', 'data-c-quota', 'data-provider-models', 'c-advanced', 'c-footer', 'c-draft']
    let previous = -1
    for (const marker of order) {
      const at = body.indexOf(marker)
      expect(at, marker + ' should render').toBeGreaterThan(-1)
      expect(at, marker + ' should follow the previous block').toBeGreaterThan(previous)
      previous = at
    }
  })

  it('shows the connection state and the model count together', () => {
    const markup = html({ account: { state: 'configured' }, models: { count: 3 } })
    expect(markup).toContain(copy.configured)
    expect(markup).toContain('3 models')
  })

  it('formats reset captions and falls back when the provider sends none', () => {
    const markup = html({
      quota: {
        status: 'ready',
        windows: [
          { id: 'week', label: 'Week', shortLabel: 'W', remainingPercent: 83, valueText: '83%', resetsAt: '2026-09-14T12:26:00.000Z' },
          { id: 'month', label: 'Month', shortLabel: 'M', remainingPercent: 100, valueText: '100%' },
        ],
      },
    })
    expect(markup).toMatch(/Week|2026|9\//)
    expect(markup).toContain('Month · reset time not provided')
  })

  it('renders each quota status as copy instead of a fake bar', () => {
    expect(html({ quota: { status: 'unsupported', windows: [] } })).toContain(copy.unsupportedQuota)
    expect(html({ quota: { status: 'loading', windows: [] } })).toContain(copy.loadingQuota)
    expect(html({ quota: { status: 'error', windows: [] } })).toContain(copy.errorQuota)
    expect(html({ quota: { status: 'logged-out', windows: [] } })).toContain(copy.connectToSee)
  })

  it('keeps advanced settings folded and never touches their business content', () => {
    const markup = html({ advanced: createElement('label', null, createElement('input', { type: 'checkbox' }), 'Enable tool') })
    expect(markup).toContain('<details class="c-advanced">')
    expect(markup).not.toContain('<details class="c-advanced" open')
    expect(markup).toContain('Enable tool')
  })

  it('renders the models toolbar only for the handlers the plugin provides', () => {
    const bare = html({ models: { count: 0 } })
    expect(bare).not.toContain(copy.expandAll)
    const full = html({
      models: {
        count: 2,
        allOpen: false,
        onToggleAll: () => undefined,
        sorting: false,
        onToggleSorting: () => undefined,
        onChooseFromAccount: () => undefined,
      },
    })
    expect(full).toContain(copy.expandAll)
    expect(full).toContain(copy.sort)
    expect(full).toContain(copy.chooseFromAccount)
  })
  it('disables the sort action when the catalog cannot be reordered', () => {
    const markup = html({
      models: {
        count: 1,
        sorting: false,
        sortDisabled: true,
        onToggleSorting: () => undefined,
      },
    })
    // Icons and labels share one button, so compare against icon-free markup.
    const stripped = markup.replace(/<svg[\s\S]*?<\/svg>/g, '')
    expect(stripped).toMatch(/<button[^>]*disabled[^>]*>Sort<\/button>/)
  })

  it('renders the shared model rows and the add button from provider data', () => {
    const markup = html({
      models: {
        count: 2,
        items: [
          { rowId: 'r1', id: 'grok-4.6', name: 'Grok 4.6' },
          { rowId: 'r2', id: '', name: '' },
        ],
        expanded: ['r2'],
        onPatch: () => undefined,
        onRemove: () => undefined,
        onToggle: () => undefined,
        onReorder: () => undefined,
        onAdd: () => undefined,
        extra: () => createElement('p', null, 'Extra fields'),
      },
    })

    expect(markup).toContain('c-model-card')
    expect(markup).toContain('grok-4.6')
    expect(markup).toContain(copy.modelIdLabel)
    expect(markup).toContain(copy.modelNameLabel)
    expect(markup).toContain(copy.addModelLabel)
    expect(markup.split('data-model-row').length - 1).toBe(2)
    // Only the expanded row shows provider-specific fields.
    expect(markup.match(/Extra fields/g)?.length ?? 0).toBeGreaterThanOrEqual(1)
    // An empty id falls back to the row position for its labels.
    expect(markup).toContain('Remove 2')
  })

  it('puts the prototype icons on the three model actions', () => {
    const markup = html({
      models: {
        count: 1,
        allOpen: false,
        onToggleAll: () => undefined,
        sorting: false,
        onToggleSorting: () => undefined,
        onChooseFromAccount: () => undefined,
      },
    })
    const actions = markup.slice(markup.indexOf('c-models-actions'), markup.indexOf('c-models-hint'))
    expect(actions.match(/<svg/g)).toHaveLength(3)
  })
})