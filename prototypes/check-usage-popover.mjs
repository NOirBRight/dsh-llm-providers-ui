// THROWAWAY: run pnpm prototype:usage-popover, then node prototypes/check-usage-popover.mjs.
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'/home/noirbright/.local/opt/dsh-staging/dsh-v0.1.2-rc.1-a66e470204/source/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs');
const base=process.env.PROTOTYPE_URL||'http://127.0.0.1:4187/provider-settings-system.html';
const browser=await chromium.launch({headless:true}),errors=[],external=[];
const act=(p,name)=>p.locator('[data-action="'+name+'"]');
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function pageFor(variant,width=1280,height=900,theme='light'){
  const p=await browser.newPage({viewport:{width,height},hasTouch:width<600});p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
  await p.goto(base+'?surface=task&variant='+variant+'&inspect=codex&theme='+theme);await settle(p);return p;
}
try{
  for(const variant of ['A','B','C'])for(const [width,height] of [[1280,900],[836,850],[390,844],[320,640],[844,390],[390,350]])for(const theme of ['light','dark']){
    const p=await pageFor(variant,width,height,theme),surface=p.locator('#usage-inspector');assert.equal(await surface.isVisible(),true,[variant,width,height,theme].join(' '));
    assert.equal(await p.evaluate(()=>usageVariant),variant);assert.equal(new URL(p.url()).searchParams.get('variant'),variant);assert.equal(await p.locator('.task-usage-card[title]').count(),0);
    const shape=await surface.boundingBox(),bar=await p.locator('.prototype-bar').boundingBox();assert.ok(shape.x>=0&&shape.x+shape.width<=width+1,JSON.stringify({variant,width,height,shape}));assert.ok(shape.y>=0&&shape.y+shape.height<=bar.y+1,JSON.stringify({variant,width,height,shape,bar}));
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.equal(await surface.evaluate(n=>n.scrollWidth>n.clientWidth+1),false);
    assert.equal(await p.locator('.usage-content [data-system-zone]').count(),1);assert.equal(await p.locator('.usage-content [role=meter]').count(),3);
    for(const action of ['usage-refresh','usage-close','usage-settings']){const box=await act(p,action).boundingBox();assert.ok(box.height>=44&&box.width>=44,action);assert.ok(box.y>=0&&box.y+box.height<=bar.y+1,JSON.stringify({variant,width,height,action,box}));}
    assert.equal(await p.locator('#task-usage-cards').isVisible(),variant!=='B'&&(variant!=='C'||width>644));
    await p.keyboard.press('Escape');assert.equal(await surface.isVisible(),false);assert.equal(await p.evaluate(()=>document.activeElement.dataset.provider),'codex');
    const tile=p.locator('.task-usage-card[data-provider=codex]');if(width<600)await tile.tap();else await tile.press('Enter');assert.equal(await surface.isVisible(),true);await act(p,'usage-close').click();assert.equal(await p.evaluate(()=>document.activeElement.dataset.provider),'codex');await p.close();
  }
  console.log('PASS 36 variant/theme/viewport layouts, touch, keyboard, focus return and bounded controls');
  for(const variant of ['A','B','C']){
    const p=await pageFor(variant),surface=p.locator('#usage-inspector');
    await p.locator('#usage-lab>summary').click();const underlying=await p.evaluate(()=>usageOpen);await p.keyboard.press('Escape');assert.equal(await p.locator('#usage-lab').evaluate(n=>n.open),false);assert.equal(await p.evaluate(()=>usageOpen),underlying);if(!underlying)await p.locator('.task-usage-card[data-provider=codex]').click();
    await act(p,'usage-refresh').click();assert.equal(await p.evaluate(()=>getP('codex').refreshing),true);assert.equal(await p.locator('.usage-content [role=meter]').count(),3);assert.equal(await act(p,'usage-refresh').getAttribute('aria-disabled'),'true');assert.equal(await act(p,'usage-refresh').evaluate(n=>document.activeElement===n),true);
    await p.waitForFunction(()=>!getP('codex').refreshing);assert.equal(await act(p,'usage-refresh').evaluate(n=>document.activeElement===n),true);assert.equal(await surface.isVisible(),true);
    await p.locator('#usage-draft').click();await p.locator('#usage-draft').fill('retained conversation draft');assert.equal(await surface.isVisible(),variant!=='A');const before=await p.evaluate(()=>usageVariant);await p.locator('#usage-draft').press('ArrowLeft');assert.equal(await p.evaluate(()=>usageVariant),before);
    await act(p,'usage-next').click();assert.equal(await p.locator('#usage-draft').inputValue(),'retained conversation draft');await act(p,'usage-prev').click();assert.equal(await p.evaluate(()=>usageVariant),variant);assert.equal(await surface.isVisible(),true);await p.reload();await settle(p);assert.equal(await p.evaluate(()=>usageVariant),variant);assert.equal(await surface.isVisible(),true);
    for(const [scenario,message,bars] of [['zero','0%',3],['low','8%',3],['loading','正在读取',0],['stale','保留上次',3],['error','无法读取',0],['empty','暂未返回',0],['unknown-reset','重置时间未提供',3],['logged-out','连接账号',0],['unsupported','暂未提供额度查询接口',0],['readonly','只读连接',3]]){
      await p.locator('#usage-lab>summary').click();await p.locator('#usage-scenario-select').selectOption(scenario);assert.equal(await surface.isVisible(),true);assert.ok((await surface.innerText()).includes(message),scenario);assert.equal(await p.locator('.usage-content [role=meter]').count(),bars,scenario);
      if(['logged-out','unsupported','readonly'].includes(scenario)){assert.equal(await act(p,'usage-refresh').getAttribute('aria-disabled'),'true');await act(p,'usage-refresh').click({force:true});assert.equal(await p.evaluate(()=>!!getP(usageId).refreshing),false);}
    }
    await p.locator('#usage-lab>summary').click();await p.locator('#usage-scenario-select').selectOption('normal');await act(p,'usage-settings').click();assert.equal(await p.locator('.settings').isVisible(),true);assert.equal(await surface.isVisible(),false);assert.equal(await p.locator('[data-provider-body=codex]').count(),1);
    await act(p,'overview').click();await p.getByRole('switch',{name:'在侧边栏显示额度'}).uncheck();await act(p,'close-settings').click();assert.equal(await p.locator('#task-usage').isVisible(),false);assert.equal(await surface.isVisible(),false);await p.close();
  }
  console.log('PASS retained refresh/focus, independent draft, cycling/reload, all statuses, settings navigation and global gate');
  const p=await pageFor('__proto__');assert.equal(await p.evaluate(()=>usageVariant),'A');assert.equal((await p.request.get(new URL('check-usage-popover.mjs',base).href)).status(),404);await p.close();
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);console.log('PASS URL validation, allowlist, no page errors or external requests');
}finally{await browser.close();}
