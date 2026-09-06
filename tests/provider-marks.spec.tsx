import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ProviderMark } from '../src/client/provider-marks.tsx'

describe('ProviderMark', () => {
  it('renders the supplied Antigravity silhouette instead of the initial', () => {
    const html = renderToStaticMarkup(createElement(ProviderMark, { providerKey: 'antigravity', fallback: 'A' }))
    expect(html).toContain('<svg')
    expect(html).toContain('viewBox="0 0 169 148"')
    expect(html).not.toContain('>A<')
  })

  it('falls back to the initial for unknown keys', () => {
    const html = renderToStaticMarkup(createElement(ProviderMark, { providerKey: 'llm-unknown', fallback: 'X' }))
    expect(html).toContain('>X<')
    expect(html).not.toContain('<svg')
  })
})