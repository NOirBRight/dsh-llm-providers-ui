/** Live UI smoke for the existing authenticated 3082 lab. Start an isolated Chrome with CDP on 9229 first. */
import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'

const tabs = await (await fetch('http://127.0.0.1:9229/json')).json()
const tab = tabs.find(tab => tab.type === 'page' && new URL(tab.url).origin === 'http://127.0.0.1:3082')
assert.ok(tab, 'Authenticate the existing 3082 lab in this isolated browser first')
const ws = new WebSocket(tab.webSocketDebuggerUrl)
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }))
let id = 0
const pending = new Map()
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data)
  const resolve = pending.get(message.id)
  if (resolve) { pending.delete(message.id); resolve(message) }
})
async function call(method, params = {}) {
  const requestId = ++id
  const result = new Promise(resolve => pending.set(requestId, resolve))
  ws.send(JSON.stringify({ id: requestId, method, params }))
  const message = await result
  assert.ok(!message.error, method + ' failed')
  return message.result
}
async function evaluate(expression) {
  const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  assert.ok(!result.exceptionDetails, 'Browser assertion/evaluation failed')
  return result.result.value
}
async function wait(expression) {
  return evaluate('new Promise((resolve,reject)=>{const end=Date.now()+20000;function check(){if(' + expression + ')resolve(true);else if(Date.now()>end)reject(Error("UI wait timeout"));else requestAnimationFrame(check)}check()})')
}
async function click(text) {
  await wait('[...document.querySelectorAll("button")].some(b=>b.textContent.trim()===' + JSON.stringify(text) + '&&b.getClientRects().length)')
  await evaluate('(()=>{const b=[...document.querySelectorAll("button")].find(b=>b.textContent.trim()===' + JSON.stringify(text) + '&&b.getClientRects().length);if(!b)throw Error("missing button");b.click()})()')
}
async function providers() {
  if (!await evaluate('Boolean(document.querySelector("[data-providers-section]"))')) await click('LLM Providers')
  await wait('document.querySelectorAll("[data-providers-section] [data-provider-card]").length===7')
  await wait('document.querySelector("[data-provider-card=antigravity] [data-provider-header-status]")?.textContent==="Connected" && Boolean(document.querySelector("[data-provider-card=antigravity] [role=meter]"))')
  await wait('[...document.querySelectorAll("[data-provider-card]")].every(c=>c.querySelector("[data-provider-card-header][aria-expanded=false] [data-provider-quota-mini]"))')
  await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))')
}
async function screenshot(name) {
  const image = await call('Page.captureScreenshot', { format: 'png' })
  await writeFile('/tmp/' + name + '.png', Buffer.from(image.data, 'base64'))
}
await call('Page.enable')
await call('Runtime.enable')
await call('Page.bringToFront')
await wait('[...document.querySelectorAll("button")].some(b=>b.getAttribute("aria-label")==="Open sidebar"||["Settings","General"].includes(b.textContent.trim()))')
let originalTheme
try {
  if (!await evaluate('[...document.querySelectorAll("button")].some(b=>b.textContent.trim()==="General")')) {
    await evaluate('[...document.querySelectorAll("button")].find(b=>b.getAttribute("aria-label")==="Open sidebar")?.click()')
    await click('Settings')
  }
  await click('General')
  originalTheme = await evaluate('[...document.querySelectorAll("button[aria-pressed=true]")].find(b=>["Light","Dark","System"].includes(b.textContent.trim()))?.textContent.trim()')
  assert.ok(originalTheme, 'Current theme selection is observable')
  for (const width of [1280, 390, 320]) for (const theme of ['Light', 'Dark']) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 960, deviceScaleFactor: 1, mobile: width < 681 })
    await call('Emulation.setTouchEmulationEnabled', { enabled: width < 681 })
    await click('General')
    await click(theme)
    await providers()
    const data = await evaluate('(()=>{const section=document.querySelector("[data-providers-section]"),cards=[...section.querySelectorAll("[data-provider-card]")];return {roles:cards.map(c=>c.getAttribute("data-provider-role")),icons:cards.filter(c=>c.querySelector("[data-provider-header-mark] svg")).length,overflow:document.documentElement.scrollWidth>innerWidth,cardsOverflow:cards.some(c=>c.scrollWidth>c.clientWidth+1),badges:section.querySelectorAll("[data-provider-role-badge]").length}})()')
    assert.equal(data.icons, 7, 'Every card has a brand mark')
    assert.equal(data.badges, 7, 'No duplicate role badges')
    assert.equal(data.roles.filter(role => role === 'agent').length, 1)
    assert.equal(data.overflow, false, 'Document overflow at ' + width)
    assert.equal(data.cardsOverflow, false, 'Card overflow at ' + width)
    const alignment = await evaluate('(()=>{const headers=[...document.querySelectorAll("[data-provider-card-header]")];return {padding:headers.map(h=>parseFloat(getComputedStyle(h).paddingLeft)),right:headers.map(h=>h.querySelector("[data-provider-header-chevron]").getBoundingClientRect().right)}})()')
    assert.ok(alignment.padding.every(padding=>padding === (width < 681 ? 4 : 14)), 'Consistent shared header padding')
    assert.ok(Math.max(...alignment.right)-Math.min(...alignment.right)<2, 'Chevrons align across all Provider cards')
    assert.equal(await evaluate('(()=>{const headers=[...document.querySelectorAll("[data-provider-card-header]")];return headers.filter(h=>{const r=h.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight}).every(h=>{const r=h.getBoundingClientRect();return h.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2))})})()'), true, 'Provider headers must not be occluded by the sidebar or conversation')
    await screenshot('lab-providers-' + width + '-' + theme.toLowerCase())
    await evaluate('document.querySelector("[data-provider-card=antigravity] [data-provider-card-header]").click()')
    await wait('document.querySelector("[data-provider-card=antigravity] [data-provider-card-header]").getAttribute("aria-expanded")==="true"')
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'), true, 'Expanded Antigravity overflow')
    assert.equal(await evaluate('Boolean(document.querySelector("[data-provider-card=antigravity] details"))'), false, 'Runtime internals must not occupy the normal settings card')
    await screenshot('lab-antigravity-' + width + '-' + theme.toLowerCase())
    await evaluate('document.querySelector("[data-provider-card=antigravity] [data-provider-card-header]").click()')
    console.log('PASS layout ' + width + ' ' + theme)
  }
  console.log('PASS seven real providers, brand/role icons, collapsed/expanded layout in light/dark at 1280/390/320; no provider auth/config writes')
} finally {
  try {
    if (originalTheme) {
      await call('Emulation.setDeviceMetricsOverride', { width: 1280, height: 960, deviceScaleFactor: 1, mobile: false })
      await call('Emulation.setTouchEmulationEnabled', { enabled: false })
      await click('General')
      await click(originalTheme)
    }
  } finally { ws.close() }
}
