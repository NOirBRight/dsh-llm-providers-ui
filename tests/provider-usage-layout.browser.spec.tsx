/** Real component SSR in an isolated browser fixture; no production quota data is replaced. */
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { ProviderUsagePanel, type ProviderUsageSummary } from '../src/client/ProviderUsagePanel.tsx'

const providers: ProviderUsageSummary[] = ['cursor', 'grok', 'codex', 'ollama', 'commandcode', 'opencode'].map((providerKey, index) => ({
  providerKey, name: providerKey, status: index === 1 ? 'unsupported' : 'ready',
  windows: index === 1 ? [] : [{ id: 'fixture', label: 'Fixture', shortLabel: 'F', valueText: '60%', remainingPercent: 60 }],
}))

it('keeps status tiles equal-height and all three rows visible at narrow sidebar widths', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-usage-layout-'))
  const chrome = process.env.CHROME_BIN ?? (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome')
  const html = renderToStaticMarkup(createElement(ProviderUsagePanel, { providers, onRefresh() {}, onToggleVisibility() {}, onShowAll() {} }))
  try {
    for (const width of [240, 280]) for (const old of [false, true]) {
      const markup = old ? html.replace('min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:color-mix(in srgb,var(--dsw-alias-label-primary) 62%', 'color:color-mix(in srgb,var(--dsw-alias-label-primary) 62%') : html
      const page = join(dir, 'fixture.html')
      writeFileSync(page, '<!doctype html><meta charset="utf-8"><style>body{margin:0;width:' + width + 'px;font-family:sans-serif}*{box-sizing:border-box}</style>' + markup + '<pre id="result"></pre><script>const stage=document.querySelector(".pu-stage"),rows=[...document.querySelectorAll(".pu-row")];document.querySelector("#result").textContent=JSON.stringify({heights:rows.map(r=>r.getBoundingClientRect().height),full:rows[5].getBoundingClientRect().bottom<=stage.getBoundingClientRect().bottom,nowrap:getComputedStyle(document.querySelectorAll(".pu-primary")[1]).whiteSpace})</script>')
      const run = spawnSync(chrome, ['--headless', '--no-sandbox', '--disable-dev-shm-usage', '--user-data-dir=' + join(dir, 'chrome'), '--dump-dom', '--virtual-time-budget=500', 'file://' + page], { encoding: 'utf8', timeout: 30000 })
      expect(run.status, run.stderr).toBe(0)
      const result = JSON.parse(run.stdout.match(new RegExp('<pre id="result">(.*?)</pre>'))![1]!)
      if (old && width === 240) {
        expect(new Set(result.heights).size).toBeGreaterThan(1)
        expect(result.full).toBe(false)
      } else if (!old) {
        expect(new Set(result.heights).size).toBe(1)
        expect(result.nowrap).toBe('nowrap')
        expect(result.full).toBe(true)
      }
    }
  } finally { rmSync(dir, { recursive: true, force: true }) }
}, 90000)
