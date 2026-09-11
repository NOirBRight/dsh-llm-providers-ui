import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Settings > LLM Providers page shell. Provider cards arrive through settings.provider.item. */
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { applySavedOrder, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS } from '../order.js';
import { formatResetLabel, pickPrimaryWindow } from './usage.js';
import { ProviderQuotaMeter } from './provider-ui.js';
import { ProviderMark } from './provider-marks.js';
import { SortableList } from './SortableList.js';
import { providerUiCss, ProviderRoleBadge } from './provider-ui.js';
import { settingsCCss } from './settings-c-css.js';
// ponytail: the native dialog lives inside the sidebar; remove ancestry overrides once the host portals settings.
const providerShellCss = `
div:has([role="dialog"] [data-providers-section]){opacity:1!important;visibility:visible!important;z-index:1000!important;pointer-events:auto!important}
@media(max-width:680px){
 [role="dialog"]:has([data-providers-section]){flex-direction:column;width:calc(100% - 16px);max-width:calc(100% - 16px);height:calc(100dvh - 16px);max-height:calc(100dvh - 16px)}
 [role="dialog"]:has([data-providers-section])>nav{width:100%;min-width:0;flex:none;padding:8px;border-right:0;border-bottom:1px solid var(--dsw-alias-border-l2)}
 [role="dialog"]:has([data-providers-section])>nav>div:last-child{display:flex;flex-direction:row;gap:4px;overflow-x:auto}
 [role="dialog"]:has([data-providers-section])>nav button{flex:none;white-space:nowrap;min-height:44px;padding:8px 10px}
 [role="dialog"]:has([data-providers-section])>div{width:100%;min-width:0;min-height:0;flex:1}
}
`;
const fallbackWrapStyle = { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 };
const fallbackBadgeAlign = { alignSelf: 'flex-start' };
const API_KEY_AUTH = /(?:ollama|opencode-go|commandcode)$/u;
function linkState(key, account, summary) {
    if (account !== undefined)
        return account.state;
    if (summary === undefined || summary.status === 'logged-out')
        return 'unconnected';
    return API_KEY_AUTH.test(key) ? 'configured' : 'connected';
}
function countModels(root) {
    const rows = root.querySelectorAll('[data-provider-model]').length;
    if (rows > 0)
        return rows;
    const text = [...root.querySelectorAll('[data-provider-header-summary]')].map(node => node.textContent ?? '').join(' ');
    const match = /(\d+)\s*(?:models?|个模型)/iu.exec(text);
    return match === null ? undefined : Number(match[1]);
}
function IconSort() {
    return _jsx("svg", { className: "c-ico", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: "M5 2v12m-3-3 3 3 3-3M11 14V2m-3 3 3-3 3 3" }) });
}
function IconCheck() {
    return _jsx("svg", { className: "c-ico", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: "M3 8l3 3 7-7" }) });
}
function IconBack() {
    return _jsx("svg", { className: "c-ico", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: "M10 3 5 8l5 5" }) });
}
function IconRefresh() {
    return _jsx("svg", { className: "c-ico", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: "M13 6a5.2 5.2 0 1 0 .1 4M13 2v4H9" }) });
}
function svgIcon(path) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'c-ico');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.3');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    node.setAttribute('d', path);
    svg.append(node);
    return svg;
}
function isZh() {
    return typeof document !== 'undefined' && document.documentElement.lang.toLowerCase().startsWith('zh');
}
/** Real flex items of the detail column: display:contents wrappers collapse into it. */
function flexItems(root) {
    const items = [];
    const walk = (node) => {
        for (const child of node.children) {
            if (!(child instanceof HTMLElement))
                continue;
            if (child.tagName === 'STYLE' || child.tagName === 'SCRIPT')
                continue;
            if (getComputedStyle(child).display === 'contents') {
                walk(child);
                continue;
            }
            items.push(child);
        }
    };
    walk(root);
    return items;
}
/** Prototype C reading order: intro, notice, account, quota, models, advanced, footer, draft bar. */
function orderOf(item) {
    if (item.matches('.c-crumb'))
        return 1;
    if (item.matches('.c-detail-title'))
        return 2;
    if (item.matches('.c-account-head'))
        return 5;
    if (item.classList.contains('c-account'))
        return 6;
    if (item.hasAttribute('data-c-quota'))
        return 7;
    if (item.hasAttribute('data-c-hide'))
        return 99;
    if (item.tagName === 'SECTION') {
        if (isUsageBlock(item))
            return 99;
        if (isModelBlock(item))
            return 8;
        if (item.classList.contains('c-account'))
            return 6;
        return 9;
    }
    if (item.tagName === 'DETAILS')
        return 10;
    if (item.tagName === 'P')
        return 3;
    const label = item.textContent ?? '';
    if (item.querySelectorAll('button').length > 0 && /discard|save|放弃|保存|reload|载入|重载/iu.test(label))
        return 12;
    if (item.querySelectorAll('button').length === 0 && /[·]\s*v?\d|\bv\d+\.\d+/u.test(label))
        return 11;
    return 4;
}
function paintOrder(root) {
    for (const item of flexItems(root)) {
        const next = String(orderOf(item));
        if (item.style.order !== next)
            item.style.order = next;
    }
}
const USAGE_TEXT = /usage|quota|额度|用量/iu;
const ACCOUNT_TEXT = /account|connection|账号|连接|signed in|configured|not connected/iu;
const MODEL_TEXT = /model|模型|catalog|目录/iu;
const ACCOUNT_ACTION = /sign in|sign out|log in|log out|登录|退出|manage|管理/iu;
const READING_TEXT = /reading quota|reading sign-in|正在读取|读取额度/iu;
function hideBlock(node) {
    if (node.getAttribute('data-c-hide') !== '')
        node.setAttribute('data-c-hide', '');
    if (node.hidden !== true)
        node.hidden = true;
}
/** Plugin block that only exists to show quota; ours always wins. */
function isUsageBlock(node) {
    // Never hide a block that carries the sign-in control; only its quota chrome goes.
    if ([...node.querySelectorAll('button')].some(button => ACCOUNT_ACTION.test(button.textContent ?? '')))
        return false;
    if (USAGE_TEXT.test(node.getAttribute('aria-label') ?? ''))
        return true;
    if (node.querySelector('[data-provider-quota],[data-provider-quota-mini],[data-provider-quota-missing]') !== null)
        return true;
    const text = node.textContent ?? '';
    if (READING_TEXT.test(text))
        return true;
    // Some plugins ship an unlabeled quota block; its own heading is the only signal.
    return USAGE_TEXT.test(text.replace(/\s+/gu, ' ').trim().slice(0, 30));
}
function isModelBlock(node) {
    return node.querySelector('[data-provider-model]') !== null || MODEL_TEXT.test(node.getAttribute('aria-label') ?? '');
}
/** Account or API-key block: signs in/out, a secret field, or a provider URL. */
function isAccountBlock(node) {
    if (node.querySelector('[data-provider-model],[data-provider-quota],[data-provider-quota-mini]') !== null)
        return false;
    if (ACCOUNT_TEXT.test(node.getAttribute('aria-label') ?? ''))
        return true;
    if (node.querySelector('input[type=password],input[type=url]') !== null)
        return true;
    return [...node.querySelectorAll('button')].some(button => ACCOUNT_ACTION.test(button.textContent ?? ''));
}
/** Fold any remaining plugin section into a closed prototype advanced block. */
function foldAdvanced(node, t) {
    const existing = node.closest('details[data-c-advanced]');
    if (existing instanceof HTMLDetailsElement) {
        if (existing.open)
            existing.open = false;
        return;
    }
    const details = document.createElement('details');
    details.className = 'c-advanced';
    details.setAttribute('data-c-advanced', '');
    const summary = document.createElement('summary');
    const heading = document.createElement('span');
    heading.textContent = t('advancedHeading');
    const note = document.createElement('span');
    note.className = 'c-advanced-note';
    note.textContent = t('advancedNote');
    summary.append(svgIcon('M6 3l5 5-5 5'), heading, note);
    details.append(summary);
    const parent = node.parentElement;
    if (parent === null)
        return;
    parent.insertBefore(details, node);
    details.append(node);
}
/** One pass that turns any plugin card into the prototype C detail layout. */
function normalizeDetail(root, t, linked) {
    for (const node of root.querySelectorAll('section')) {
        if (!(node instanceof HTMLElement))
            continue;
        if (node.hasAttribute('data-c-quota') || node.closest('[data-c-quota]') !== null)
            continue;
        if (node.closest('[data-c-hide]') !== null)
            continue;
        // A plugin body/card is a wrapper, not one of the prototype blocks.
        if (node.hasAttribute('data-provider-body') || node.hasAttribute('data-provider-card'))
            continue;
        const parent = node.parentElement;
        if (parent !== null && parent.closest('section') === parent)
            continue;
        if (node.querySelectorAll('section').length > 1)
            continue;
        if (isUsageBlock(node)) {
            hideBlock(node);
            continue;
        }
        if (isModelBlock(node))
            continue;
        if (isAccountBlock(node)) {
            paintAccount(node, t, linked);
            continue;
        }
        foldAdvanced(node, t);
    }
    root.querySelectorAll('details[data-c-advanced]').forEach(node => {
        if (node instanceof HTMLDetailsElement && node.open)
            node.open = false;
    });
    // Plugin quota meters and card headers are ours to own, wherever they render.
    root.querySelectorAll('[data-provider-quota],[data-provider-quota-mini],[data-provider-quota-missing],[data-provider-card-header]').forEach(node => {
        if (!(node instanceof HTMLElement))
            return;
        // Our own quota meters carry the same attributes; never hide ourselves.
        if (node.closest('[data-c-quota]') !== null)
            return;
        hideBlock(node);
    });
    root.querySelectorAll('.c-account-head').forEach(head => {
        const next = head.nextElementSibling;
        if (!(next instanceof HTMLElement) || !next.classList.contains('c-account'))
            head.remove();
    });
}
const MODEL_ICONS = {
    sliders: 'M2 4h12M2 12h12M5 2v4M11 10v4',
    sort: 'M5 2v12m-3-3 3 3 3-3M11 14V2m-3 3 3-3 3 3',
    check: 'M3 8l3 3 7-7',
    plus: 'M8 3v10M3 8h10',
};
function modelSection(root) {
    return [...root.querySelectorAll('section')].find(node => /model|模型|catalog|目录/iu.test(node.getAttribute('aria-label') ?? ''));
}
function rowToggles(section) {
    return [...section.querySelectorAll('[data-provider-model] button[aria-expanded]')].filter((node) => node instanceof HTMLElement);
}
const SORT_TEXT = /^(?:Sort|Done|Done sorting|排序|完成排序)$/u;
const CATALOG_TEXT = /fetch|choose|获取|从账户/iu;
const ADD_TEXT = /add model|手动添加/iu;
/** Plugin-owned action in the models header, ignoring our own injected buttons. */
function pluginAction(section, matcher) {
    return [...section.querySelectorAll('button')].find(node => node instanceof HTMLElement
        && node.closest('[data-provider-model]') === null
        && node.getAttribute('data-c-own') === null
        && matcher.test((node.textContent ?? '').replace(/\s+/gu, ' ').trim()));
}
function markChrome(node, kind) {
    if (node !== null && node !== undefined && node.getAttribute('data-c-plugin-chrome') !== kind)
        node.setAttribute('data-c-plugin-chrome', kind);
}
function ownButton(action, icon, label, quiet) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = quiet ? 'c-btn quiet' : 'c-btn';
    button.setAttribute('data-c-own', action);
    button.append(svgIcon(icon));
    const span = document.createElement('span');
    span.className = 'c-label';
    span.textContent = label;
    button.append(span);
    return button;
}
function setOwnButton(button, icon, label, disabled) {
    const span = button.querySelector('.c-label');
    if (span instanceof HTMLElement && span.textContent !== label)
        span.textContent = label;
    const path = button.querySelector('svg path');
    if (path !== null && path.getAttribute('d') !== icon)
        path.setAttribute('d', icon);
    if (button.disabled !== disabled)
        button.disabled = disabled;
}
/** Prototype C models header. Ours owns the title, count, hint and the three actions;
 * the plugin's own chrome is hidden and our buttons forward clicks to it, so every
 * provider shows the same copy, icons and geometry. */
