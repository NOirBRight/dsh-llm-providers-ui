// THROWAWAY browser check. Start pnpm prototype:providers first. No test framework or new dependency.
import assert from 'node:assert/strict';
// ponytail: reuse lab Playwright; set PLAYWRIGHT_MODULE to an installed module on another machine.
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || '/home/noirbright/.local/opt/dsh-staging/dsh-v0.1.2-rc.1-a66e470204/source/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs');
const base=process.env.PROTOTYPE_URL || 'http://127.0.0.1:4186/provider-settings-system.html';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
const errors=[],external=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('request',request=>{if(new URL(request.url()).origin!==new URL(base).origin)external.push(request.url());});
const act=(action,root=page)=>root.locator('[data-action="'+action+'"]');
const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function scenario(provider,name){await act('review').click();await page.locator('#review-provider').selectOption(provider);await page.locator('#review-scenario').selectOption(name);await act('apply-scenario').click();}
try {
  for(const width of [1440,836,390,320])for(const theme of ['light','dark'])for(const variant of ['A','B','C']){
    await page.setViewportSize({width,height:900});await page.goto(base+'?variant='+variant+'&theme='+theme+'&provider=codex');await settle();
    const state=await page.evaluate(()=>{const w=document.querySelector('.workspace');return {overflow:document.documentElement.scrollWidth>innerWidth||w.scrollWidth>w.clientWidth,models:document.querySelectorAll('.model-card').length,modelsFolded:[...document.querySelectorAll('.model-card')].some(n=>n.closest('details')),advancedOpen:document.querySelector('.advanced')?.open,decimal:/\d+\.\d+%/.test([...document.querySelectorAll('.meter-value')].map(n=>n.textContent).join(' '))};});
    assert.equal(state.overflow,false,JSON.stringify({width,theme,variant,state}));assert.equal(state.models,4);assert.equal(state.modelsFolded,false);assert.equal(state.advancedOpen,false);assert.equal(state.decimal,false);
  }
  console.log('PASS 24 layout / theme cases, models open, advanced closed, integer percentages');
  await page.setViewportSize({width:1440,height:1000});await page.goto(base+'?variant=B');
  const input=page.locator('[data-field=name]').first();await input.fill('Retained draft');await input.press('ArrowRight');assert.match(page.url(),/variant=B/);
  await page.locator('[data-advanced] summary').click();await page.locator('[data-control=enableSearch]').check();
  assert.equal(await page.locator('[data-control=searchMode]').isVisible(),true);await page.locator('[data-control=searchMode]').selectOption('live');
  await page.locator('[data-control=enableImageGeneration]').check();assert.equal(await page.locator('[data-control=imageGenerationModel]').isVisible(),true);
  const before=await page.locator('.rail-item').evaluateAll(ns=>ns.map(n=>n.dataset.provider));
  await act('sort-providers').click();assert.equal(await page.locator('#modal [role=meter]').count(),0);assert.equal(await page.locator('#modal [data-drag]').count(),8);
  await page.locator('[data-drag=codex]').press('ArrowDown');assert.equal(await page.locator('[data-sort-id]').first().getAttribute('data-sort-id'),'grok');
  await page.getByRole('button',{name:'取消',exact:true}).click();assert.deepEqual(await page.locator('.rail-item').evaluateAll(ns=>ns.map(n=>n.dataset.provider)),before);
  await act('sort-providers').click();await page.locator('[data-drag=codex]').press('ArrowDown');await act('commit-sort').click();
  assert.equal(await page.locator('.rail-item').first().getAttribute('data-provider'),'grok');assert.equal(await page.locator('[data-field=name]').first().inputValue(),'Retained draft');
  await act('sort-providers').click();
  const handle=await page.locator('[data-drag=grok]').boundingBox(),drop=await page.locator('[data-sort-id=codex]').boundingBox();
  await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2);await page.mouse.down();await page.mouse.move(drop.x+40,drop.y+drop.height*.8,{steps:10});await page.mouse.up();
  assert.equal(await page.locator('[data-sort-id]').first().getAttribute('data-sort-id'),'codex');await act('commit-sort').click();
  assert.equal(await page.locator('[data-field=name]').first().inputValue(),'Retained draft');
  await act('sort-models').click();const modelIds=await page.locator('[data-sort-id]').evaluateAll(ns=>ns.map(n=>n.dataset.sortId));await page.locator('[data-drag]').first().press('ArrowDown');await act('commit-sort').click();assert.equal(await page.locator('.model-card').first().getAttribute('data-model-row'),modelIds[1]);
  await act('catalog').click();await page.locator('#catalog-search').fill('1m');assert.ok(await page.locator('.candidate').count()>0);await page.locator('.candidate input').first().check();await act('apply-catalog').click();assert.equal(await page.locator('.model-card').count(),5);
  await act('save').click();await page.waitForFunction(()=>document.querySelector('#draftbar').textContent==='');
  await act('remove-model').first().click();assert.equal(await page.locator('.model-card').count(),4);await act('undo-remove').click();assert.equal(await page.locator('.model-card').count(),5);
  await page.locator('[data-field=thinking]').first().uncheck();assert.equal(await page.locator('[data-field=effort]').first().isDisabled(),true);assert.equal(await page.locator('[data-field=effort]').first().inputValue(),'');
  await act('discard').click();await act('confirm-action').click();assert.equal(await page.locator('[data-field=thinking]').first().isChecked(),true);
  const ids=page.locator('[data-field=id]');await ids.nth(1).fill(await ids.first().inputValue());await act('save').click();assert.match(await page.locator('#draftbar').textContent(),/未保存/);assert.match(await page.locator('[data-model-catalog]').textContent(),/不能重复/);
  await act('discard').click();await act('confirm-action').click();
  console.log('PASS catalog, editable parameters, validation, draft persistence, provider/model sorting and cancel');
  await scenario('codex','reauth');assert.equal(await page.getByRole('button',{name:'重新登录',exact:true}).count(),1);assert.equal(await page.locator('#draftbar').textContent(),'');
  await scenario('codex','zero');assert.equal(await page.locator('[role=meter][aria-valuenow="0"]').count(),1);
  await scenario('codex','empty');assert.equal(await page.locator('[role=meter]').count(),0);
  await scenario('codex','stale');assert.match(await page.locator('.provider-body').textContent(),/上次成功/);
  await scenario('codex','readonly');assert.equal(await page.locator('[data-field=id]').first().isDisabled(),true);assert.equal(await act('catalog').isDisabled(),true);
  await act('reset-demo').click();await page.locator('.rail-item[data-provider=cursor-acp]').click();assert.equal(await page.locator('[role=meter]').count(),0);assert.match(await page.locator('.provider-body').textContent(),/暂未提供额度查询/);
  await act('auth-start').click();assert.equal(await page.locator('#auth-input').count(),0);await act('auth-success').click();assert.equal(await page.locator('[role=meter]').count(),0);
  await act('reset-demo').click();await page.locator('.rail-item[data-provider=opencode]').click();
  const password=page.locator('[data-key=opencode]');await password.fill('prototype-not-a-secret');const thinking=page.locator('[data-field=thinking]').first();await thinking.setChecked(!(await thinking.isChecked()));
  assert.equal(await password.inputValue(),'prototype-not-a-secret');assert.equal(await password.getAttribute('type'),'password');
  assert.equal(await page.evaluate(()=>JSON.stringify(stateSnapshot()).includes('prototype-not-a-secret')||document.documentElement.outerHTML.includes('prototype-not-a-secret')),false);
  await act('save').click();await page.waitForFunction(()=>document.querySelector('#draftbar').textContent==='');assert.equal(await password.inputValue(),'');assert.equal(await page.locator('[role=meter]').count(),0);
  console.log('PASS password draft survives render, stays private, clears after save; old quota invalidated');
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
  console.log('PASS quota states, read-only, Cursor ACP auth/unsupported quota; no page errors, external requests or persistence');
} finally {await browser.close();}
