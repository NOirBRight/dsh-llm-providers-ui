// THROWAWAY: pnpm prototype:usage-popover, then node prototypes/check-usage-popover.mjs.
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'/home/noirbright/.local/opt/dsh-staging/dsh-v0.1.2-rc.1-a66e470204/source/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs');
const base=process.env.PROTOTYPE_URL||'http://127.0.0.1:4187/provider-settings-system.html',browser=await chromium.launch({headless:true}),errors=[],external=[];
const act=(p,name)=>p.locator('[data-action="'+name+'"]');
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function pageFor(width=1280,height=900,theme='light',variant='B'){
  const p=await browser.newPage({viewport:{width,height},hasTouch:width<600});p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
  await p.goto(base+'?surface=task&variant='+variant+'&inspect=codex&theme='+theme);await settle(p);return p;
}
async function choose(p,id){await p.locator('#usage-lab>summary').click();await p.locator('#usage-provider-select').selectOption(id);await settle(p);}
async function scenario(p,id){await p.locator('#usage-lab>summary').click();await p.locator('#usage-scenario-select').selectOption(id);await settle(p);}
try{
  for(const [width,height] of [[1280,900],[836,850],[390,844],[320,640],[844,390],[390,350]])for(const theme of ['light','dark']){
    const p=await pageFor(width,height,theme),surface=p.locator('#usage-inspector');
    for(const [id,windows] of [['grok',1],['cursor',2],['codex',3]]){
      await choose(p,id);assert.equal(await surface.isVisible(),true);assert.equal(await p.locator('.usage-content [role=meter]').count(),windows);assert.equal(await surface.locator('[data-system-zone]').count(),1);
      const shape=await surface.boundingBox(),bar=await p.locator('.prototype-bar').boundingBox();assert.ok(shape.x>=0&&shape.x+shape.width<=width+1&&shape.y>=0&&shape.y+shape.height<=bar.y+1,JSON.stringify({id,width,height,shape,bar}));
      for(const action of ['usage-refresh-all','usage-refresh','usage-close','usage-settings']){const box=await act(p,action).boundingBox();assert.ok(box.height>=44&&box.width>=44,action);assert.ok(box.y>=0&&box.y+box.height<=bar.y+1,JSON.stringify({id,width,height,action,box}));}
      assert.equal(await surface.evaluate(n=>n.scrollWidth>n.clientWidth+1),false);assert.equal(await p.locator('#task-usage-cards').isVisible(),false);
      const text=await surface.innerText();for(const omitted of ['账户额度','各窗口独立计量','更新时间未提供','Personal Usage'])assert.equal(text.includes(omitted),false,omitted);
    }
    if(width<=620)assert.equal(await p.locator('.task-chat').isVisible(),false);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.equal(await p.locator('.task-usage-card[title]').count(),0);
    await p.keyboard.press('Escape');assert.equal(await surface.isVisible(),false);assert.equal(await p.evaluate(()=>document.activeElement.dataset.provider),'codex');
    const tile=p.locator('.task-usage-card[data-provider=codex]');if(width<600)await tile.tap();else await tile.press('Enter');assert.equal(await surface.isVisible(),true);await act(p,'usage-close').click();await p.close();
  }
  console.log('PASS one/two/three-window content, 12 viewport/themes, compact controls, touch and focus return');
  const p=await pageFor(),surface=p.locator('#usage-inspector');const heights=[];
  for(const id of ['grok','cursor','codex']){await choose(p,id);heights.push((await surface.boundingBox()).height);assert.equal(await p.locator('.usage-content').evaluate(n=>n.scrollHeight>n.clientHeight+1),false,'no needless scrolling: '+id);}
  assert.ok(heights[0]<heights[1]&&heights[1]<heights[2],JSON.stringify(heights));
  await choose(p,'cursor');const collapsed=(await surface.boundingBox()).height;await p.locator('.usage-more>summary').click();await settle(p);assert.ok((await surface.boundingBox()).height>collapsed);assert.ok((await surface.innerText()).includes('Personal Usage'));await p.locator('.usage-more>summary').click();await settle(p);assert.ok(Math.abs((await surface.boundingBox()).height-collapsed)<1);
  await p.locator('#usage-draft').fill('retained conversation draft');await p.locator('#usage-draft').press('ArrowRight');assert.equal(await p.evaluate(()=>usageVariant),'B');assert.equal(await surface.isVisible(),true);
  await p.evaluate(()=>{window.refreshCalls=[];const original=refresh;refresh=p=>{refreshCalls.push(p.id);original(p);};getP('grok').connected=false;getP('ollama').quota.status='unsupported';window.keptBody=document.querySelector('.usage-content').firstChild;window.keptRefresh=document.querySelector('[data-action=usage-refresh-all]');render();});
  const eligible=await p.evaluate(()=>providers.filter(usageCanRefresh).map(p=>p.id));await act(p,'usage-refresh').click();await act(p,'usage-refresh-all').click();
  assert.deepEqual(await p.evaluate(()=>providers.filter(p=>p.refreshing).map(p=>p.id)),eligible);await act(p,'usage-refresh-all').click({force:true});assert.deepEqual((await p.evaluate(()=>refreshCalls)).sort(),[...eligible].sort());
  assert.equal(await act(p,'usage-refresh-all').getAttribute('aria-disabled'),'true');assert.equal(await act(p,'usage-refresh-all').evaluate(n=>document.activeElement===n&&n===window.keptRefresh),true);assert.equal(await p.evaluate(()=>document.querySelector('.usage-content').firstChild===window.keptBody),true);
  await p.waitForFunction(()=>providers.every(p=>!p.refreshing));assert.deepEqual(await p.evaluate(()=>providers.filter(p=>p.updated).map(p=>p.id)),eligible);assert.equal(await act(p,'usage-refresh-all').evaluate(n=>document.activeElement===n),true);assert.equal(await p.locator('#usage-draft').inputValue(),'retained conversation draft');
  await act(p,'usage-close').click();assert.equal(await act(p,'usage-refresh-all').isVisible(),true);await act(p,'usage-refresh-all').click();assert.equal(await surface.isVisible(),false);await p.waitForFunction(()=>providers.every(p=>!p.refreshing));
  await choose(p,'codex');for(const [state,message,bars] of [['zero','0%',3],['low','8%',3],['loading','正在读取',0],['stale','以下为缓存',3],['error','读取失败',0],['empty','暂无额度',0],['unknown-reset','重置时间未提供',3],['logged-out','连接账号',0],['unsupported','暂不支持',0],['readonly','只读',3]]){
    await scenario(p,state);assert.ok((await surface.innerText()).includes(message),state);assert.equal(await surface.locator('[role=meter]').count(),bars,state);
    if(['logged-out','unsupported','readonly'].includes(state)){await act(p,'usage-refresh').click({force:true});assert.equal(await p.evaluate(()=>!!getP(usageId).refreshing),false);}
    if(state==='readonly'){assert.equal(await act(p,'usage-refresh-all').getAttribute('aria-disabled'),'true');const calls=await p.evaluate(()=>refreshCalls.length);await act(p,'usage-refresh-all').click({force:true});assert.equal(await p.evaluate(()=>refreshCalls.length),calls);}
  }
  await scenario(p,'normal');await act(p,'usage-settings').click();assert.equal(await p.locator('.settings').isVisible(),true);assert.equal(await surface.isVisible(),false);await act(p,'overview').click();await p.getByRole('switch',{name:'在侧边栏显示额度'}).uncheck();await act(p,'close-settings').click();assert.equal(await p.locator('#task-usage').isVisible(),false);assert.equal(await act(p,'usage-refresh-all').isVisible(),false);await p.close();
  for(const alias of ['A','C','__proto__']){const p=await pageFor(1280,900,'light',alias);assert.equal(new URL(p.url()).searchParams.get('variant'),'B');assert.equal(await act(p,'usage-next').count(),0);assert.equal((await p.request.get(new URL('check-usage-popover.mjs',base).href)).status(),404);await p.close();}
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);console.log('PASS adaptive height, optional facts, deduped global refresh, eligibility/read-only, retained DOM/draft, settings/global gate and selected B');
}finally{await browser.close();}