function paintModelsChrome(section) {
    const rows = rowToggles(section);
    const root = section.closest('.c-full') ?? section;
    const sectionToggle = [...section.querySelectorAll('button[aria-expanded]')].find(node => node instanceof HTMLElement && node.closest('[data-provider-model]') === null);
    // Open the catalog exactly once: a zero-model provider used to be re-toggled on every
    // repaint, which is what flickered (Codex).
    if (sectionToggle !== undefined && sectionToggle.dataset.cOpened !== '1') {
        sectionToggle.dataset.cOpened = '1';
        if (sectionToggle.getAttribute('aria-expanded') === 'false')
            sectionToggle.click();
    }
    markChrome(sectionToggle ?? null, 'toggle');
    const sortButton = pluginAction(section, SORT_TEXT);
    const catalogButton = pluginAction(section, CATALOG_TEXT);
    const addButton = [...root.querySelectorAll('button')].find(node => node instanceof HTMLElement
        && node.getAttribute('data-c-own') === null
        && node.closest('[data-provider-model]') === null
        && ADD_TEXT.test((node.textContent ?? '').replace(/\s+/gu, ' ').trim()));
    markChrome(sortButton, 'sort');
    markChrome(catalogButton, 'catalog');
    markChrome(addButton, 'add');
    let pluginHead = section.querySelector('[data-c-plugin-chrome="header"]');
    if (!(pluginHead instanceof HTMLElement)) {
        const found = [...section.children].find(node => node instanceof HTMLElement
            && node.tagName === 'DIV'
            && node.querySelector('[data-provider-model]') === null
            && node.querySelectorAll('button').length > 0);
        pluginHead = found instanceof HTMLElement ? found : null;
    }
    markChrome(pluginHead instanceof HTMLElement ? pluginHead : undefined, 'header');
    // ponytail: document lang is the primary signal; the plugin's own copy covers a mis-set lang.
    const zh = isZh() || /[\u4e00-\u9fff]/u.test(pluginHead instanceof HTMLElement ? (pluginHead.textContent ?? '') : '');
    for (const child of section.children) {
        if (child instanceof HTMLElement && child.tagName === 'P' && child.getAttribute('data-c-models-hint') === null)
            markChrome(child, 'hint');
    }
    const head = ensureModelsHead(section, zh);
    const countText = zh ? String(rows.length) + ' 个' : String(rows.length);
    if (head.count.textContent !== countText)
        head.count.textContent = countText;
    const allOpen = rows.length > 0 && rows.every(row => row.getAttribute('aria-expanded') === 'true');
    setOwnButton(head.expand, MODEL_ICONS.sliders, allOpen ? (zh ? '全部收起' : 'Collapse all') : (zh ? '全部展开' : 'Expand all'), false);
    const done = sortButton !== undefined && /done|完成/iu.test((sortButton.textContent ?? '').trim());
    setOwnButton(head.sort, done ? MODEL_ICONS.check : MODEL_ICONS.sort, done ? (zh ? '完成排序' : 'Done sorting') : (zh ? '排序' : 'Sort'), sortButton === undefined || sortButton.hasAttribute('disabled'));
    setOwnButton(head.catalog, MODEL_ICONS.plus, zh ? '从账户目录选取' : 'Choose from account', catalogButton === undefined || catalogButton.hasAttribute('disabled'));
    let addOwn = section.querySelector('[data-c-own="add"]');
    if (!(addOwn instanceof HTMLButtonElement)) {
        addOwn = ownButton('add', MODEL_ICONS.plus, zh ? '手动添加模型' : 'Add model manually', false);
        addOwn.addEventListener('click', () => { pluginAction(section, ADD_TEXT)?.click(); });
        section.append(addOwn);
    }
    else {
        setOwnButton(addOwn, MODEL_ICONS.plus, zh ? '手动添加模型' : 'Add model manually', false);
        if (section.lastElementChild !== addOwn)
            section.append(addOwn);
    }
}
function ensureModelsHead(section, zh) {
    const found = section.querySelector('[data-c-models-head]');
    if (found instanceof HTMLElement) {
        const count = found.querySelector('[data-c-count]');
        const expand = found.querySelector('[data-c-own="expand"]');
        const sort = found.querySelector('[data-c-own="sort"]');
        const catalog = found.querySelector('[data-c-own="catalog"]');
        if (count instanceof HTMLElement && expand instanceof HTMLButtonElement && sort instanceof HTMLButtonElement && catalog instanceof HTMLButtonElement) {
            return { head: found, count, expand, sort, catalog };
        }
    }
    const head = document.createElement('div');
    head.className = 'c-models-head';
    head.setAttribute('data-c-models-head', '');
    const title = document.createElement('div');
    title.className = 'c-models-title';
    const heading = document.createElement('h3');
    heading.textContent = zh ? '模型' : 'Models';
    const count = document.createElement('span');
    count.className = 'c-count';
    count.setAttribute('data-c-count', '');
    title.append(heading, count);
    const actions = document.createElement('div');
    actions.className = 'c-models-actions';
    const expand = ownButton('expand', MODEL_ICONS.sliders, zh ? '全部展开' : 'Expand all', true);
    const sort = ownButton('sort', MODEL_ICONS.sort, zh ? '排序' : 'Sort', true);
    const catalog = ownButton('catalog', MODEL_ICONS.plus, zh ? '从账户目录选取' : 'Choose from account', false);
    actions.append(expand, sort, catalog);
    head.append(title, actions);
    const hint = document.createElement('p');
    hint.className = 'c-models-hint';
    hint.setAttribute('data-c-models-hint', '');
    hint.textContent = zh ? '名称和 ID 始终显示；展开箭头查看容量与能力参数。' : 'Names and IDs always show; expand a row for capacity and capability parameters.';
    expand.addEventListener('click', () => {
        const current = rowToggles(section);
        const collapsed = current.filter(row => row.getAttribute('aria-expanded') === 'false');
        const open = current.filter(row => row.getAttribute('aria-expanded') === 'true');
        for (const row of collapsed.length > 0 ? collapsed : open)
            row.click();
    });
    sort.addEventListener('click', () => { pluginAction(section, SORT_TEXT)?.click(); });
    catalog.addEventListener('click', () => { pluginAction(section, CATALOG_TEXT)?.click(); });
    const anchor = section.querySelector('[data-c-plugin-chrome="header"]') ?? section.firstElementChild ?? null;
    section.insertBefore(head, anchor);
    section.insertBefore(hint, head.nextSibling);
    return { head, count, expand, sort, catalog };
}
function paintModels(root) {
    root.querySelectorAll('[data-provider-model] input').forEach(node => {
        if (!(node instanceof HTMLInputElement))
            return;
        if (node.previousElementSibling?.classList.contains('c-field-label') === true)
            return;
        const label = document.createElement('span');
        label.className = 'c-field-label';
        label.textContent = node.placeholder.length > 0 ? node.placeholder : (node.getAttribute('aria-label') ?? '');
        node.parentElement?.insertBefore(label, node);
    });
    const section = modelSection(root);
    if (section === undefined)
        return;
    paintModelsChrome(section);
}
function paintAccount(section, t, linked) {
    section.classList.add('c-account');
    if (section.previousElementSibling?.getAttribute('data-c-account-head') !== '') {
        const head = document.createElement('div');
        head.className = 'c-account-head';
        head.setAttribute('data-c-account-head', '');
        head.textContent = t('accountHeading');
        section.parentElement?.insertBefore(head, section);
    }
    if (section.querySelector('[data-c-account-name]') !== null)
        return;
    const paragraph = section.querySelector('p');
    const raw = (paragraph?.textContent ?? section.getAttribute('aria-label') ?? '').trim();
    const match = /Signed in as\s+(.+)/iu.exec(raw) ?? /以\s*(.+?)\s*身份登录/u.exec(raw) ?? (/@/.test(raw) ? [raw, raw] : null);
    const email = match?.[1]?.trim();
    if (paragraph === null || email === undefined || email.length === 0)
        return;
    const name = document.createElement('div');
    name.className = 'c-account-name';
    name.setAttribute('data-c-account-name', '');
    const dot = document.createElement('span');
    dot.className = 'c-dot good';
    name.append(dot, document.createTextNode(email));
    const meta = document.createElement('div');
    meta.className = 'c-account-meta';
    meta.textContent = linked === 'configured' ? t('accountApiMeta') : t('accountOauthMeta');
    const copy = document.createElement('div');
    copy.className = 'c-account-copy';
    copy.append(name, meta);
    paragraph.replaceWith(copy);
}
/** Bind the shared page to live keyed-slot and settings snapshots. */
export function bindProvidersSection(listRegisteredKeys, subscribe, readPage, onReorder, roleOf, onShowSidebarUsage, headerOf, readUsage, subscribeUsage, accountOf, onRefresh) {
    return function BoundProvidersSection(props) {
        const [, bump] = useState(0);
        useEffect(() => subscribe(() => { bump(value => value + 1); }), [subscribe]);
        const order = readPage();
        const usageSummaries = useSyncExternalStore(subscribeUsage ?? (() => () => undefined), readUsage ?? (() => []), readUsage ?? (() => []));
        return (_jsx(ProvidersSection, { renderSlot: props.renderSlot, t: props.t, registeredKeys: listRegisteredKeys(), savedOrder: order.keys, disabled: order.disabled, onReorder: onReorder, roleOf: roleOf, showSidebarUsage: order.showSidebarUsage, onShowSidebarUsage: onShowSidebarUsage, usageSummaries: usageSummaries, ...(headerOf === undefined ? {} : { headerOf }), ...(accountOf === undefined ? {} : { accountOf }), ...(onRefresh === undefined ? {} : { onRefresh }) }));
    };
}
/**
 * Settings C: compact quota ledger on overview; the plugin item slot mounts
 * only in the independent detail view. Sorting reorders ledger rows in place.
 */
