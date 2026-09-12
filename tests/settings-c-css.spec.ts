import { describe, expect, it } from 'vitest'
import { settingsCCss } from '../src/client/settings-c-css.ts'

/**
 * The detail layout leans on a few hooks that are easy to delete by accident
 * (a substring cleanup once took the section hairline with the legacy row hook).
 */
describe('shared detail stylesheet', () => {
  it('separates the quota and model blocks with one hairline', () => {
    expect(settingsCCss).toContain('[data-providers-section] [data-provider-models]')
    expect(settingsCCss).toContain('[data-providers-section] [data-c-quota]')
    const rule = /\[data-provider-models\],\[data-providers-section\] \[data-c-quota\]\{[^}]*border-top:1px solid var\(--c-line\)/u
    expect(settingsCCss).toMatch(rule)
  })

  it('renders the draft bar as the prototype pane bar', () => {
    expect(settingsCCss).toMatch(/\.c-draft\{[^}]*border-top:1px solid var\(--c-line\)/u)
    expect(settingsCCss).toContain('.c-draft-actions{display:flex')
  })

  it('keeps the toolbar on one 96px-stable row without the legacy hooks', () => {
    expect(settingsCCss).toContain('.c-models-head{display:flex!important')
    expect(settingsCCss).toContain('flex-wrap:nowrap!important')
    expect(settingsCCss).toContain('.c-models-actions .c-btn.quiet{min-width:96px}')
    // The bracketed legacy hook must be gone; [data-provider-models] is the section wrapper.
    expect(settingsCCss).not.toMatch(/\[data-provider-model\]/u)
    expect(settingsCCss).not.toContain('.c-probe')
  })
})
