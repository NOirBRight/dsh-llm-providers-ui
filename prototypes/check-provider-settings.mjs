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
const settle=(target=page)=>target.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function scenario(provider,name){await act('review').click();await page.locator('#review-provider').selectOption(provider);await page.locator('#review-scenario').selectOption(name);await act('apply-scenario').click();}
try {
  for(const width of [1440,836,390,320])for(const theme of ['light','dark'])for(const variant of ['A','B','C']){
    await page.setViewportSize({width,height:900});await page.goto(base+'?variant='+variant+'&theme='+theme+'&provider=codex');await settle();
    const state=await page.evaluate(()=>{const w=document.querySelector('.workspace');return {overflow:document.documentElement.scrollWidth>innerWidth||w.scrollWidth>w.clientWidth,models:document.querySelectorAll('.model-card').length,parametersHidden:document.querySelectorAll('.model-parameters[hidden]').length,segmented:[...document.querySelectorAll('.track')].every(n=>getComputedStyle(n,'::after').backgroundImage.includes('repeating-linear-gradient')),equalTracks:(()=>{const widths=[...document.querySelectorAll('.quota-list .track')].map(n=>n.getBoundingClientRect().width);return Math.max(...widths)-Math.min(...widths)<1;})(),advancedOpen:document.querySelector('.advanced')?.open,decimal:/\d+\.\d+%/.test([...document.querySelectorAll('.meter-value')].map(n=>n.textContent).join(' '))};});
    assert.equal(state.overflow,false,JSON.stringify({width,theme,variant,state}));assert.equal(state.models,4);assert.equal(state.parametersHidden,0);assert.equal(state.segmented,true);assert.equal(state.equalTracks,true);assert.equal(state.advancedOpen,false);assert.equal(state.decimal,false);
  }
  console.log('PASS 24 layout / theme cases, native segmented meters, model parameters default open');
  await page.setViewportSize({width:1440,height:1000});await page.goto(base+'?variant=B');
  const initialConfig=await page.evaluate(()=>JSON.stringify(config(getP('codex'))));
  await act('toggle-model').first().click();assert.equal(await page.locator('[data-field=context]').first().isVisible(),false);assert.equal(await page.locator('[data-field=id]').first().isVisible(),true);
  await act('toggle-models').click();assert.equal(await page.locator('.model-parameters[hidden]').count(),4);await act('toggle-models').click();assert.equal(await page.locator('.model-parameters[hidden]').count(),0);
  assert.equal(await page.evaluate(()=>JSON.stringify(config(getP('codex')))),initialConfig);assert.equal(await page.locator('#draftbar').textContent(),'');await act('toggle-model').first().click();
  const input=page.locator('[data-field=name]').first();await input.fill('Retained draft');await input.press('ArrowRight');assert.match(page.url(),/variant=B/);
  await page.locator('[data-advanced] summary').click();await page.locator('[data-control=enableSearch]').check();
  assert.equal(await page.locator('[data-control=searchMode]').isVisible(),true);await page.locator('[data-control=searchMode]').selectOption('live');
  await page.locator('[data-control=enableImageGeneration]').check();assert.equal(await page.locator('[data-control=imageGenerationModel]').isVisible(),true);
  const before=await page.locator('.rail-item').evaluateAll(ns=>ns.map(n=>n.dataset.provider));
  await act('sort-providers').click();assert.equal(await page.locator('#modal').evaluate(n=>n.open),false);assert.equal(await page.locator('#workspace [data-drag]').count(),8);
  await page.locator('[data-drag=codex]').press('ArrowDown');assert.equal(await page.locator('[data-sort-id]').first().getAttribute('data-sort-id'),'grok');
  await act('cancel-sort').click();assert.deepEqual(await page.locator('.rail-item').evaluateAll(ns=>ns.map(n=>n.dataset.provider)),before);
  await act('sort-providers').click();await page.locator('[data-drag=codex]').press('ArrowDown');await act('commit-sort').click();
  assert.equal(await page.locator('.rail-item').first().getAttribute('data-provider'),'grok');assert.equal(await page.locator('[data-field=name]').first().inputValue(),'Retained draft');
  await act('sort-providers').click();
  const handle=await page.locator('[data-drag=grok]').boundingBox(),drop=await page.locator('[data-sort-id=codex]').boundingBox();
  await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2);await page.mouse.down();await page.mouse.move(drop.x+40,drop.y+drop.height*.8,{steps:10});await page.mouse.up();
  assert.equal(await page.locator('[data-sort-id]').first().getAttribute('data-sort-id'),'codex');await act('commit-sort').click();
  assert.equal(await page.locator('[data-field=name]').first().inputValue(),'Retained draft');
  await act('sort-models').click();const modelIds=await page.locator('[data-sort-id]').evaluateAll(ns=>ns.map(n=>n.dataset.sortId));await page.locator('[data-drag]').first().press('ArrowDown');await act('commit-sort').click();assert.equal(await page.locator('.model-card').first().getAttribute('data-model-row'),modelIds[1]);assert.equal(await page.locator('[data-model-row="gpt-5.6-sol"] [data-action=toggle-model]').getAttribute('aria-expanded'),'false');
  await act('catalog').click();await page.locator('#catalog-search').fill('1m');assert.ok(await page.locator('.candidate').count()>0);await page.locator('.candidate input').first().check();await act('apply-catalog').click();assert.equal(await page.locator('.model-card').count(),5);
  await act('save').click();await page.waitForFunction(()=>document.querySelector('#draftbar').textContent==='');
  await act('remove-model').first().click();assert.equal(await page.locator('.model-card').count(),4);await act('undo-remove').click();assert.equal(await page.locator('.model-card').count(),5);
  await page.locator('[data-field=thinking]').first().uncheck();assert.equal(await page.locator('[data-field=effort]').first().isDisabled(),true);assert.equal(await page.locator('[data-field=effort]').first().inputValue(),'');
  await act('discard').click();await act('confirm-action').click();assert.equal(await page.locator('[data-field=thinking]').first().isChecked(),true);
  const ids=page.locator('[data-field=id]');await ids.nth(1).fill(await ids.first().inputValue());await act('save').click();assert.match(await page.locator('#draftbar').textContent(),/未保存/);assert.match(await page.locator('[data-model-catalog]').textContent(),/不能重复/);
  await act('discard').click();await act('confirm-action').click();
  console.log('PASS model collapse/expand, catalog, validation, drafts, inline provider/model sorting and cancel');
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
  const mobile=await browser.newPage({isMobile:true,hasTouch:true});mobile.on('pageerror',e=>errors.push(e.message));
  const cdp=await mobile.context().newCDPSession(mobile);
  for(const [width,height] of [[320,640],[390,844],[430,932],[844,390],[390,350]]){
    await mobile.setViewportSize({width,height});await mobile.goto(base+'?variant=B&provider=codex');
    await mobile.evaluate(()=>{document.documentElement.style.setProperty('--safe-top','24px');document.documentElement.style.setProperty('--safe-bottom','34px');});
    await act('toggle-model',mobile).first().click();await mobile.locator('[data-field=name]').first().fill('手机草稿');await act('sort-models',mobile).click();await settle(mobile);
    const geometry=await mobile.evaluate(()=>{const w=document.querySelector('.workspace'),f=document.querySelector('.draftbar').getBoundingClientRect(),bar=document.querySelector('.prototype-bar').getBoundingClientRect(),grip=document.querySelector('[data-drag]').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth||w.scrollWidth>w.clientWidth,space:w.clientHeight,footer:f.bottom,barTop:bar.top,barBottom:bar.bottom,gripWidth:grip.width,gripHeight:grip.height,visibleGrip:Math.min(w.getBoundingClientRect().bottom,grip.bottom)-Math.max(w.getBoundingClientRect().top,grip.top),dialog:document.querySelector('#modal').open};});
    assert.equal(geometry.overflow,false,JSON.stringify({width,height,geometry}));assert.equal(geometry.dialog,false);assert.ok(geometry.space>=44);assert.ok(geometry.footer<geometry.barTop);assert.ok(geometry.barBottom<=height-34);assert.ok(geometry.gripWidth>=44&&geometry.gripHeight>=44);assert.ok(geometry.visibleGrip>=44,JSON.stringify({width,height,geometry}));
    if(width===390&&height===844){
      const from=await mobile.locator('[data-drag]').first().boundingBox(),to=await mobile.locator('[data-sort-id]').nth(1).boundingBox();
      const x=from.x+from.width/2,y=from.y+from.height/2,end=to.y+to.height*.8;
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
      for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+(end-y)*i/8}]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await mobile.locator('[data-sort-id]').first().getAttribute('data-sort-id'),'gpt-5.6-sol-fast');
    }
    await act('cancel-sort',mobile).click();await settle(mobile);
    const toastPosition=await mobile.evaluate(()=>({toast:document.querySelector('#toast').getBoundingClientRect().bottom,bar:document.querySelector('.prototype-bar').getBoundingClientRect().top,footer:document.querySelector('.draftbar').getBoundingClientRect().top}));assert.ok(toastPosition.toast<Math.min(toastPosition.bar,toastPosition.footer));
    assert.equal(await mobile.locator('[data-field=name]').first().inputValue(),'手机草稿');assert.equal(await act('toggle-model',mobile).first().getAttribute('aria-expanded'),'false');assert.equal(await mobile.locator('[data-field=name]').first().evaluate(n=>getComputedStyle(n).fontSize),'16px');
  }
  await act('sort-providers',mobile).click();await settle(mobile);
  const edgeHandle=await mobile.locator('[data-drag]').first().boundingBox(),sortViewport=await mobile.locator('#workspace').boundingBox(),startScroll=await mobile.locator('#workspace').evaluate(n=>n.scrollTop);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:edgeHandle.x+22,y:edgeHandle.y+22}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:edgeHandle.x+22,y:sortViewport.y+sortViewport.height-6}]});
  await mobile.waitForFunction(start=>document.querySelector('#workspace').scrollTop>start+50,startScroll,{timeout:5000});await mobile.keyboard.press('Escape');await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.equal(await mobile.locator('.inline-sort,.sort-ghost').count(),0);assert.equal(await mobile.locator('[data-field=name]').first().inputValue(),'手机草稿');
  await mobile.close();console.log('PASS phone portrait/landscape/short viewport, safe areas, 44px handles, touch sorting and view/draft preservation');
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
  console.log('PASS quota states, read-only, Cursor ACP auth/unsupported quota; no page errors, external requests or persistence');
} finally {await browser.close();}
