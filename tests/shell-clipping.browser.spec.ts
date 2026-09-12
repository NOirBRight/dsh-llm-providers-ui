/**
 * Browser regression: the Providers shell must not break host frame clipping.
 * Headless Chrome --dump-dom runs a labeled pure-CSS fixture (no production
 * runtime): a 100%-wide overflow:hidden frame holding role=dialog +
 * data-providers-section markers, a nav header, and a hidden 360px sheet parked
 * outside the frame at left:100%. Inline fixture JS reports JSON metrics.
 */
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const chrome = process.env.CHROME_BIN ?? (process.platform === 'darwin'
  ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  : 'google-chrome')

function measure(ruleCss: string): { cw: number, sw: number, hd: string } {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-shell-clip-'))
  try {
    const fixture = '<!doctype html><html><head><meta charset="utf-8"><style>\n'
      + 'html,body{margin:0;padding:0}\n#frame{width:100%;overflow:hidden;position:relative}\n'
      + '#sheet{position:absolute;left:100%;top:0;width:360px;height:200px}\n'
      + '</style><style id="rule">' + ruleCss + '</style></head><body>\n'
      + '<div id="frame"><div role="dialog"><nav><div id="nhead">title</div><div>cats</div></nav>'
      + '<div data-providers-section>providers</div></div><div id="sheet">hidden sheet</div></div>\n'
      + '<div id="m"></div><script>document.getElementById("m").textContent=JSON.stringify({cw:document.documentElement.clientWidth,sw:document.documentElement.scrollWidth,hd:getComputedStyle(document.getElementById("nhead")).display})<\/script></body></html>\n'
    const page = join(dir, 'fixture.html')
    writeFileSync(page, fixture)
    const run = spawnSync(chrome, ['--headless', '--dump-dom', '--virtual-time-budget=2000',
      '--no-sandbox', '--disable-dev-shm-usage', 'file://' + page], { encoding: 'utf8', timeout: 45000 })
    if (run.error !== undefined) throw run.error
    const metrics = run.stdout.match(/<div id="m">(.*?)<\/div>/)?.[1]
    expect(metrics).toBeDefined()
    return JSON.parse(metrics as string) as { cw: number, sw: number, hd: string }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

describe('providers shell clipping', () => {
  it('clips the offcanvas sheet, keeps the native header, and fails on the old override', () => {
    const source = readFileSync(new URL('../src/client/ProvidersSection.tsx', import.meta.url), 'utf8')
    const shellCss = source.match(/const providerShellCss = `([\s\S]*?)`/)?.[1]
    expect(shellCss).toBeDefined()
    expect(shellCss).not.toContain('overflow:visible')
    expect(shellCss).not.toContain('>nav>div:first-child{display:none}')
    const fixed = measure(shellCss as string)
    expect(fixed.sw).toBe(fixed.cw)
    expect(fixed.hd).not.toBe('none')
    // Must-fail control: the old override inflates the document past the viewport.
    const oldCss = (shellCss as string).replace('visibility:visible!important;', 'visibility:visible!important;overflow:visible!important;')
    const inflated = measure(oldCss)
    expect(inflated.sw).toBeGreaterThan(inflated.cw)
  }, 90000)
})
