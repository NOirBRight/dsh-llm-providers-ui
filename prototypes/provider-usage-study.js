/* THROWAWAY: three Task Panel detail interactions, on top of locked settings 93d085e.
 * ?surface=task&variant=A|B|C&inspect=codex. Shared tokens/data/renderers remain in the settings study.
 */
'use strict';
const usageLayouts={A:{name:'贴边浮卡',note:'点击展开，点外部关闭；不挤压会话'},B:{name:'原位展开',note:'在侧栏内阅读，返回后恢复额度网格'},C:{name:'伴随面板',note:'保持打开，可继续输入或切换 Provider'}};
const usageScenarios={normal:'正常',low:'低额度',zero:'真正 0%',loading:'首次加载',stale:'失败 · 有缓存',error:'失败 · 无缓存',empty:'暂无数据','unknown-reset':'重置时间未知','logged-out':'未连接',unsupported:'不支持额度',readonly:'只读'};
let usageReady=false,usageVariant='A',usageId='codex',usageOpen=false,usageReturnFocus=null;
function usageSnapshot(){return {variant:usageVariant,open:usageOpen,provider:usageId,scenario:getP(usageId).scenario||'normal',refreshing:!!getP(usageId).refreshing,placement:$('#usage-inspector')?.dataset.variant||null,settingsLockedAt:'93d085e'};}
function UsageVariantA(surface){surface.setAttribute('popover','manual');surface.setAttribute('role','dialog');document.body.append(surface);}
function UsageVariantB(surface){surface.setAttribute('role','region');$('#task-usage').append(surface);}
function UsageVariantC(surface){surface.setAttribute('role','complementary');$('#closed').append(surface);}
function positionUsage(event){
  if(!usageReady||!usageOpen)return;
  const surface=$('#usage-inspector'),scene=$('#closed'),v=visualViewport,left=v?.offsetLeft||0,top=v?.offsetTop||0,width=v?.width||innerWidth;
  const bottom=Math.min(top+(v?.height||innerHeight),$('.prototype-bar').getBoundingClientRect().top)-12;
  surface.style.setProperty('--usage-available',Math.max(120,bottom-top-12)+'px');
  scene.style.setProperty('--usage-inline-height',Math.max(170,Math.min(410,scene.clientHeight-200))+'px');
  if(usageVariant==='B'){if(event?.type!=='scroll')surface.scrollIntoView({block:'nearest'});return;}
  if(usageVariant!=='A')return;
  const anchor=$('.task-usage-card[data-provider="'+usageId+'"]'),panel=$('.task-panel').getBoundingClientRect(),r=anchor?.getBoundingClientRect()||panel;
  const box=surface.getBoundingClientRect();
  const x=Math.max(left+12,Math.min(panel.right+10,left+width-box.width-12));
  const y=Math.max(top+12,Math.min(r.bottom-box.height,bottom-box.height));
  Object.assign(surface.style,{left:x+'px',top:y+'px'});
}
function closeUsage(returnFocus=true){
  const surface=$('#usage-inspector');if(!surface)return;
  usageOpen=false;
  if(surface.matches(':popover-open'))surface.hidePopover();
  surface.hidden=true;surface.removeAttribute('popover');surface.removeAttribute('data-provider');document.body.append(surface);
  updateUsageStudy();
  if(returnFocus){const target=$('.task-usage-card[data-provider="'+usageId+'"]')||usageReturnFocus;if(target?.isConnected)target.focus({preventScroll:true});}
  record('close usage detail');
}
function openUsage(id=usageId,focus=true){
  if(!showSidebarUsage||!getP(id)||getP(id).role!=='llm')return;
  const surface=$('#usage-inspector');
  if(surface.matches(':popover-open'))surface.hidePopover();
  surface.hidden=true;surface.removeAttribute('popover');surface.removeAttribute('data-provider');surface.style.left='';surface.style.top='';
  usageId=id;usageOpen=true;usageReturnFocus=$('.task-usage-card[data-provider="'+id+'"]');
  surface.dataset.variant=usageVariant;
  ({A:UsageVariantA,B:UsageVariantB,C:UsageVariantC}[usageVariant])(surface);
  surface.hidden=false;updateUsageStudy();
  if(usageVariant==='A')surface.showPopover();
  positionUsage();
  if(focus)$('[data-action=usage-close]',surface).focus({preventScroll:true});
  if(usageVariant==='B')surface.scrollIntoView({block:'nearest'});
  record('open usage detail');
}
function updateUsageStudy(){
  if(!usageReady)return;
  const surface=$('#usage-inspector'),p=getP(usageId),visible=!$('#closed').hidden&&showSidebarUsage;
  if(usageOpen&&!visible){closeUsage(false);return;}
  $('#closed').dataset.usageVariant=usageVariant;$('#closed').dataset.usageOpen=String(usageOpen);
  $('#task-usage-cards').hidden=usageOpen&&usageVariant==='B';
  $$('.task-usage-card').forEach(button=>{button.removeAttribute('title');button.setAttribute('aria-expanded',String(usageOpen&&button.dataset.provider===usageId));button.setAttribute('aria-controls','usage-inspector');if(usageVariant==='A')button.setAttribute('aria-haspopup','dialog');else button.removeAttribute('aria-haspopup');});
  $('#variant-label').innerHTML=usageVariant+' · '+usageLayouts[usageVariant].name+'<small>← / → 比较 · 设置设计已锁定</small>';
  $('#usage-layout-note').textContent=usageLayouts[usageVariant].note;
  $('#usage-provider-select').value=usageId;$('#usage-scenario-select').value=p.scenario in usageScenarios?p.scenario:'normal';$('#usage-scenario-select').disabled=!!p.refreshing;
  if(usageOpen){
    if(surface.dataset.provider!==p.id){
      surface.dataset.provider=p.id;
      surface.innerHTML='<header class="usage-head">'+brand(p)+'<div class="grow"><h2 id="usage-title">'+esc(p.name)+'</h2><div class="tiny muted" id="usage-account-status"></div></div><button type="button" class="icon-btn" data-action="usage-refresh" aria-label="刷新 '+esc(p.name)+' 额度"></button><button type="button" class="icon-btn" data-action="usage-close" aria-label="'+(usageVariant==='B'?'返回额度列表':'关闭额度详情')+'">'+icon(usageVariant==='B'?'back':'close')+'</button></header><div class="usage-content" tabindex="-1"></div><footer class="usage-foot"><span class="tiny muted" id="usage-live" role="status"></span>'+btn('usage-settings','前往设置 '+icon('external'),p.id,'quiet')+'</footer>';
    }
    $('#usage-account-status').textContent=status(p)+' · 账户额度';
    const refreshButton=$('[data-action=usage-refresh]',surface),blocked=readOnly||!p.connected||p.quota.status==='unsupported'||p.refreshing;
    refreshButton.setAttribute('aria-disabled',String(!!blocked));refreshButton.innerHTML=icon('refresh',p.refreshing?'spin':'');
    const body=$('.usage-content',surface),scroll=body.scrollTop,expanded=$('.usage-more',body)?.open||false,activity=$('.activity',body)?.open||false;
    body.innerHTML=(readOnly?alertBox('只读连接：可查看额度，不能刷新。','warn'):'')+quotaBlock(p);
    $('[data-action=refresh]',body)?.remove();
    const facts=$('.facts',body),stats=$('.activity',body);
    if(usageVariant==='A'&&(facts||stats)){
      const more=document.createElement('details');more.className='usage-more';more.innerHTML='<summary>账户信息与用量明细</summary>';more.open=expanded;
      const section=$('section',body);section.insertBefore(more,$('.quota-meta',section));if(facts)more.append(facts);if(stats)more.append(stats);
    }
    if($('.activity',body))$('.activity',body).open=activity;
    body.scrollTop=scroll;
    $('#usage-live').textContent=p.refreshing?'正在更新 · 保留当前读数':!p.connected?'连接账号后查询':p.quota.status==='unsupported'?'暂不支持查询':p.quota.status==='stale'?'当前显示缓存':p.updated?'已更新':'更新时间未提供';
    $('[data-action=usage-settings]',surface).textContent=p.connected?'前往设置 ↗':'连接账号 ↗';
  }
  const url=new URL(location.href);url.searchParams.set('surface','task');url.searchParams.set('variant',usageVariant);if(usageOpen)url.searchParams.set('inspect',usageId);else url.searchParams.delete('inspect');history.replaceState(null,'',url);
  $('#usage-state-json').textContent=JSON.stringify(stateSnapshot(),null,2);
  requestAnimationFrame(positionUsage);
}
function cycleUsage(delta){
  const keys=Object.keys(usageLayouts);usageVariant=keys[(keys.indexOf(usageVariant)+delta+keys.length)%keys.length];
  if($('#closed').hidden){$('.settings').hidden=true;$('#closed').hidden=false;renderTaskPanel();}
  $('#usage-lab').open=false;openUsage(usageId,false);record('usage variant');
}
function scenarioUsage(name){
  if(!Object.hasOwn(usageScenarios,name))return;
  const p=getP(usageId);if(p.refreshing)return;
  const seed=window.PROVIDER_DEMO.find(v=>v.id===p.id);p.quota=copy(seed.quota);p.connected=seed.connected;p.authExpired=false;p.scenario=name;readOnly=name==='readonly';delete p.updated;
  if(name==='logged-out')p.connected=false;
  if(['loading','empty','stale','error','unsupported'].includes(name)){p.quota.status=name;if(name==='empty'||name==='unsupported')p.quota.windows=[];}
  if(name==='low'||name==='zero'){const w=p.quota.windows.find(validRemaining);if(w)w.remaining=name==='zero'?0:8;}
  if(name==='unknown-reset')p.quota.windows.forEach(w=>w.reset=null);
  $('#usage-lab').open=false;render();openUsage(usageId);record('usage scenario '+name);
}
function initUsageStudy(){
  usageVariant=Object.hasOwn(usageLayouts,params.get('variant'))?params.get('variant'):'A';usageId=providers.some(p=>p.id===params.get('inspect')&&p.role==='llm')?params.get('inspect'):'codex';
  document.documentElement.classList.add('usage-study');
  $('.prototype-caption').innerHTML='<strong>DESIGN STUDY / 03</strong> Task Panel 额度详情 · 演示数据 · 设置设计已锁定';
  const surface=document.createElement('section');surface.id='usage-inspector';surface.className='usage-surface';surface.hidden=true;surface.setAttribute('aria-labelledby','usage-title');document.body.append(surface);
  surface.addEventListener('toggle',event=>{if(event.newState==='closed'&&usageVariant==='A'&&usageOpen&&surface.hasAttribute('popover')&&!surface.matches(':popover-open'))closeUsage(false);});
  $('.task-chat').innerHTML='<header class="usage-chat-head"><span class="tiny muted">会话 · 额度交互评审</span><span class="pill">演示</span></header><div class="usage-chat-body"><h2>查看额度，不离开当前任务</h2><p id="usage-layout-note"></p><p>点击侧栏 Provider，可在同一份数据上比较三种交互。</p><p class="tiny faint">单个 Provider 的显隐和排序沿用外部入口，不在提示框内重复设置。</p><p id="task-preview-status" class="sr-only"></p></div><label class="usage-composer"><span class="tiny muted">输入区 · 用于测试焦点与遮挡，不发送消息</span><textarea id="usage-draft" rows="3" placeholder="试着继续输入，或选中提示框里的额度文字…"></textarea></label>';
  $('#closed [data-action=reopen]').textContent='Provider 设置';
  const bar=$('.prototype-bar');bar.setAttribute('aria-label','额度提示框方案比较');
  const previous=document.createElement('button');previous.className='arrow';previous.dataset.action='usage-prev';previous.setAttribute('aria-label','上一个提示框方案');previous.innerHTML=icon('back');bar.prepend(previous);
  const next=document.createElement('button');next.className='arrow';next.dataset.action='usage-next';next.setAttribute('aria-label','下一个提示框方案');next.innerHTML=icon('chevron');$('#variant-label').after(next);
  const lab=document.createElement('details');lab.id='usage-lab';lab.innerHTML='<summary>演示</summary><div class="usage-lab-menu"><strong>演示控制 · 不是真实设置</strong><label>Provider<select id="usage-provider-select">'+providers.filter(p=>p.role==='llm').map(p=>'<option value="'+p.id+'">'+esc(p.name)+'</option>').join('')+'</select></label><label>状态<select id="usage-scenario-select">'+Object.entries(usageScenarios).map(([id,name])=>'<option value="'+id+'">'+name+'</option>').join('')+'</select></label><div id="usage-base-tools"></div><details><summary>查看完整原型状态</summary><pre id="usage-state-json"></pre></details></div>';
  bar.append(lab);$$('.prototype-bar>.divider').forEach(n=>n.remove());const tools=$('#usage-base-tools');tools.append($('#frame').parentElement,$('#theme-button'),$('[data-action=reset-demo]'));$('[data-action=review]').hidden=true;
  usageReady=true;$('.settings').hidden=true;$('#closed').hidden=false;render();
  document.addEventListener('click',event=>{
    const action=event.target.closest('[data-action]')?.dataset.action;
    if(action==='usage-open'){const id=event.target.closest('[data-provider]').dataset.provider;if(usageOpen&&id===usageId)closeUsage();else openUsage(id);}
    if(action==='usage-close')closeUsage();
    if(action==='usage-prev'||action==='usage-next')cycleUsage(action==='usage-next'?1:-1);
    if(action==='usage-refresh'){const p=getP(usageId);if(!readOnly&&p.connected&&p.quota.status!=='unsupported'&&!p.refreshing)refresh(p);}
    if(action==='usage-settings'){const id=usageId;closeUsage(false);openProvider(id);}
  });
  document.addEventListener('change',event=>{if(event.target.id==='usage-provider-select'){$('#usage-lab').open=false;openUsage(event.target.value);}if(event.target.id==='usage-scenario-select')scenarioUsage(event.target.value);});
  document.addEventListener('pointerdown',event=>{if(!event.target.closest('#usage-lab'))$('#usage-lab').open=false;if(usageOpen&&usageVariant==='A'&&!event.target.closest('#usage-inspector,.task-usage-card'))closeUsage(false);},true);
  document.addEventListener('keydown',event=>{
    if($('#modal').open)return;
    if(event.key==='Escape'&&$('#usage-lab').open){event.preventDefault();$('#usage-lab').open=false;$('#usage-lab>summary').focus();return;}
    if(event.key==='Escape'&&usageOpen){event.preventDefault();closeUsage();return;}
    if(['ArrowLeft','ArrowRight'].includes(event.key)&&!event.target.closest('input,textarea,select,[contenteditable],#usage-lab')){event.preventDefault();cycleUsage(event.key==='ArrowRight'?1:-1);}
  });
  window.addEventListener('resize',positionUsage);window.addEventListener('scroll',positionUsage,true);visualViewport?.addEventListener('resize',positionUsage);visualViewport?.addEventListener('scroll',positionUsage);
  new ResizeObserver(positionUsage).observe($('#closed'));
  if(params.has('inspect'))openUsage(usageId,false);record('initial usage study');
}
