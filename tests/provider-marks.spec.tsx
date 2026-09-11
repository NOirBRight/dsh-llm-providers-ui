import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ProviderMark } from '../src/client/provider-marks.tsx'

function mark(key: string): string {
  return renderToStaticMarkup(createElement(ProviderMark, { providerKey: key }))
}

describe('ProviderMark', () => {
  it('renders the supplied Antigravity silhouette', () => {
    const html = mark('antigravity')
    expect(html).toContain('<svg')
    expect(html).toContain('viewBox="0 0 169 148"')
  })

  it('renders the supplied CommandCode squircle with theme-token cutout', () => {
    const html = mark('commandcode')
    expect(html).toContain('<svg')
    expect(html).toContain('viewBox="0 0 137 137"')
    // Canonical BrandMark: currentColor squircle plus bg-layer-1 glyph cutout for light/dark.
    expect(html).toContain('fill="currentColor"')
    expect(html).toContain('var(--dsw-alias-bg-layer-1)')
  })

  it('renders the DeepSeek fish for deepseek and deepseek-official', () => {
    for (const key of ['deepseek', 'deepseek-official', 'llm-deepseek-official']) {
      const html = mark(key)
      expect(html).toContain('<svg')
      expect(html).toContain('viewBox="0 0 23.16 17.04"')
    }
  })

  it('maps every live catalog id to a mark', () => {
    for (const key of ['deepseek-official', 'codex', 'grok', 'opencode-go', 'antigravity']) {
      expect(mark(key)).toContain('<svg')
    }
  })

  it('renders a generic globe for truly unknown keys', () => {
    const html = mark('llm-unknown')
    expect(html).toContain('<svg')
    expect(html).toContain('viewBox="0 0 14 14"')
  })
})
