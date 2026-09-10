/* THROWAWAY: selected B, inline usage detail. Settings stay locked at 93d085e.
 * Earlier A/C comparisons are preserved in commit 1c9f6cc. No real requests or persistence.
 */
'use strict';
const usageVariant='B';
const usageScenarios={normal:'正常',low:'低额度',zero:'真正 0%',loading:'首次加载',stale:'失败 · 有缓存',error:'失败 · 无缓存',empty:'暂无数据','unknown-reset':'重置时间未知','logged-out':'未连接',unsupported:'不支持额度',readonly:'只读'};
let usageReady=false,usageId='codex',usageOpen=false,usageContentKey='';
const usageCanRefresh=p=>!readOnly&&p.role==='llm'&&p.connected&&p.quota.status!=='unsupported';
function usageSnapshot(){return {variant:usageVariant,open:usageOpen,provider:usageId,scenario:getP(usageId).scenario||'normal',refreshingProviders:providers.filter(p=>p.refreshing).map(p=>p.id),settingsLockedAt:'93d085e'};}
function positionUsage(event){
  if(!usageReady||!usageOpen)return;
  $('#usage-inspector').style.maxHeight=Math.max(160,$('#closed').clientHeight-240)+'px';
  if(event?.type!=='scroll')$('#task-usage').scrollIntoView({block:'nearest'});
}
function closeUsage(returnFocus=true){
  const surface=$('#usage-inspector');if(!surface)return;
  usageOpen=false;surface.hidden=true;surface.removeAttribute('data-provider');updateUsageStudy();
  if(returnFocus)$('.task-usage-card[data-provider="'+usageId+'"]')?.focus({preventScroll:true});
  record('close usage detail');
}
function openUsage(id=usageId,focus=true){
  if(!showSidebarUsage||!getP(id)||getP(id).role!=='llm')return;
  const surface=$('#usage-inspector');usageId=id;usageOpen=true;surface.hidden=false;
  updateUsageStudy();positionUsage();
  if(focus)$('[data-action=usage-close]',surface).focus({preventScroll:true});
  record('open usage detail');
}
function refreshUsage(all=false){
  const targets=(all?providers:[getP(usageId)]).filter(p=>usageCanRefresh(p)&&!p.refreshing);
  targets.forEach(p=>refresh(p));record(all?'refresh all usage':'refresh one usage');
}
function updateUsageStudy(){
  if(!usageReady)return;
  const surface=$('#usage-inspector'),p=getP(usageId),visible=!$('#closed').hidden&&showSidebarUsage;
  if(usageOpen&&!visible){closeUsage(false);return;}
  $('#closed').dataset.usageOpen=String(usageOpen);$('#task-usage-cards').hidden=usageOpen;
  $$('.task-usage-card').forEach(button=>{button.removeAttribute('title');button.setAttribute('aria-expanded',String(usageOpen&&button.dataset.provider===usageId));button.setAttribute('aria-controls','usage-inspector');});
  $('#variant-label').innerHTML='B · 原位展开<small>已选定方案</small>';
  $('#usage-provider-select').value=usageId;$('#usage-scenario-select').value=Object.hasOwn(usageScenarios,p.scenario)?p.scenario:'normal';$('#usage-scenario-select').disabled=!!p.refreshing;
  const eligible=providers.filter(usageCanRefresh),busy=eligible.some(p=>p.refreshing),allButton=$('[data-action=usage-refresh-all]');
  allButton.setAttribute('aria-disabled',String(!eligible.some(p=>!p.refreshing)));allButton.innerHTML=icon('refresh',busy?'spin':'')+(busy?'刷新中':'刷新全部');
  if(usageOpen){
    if(surface.dataset.provider!==p.id){
      surface.dataset.provider=p.id;usageContentKey='';
      surface.innerHTML='<header class="usage-head">'+brand(p)+'<h2 class="grow" id="usage-title">'+esc(p.name)+'</h2><button type="button" class="icon-btn" data-action="usage-refresh" aria-label="刷新 '+esc(p.name)+' 额度"></button><button type="button" class="icon-btn" data-action="usage-close" aria-label="返回额度列表">'+icon('back')+'</button></header><div class="usage-content" tabindex="-1"></div><footer class="usage-foot"><span class="tiny muted" id="usage-live" role="status"></span>'+btn('usage-settings','前往设置 ↗',p.id,'quiet')+'</footer>';
    }
    const refreshButton=$('[data-action=usage-refresh]',surface);refreshButton.setAttribute('aria-disabled',String(!usageCanRefresh(p)||!!p.refreshing));refreshButton.innerHTML=icon('refresh',p.refreshing?'spin':'');
    const body=$('.usage-content',surface),key=JSON.stringify([p.quota,p.connected]);
    // Global refresh also redraws sibling cards; keep text selection and disclosures in this detail intact.
    if(key!==usageContentKey){
      usageContentKey=key;const scroll=body.scrollTop,expanded=$('.usage-more',body)?.open||false,activity=$('.activity',body)?.open||false;
      body.innerHTML=quotaBlock(p);$('.section-heading',body).remove();$('.quota-meta',body).remove();
      const note=$('.alert>span',body);
      if(note)note.textContent=p.quota.status==='unsupported'?'暂不支持额度查询':!p.connected?'连接账号后查看额度':({error:'读取失败，请重试',stale:'刷新失败 · 以下为缓存',idle:'尚未读取，点击刷新',empty:'暂无额度数据'}[p.quota.status]||'暂无额度数据');
      const facts=$('.facts',body),stats=$('.activity',body);
      if(facts||stats){const more=document.createElement('details');more.className='usage-more';more.innerHTML='<summary>更多用量</summary>';more.open=expanded;$('section',body).append(more);if(facts)more.append(facts);if(stats)more.append(stats);}
      if($('.activity',body))$('.activity',body).open=activity;body.scrollTop=scroll;
    }
    const time=p.updated?new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit'}).format(new Date(p.updated)):'';
    $('#usage-live').innerHTML=(p.refreshing?'刷新中…':readOnly?'只读':time?'更新 '+esc(time):'')+'<span class="usage-zone" data-system-zone>系统时区 · '+esc(systemZone())+'</span>';
    $('[data-action=usage-settings]',surface).textContent=p.connected?'前往设置 ↗':'连接账号 ↗';
  }
  const url=new URL(location.href);url.searchParams.set('surface','task');url.searchParams.set('variant',usageVariant);if(usageOpen)url.searchParams.set('inspect',usageId);else url.searchParams.delete('inspect');history.replaceState(null,'',url);
  $('#usage-state-json').textContent=JSON.stringify(stateSnapshot(),null,2);requestAnimationFrame(positionUsage);
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
  usageId=providers.some(p=>p.id===params.get('inspect')&&p.role==='llm')?params.get('inspect'):'codex';document.documentElement.classList.add('usage-study');
  $('.prototype-caption').innerHTML='<strong>DESIGN STUDY / 03</strong> Task Panel · 演示数据';
  const surface=document.createElement('section');surface.id='usage-inspector';surface.className='usage-surface';surface.hidden=true;surface.setAttribute('role','region');surface.setAttribute('aria-labelledby','usage-title');$('#task-usage').append(surface);
  const heading=$('#task-usage>h3'),toolbar=document.createElement('div');toolbar.className='usage-tools';heading.before(toolbar);toolbar.append(heading);toolbar.insertAdjacentHTML('beforeend',btn('usage-refresh-all','刷新全部','','quiet'));
  $('[data-action=usage-refresh-all]').setAttribute('aria-label','刷新全部 Provider 额度');
  $('.task-chat').innerHTML='<header class="usage-chat-head"><span class="tiny muted">当前会话</span></header><div class="usage-chat-body"><h2>Provider 额度</h2><p id="task-preview-status" class="sr-only"></p></div><label class="usage-composer"><span class="tiny muted">测试输入</span><textarea id="usage-draft" rows="3" placeholder="消息草稿（不发送）"></textarea></label>';
  $('#closed [data-action=reopen]').textContent='Provider 设置';
  const bar=$('.prototype-bar');bar.setAttribute('aria-label','额度原型演示控制');
  const lab=document.createElement('details');lab.id='usage-lab';lab.innerHTML='<summary>演示</summary><div class="usage-lab-menu"><strong>演示控制</strong><label>Provider<select id="usage-provider-select">'+providers.filter(p=>p.role==='llm').map(p=>'<option value="'+p.id+'">'+esc(p.name)+'</option>').join('')+'</select></label><label>状态<select id="usage-scenario-select">'+Object.entries(usageScenarios).map(([id,name])=>'<option value="'+id+'">'+name+'</option>').join('')+'</select></label><div id="usage-base-tools"></div><details><summary>查看原型状态</summary><pre id="usage-state-json"></pre></details></div>';
  bar.append(lab);$$('.prototype-bar>.divider').forEach(n=>n.remove());const tools=$('#usage-base-tools');tools.append($('#frame').parentElement,$('#theme-button'),$('[data-action=reset-demo]'));$('[data-action=review]').hidden=true;
  usageReady=true;$('.settings').hidden=true;$('#closed').hidden=false;render();
  document.addEventListener('click',event=>{
    const action=event.target.closest('[data-action]')?.dataset.action;
    if(action==='usage-open'){const id=event.target.closest('[data-provider]').dataset.provider;if(usageOpen&&id===usageId)closeUsage();else openUsage(id);}
    if(action==='usage-close')closeUsage();
    if(action==='usage-refresh'||action==='usage-refresh-all')refreshUsage(action==='usage-refresh-all');
    if(action==='usage-settings'){const id=usageId;closeUsage(false);openProvider(id);}
  });
  document.addEventListener('change',event=>{if(event.target.id==='usage-provider-select'){$('#usage-lab').open=false;openUsage(event.target.value);}if(event.target.id==='usage-scenario-select')scenarioUsage(event.target.value);});
  document.addEventListener('pointerdown',event=>{if(!event.target.closest('#usage-lab'))$('#usage-lab').open=false;});
  document.addEventListener('keydown',event=>{
    if($('#modal').open)return;
    if(event.key==='Escape'&&$('#usage-lab').open){event.preventDefault();$('#usage-lab').open=false;$('#usage-lab>summary').focus();return;}
    if(event.key==='Escape'&&usageOpen){event.preventDefault();closeUsage();}
  });
  window.addEventListener('resize',positionUsage);visualViewport?.addEventListener('resize',positionUsage);
  surface.addEventListener('toggle',()=>requestAnimationFrame(positionUsage),true);new ResizeObserver(positionUsage).observe($('#closed'));
  if(params.has('inspect'))openUsage(usageId,false);record('initial usage study');
}
