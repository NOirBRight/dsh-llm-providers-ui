/* THROWAWAY prototype. All actions are in-memory simulations; never call a provider or persist credentials.
 * Chosen design C: quota overview and independent configuration. Earlier A/B studies remain in git history.
 */
'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const copy = value => structuredClone(value);
const params = new URLSearchParams(location.search);
let providers = copy(window.PROVIDER_DEMO);
let order = providers.map(p => p.id);
let selected = providers.some(p => p.id === params.get('provider')) ? params.get('provider') : 'codex';
const variant = 'C';
let detailC = params.has('provider');
let readOnly = false;
let showSidebarUsage = true;
let filter = 'all';
let modalState = null;
let sortDrag = null;
let sortState = null;
const expandedModels = new Set();
const modelKey = (p,m) => p.id+":"+m.uid;
const modelLocked = p => readOnly||p.saving||(p.role==="agent"&&(!p.connected||!p.installed));
let removed = null;
// Password drafts stay outside serializable/reviewable state and never leave this page.
const keyDrafts = new Map();
let toastTimer;
const config = p => ({models:p.models, advanced:p.advanced, baseURL:p.baseURL});
let saved = new Map(providers.map(p => [p.id, copy(config(p))]));
const getP = id => providers.find(p => p.id === (id || selected));
const dirty = p => !!p.pendingKey || JSON.stringify(config(p)) !== JSON.stringify(saved.get(p.id));
const iconPaths = {
  chevron:'M6 3l5 5-5 5', back:'M10 3L5 8l5 5', close:'M4 4l8 8M12 4l-8 8', plus:'M8 3v10M3 8h10',
  refresh:'M13 6a5.2 5.2 0 10.1 4M13 2v4H9', grip:'M5 3h.01M11 3h.01M5 8h.01M11 8h.01M5 13h.01M11 13h.01',
  sort:'M5 2v12m-3-3 3 3 3-3M11 14V2m-3 3 3-3 3 3', trash:'M3 4h10M6 4V2h4v2M4 4l1 10h6l1-10M7 7v4M9 7v4',
  model:'M2 4l6-3 6 3v8l-6 3-6-3V4zm0 0 6 3 6-3M8 7v8', globe:'M14 8A6 6 0 112 8a6 6 0 0112 0ZM2 8h12M8 2c-4 4-4 8 0 12M8 2c4 4 4 8 0 12',
  link:'M6 10l4-4M5 7 3 9a3 3 0 004 4l2-2M7 5l2-2a3 3 0 014 4l-2 2', sliders:'M2 4h12M2 12h12M5 2v4M11 10v4',
  settings:'M6 2h4l.5 2 2 .5 1 3-1.5 1.5.2 2-2.7 2-2-.7-2 .7-2.7-2 .2-2L2 7.5l1-3L5.5 4 6 2ZM10 8a2 2 0 11-4 0 2 2 0 014 0Z',
  chart:'M3 14V8M8 14V3M13 14V6', agent:'M3 3h10v10H3V3Zm2 3 2 2-2 2m4 0h2', shop:'M2 6h12l-1-4H3L2 6Zm1 0v8h10V6M6 14V9h4v5',
  info:'M8 7v4M8 4.5h.01M14 8A6 6 0 112 8a6 6 0 0112 0Z', check:'M3 8l3 3 7-7', external:'M9 2h5v5M14 2 7 9M6 3H3v10h10v-3',
  search:'M10.5 10.5 14 14M12 7a5 5 0 11-10 0 5 5 0 0110 0Z', lock:'M4 7V5a4 4 0 018 0v2M3 7h10v7H3V7Z', moon:'M12 11A6 6 0 015 2a6 6 0 107 9Z'
};
function icon(name, cls = '') { return '<svg class="'+cls+'" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+iconPaths[name]+'"/></svg>'; }
function brand(p, big = false) { return '<span class="brand'+(big?' big':'')+'">'+window.PROVIDER_MARKS[p.id]+'</span>'; }
function badge(p) { return '<span class="pill '+(p.role==='agent'?'agent':'')+'">'+icon(p.role==='agent'?'agent':'model')+(p.role==='agent'?'Agent':'LLM')+'</span>'; }
function btn(action, text, id = '', cls = '', disabled = false) { return '<button type="button" class="btn '+cls+'" data-action="'+action+'"'+(id?' data-provider="'+esc(id)+'"':'')+(disabled?' disabled':'')+'>'+text+'</button>'; }
function status(p) { return p.installing ? '安装中' : !p.installed && p.role==='agent' ? '未安装运行环境' : p.authExpired ? '授权已失效' : !p.connected ? '未连接' : p.auth==='api-key' ? '已配置' : '已连接'; }
function identity(p, big = false) {
  return '<div class="identity">'+brand(p,big)+'<div class="grow"><div class="name-line"><span class="name">'+esc(p.name)+'</span>'+badge(p)+(p.development?'<span class="pill dev">开发中</span>':'')+(dirty(p)?'<span class="draft-dot" title="有未保存的更改">●</span>':'')+'</div><div class="sub"><span class="dot '+(p.connected&&p.installed?'good':'')+'"></span>'+status(p)+'<span aria-hidden="true">·</span>'+p.models.length+' 个模型</div></div></div>';
}
const systemZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
function dateLabel(value) {
  const n=Date.parse(value);
  return Number.isFinite(n)?new Intl.DateTimeFormat(undefined,{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(n):null;
}
function resetCaption(w) {
  const date=dateLabel(w.reset);
  if(!date)return (w.period?w.period+' · ':'')+'重置时间未提供';
  const mins=Math.ceil((Date.parse(w.reset)-Date.now())/60000);
  const relative=mins<=0?'已到期，等待更新':mins>=1440?Math.ceil(mins/1440)+'天后':mins>=60?Math.floor(mins/60)+'小时'+(mins%60?mins%60+'分后':'后'):mins+'分钟后';
  return '重置于 '+date+' · '+relative;
}
function resetStamp(w,cls='meter-caption') {
  const caption=resetCaption(w);
  return '<span class="'+cls+'" data-reset="'+esc(w.reset)+'" data-period="'+esc(w.period)+'" title="'+esc(caption+' · '+systemZone())+'">'+esc(caption)+'</span>';
}
function refreshTimes() {
  $$('[data-reset]').forEach(el=>{const text=resetCaption({reset:el.dataset.reset,period:el.dataset.period});el.textContent=text;el.title=text+' · '+systemZone();});
  $$('[data-local-date]').forEach(el=>el.textContent=dateLabel(el.dataset.localDate)||'—');
  $$('[data-system-zone]').forEach(el=>el.textContent='系统时区 · '+systemZone());
}
const validRemaining = w => typeof w?.remaining==='number' && Number.isFinite(w.remaining) && w.remaining>=0 && w.remaining<=100 && !w.disabled;
function meter(w,mini=false) {
  if(!w||!validRemaining(w))return '<div class="missing-quota">'+(w?.disabled?'此额度窗口已停用':w?esc(w.label)+' · 暂无数据':'暂未提供额度数据')+(w?resetStamp(w,'faint'):'<small class="faint">等待 Provider 返回</small>')+'</div>';
  return '<div class="meter'+(mini?' mini':'')+'"><div class="meter-top"><span class="meter-label">'+esc(w.label)+'</span><span class="meter-value">'+Math.round(w.remaining)+'%'+(!mini?' <small class="muted">剩余</small>':'')+'</span></div><div class="track" role="meter" aria-label="'+esc(w.label)+' 剩余额度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+w.remaining+'" aria-valuetext="'+Math.round(w.remaining)+'% 剩余"><div class="fill'+(w.remaining<20?' low':'')+'" style="width:'+w.remaining+'%"></div></div>'+resetStamp(w)+'</div>';
}
const primary = p => p.quota.windows.find(validRemaining) || p.quota.windows[0];
function quotaSummary(p) {
  if (p.quota.status==='unsupported') return '<div class="missing-quota"><span>暂不支持额度查询</span><small>Provider 未提供接口</small></div>';
  if (!p.connected) return '<div class="missing-quota"><span>连接后查看额度</span><small>当前未连接</small></div>';
  if (p.quota.status==='loading') return '<div class="meter skeleton"><span class="meter-label">正在读取额度…</span><div class="track"></div><span class="meter-caption">等待 Provider 返回</span></div>';
  if (p.quota.status==='error') return '<div class="missing-quota"><span class="danger-text">额度读取失败</span><small>打开详情重试</small></div>';
  if (p.quota.status==='idle') return '<div class="missing-quota"><span>尚未读取额度</span><small>点击刷新后获取</small></div>';
  const w=primary(p);
  return meter(p.quota.status==='stale'&&w ? {...w,label:w.label+' · 缓存'} : w,true);
}
function alertBox(text, kind = '') { return '<div class="alert '+kind+'">'+icon('info')+'<span>'+text+'</span></div>'; }
function accountBlock(p) {
  const locked = readOnly || p.saving;
  if (p.role==='agent' && !p.installed) return '<section><div class="section-heading"><h3>运行环境</h3></div>'+alertBox(p.installing?'正在安装演示运行环境，请稍候…':'首次使用需要安装 '+esc(p.name)+' 的原生运行环境。')+'<div class="model-actions">'+btn('install',p.installing?icon('refresh','spin')+' 安装中…':'安装运行环境',p.id,'primary',locked||p.installing)+btn('probe','检查安装状态',p.id,'',locked||p.installing)+'</div></section>';
  const names = {chatgpt:'ChatGPT 账号',xai:'xAI 账号',cursor:'Cursor 账号','api-key':'API Key',google:'Google 个人账号','cursor-cli':'Cursor CLI 账号'};
  const signNames = {chatgpt:'使用 ChatGPT 登录',xai:'使用 xAI 登录',cursor:'使用 Cursor 登录',google:'使用 Google 登录','cursor-cli':'使用 Cursor 登录'};
  let actions = p.auth==='api-key' ? '' : p.connected ? btn('account-menu','管理账号',p.id,'',locked) : btn('auth-start',p.authExpired?'重新登录':signNames[p.auth],p.id,'primary',locked);
  let text = p.connected ? (p.auth==='api-key'?'已配置访问密钥':esc(p.account||'演示账号')) : p.authExpired ? (p.auth==='api-key'?'密钥已失效，请更新':'登录已失效，请重新授权') : '尚未连接账号';
  let account = '<div class="account"><div class="grow"><div class="account-name row"><span class="dot '+(p.connected?'good':'')+'"></span>'+text+'</div><div class="account-meta">'+names[p.auth]+(p.auth==='api-key'?' · 不会回显已保存的密钥':' · '+(p.role==='agent'?'原生 Agent':'订阅授权，不使用 API Key'))+'</div></div><div class="account-actions">'+actions+'</div></div>';
  if(p.auth==='api-key') account += '<div class="api-key-row"><label class="field"><span class="field-label">'+(p.connected?'替换 API Key':'API Key')+'</span><input data-key="'+p.id+'" data-focus="key-'+p.id+'" type="password" autocomplete="off" placeholder="'+(p.connected?'已配置 · 输入演示密钥以替换':'输入演示密钥，请勿使用真实密钥')+'" '+(locked?'disabled':'')+'><span class="field-hint">'+(p.pendingKey?'已输入新密钥，保存后在演示中生效。':'只在当前页内存暂存；不发送、不持久化。')+'</span></label></div>';
  return '<section><div class="section-heading"><h3>账号与连接</h3></div>'+account+'</section>';
}
function quotaBlock(p) {
  const disabled = readOnly || !p.connected || p.quota.status==='unsupported' || p.refreshing;
  let body;
  if (p.quota.status==='unsupported') body=alertBox('此 Provider 暂未提供额度查询接口。登录与模型配置仍可正常使用。');
  else if (!p.connected) body=alertBox('连接账号后读取额度。已保存的模型配置不会被删除。');
  else if (p.quota.status==='loading') body=quotaSummary(p);
  else if (p.quota.status==='error') body=alertBox('无法读取额度。请重试；无缓存数据时不显示进度条。','error');
  else if (p.quota.status==='idle') body=alertBox('额度尚未读取。点击“刷新”获取；保存配置不会自动查询。');
  else {
    body=(p.quota.status==='stale'?alertBox('刷新失败，以下保留上次成功的数据，不代表当前额度。','warn'):'')+'<div class="quota-list"'+(p.quota.status==='stale'?' style="margin-top:15px"':'')+'>'+(p.quota.windows.length?p.quota.windows.map(w=>meter(w)).join(''):alertBox('暂未返回额度数据。可刷新重试。'))+'</div>';
    if(p.quota.facts.length) body+='<dl class="facts">'+p.quota.facts.map(f=>'<div><dt>'+esc(f.label)+'</dt><dd>'+(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T/.test(f.value)&&dateLabel(f.value)?'<span data-local-date="'+esc(f.value)+'">'+esc(dateLabel(f.value))+'</span>':esc(f.value))+'</dd></div>').join('')+'</dl>';
    if(p.quota.activity.length) body+='<details class="activity"><summary>本周按模型统计</summary><div class="activity-list">'+p.quota.activity.map(a=>'<div class="row between"><span>'+esc(a.name)+'</span><span class="muted">'+a.count+' 次请求</span></div>').join('')+'</div></details>';
  }
  return '<section><div class="section-heading"><h3>剩余额度</h3>'+btn('refresh',icon('refresh',p.refreshing?'spin':'')+(p.refreshing?' 刷新中':' 刷新'),p.id,'quiet',disabled)+'</div>'+body+'<div class="quota-meta"><span>账户剩余额度 · 各窗口独立计量</span><span><span data-system-zone>系统时区 · '+esc(systemZone())+'</span>'+(p.connected&&['ready','stale','empty'].includes(p.quota.status)?p.updated?' · 更新于 <span data-local-date="'+esc(p.updated)+'">'+esc(dateLabel(p.updated))+'</span>':' · 更新时间未提供':'')+'</span></div></section>';
}
const effortLabels = {off:'关闭',none:'无',minimal:'最小',low:'低',medium:'中',high:'高',xhigh:'极高',max:'最大'};
function modelField(p,m,key,label,type='text',placeholder='') {
  return '<label class="field"><span class="field-label">'+label+'</span><input data-provider="'+p.id+'" data-model="'+m.uid+'" data-field="'+key+'" data-focus="'+p.id+'-'+m.uid+'-'+key+'" type="'+type+'" value="'+esc(m[key])+'" placeholder="'+esc(placeholder)+'"'+(key==='id'?' required':'')+(type==='number'?' min="1" step="1"':'')+(modelLocked(p)?' disabled':'')+'></label>';
}
function modelsBlock(p) {

  const locked=modelLocked(p),sorting=sortState?.type==='sort-models'&&sortState.provider===p.id,allClosed=p.models.length&&p.models.every(m=>!expandedModels.has(modelKey(p,m)));
  const rows=p.models.map(m=>{
    const closed=!expandedModels.has(modelKey(p,m)),panel='parameters-'+p.id+'-'+m.uid;
    return '<article class="model-card" data-model-row="'+m.uid+'" data-sort-id="'+m.uid+'"><div class="model-editor"><div class="model-top">'+dragHandle(m.uid,m.name||m.id||'新模型')+modelField(p,m,'id','Model ID')+modelField(p,m,'name','显示名称')+'<button type="button" class="icon-btn model-toggle" data-action="toggle-model" data-provider="'+p.id+'" data-model="'+m.uid+'" data-focus="toggle-'+p.id+'-'+m.uid+'" aria-expanded="'+!closed+'" aria-controls="'+panel+'" aria-label="'+(closed?'展开':'收起')+'模型参数" title="'+(closed?'展开':'收起')+'模型参数">'+icon('chevron','chevron')+'</button><button type="button" class="icon-btn" data-action="remove-model" data-provider="'+p.id+'" data-model="'+m.uid+'" aria-label="移除 '+esc(m.name||m.id||'新模型')+'" '+(locked?'disabled':'')+'>'+icon('trash')+'</button></div><fieldset class="model-parameters" id="'+panel+'" '+(closed?'hidden ':'')+(locked?'disabled':'')+'><div class="model-options">'+modelField(p,m,'context','上下文窗口 · Tokens','number','Provider 默认')+'<div class="model-capabilities">'+['vision','thinking'].map(key=>'<label><input type="checkbox" data-provider="'+p.id+'" data-model="'+m.uid+'" data-field="'+key+'" data-focus="'+p.id+'-'+m.uid+'-'+key+'" '+(m[key]?'checked':'')+'>'+(key==='vision'?'视觉':'推理')+'</label>').join('')+'</div><label class="field"><span class="field-label">默认思考等级</span><select data-provider="'+p.id+'" data-model="'+m.uid+'" data-field="effort" data-focus="'+p.id+'-'+m.uid+'-effort" '+(!m.thinking||!(m.efforts??p.efforts).length?'disabled':'')+'><option value="">Provider 默认</option>'+(m.efforts??p.efforts).map(e=>'<option value="'+e+'" '+(m.effort===e?'selected':'')+'>'+effortLabels[e]+' · '+e+'</option>').join('')+'</select></label></div>'+(m.hint?'<div class="model-source">'+esc(m.hint)+'</div>':'')+'</fieldset></div></article>';
  }).join('');
  return '<section data-model-catalog="'+p.id+'"><div class="section-heading"><h3>模型<span class="count">'+p.models.length+' 个</span></h3><div class="row model-toolbar">'+(p.models.length?btn('toggle-models',icon('sliders')+'<span class="control-label">'+(allClosed?'全部展开':'全部收起')+'</span>',p.id,'quiet icon-label'):'')+btn('sort-models',icon('sort')+' 排序',p.id,'quiet sort-toggle',!sorting&&(locked||p.models.length<2))+btn('catalog',icon('plus')+'<span class="control-label">'+esc(p.catalogLabel)+'</span>',p.id,'icon-label',readOnly||p.saving||!p.connected)+'</div></div><p class="field-hint" style="margin-bottom:12px">名称和 ID 始终显示；展开箭头查看容量与能力参数。</p>'+(p.validation?alertBox(esc(p.validation),'error'):'')+'<div class="model-list">'+(rows||'<div class="empty-box">'+icon('model')+'<strong>还没有添加模型</strong><p>从 Provider 获取目录，或手动填写 Model ID。</p></div>')+'</div><div class="model-actions">'+btn('add-model',icon('plus')+' 手动添加模型',p.id,'',locked)+'</div></section>';
}
function advancedBlock(p) {
  if(!p.advanced.length&&!p.baseURL) return '';
  let controls='';
  if(p.baseURL) controls+='<label class="field"><span class="field-label">API 地址'+(!p.baseURL.editable?' · 固定官方地址':'')+'</span><input type="url" data-url="'+p.id+'" data-focus="url-'+p.id+'" value="'+esc(p.baseURL.value)+'" '+(!p.baseURL.editable?'readonly':'')+'><span class="field-hint">'+(p.baseURL.editable?'更改将影响此 Provider 的模型发现与请求。':'由 Provider 固定，不能修改。')+'</span></label>';
  for(const c of p.advanced) {
    const visible=!c.when||p.advanced.find(v=>v.key===c.when[0])?.value===c.when[1];
    if(!visible) continue;
    const attr=' data-provider="'+p.id+'" data-control="'+c.key+'" data-focus="control-'+p.id+'-'+c.key+'"';
    let input=c.type==='checkbox'?'<label class="checkbox-field"><input type="checkbox"'+attr+' '+(c.value?'checked':'')+'>'+esc(c.label)+'</label>':c.type==='select'?'<label class="field"><span class="field-label">'+esc(c.label)+'</span><select'+attr+'>'+c.options.map(o=>'<option value="'+esc(o.value)+'" '+(String(c.value)===o.value?'selected':'')+'>'+esc(o.label)+'</option>').join('')+'</select></label>':'<label class="field"><span class="field-label">'+esc(c.label)+'</span><input type="number"'+attr+' value="'+esc(c.value)+'" min="'+(c.min??1)+'" step="1"></label>';
    controls+='<div class="control'+(c.when?' control-child':'')+'">'+input+(c.hint?'<p class="field-hint">'+esc(c.hint)+'</p>':'')+'</div>';
  }
  return '<details class="advanced" data-advanced="'+p.id+'" '+(p.advancedOpen?'open':'')+'><summary>'+icon('chevron','chevron')+'高级设置<span class="advanced-note">'+(p.advanced.length?'可选能力与工具':'连接配置')+'</span></summary><fieldset class="advanced-content" '+(readOnly||p.saving?'disabled':'')+'>'+controls+'</fieldset></details>';
}
function providerBody(p, cls='') {
  return '<div class="provider-body '+cls+'" data-provider-body="'+p.id+'"><p class="provider-intro">'+esc(p.description)+'</p>'+(p.notice?alertBox(esc(p.notice),'warn'):'')+(p.development?alertBox('接入规范示例 · Cursor ACP 尚未安装在 3080。仅展示已实现的 CLI 登录和模型能力；额度查询暂不支持。'):'')+(readOnly?alertBox('当前连接为只读。可以查看所有配置，但不能修改账号、模型或排序。','warn'):'')+accountBlock(p)+quotaBlock(p)+modelsBlock(p)+advancedBlock(p)+'<div class="provider-foot">'+icon('lock')+esc(p.name)+' · v'+esc(p.version)+' · '+(p.role==='agent'?'原生 Agent':'LLM Provider')+'</div></div>';
}
function pageTitle(subtitle) { return '<header class="page-title"><div><h1>LLM Providers</h1><p>'+subtitle+'</p></div>'+btn('sort-providers',icon('sort')+' Provider 排序','','sort-toggle',readOnly)+'</header>'; }
function VariantC() {
  if(detailC){const p=getP();return '<div class="breadcrumb"><button data-action="overview">'+icon('back')+' 额度总览</button><span>/</span><span>'+esc(p.name)+'</span></div><article class="full-detail"><div class="detail-title">'+identity(p,true)+'</div>'+providerBody(p,'detail-body')+'</article>';}
  const visible=order.map(getP).filter(p=>filter==='all'||p.role===filter);
  return pageTitle('先看账户额度，再进入独立详情页配置。')+'<div class="overview-note"><span class="number">'+providers.filter(p=>p.connected).length+'</span><div class="grow overview-copy"><strong>已连接的 Provider</strong><p>额度属于各自账户，不合并统计，也不互相替代。</p></div><label class="sidebar-toggle" title="全局控制 Task Panel 的额度显示；关闭设置可预览"><span>在侧边栏显示</span><input id="show-sidebar-usage" type="checkbox" role="switch" aria-label="在侧边栏显示额度" aria-describedby="sidebar-usage-hint" '+(showSidebarUsage?'checked':'')+' '+(readOnly?'disabled':'')+'></label><span id="sidebar-usage-hint" class="sr-only">仅控制 Task Panel 的额度区域；单个 Provider 的选择沿用外部设置。</span></div><div class="section-heading overview-filters"><div class="row">'+[['all','全部'],['llm','LLM'],['agent','Agent']].map(([id,name])=>'<button class="btn '+(filter===id?'':'quiet')+'" data-action="filter" data-filter="'+id+'" aria-pressed="'+(filter===id)+'">'+name+'</button>').join('')+'</div><span class="tiny faint" data-system-zone>系统时区 · '+esc(systemZone())+'</span></div><div class="ledger"><div class="ledger-labels"><span>Provider / 连接状态</span><span>主要窗口 · 剩余额度</span><span>配置</span></div><div id="provider-rows">'+visible.map(p=>'<div class="ledger-row" data-ledger-provider="'+p.id+'" data-sort-id="'+p.id+'"><div class="provider-cell">'+dragHandle(p.id,p.name)+identity(p)+'</div><div class="mini">'+quotaSummary(p)+'</div>'+btn('open-provider','详情',p.id)+'</div>').join('')+'</div></div>';
}
function renderTaskPanel() {
  $('#task-usage').hidden=!showSidebarUsage;
  // Reuse the current quota data; this preview does not duplicate external per-provider preferences.
  $('#task-usage-cards').innerHTML=$('#closed').hidden||!showSidebarUsage?'':providers.filter(p=>p.role==='llm').map(p=>'<button class="task-usage-card" data-action="'+(usageReady?'usage-open':'open-provider')+'" data-provider="'+p.id+'" title="查看 '+esc(p.name)+' 额度详情">'+brand(p)+'<span class="grow"><span class="task-usage-name">'+esc(p.name)+'</span>'+quotaSummary(p)+'</span></button>').join('');
  $('#task-preview-status').textContent=showSidebarUsage?'额度区域已显示。':'额度区域已隐藏，会话和其他侧栏内容不受影响。';
  if(usageReady)updateUsageStudy();
}
function renderDraftbar() {
  const p=getP();
  if(!detailC){$('#draftbar').innerHTML='';return;}
  $('#draftbar').innerHTML=dirty(p)||p.footerError?'<div class="grow"><div class="row"><span class="dot warn"></span><span>'+esc(p.name)+' · '+(p.saving?'正在保存演示配置':'有未保存的更改')+'</span></div>'+(p.footerError?'<div class="tiny danger-text" style="margin-top:4px">'+esc(p.footerError)+'</div>':'')+'</div><div class="actions">'+btn(p.conflict?'reload-config':'discard',p.conflict?'重新载入':'放弃更改',p.id,'',p.saving)+btn('save',p.saving?'保存中…':'保存更改',p.id,'primary',readOnly||p.saving)+'</div>':'';
}
function syncURL() {
  const url=new URL(location.href);url.searchParams.set('variant',usageReady?usageVariant:variant);url.searchParams.set('frame',$('#frame').value);url.searchParams.set('theme',document.documentElement.dataset.theme||'light');
  if(detailC)url.searchParams.set('provider',selected);else url.searchParams.delete('provider');
  history.replaceState(null,'',url);
}
function render(resetScroll=false) {

  const work=$('#workspace'),scroll=work.scrollTop,focus=document.activeElement?.dataset?.focus;
  const cursor=focus&&document.activeElement instanceof HTMLInputElement?document.activeElement.selectionStart:null;
  if(sortDrag)finishPointerSort(false);
  work.innerHTML=VariantC();
  syncSortUI();

  $$('[data-key]',work).forEach(input=>{input.value=keyDrafts.get(input.dataset.key)||'';});
  work.scrollTop=resetScroll?0:scroll;
  if(focus){const next=$('[data-focus="'+CSS.escape(focus)+'"]',work);next?.focus({preventScroll:true});if(next instanceof HTMLInputElement&&cursor!==null&&['text','password','search','url'].includes(next.type))next.setSelectionRange(cursor,cursor);}
  $$('[data-advanced]',work).forEach(d=>d.addEventListener('toggle',()=>{getP(d.dataset.advanced).advancedOpen=d.open;}));
  $('#variant-label').innerHTML='C · 额度总览<small>已选定方案 · 继续细化</small>';
  renderDraftbar();renderTaskPanel();syncURL();
}
function stateSnapshot() {
  return {variant,selected,usageStudy:usageReady?usageSnapshot():null,showSidebarUsage,expandedModels:[...expandedModels],sort:sortState?{type:sortState.type,provider:sortState.provider,items:sortIDs(true)}:null,detailC,frame:$('#frame').value,theme:document.documentElement.dataset.theme,readOnly,order,systemTime:new Date().toISOString(),timeZone:systemZone(),providers:providers.map(p=>({id:p.id,scenario:p.scenario||'normal',connected:p.connected,authExpired:!!p.authExpired,installed:p.installed,conflict:!!p.conflict,saveFailure:!!p.saveFailure,footerError:p.footerError||'',dirty:dirty(p),pendingKey:!!p.pendingKey,quota:p.quota,config:config(p)}))};
}
function record(action) { console.info('[prototype state]',action,stateSnapshot()); }
function toast(text, undo=false) { clearTimeout(toastTimer);$('#toast').innerHTML=esc(text)+(undo?' <button class="link-btn" style="color:inherit;margin-left:8px" data-action="undo-remove">撤销</button>':'');toastTimer=setTimeout(()=>{$('#toast').textContent='';},4500); }
function openProvider(id) { if(sortState)endSort(true);const fromSidebar=!$('#closed').hidden;$('.settings').hidden=false;$('#closed').hidden=true;selected=id;detailC=true;render(true);if(fromSidebar)$('.breadcrumb button').focus({preventScroll:true});record('select provider'); }
function showModal(type, data={}) { modalState={type,...data};renderModal();if(!$('#modal').open)$('#modal').showModal();requestAnimationFrame(()=>{$('input:not([type=checkbox]),select,button',$('#modal'))?.focus();}); }
function closeModal() { $('#modal').close();modalState=null; }
function dialogFrame(title,body,footer='') { return '<div class="dialog-inner"><header class="dialog-header"><h2 id="modal-title">'+title+'</h2><button type="button" class="icon-btn" data-action="close-modal" aria-label="关闭对话框">'+icon('close')+'</button></header><div class="dialog-body">'+body+'</div>'+(footer?'<footer class="dialog-footer">'+footer+'</footer>':'')+'</div>'; }
function dragHandle(id,name) {
  return '<button type="button" class="grip" data-drag="'+esc(id)+'" aria-label="移动 '+esc(name)+'；用上下方向键排序" title="拖动或用上下方向键排序；Esc 取消">'+icon('grip')+'</button>';
}
function sortIDs(includeHidden=false) { return sortState.type==='sort-providers'?order.filter(id=>includeHidden||filter==='all'||getP(id).role===filter):getP(sortState.provider).models.map(m=>m.uid); }
function syncSortUI() {
  $$('[data-action="sort-providers"],[data-action="sort-models"]').forEach(button=>{const active=sortState?.type===button.dataset.action,p=getP(button.dataset.provider);button.disabled=!active&&(button.dataset.action==='sort-models'?modelLocked(p)||p.models.length<2:readOnly);button.setAttribute('aria-pressed',String(active));button.innerHTML=icon(active?'check':'sort')+' '+(active?'完成排序':button.dataset.action==='sort-providers'?'Provider 排序':'排序');});
  for(const list of [$('#provider-rows'),$('.model-list')].filter(Boolean)){
    const active=sortState?.type===(list.id==='provider-rows'?'sort-providers':'sort-models');
    list.classList.toggle('sort-list',active);
    $$('[data-sort-id]',list).forEach(row=>{
      row.classList.toggle('sort-row',active);
    });
    const controls=list.id==='provider-rows'?$$('[data-action="open-provider"]',list):$$('.model-editor input,.model-editor select,[data-action="toggle-model"],[data-action="catalog"],[data-action="add-model"],[data-action="toggle-models"]',list.closest('[data-model-catalog]'));
    controls.forEach(el=>{if(active){if(el.dataset.sortDisabled===undefined)el.dataset.sortDisabled=String(el.disabled);el.disabled=true;}else if(el.dataset.sortDisabled!==undefined){el.disabled=el.dataset.sortDisabled==='true';delete el.dataset.sortDisabled;}});
  }
}
function setSortOrder(items) {
  if(sortState.type==='sort-providers')order=[...items];
  else{const p=getP(sortState.provider);p.models=items.map(id=>p.models.find(m=>m.uid===id));}
  renderDraftbar();
}
function restoreSortOrder(items) {
  const current=sortIDs(true),original=new Set(items),remaining=items.filter(id=>current.includes(id));let index=0;
  // Cancel order changes, not deletions or restorations made in the model draft.
  setSortOrder(current.map(id=>original.has(id)?remaining[index++]:id));
  const list=$('.sort-list');for(const id of sortIDs())list.append($('[data-sort-id="'+id+'"]',list));
}
function beginSort(type,p) {
  if(sortState){if(sortState.type===type)endSort(true);return;}
  if(readOnly||p?.saving)return;
  const items=type==='sort-models'?p.models.map(m=>m.uid):[...order];
  sortState={type,provider:type==='sort-models'?p.id:null,original:[...items]};
  syncSortUI();record('begin in-place sort');
}
function endSort(commit) {
  if(!sortState)return;if(sortDrag)finishPointerSort(false);
  const s=sortState;if(!commit)restoreSortOrder(s.original);
  sortState=null;syncSortUI();renderDraftbar();
  $('[data-action="'+s.type+'"]')?.focus({preventScroll:true});
  toast(commit?(s.type==='sort-models'?'模型顺序已更新；保存更改后生效':'Provider 顺序已更新'):'已取消排序，原顺序与草稿保留');record(commit?'finish in-place sort':'cancel in-place sort');
}
function renderModal() {
  const s=modalState,p=getP(s.provider);
  let html='';
  if(s.type==='catalog') html=dialogFrame(esc(p.name)+' · 选择模型','<p class="dialog-description">'+esc(p.catalogLabel)+'。Fast 和大上下文版本是独立条目；未勾选模型不会出现在目录中。</p><input class="catalog-search" type="search" id="catalog-search" placeholder="搜索名称或 Model ID" aria-label="搜索模型" autofocus><div id="candidate-list"></div>', '<span class="count" id="picker-count"></span>'+btn('close-modal','取消')+btn('apply-catalog','应用到模型目录','','primary'));
  if(s.type==='account-menu') html=dialogFrame('管理 '+esc(p.name)+' 账号','<div class="account"><div>'+esc(p.account||'演示账户')+'<div class="account-meta">'+status(p)+'</div></div></div><p class="dialog-description">'+(p.auth==='google'?'切换账号将影响此 DSH 实例的所有设备。退出仅清除此实例的隔离登录，不会撤销 Google 授权。':p.auth==='cursor-cli'?'Cursor ACP 使用这台机器的 Cursor CLI 登录状态，不是独立的 Google 登录配置。':'退出后清除账号额度展示，但保留模型配置。')+'</p>',btn('confirm-logout','退出登录',p.id,'danger')+btn('confirm-switch','切换账号',p.id));
  if(['confirm-logout','confirm-switch','discard','reload-config'].includes(s.type)) {
    const configAction=['discard','reload-config'].includes(s.type);
    html=dialogFrame(configAction?'放弃未保存的更改？':s.type==='confirm-switch'?'切换账号？':'退出登录？','<p class="dialog-description">'+(configAction?'这将重新载入上次保存的 '+esc(p.name)+' 配置，移除当前未保存的编辑与新密钥输入状态。':s.type==='confirm-switch'?'接下来重新授权 '+esc(p.name)+'。模型草稿保留，原账号额度将清除。':'退出 '+esc(p.name)+'，并清除其额度缓存。模型配置与草稿保留。')+'</p>',btn('close-modal','取消')+btn('confirm-action',configAction?'放弃并重新载入':s.type==='confirm-switch'?'继续切换':'确认退出',p.id,configAction?'danger':'primary'));
  }
  if(s.type==='auth') html=authDialog(p);
  if(s.type==='scope') html=dialogFrame('原型范围','<p class="dialog-description">本次只重设计 LLM Providers。其余设置导航保留真实外壳的位置，不复制无关页面。</p>',btn('close-modal','返回 Provider 设置','','primary'));
  if(s.type==='review') html=reviewDialog();
  if(s.type==='config-preview') html=dialogFrame('演示配置 · 只读','<p class="dialog-description">这不是实际配置文件。所有更改只在当前页面内存中；刷新页面会重置。</p><pre class="state-json">'+esc(JSON.stringify({order,providers:providers.map(v=>({id:v.id,...config(v)}))},null,2))+'</pre>',btn('close-modal','关闭'));
  $('#modal').innerHTML=html;
  if(s.type==='catalog')renderCandidates('');
}
function renderCandidates(query) {
  const p=getP(modalState.provider),q=query.trim().toLowerCase();
  const visible=p.candidates.filter(m=>(m.id+' '+m.name).toLowerCase().includes(q));
  const groups=[...new Set(visible.map(m=>m.group||p.name))];
  $('#candidate-list').innerHTML=groups.length?groups.map(g=>'<section class="picker-group"><h3>'+esc(g)+'</h3>'+visible.filter(m=>(m.group||p.name)===g).map(m=>'<label class="candidate"><input type="checkbox" data-candidate="'+esc(m.id)+'" '+(modalState.picked.has(m.id)?'checked':'')+'><span><span class="candidate-name">'+esc(m.name)+'</span><div class="candidate-id mono">'+esc(m.id)+'</div><div class="candidate-hint">'+esc(m.hint||((m.vision?'视觉 · ':'')+(m.thinking?'推理 · ':'')+(m.context?Number(m.context).toLocaleString('en-US')+' Tokens':'上下文由 Provider 提供')))+'</div></span></label>').join('')+'</section>').join(''):'<div class="empty-box">'+icon('search')+'<p>未找到匹配的模型</p><small>尝试其他名称，或关闭后手动添加。</small></div>';
  $('#picker-count').textContent='已选择 '+modalState.picked.size+' 个模型';
}
function authDialog(p) {
  const s=modalState;
  const providerNames={chatgpt:'ChatGPT',cursor:'Cursor',xai:'xAI',google:'Google','cursor-cli':'Cursor CLI'};
  const remote=!!s.remote;
  let body='<p class="dialog-description">使用 '+providerNames[p.auth]+' 账号授权 '+esc(p.name)+'。此处为交互模拟，不会打开真实授权或发送任何凭据。</p>';
  if(p.auth==='chatgpt') body+='<div class="auth-code mono">ABCD-EFGH</div><div class="row">'+btn('copy-code','复制设备码')+btn('open-auth',icon('external')+' 打开 ChatGPT 登录页')+'</div><p class="field-hint">也支持直接浏览器 OAuth；这里展示需要设备码的分支。</p>';
  else body+=btn('open-auth',icon('external')+' 打开 '+providerNames[p.auth]+' 登录页','','primary');
  if(s.opened)body+='<div class="auth-progress row muted">'+icon('refresh','spin')+'等待在浏览器中完成授权…</div>';
  if(p.auth==='xai') body+='<label class="field"><span class="field-label">登录授权码</span><input id="auth-input" autocomplete="off" placeholder="输入 demo-code 体验提交" aria-label="登录授权码"></label>'+btn('submit-auth','提交授权码','','primary');
  if(p.auth==='google') body+='<div class="demo-strip"><label class="checkbox-field"><input id="auth-remote" type="checkbox" '+(remote?'checked':'')+'>原型场景：从远程浏览器 / App 登录</label></div>'+(remote?'<label class="field"><span class="field-label">授权后地址</span><input id="auth-input" type="url" placeholder="http://127.0.0.1:51821/?code=demo&state=demo" aria-label="Google 授权回调地址"><span class="field-hint">真实实现验证原端口与 state；这里仅接受演示回调。不要粘贴真实凭据。</span></label><div class="row">'+btn('copy-link','复制演示登录链接')+btn('submit-auth','继续登录','','primary')+'</div>':'<p class="field-hint">本机浏览器完成授权后，回调自动返回。远程 / App 使用复制地址方式继续。</p>');
  if(p.auth==='cursor-cli')body+='<div class="auth-url mono">cursor-agent login<br>cursor.com/loginDeepControl → cursor-agent://login</div>'+alertBox('Cursor ACP 需要本机 CLI。不使用 Google 的 127.0.0.1 回调粘贴，也不展示尚未实现的取消登录接口。')+btn('check-auth','检查登录状态');
  body+='<div class="demo-strip"><div class="row between wrap"><span>原型控制 · 不属于正式界面</span>'+btn('auth-success','模拟授权成功')+'</div><p style="margin-top:7px">可用此按钮走完登录、连接状态和额度联动，不需要真实账户。</p></div>';
  return dialogFrame('连接 '+esc(p.name),body,btn('close-modal',p.auth==='cursor-cli'?'关闭':'取消登录'));
}
function reviewDialog() {
  const p=getP();
  const scenarios=[['normal','正常数据'],['logged-out','未连接'],['reauth','授权失效'],['loading','额度加载中'],['low','额度偏低 · 8%'],['zero','额度已用尽 · 0%'],['unknown-reset','重置时间未知'],['empty','无额度数据'],['stale','刷新失败 · 保留缓存'],['error','读取失败 · 无缓存'],['readonly','只读配置'],['save-error','下一次保存失败'],['conflict','配置版本冲突'],['missing','Agent 运行环境未安装']];
  return dialogFrame('状态与接入规范','<div class="review-grid"><label class="field"><span class="field-label">预览 Provider</span><select id="review-provider">'+providers.map(v=>'<option value="'+v.id+'" '+(v.id===selected?'selected':'')+'>'+esc(v.name)+'</option>').join('')+'</select></label><label class="field"><span class="field-label">预览状态</span><select id="review-scenario">'+scenarios.map(([id,label])=>'<option value="'+id+'" '+(p.scenario===id?'selected':'')+'>'+label+'</option>').join('')+'</select></label></div>'+btn('apply-scenario','应用预览状态','','primary')+'<div class="section-heading" style="margin:0"><h3>所有 Provider 遵守同一套规则</h3></div><ol class="design-rules"><li>账号 → 额度 → 模型 → 可选高级设置。没有能力时不伪造开关。</li><li>同层级进度条等宽；整数显示，原值保留用于填充和阈值判断。</li><li>重置时间跟随浏览器系统时区与当前时间；精确时间缺失就说明，不用周期推算日期。</li><li>模型参数默认折叠；支持展开/收起，ID 与名称常显。高级设置默认收起。</li><li>排序按钮原位切换为完成排序，仅列表出现手柄；单一手柄支持鼠标、触摸和键盘。</li><li>Cursor ACP 只展示已实现能力；不借用 Cursor LLM 的额度或 Google 登录回调。</li></ol><p class="tiny muted">重置时间按系统时区显示，倒计时使用当前系统时间并自动更新；额度数值仍是演示数据。</p><details><summary class="tiny muted" style="cursor:pointer">查看完整内存状态（无凭据）</summary><pre class="state-json" style="margin-top:10px">'+esc(JSON.stringify(stateSnapshot(),null,2))+'</pre></details>',btn('close-modal','返回原型'));
}
function applyScenario() {
  if(sortState)endSort(false);
  selected=$('#review-provider').value;const p=getP(),name=$('#review-scenario').value,seed=window.PROVIDER_DEMO.find(v=>v.id===selected);
  p.quota=copy(seed.quota);p.connected=seed.connected;p.installed=true;p.authExpired=false;p.footerError='';p.validation='';p.saveFailure=false;p.conflict=false;readOnly=false;p.scenario=name;
  if(name==='logged-out'||name==='reauth')p.connected=false;
  if(name==='reauth')p.authExpired=true;
  if(['loading','empty','stale','error'].includes(name)){if(p.quota.status!=='unsupported')p.quota.status=name;if(name==='empty')p.quota.windows=[];}
  if(['low','zero'].includes(name)){if(p.quota.status!=='unsupported'&&p.quota.windows.some(validRemaining)){p.quota.status='ready';p.quota.windows.find(validRemaining).remaining=name==='low'?8:0;}else toast('此 Provider 没有可用额度接口/数据，不伪造进度条。');}
  if(name==='unknown-reset')p.quota.windows.forEach(w=>w.reset=null);
  if(name==='readonly')readOnly=true;
  if(name==='save-error')p.saveFailure=true;
  if(name==='conflict')p.conflict=true;
  if(name==='missing'){if(p.role==='agent'){p.installed=false;p.connected=false;}else toast('运行环境安装状态只适用于原生 Agent。');}
  detailC=true;closeModal();render(true);record('scenario '+name);
}
function refresh(p) {
  p.refreshing=true;render();
  setTimeout(()=>{if(getP(p.id)!==p)return;const seed=window.PROVIDER_DEMO.find(v=>v.id===p.id);p.refreshing=false;if(p.quota.status!=='unsupported'){p.quota=copy(seed.quota);if(p.quota.status==='idle')p.quota.status=p.quota.windows.length?'ready':'empty';p.updated=new Date().toISOString();}render();toast('已刷新演示额度；未发送实际请求');record('refresh quota');},650);
}
function validate(p) {
  const ids=p.models.map(m=>m.id.trim());
  if(ids.some(id=>!id))return '每个模型都需要填写 Model ID。';
  if(new Set(ids).size!==ids.length)return 'Model ID 不能重复，请修改后再保存。';
  if(p.models.some(m=>m.context!==''&&(!Number.isSafeInteger(Number(m.context))||Number(m.context)<1)))return '上下文窗口必须为空（Provider 默认）或正整数。';
  if(p.baseURL?.editable){try{const u=new URL(p.baseURL.value);if(!['https:','http:'].includes(u.protocol))return 'API 地址必须使用 HTTP 或 HTTPS。';}catch{return '请输入有效的 API 地址。';}}
  if(p.advanced.some(c=>c.type==='number'&&(!c.when||p.advanced.find(v=>v.key===c.when[0])?.value===c.when[1])&&(!Number.isSafeInteger(Number(c.value))||Number(c.value)<(c.min||1))))return '高级设置中的 Token 上限必须为正整数。';
  return '';
}
function save(p) {
  if(readOnly)return;
  if(sortState)endSort(true);
  p.validation=validate(p);p.footerError='';
  if(p.validation){p.models.forEach(m=>expandedModels.add(modelKey(p,m)));render();toast(p.validation);$('[data-model-catalog="'+p.id+'"]')?.scrollIntoView({block:'start'});return;}
  if(p.conflict){p.footerError='配置已被其他客户端更新。草稿保留；请重新载入或继续编辑。';render();return;}
  p.saving=true;render();
  setTimeout(()=>{if(getP(p.id)!==p)return;p.saving=false;if(p.saveFailure){p.saveFailure=false;p.footerError='保存失败，草稿已保留。恢复连接后可重试。';render();record('save failed');return;}p.models.forEach(m=>m.id=m.id.trim());saved.set(p.id,copy(config(p)));if(p.pendingKey){keyDrafts.delete(p.id);p.pendingKey=false;p.connected=true;p.authExpired=false;p.quota={status:'idle',windows:[],facts:[],activity:[]};}p.footerError='';render();toast('已保存到演示内存，真实配置未改变');record('save draft');},450);
}
function discard(p) { if(sortState)endSort(false);keyDrafts.delete(p.id);Object.assign(p,copy(saved.get(p.id)));p.pendingKey=false;p.validation='';p.footerError='';p.conflict=false;p.saveFailure=false; }
function moveSort(id,to) {
  const items=[...sortIDs()],from=items.indexOf(id);to=Math.max(0,Math.min(items.length-1,to));if(from<0||from===to)return;
  items.splice(to,0,items.splice(from,1)[0]);const visible=new Set(items);let index=0;
  setSortOrder(sortIDs(true).map(id=>visible.has(id)?items[index++]:id));
  const list=$('.sort-list'),node=$('[data-sort-id="'+id+'"]',list),nextId=items[to+1];list.insertBefore(node,nextId?$('[data-sort-id="'+nextId+'"]',list):null);
  $('#announce').textContent='已移动到第 '+(to+1)+' 位，共 '+items.length+' 项。';
}
function dragOver(x,y) {
  const row=document.elementFromPoint(x,y)?.closest('[data-sort-id]');if(!row||row.dataset.sortId===sortDrag.id)return;
  const items=sortIDs(),from=items.indexOf(sortDrag.id),to=items.indexOf(row.dataset.sortId),r=row.getBoundingClientRect();
  if((from<to&&y>r.top+r.height/2)||(from>to&&y<r.top+r.height/2))moveSort(sortDrag.id,to);
}
function startPointerSort(event,handle) {
  if(event.button!==0||sortDrag)return;event.preventDefault();handle.focus({preventScroll:true});
  const row=handle.closest('.sort-row'),rect=row.getBoundingClientRect(),ghost=row.cloneNode(true);
  const copies=[ghost,...$$('*',ghost)];
  // Snapshot layout: the floating copy has no workspace container or mobile-shell ancestor.
  [row,...$$('*',row)].forEach((node,i)=>{const css=getComputedStyle(node);for(const key of ['display','grid-template-columns','grid-column','grid-row','width','height','min-height','font-size','line-height','padding','gap','border-width'])copies[i].style.setProperty(key,css.getPropertyValue(key));});
  ghost.classList.add('sort-ghost');ghost.inert=true;ghost.removeAttribute('data-sort-id');ghost.removeAttribute('data-model-row');
  $$('[id],[data-drag],[data-model-row]',ghost).forEach(el=>{el.removeAttribute('id');el.removeAttribute('data-drag');el.removeAttribute('data-model-row');});ghost.setAttribute('aria-hidden','true');
  Object.assign(ghost.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px'});document.body.append(ghost);row.classList.add('grabbed');
  sortDrag={id:handle.dataset.drag,pointerId:event.pointerId,ghost,row,offset:event.clientY-rect.top,original:sortIDs(true),x:event.clientX,y:event.clientY,frame:0};
  try{handle.setPointerCapture(event.pointerId);}catch{/* prototype browser may not expose pointer capture */}
  function scrollEdge(){if(!sortDrag)return;const work=$('#workspace'),r=work.getBoundingClientRect(),y=sortDrag.y;const list=$('.sort-list').getBoundingClientRect(),band=Math.min(38,r.height/3);const dy=y<r.top+band?Math.max(-10,Math.min(0,list.top-r.top)):y>r.bottom-band?Math.min(10,Math.max(0,list.bottom-r.bottom)):0;if(dy){work.scrollTop+=dy;dragOver(sortDrag.x,y);}sortDrag.frame=requestAnimationFrame(scrollEdge);}
  sortDrag.frame=requestAnimationFrame(scrollEdge);
}
function finishPointerSort(commit) {
  if(!sortDrag)return;const drag=sortDrag;sortDrag=null;cancelAnimationFrame(drag.frame);drag.ghost.remove();drag.row.classList.remove('grabbed');if(!commit){restoreSortOrder(drag.original);$('[data-drag="'+drag.id+'"]')?.focus({preventScroll:true});}record(commit?'pointer sort preview':'cancel pointer sort');
}
function authSuccess(p) { p.connected=true;p.authExpired=false;p.installed=true;p.account=p.auth==='google'?'design.demo@gmail.com':p.auth==='cursor-cli'?'cursor.demo@example.com':p.account||'design.demo@example.com';p.quota=copy(window.PROVIDER_DEMO.find(v=>v.id===p.id).quota);p.footerError='';closeModal();render();toast('演示账号已连接，未进行真实授权');record('auth success'); }
document.addEventListener('click',async event=>{
  const target=event.target.closest('[data-action]');if(!target||target.disabled)return;
  const action=target.dataset.action,p=getP(target.dataset.provider||modalState?.provider);
  if(action==='open-provider')return openProvider(target.dataset.provider);
  if(action==='close-modal')return closeModal();
  if(action==='overview'){if(sortState)endSort(true);detailC=false;render(true);return;}
  if(action==='filter'){filter=target.dataset.filter;render(true);return;}
  if(action==='theme'){document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';$('#theme-button').textContent=document.documentElement.dataset.theme==='dark'?'浅色':'深色';syncURL();record('theme');return;}
  if(action==='close-settings'){if(sortState)endSort(true);$('.settings').hidden=true;$('#closed').hidden=false;renderTaskPanel();$('#closed [data-action=reopen]').focus();return;}
  if(action==='reopen'){$('.settings').hidden=false;$('#closed').hidden=true;renderTaskPanel();const toggle=$('#show-sidebar-usage');(toggle&&!toggle.disabled?toggle:$('#close-settings')).focus({preventScroll:true});return;}
  if(action==='scope'||action==='review'||action==='config-preview')return showModal(action);
  if(action==='reset-demo'){if(sortDrag)finishPointerSort(false);sortState=null;expandedModels.clear();keyDrafts.clear();providers=copy(window.PROVIDER_DEMO);order=providers.map(v=>v.id);saved=new Map(providers.map(v=>[v.id,copy(config(v))]));readOnly=false;showSidebarUsage=true;detailC=false;selected='codex';filter='all';if($('#modal').open)closeModal();render(true);toast('已重置全部演示数据');record('reset');return;}
  if(action==='sort-providers'||action==='sort-models')return beginSort(action,p);
  if(action==='toggle-model'){const key=p.id+':'+target.dataset.model;if(expandedModels.has(key))expandedModels.delete(key);else expandedModels.add(key);render();record('toggle model parameters');return;}
  if(action==='toggle-models'){const allClosed=p.models.every(m=>!expandedModels.has(modelKey(p,m)));p.models.forEach(m=>allClosed?expandedModels.add(modelKey(p,m)):expandedModels.delete(modelKey(p,m)));render();$('[data-action="toggle-models"][data-provider="'+p.id+'"]')?.focus({preventScroll:true});record('toggle all model parameters');return;}
  if(action==='catalog')return showModal('catalog',{provider:p.id,picked:new Set(p.models.map(m=>m.id))});
  if(action==='apply-catalog'){const v=getP(modalState.provider);const chosen=modalState.picked;v.models=[...v.models.filter(m=>chosen.has(m.id)),...v.candidates.filter(m=>chosen.has(m.id)&&!v.models.some(old=>old.id===m.id)).map(m=>({...copy(m),uid:crypto.getRandomValues(new Uint32Array(4)).join('-')}))];selected=v.id;closeModal();render();toast('模型目录已更新；保存后生效');record('catalog selection');return;}
  if(action==='add-model'){p.models.push({uid:crypto.getRandomValues(new Uint32Array(4)).join('-'),id:'',name:'',context:'',vision:false,thinking:false,effort:''});selected=p.id;render();const row=$('[data-model-row="'+p.models.at(-1).uid+'"]');row?.scrollIntoView({block:'center'});$('input',row)?.focus();record('add model');return;}
  if(action==='remove-model'){const index=p.models.findIndex(m=>m.uid===target.dataset.model);if(modelLocked(p)||index<0)return;removed={provider:p.id,index,model:p.models[index]};p.models.splice(index,1);selected=p.id;render();toast('已从草稿移除模型，尚未保存',true);record('remove model');return;}
  if(action==='undo-remove'&&removed){const v=getP(removed.provider);if(modelLocked(v))return;v.models.splice(removed.index,0,removed.model);removed=null;render();toast('已恢复模型');return;}
  if(action==='save')return save(p);
  if(['discard','reload-config','account-menu','confirm-logout','confirm-switch'].includes(action))return showModal(action,{provider:p.id});
  if(action==='confirm-action'){const type=modalState.type;if(type==='discard'||type==='reload-config'){discard(p);closeModal();render();toast('已恢复上次保存的演示配置');}else{p.connected=false;p.quota={status:p.id==='cursor-acp'?'unsupported':'empty',windows:[],facts:[],activity:[]};if(type==='confirm-switch'){showModal('auth',{provider:p.id});render();}else{closeModal();render();toast('演示账号已退出，模型草稿保留');}}record('confirm '+type);return;}
  if(action==='auth-start')return showModal('auth',{provider:p.id});
  if(action==='open-auth'){modalState.opened=true;renderModal();record('open simulated auth');return;}
  if(action==='copy-code'||action==='copy-link'){try{await navigator.clipboard.writeText(action==='copy-code'?'ABCD-EFGH':'https://accounts.google.com/o/oauth2/v2/auth?client_id=DEMO_ONLY');toast('已复制演示内容');}catch{toast('剪贴板不可用，请手动选择演示内容。');}return;}
  if(action==='auth-success')return authSuccess(p);
  if(action==='check-auth'){toast('模拟：CLI 尚未完成登录。使用“模拟授权成功”预览连接后状态。');return;}
  if(action==='submit-auth'){const value=$('#auth-input').value.trim();if(!value){$('#auth-input').reportValidity();toast('请填写演示授权内容');return;}if(p.auth==='google'&&!/^http:\/\/127\.0\.0\.1:51821\/\?/.test(value)){toast('演示回调必须使用 http://127.0.0.1:51821/');return;}return authSuccess(p);}
  if(action==='refresh')return refresh(p);
  if(action==='apply-scenario')return applyScenario();
  if(action==='probe'){toast('演示检查：尚未找到原生运行环境。');return;}
  if(action==='install'){p.installing=true;render();setTimeout(()=>{if(getP(p.id)!==p)return;p.installing=false;p.installed=true;p.connected=false;render();toast('演示安装完成，可继续连接账号');record('install native runtime');},1100);return;}
});
document.addEventListener('input',event=>{
  const input=event.target;
  if(input.id==='catalog-search'){renderCandidates(input.value);return;}
  if(input.dataset.key){const p=getP(input.dataset.key);if(input.value)keyDrafts.set(p.id,input.value);else keyDrafts.delete(p.id);p.pendingKey=!!input.value;selected=p.id;renderDraftbar();return;}
  if(input.dataset.url){const p=getP(input.dataset.url);p.baseURL.value=input.value;selected=p.id;renderDraftbar();return;}
  if(input.dataset.model&&input.dataset.field&&input.type!=='checkbox'&&input.tagName!=='SELECT'){const p=getP(input.dataset.provider);p.models.find(m=>m.uid===input.dataset.model)[input.dataset.field]=input.value;p.validation='';selected=p.id;renderDraftbar();return;}
  if(input.dataset.control&&input.type==='number'){const p=getP(input.dataset.provider);p.advanced.find(c=>c.key===input.dataset.control).value=input.value;selected=p.id;renderDraftbar();}
});
document.addEventListener('change',event=>{
  const input=event.target;
  if(input.id==='show-sidebar-usage'){if(readOnly){input.checked=showSidebarUsage;return;}showSidebarUsage=input.checked;renderTaskPanel();record('sidebar quota visibility');return;}
  if(input.id==='frame'){document.documentElement.style.setProperty('--frame',input.value+'px');syncURL();return;}
  if(input.id==='auth-remote'){modalState.remote=input.checked;renderModal();return;}
  if(input.dataset.candidate){if(input.checked)modalState.picked.add(input.dataset.candidate);else modalState.picked.delete(input.dataset.candidate);$('#picker-count').textContent='已选择 '+modalState.picked.size+' 个模型';return;}
  if(input.dataset.model&&input.dataset.field){if(input.type!=='checkbox'&&input.tagName!=='SELECT'){record('edit model');return;}const p=getP(input.dataset.provider),m=p.models.find(v=>v.uid===input.dataset.model);m[input.dataset.field]=input.type==='checkbox'?input.checked:input.value;if(input.dataset.field==='thinking'&&!input.checked)m.effort='';selected=p.id;render();record('edit model');return;}
  if(input.dataset.control){if(input.type==='number'){record('edit advanced setting');return;}const p=getP(input.dataset.provider);p.advanced.find(c=>c.key===input.dataset.control).value=input.type==='checkbox'?input.checked:input.value;selected=p.id;render();record('edit advanced setting');}
});
document.addEventListener('pointerdown',event=>{const handle=event.target.closest('[data-drag]');if(handle&&sortState)startPointerSort(event,handle);});
window.addEventListener('pointermove',event=>{
  if(!sortDrag||sortDrag.pointerId!==event.pointerId)return;event.preventDefault();sortDrag.x=event.clientX;sortDrag.y=event.clientY;sortDrag.ghost.style.top=event.clientY-sortDrag.offset+'px';dragOver(event.clientX,event.clientY);
},{passive:false});
window.addEventListener('pointerup',event=>{if(sortDrag?.pointerId===event.pointerId)finishPointerSort(true);});
window.addEventListener('pointercancel',event=>{if(sortDrag?.pointerId===event.pointerId)finishPointerSort(false);});
document.addEventListener('keydown',event=>{
  // One Escape cancels sorting, even when the browser sends pointercancel before keydown.
  if(sortState&&!$('#modal').open&&event.key==='Escape'){event.preventDefault();event.stopPropagation();endSort(false);return;}
  const handle=event.target.closest?.('[data-drag]');
  if(handle&&sortState&&['ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();moveSort(handle.dataset.drag,sortIDs().indexOf(handle.dataset.drag)+(event.key==='ArrowDown'?1:-1));handle.focus();record('keyboard sort preview');return;}


});
$('#modal').addEventListener('cancel',event=>{event.preventDefault();closeModal();});
$('#modal').addEventListener('click',event=>{if(event.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeModal();}});
$('#settings-nav').innerHTML=[['settings','通用'],['link','远程连接'],['sort','模型切换'],['model','模型'],['globe','LLM Providers'],['chart','用量'],['sliders','插件'],['agent','Agent 预设'],['shop','插件市场']].map(([glyph,label])=>'<button class="nav-cell'+(glyph==='globe'?' active':'')+'" data-action="'+(glyph==='globe'?'reopen':'scope')+'"'+(glyph==='globe'?' aria-current="page"':'')+'>'+icon(glyph)+'<span>'+label+'</span></button>').join('');
$('#frame').value=['390','800','1040'].includes(params.get('frame'))?params.get('frame'):'1040';
document.documentElement.style.setProperty('--frame',$('#frame').value+'px');
document.documentElement.dataset.theme=params.get('theme')==='dark'?'dark':'light';$('#theme-button').textContent=document.documentElement.dataset.theme==='dark'?'浅色':'深色';
new ResizeObserver(entries=>{const mobile=entries[0].contentRect.width<=620||(innerWidth<=1000&&(document.documentElement.dataset.compact==='true'||matchMedia('(pointer:coarse)').matches));$('.settings').classList.toggle('mobile-shell',mobile);if(mobile){const nav=$('.nav-list'),active=$('.nav-cell.active');nav.scrollLeft=active.offsetLeft-nav.offsetLeft-(nav.clientWidth-active.clientWidth)/2;}}).observe($('.settings'));
const chromeSize=new ResizeObserver(entries=>entries.forEach(entry=>document.documentElement.style.setProperty(entry.target.id==='draftbar'?'--draft-height':'--controls-height',Math.ceil(entry.target.getBoundingClientRect().height)+'px')));
chromeSize.observe($('.prototype-bar'));chromeSize.observe($('#draftbar'));
function fitViewport(){const v=window.visualViewport;if(v&&v.scale!==1)return;const h=v?.height||innerHeight;document.documentElement.style.setProperty('--viewport-height',h+'px');document.documentElement.style.setProperty('--viewport-bottom',Math.max(0,innerHeight-h-(v?.offsetTop||0))+'px');document.documentElement.dataset.compact=String(h<560);if(document.activeElement?.matches('input,textarea,select'))requestAnimationFrame(()=>document.activeElement?.scrollIntoView({block:'nearest'}));}
window.visualViewport?.addEventListener('resize',fitViewport);window.addEventListener('resize',fitViewport);fitViewport();
setInterval(refreshTimes,60000);window.addEventListener('focus',refreshTimes);
render();record('initial');
if(params.get('surface')==='task')initUsageStudy();