export function ProvidersSection(props) {
    const t = props.t ?? ((key) => key);
    const keys = applySavedOrder(props.registeredKeys ?? [], props.savedOrder ?? []);
    const [sorting, setSorting] = useState(false);
    const [filter, setFilter] = useState('all');
    const [detail, setDetail] = useState(undefined);
    const [modelCounts, setModelCounts] = useState({});
    // Settings policy: the overview paints from cache, then refreshes once when the page opens.
    const refreshRef = useRef(props.onRefresh);
    refreshRef.current = props.onRefresh;
    useEffect(() => { refreshRef.current?.(); }, []);
    useLayoutEffect(() => {
        if (detail === undefined)
            return;
        const root = document.querySelector('[data-providers-section] .c-full');
        if (!(root instanceof HTMLElement))
            return;
        const linked = linkState(detail, props.accountOf?.(detail), props.usageSummaries?.find(entry => entry.providerKey === detail));
        const paint = () => {
            const header = root.querySelector('[data-provider-card-header]');
            if (header instanceof HTMLElement && header.getAttribute('aria-expanded') !== 'true')
                header.click();
            if (root.querySelector('[data-provider-model]') === null) {
                const expander = root.querySelector('button[aria-expanded="false"]');
                if (expander instanceof HTMLElement && expander.closest('[data-provider-card-header]') === null)
                    expander.click();
            }
            normalizeDetail(root, t, linked);
            paintModels(root);
            paintOrder(root);
            if (root.querySelector('[data-provider-body]'))
                root.setAttribute('data-ready', '');
        };
        paint();
        // Repaint on user intent and on the plugin's async mount, not on every DOM
        // mutation: an observer turned a provider's own re-render into a loop (Codex froze).
        const timers = [60, 250, 600, 1200].map(ms => window.setTimeout(paint, ms));
        const later = () => { window.setTimeout(paint, 60); window.setTimeout(paint, 300); };
        root.addEventListener('click', later, true);
        root.addEventListener('keydown', later, true);
        return () => {
            for (const timer of timers)
                window.clearTimeout(timer);
            root.removeEventListener('click', later, true);
            root.removeEventListener('keydown', later, true);
        };
    }, [detail]);
    useLayoutEffect(() => {
        const next = {};
        document.querySelectorAll('[data-model-probe]').forEach(node => {
            if (!(node instanceof HTMLElement) || node.dataset.modelProbe === undefined)
                return;
            const count = countModels(node);
            if (count !== undefined)
                next[node.dataset.modelProbe] = count;
        });
        const full = document.querySelector('[data-providers-section] .c-full');
        if (full instanceof HTMLElement && detail !== undefined) {
            const count = countModels(full);
            if (count !== undefined)
                next[detail] = count;
        }
        setModelCounts(prev => {
            let changed = false;
            const merged = { ...prev };
            for (const [key, count] of Object.entries(next)) {
                if (merged[key] !== count) {
                    merged[key] = count;
                    changed = true;
                }
            }
            return changed ? merged : prev;
        });
    });
    const showToggle = keys.length > 1 && props.disabled !== true && detail === undefined;
    const sortable = sorting && showToggle;
    const orderBeforeSort = useRef(undefined);
    useEffect(() => {
        if (!sorting) {
            orderBeforeSort.current = undefined;
            return;
        }
        if (orderBeforeSort.current === undefined)
            orderBeforeSort.current = keys;
        const onKey = (event) => {
            if (event.key !== 'Escape')
                return;
            event.preventDefault();
            const previous = orderBeforeSort.current;
            setSorting(false);
            if (previous !== undefined)
                props.onReorder?.([...previous]);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [sorting, keys, props]);
    const visibleKeys = keys.filter(key => filter === 'all' || (props.roleOf?.(key) ?? 'llm') === filter);
    const items = (detail === undefined ? visibleKeys : keys.filter(key => key === detail)).map(key => ({ key }));
    const renderCard = (item) => {
        const node = props.renderSlot?.(PROVIDERS_ITEM_SLOT, {}, { entryKey: item.key });
        if (node == null)
            return null;
        const role = props.roleOf?.(item.key) ?? 'llm';
        const card = props.headerOf?.(item.key) === 'shared'
            ? _jsx("div", { "data-provider-slot": "", "data-provider-role": role, children: node })
            : (_jsxs("div", { "data-provider-slot": "", "data-provider-role": role, style: fallbackWrapStyle, children: [_jsx("span", { style: fallbackBadgeAlign, children: _jsx(ProviderRoleBadge, { ...(role === 'llm' ? {} : { role }) }) }), node] }));
        const summary = props.usageSummaries?.find(entry => entry.providerKey === item.key)
            ?? props.usageSummaries?.find(entry => item.key.endsWith(entry.providerKey) || entry.providerKey.endsWith(item.key));
        const account = props.accountOf?.(item.key);
        const linked = linkState(item.key, account, summary);
        const models = modelCounts[item.key];
        const copy = { at: t('resetAt'), overdue: t('resetOverdue'), missing: t('resetMissing') };
        const identity = (_jsxs("div", { className: "c-identity", children: [_jsx("span", { className: "c-brand", children: _jsx(ProviderMark, { providerKey: item.key }) }), _jsxs("div", { children: [_jsxs("div", { className: "c-name-line", children: [_jsx("span", { className: "c-name", children: summary?.name ?? item.key }), _jsx(ProviderRoleBadge, { ...(role === 'llm' ? {} : { role }) })] }), _jsxs("div", { className: "c-sub", children: [_jsx("span", { className: 'c-dot' + (linked === 'unconnected' ? '' : ' good') }), t(linked), models === undefined ? null : _jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": "true", children: "\u00B7" }), t('modelCount').replace('{n}', String(models))] })] })] })] }));
        if (detail !== undefined) {
            const windows = summary?.windows ?? [];
            return (_jsxs("article", { className: "c-full", children: [_jsx("div", { className: "c-detail-title", children: identity }), _jsxs("section", { "data-c-quota": "", children: [_jsxs("div", { className: "c-quota-head", children: [_jsx("h3", { children: t('quotaHeading') }), _jsx("button", { type: "button", className: "c-btn quiet", disabled: props.disabled === true || summary?.refreshing === true, onClick: () => { props.onRefresh?.(item.key); }, children: summary?.refreshing === true ? t('refreshing') : _jsxs(_Fragment, { children: [_jsx(IconRefresh, {}), " ", t('refresh')] }) })] }), _jsx("div", { className: "c-quota-list", children: windows.length === 0
                                    ? _jsx("div", { className: "c-missing", children: summary?.status === 'unsupported' ? t('unsupportedQuota') : summary?.status === 'error' ? t('errorQuota') : summary?.status === 'loading' ? t('loadingQuota') : t('connectToSee') })
                                    : windows.map(quotaWindow => {
                                        const reset = formatResetLabel(quotaWindow.resetsAt, quotaWindow.label, copy);
                                        return (_jsx(ProviderQuotaMeter, { label: quotaWindow.label, ...(quotaWindow.remainingPercent === undefined ? {} : { remainingPercent: quotaWindow.remainingPercent }), emptyLabel: quotaWindow.valueText, ...(reset === undefined ? {} : { detail: reset }) }, quotaWindow.id));
                                    }) }), _jsxs("div", { className: "c-quota-meta", children: [_jsx("span", { children: t('quotaMeta') }), _jsxs("span", { children: [t('systemZone'), " \u00B7 ", Intl.DateTimeFormat().resolvedOptions().timeZone] })] })] }), _jsx("div", { className: "c-plugin", children: card })] }));
        }
        const primary = summary === undefined ? undefined : pickPrimaryWindow(summary.windows);
        const missing = primary !== undefined
            ? undefined
            : summary === undefined || summary.status === 'logged-out'
                ? t('connectToSee')
                : summary.status === 'unsupported'
                    ? t('unsupportedQuota')
                    : summary.status === 'loading'
                        ? t('loadingQuota')
                        : summary.status === 'error'
                            ? t('errorQuota')
                            : t('connectToSee');
        const reset = primary === undefined ? undefined : formatResetLabel(primary.resetsAt, primary.label, copy);
        return (_jsxs("div", { className: "c-row-grid", "data-provider-row": item.key, "data-provider-role": role, children: [_jsx("div", { className: "c-probe", "data-model-probe": item.key, "aria-hidden": "true", children: card }), _jsx("div", { className: "c-cell", children: identity }), _jsx("div", { className: "c-mini", children: missing === undefined && primary !== undefined
                        ? _jsx(ProviderQuotaMeter, { label: primary.shortLabel || primary.label, ...(primary.remainingPercent === undefined ? {} : { remainingPercent: primary.remainingPercent }), emptyLabel: primary.valueText, ...(reset === undefined ? {} : { detail: reset }) })
                        : _jsx("div", { className: "c-missing", children: missing }) }), _jsx("button", { type: "button", className: "c-btn", "data-action": "open-provider", onClick: () => { setDetail(item.key); }, children: t('details') })] }));
    };
    const linkedCount = keys.filter(key => {
        const account = props.accountOf?.(key);
        const summary = props.usageSummaries?.find(entry => entry.providerKey === key)
            ?? props.usageSummaries?.find(entry => key.endsWith(entry.providerKey) || entry.providerKey.endsWith(key));
        return linkState(key, account, summary) !== 'unconnected';
    }).length;
    const body = keys.length === 0
        ? _jsx("p", { className: "c-empty", children: t('empty') })
        : (_jsxs("div", { className: "c-ledger", "data-providers-list": "", children: [detail === undefined ? _jsxs("div", { className: "c-labels", children: [_jsx("span", { children: t('colProvider') }), _jsx("span", { children: t('colQuota') }), _jsx("span", { children: t('colConfig') })] }) : null, _jsx(SortableList, { chrome: "plain", items: items, getId: item => item.key, dragLabel: item => t('drag') + ': ' + item.key, sorting: sortable, ...(props.disabled === undefined ? {} : { disabled: props.disabled }), onReorder: next => { props.onReorder?.(next.map(item => item.key)); }, renderItem: item => renderCard(item) })] }));
    return (_jsxs("div", { "data-providers-section": PROVIDERS_LOCALE_NS, ...(sortable ? { 'data-sorting': '' } : {}), children: [_jsx("style", { children: providerUiCss + providerShellCss + settingsCCss }), detail === undefined
                ? (_jsxs(_Fragment, { children: [_jsxs("header", { className: "c-page-title", children: [_jsxs("div", { children: [_jsx("h2", { children: t('title') }), _jsx("p", { children: t('subtitle') })] }), showToggle
                                    ? _jsx("button", { type: "button", className: "c-btn c-sort", "aria-expanded": sorting, onClick: () => { setSorting(value => !value); }, children: sorting ? _jsxs(_Fragment, { children: [_jsx(IconCheck, {}), " ", t('done')] }) : _jsxs(_Fragment, { children: [_jsx(IconSort, {}), " ", t('sort')] }) })
                                    : null] }), _jsxs("div", { className: "c-note", children: [_jsx("span", { className: "c-number", children: linkedCount }), _jsxs("div", { className: "c-copy", children: [_jsx("strong", { children: t('connectedCount') }), _jsx("p", { children: t('connectedHint') })] }), _jsxs("label", { className: "c-switch", children: [_jsx("span", { children: t('sidebarToggle') }), _jsx("input", { type: "checkbox", role: "switch", "aria-label": t('sidebarToggle'), "aria-describedby": "sidebar-usage-hint", checked: props.showSidebarUsage !== false, disabled: props.disabled === true, onChange: event => { props.onShowSidebarUsage?.(event.target.checked); } })] }), _jsx("span", { id: "sidebar-usage-hint", className: "sr-only", children: t('sidebarToggleHint') })] }), _jsxs("div", { className: "c-filters", children: [_jsx("div", { className: "c-row", children: ['all', 'llm', 'agent'].map(id => (_jsx("button", { type: "button", className: 'c-btn' + (filter === id ? '' : ' quiet'), "aria-pressed": filter === id, onClick: () => { setFilter(id); }, children: t(id === 'all' ? 'filterAll' : id === 'llm' ? 'filterLlm' : 'filterAgent') }, id))) }), _jsxs("span", { className: "c-zone", children: [t('systemZone'), " \u00B7 ", Intl.DateTimeFormat().resolvedOptions().timeZone] })] })] }))
                : (_jsxs("div", { className: "c-crumb", children: [_jsxs("button", { type: "button", onClick: () => { setDetail(undefined); }, children: [_jsx(IconBack, {}), " ", t('breadcrumbOverview')] }), _jsx("span", { children: "/" }), _jsx("span", { children: props.usageSummaries?.find(entry => entry.providerKey === detail)?.name ?? detail })] })), body] }));
}
//# sourceMappingURL=ProvidersSection.js.map