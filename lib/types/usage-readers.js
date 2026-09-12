/** Bundle-safe quota decoders, RPC readers, and browser cache helpers; no ModuleLoader wrapper or reactive store. */
/**
 * Wire error code the Host answers when the provider credential is missing or
 * unusable (mirrors `INVALID_CREDENTIAL_CODE` in `@deepseek-ai/dsh-llm`, which a
 * browser bundle cannot import). Mapped to `logged-out` so a provider without a
 * usable credential never keeps serving the previous account's quota.
 */
const INVALID_CREDENTIAL_CODE = 'INVALID_CREDENTIAL';
/** Whether one RPC failure means "this provider has no usable credential". */
function credentialFailure(error) {
    return error.code === INVALID_CREDENTIAL_CODE;
}
/** Plain-object guard shared by the reader factories and the sidebar cache validator. */
export function recordUsageValue(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : undefined;
}
const SECRET_KEY = /^(?:accessToken|refreshToken|access_token|refresh_token|id_token|idToken|token|apiKey|api_key)$/iu;
/** Reject any secret-shaped field before a provider response enters UI state. */
function secretFree(value) {
    if (Array.isArray(value))
        return value.every(secretFree);
    const item = recordUsageValue(value);
    if (item === undefined)
        return true;
    return Object.entries(item).every(([key, child]) => !SECRET_KEY.test(key) && secretFree(child));
}
/** Non-empty string guard shared by the reader factories and the sidebar cache validator. */
export function nonEmptyString(value) {
    return typeof value === 'string' && value.length > 0;
}
function finiteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
}
/** Non-negative finite number guard shared by the reader factories and the sidebar cache validator. */
export function nonNegativeNumber(value) {
    return finiteNumber(value) && value >= 0;
}
function displayNumber(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}
function percentage(value) {
    return Math.round(Math.max(0, Math.min(100, value)));
}
function percentageText(value) {
    return displayNumber(percentage(value)) + '%';
}
const SHORT_LABELS = [
    [/five|5h|5-hour/u, '5h'],
    [/two-hour|2-hour|2h/u, '2h'],
    [/session/u, 'S'],
    [/week/u, 'W'],
    [/month/u, 'M'],
    [/credit/u, 'Cr'],
    [/agent/u, 'A'],
    [/daily|day/u, 'D'],
    [/local/u, 'L'],
    [/other/u, 'Oth'],
];
function shortLabel(value) {
    const normalized = value.toLowerCase();
    if (/^\d+h$/u.test(normalized))
        return normalized;
    return SHORT_LABELS.find(([pattern]) => pattern.test(normalized))?.[1] ?? value.slice(0, 4);
}
const PERIOD_RANK = { M: 6, W: 5, D: 4, CURS: 3, S: 1, A: 0, L: 0, CR: -1 };
function periodRank(shortLabelValue) {
    const normalized = shortLabelValue.toUpperCase();
    return PERIOD_RANK[normalized] ?? (/^\d+H$/.test(normalized) ? 2 : 0);
}
/** Headline window: longest remaining-percent period. Text-only windows are skipped. */
export function pickPrimaryWindow(windows) {
    let best;
    for (const quotaWindow of windows) {
        if (quotaWindow.remainingPercent === undefined)
            continue;
        if (best === undefined || periodRank(quotaWindow.shortLabel) > periodRank(best.shortLabel))
            best = quotaWindow;
    }
    if (best !== undefined && best.remainingPercent === 100 && !nonEmptyString(best.resetsAt)) {
        let fallback;
        for (const quotaWindow of windows) {
            if (quotaWindow === best || !nonEmptyString(quotaWindow.resetsAt) || quotaWindow.remainingPercent === undefined)
                continue;
            if (fallback === undefined || periodRank(quotaWindow.shortLabel) > periodRank(fallback.shortLabel))
                fallback = quotaWindow;
        }
        if (fallback !== undefined)
            return fallback;
    }
    return best;
}
function formatRemainingDuration(ms) {
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'always' });
    const days = Math.round(ms / 86_400_000);
    if (Math.abs(days) >= 1)
        return rtf.format(days, 'day');
    const hours = Math.round(ms / 3_600_000);
    if (Math.abs(hours) >= 1)
        return rtf.format(hours, 'hour');
    const minutes = Math.max(1, Math.round(Math.abs(ms) / 60_000));
    return rtf.format(ms < 0 ? -minutes : minutes, 'minute');
}
function parseResetTime(resetsAt) {
    if (/^\d{4}-\d{2}-\d{2}/u.test(resetsAt)) {
        const iso = Date.parse(resetsAt);
        return Number.isFinite(iso) ? iso : undefined;
    }
    if (!/^\d{10,}$/u.test(resetsAt))
        return undefined;
    const n = Number(resetsAt);
    if (!Number.isFinite(n) || n <= 0)
        return undefined;
    return n < 1e12 ? n * 1000 : n;
}
/** System-zone instant for a reset ISO. Language copy stays in the UI. */
export function formatResetInstant(resetsAt) {
    if (!nonEmptyString(resetsAt))
        return undefined;
    const time = parseResetTime(resetsAt);
    if (time === undefined)
        return undefined;
    const delta = time - Date.now();
    if (delta < -400 * 86400000 || delta > 800 * 86400000)
        return undefined;
    const when = new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(time));
    return { when, overdue: delta <= 0, relative: formatRemainingDuration(delta) };
}
/** Compose a reset caption. Missing ISO never becomes a fake calendar date. */
export function formatResetLabel(resetsAt, period, copy) {
    const instant = formatResetInstant(resetsAt);
    if (instant !== undefined) {
        const lead = copy === undefined ? '' : (instant.overdue ? copy.overdue : copy.at);
        return (lead + instant.when + ' · ' + instant.relative).replace(/^ · /, '');
    }
    if (nonEmptyString(resetsAt) && /reset|重置/iu.test(resetsAt))
        return resetsAt;
    if (period === undefined || period.length === 0)
        return undefined;
    return copy === undefined ? period : copy.missing.replace('{period}', period);
}
function windowLabel(id, period) {
    return nonEmptyString(period) ? period : id;
}
function remainingWindow(input) {
    const remaining = input.limit === 0 ? undefined : percentage(100 * (1 - input.used / input.limit));
    return {
        id: input.id,
        label: input.label,
        shortLabel: shortLabel(input.label),
        ...(remaining === undefined
            ? { valueText: displayNumber(Math.max(0, input.limit - input.used)) + ' / ' + displayNumber(input.limit) }
            : { remainingPercent: remaining, valueText: percentageText(remaining) }),
        ...(input.resetsAt === undefined ? {} : { resetsAt: input.resetsAt }),
    };
}
function usageResult(value, decode) {
    const response = recordUsageValue(value);
    if (response === undefined || !secretFree(response))
        return { status: 'error', message: 'malformed usage response' };
    if (response.status === 'unsupported')
        return { status: 'unsupported' };
    if (response.status === 'logged-out')
        return { status: 'logged-out' };
    if (response.status !== 'ok')
        return { status: 'error', message: 'unknown usage status' };
    const usage = recordUsageValue(response.usage);
    const decoded = usage === undefined ? undefined : decode(usage);
    return decoded === undefined ? { status: 'error', message: 'malformed usage response' } : { status: 'ready', ...decoded };
}
function decodePercentUsage(usage) {
    if (!nonEmptyString(usage.fetchedAt) || !Array.isArray(usage.windows) || usage.windows.length === 0)
        return undefined;
    const viewReset = usage.resetsAt;
    if (viewReset !== undefined && !nonEmptyString(viewReset))
        return undefined;
    const windows = [];
    for (const value of usage.windows) {
        const item = recordUsageValue(value);
        if (item === undefined || !nonEmptyString(item.id) || !nonNegativeNumber(item.used) || !nonNegativeNumber(item.limit))
            return undefined;
        if (item.period !== undefined && !nonEmptyString(item.period))
            return undefined;
        if (item.unit !== undefined && item.unit !== 'percent')
            return undefined;
        if (item.resetsAt !== undefined && !nonEmptyString(item.resetsAt))
            return undefined;
        const resetsAt = item.resetsAt ?? viewReset;
        windows.push(remainingWindow({
            id: item.id,
            label: windowLabel(item.id, item.period),
            used: item.used,
            limit: item.unit === 'percent' ? 100 : item.limit,
            ...(resetsAt === undefined ? {} : { resetsAt }),
        }));
    }
    return { fetchedAt: usage.fetchedAt, windows };
}
function decodeFractionUsage(keys, usage) {
    if (!nonEmptyString(usage.fetchedAt))
        return undefined;
    const windows = [];
    for (const key of keys) {
        const value = usage[key];
        if (value === undefined)
            continue;
        const item = recordUsageValue(value);
        if (item === undefined || !nonNegativeNumber(item.usage))
            return undefined;
        if (item.resetsAt !== undefined && !nonEmptyString(item.resetsAt))
            return undefined;
        windows.push(remainingWindow({
            id: key,
            label: key === 'session' ? 'Session' : key === 'weekly' ? 'Week' : 'Month',
            used: item.usage,
            limit: 1,
            ...(item.resetsAt === undefined ? {} : { resetsAt: item.resetsAt }),
        }));
    }
    return { fetchedAt: usage.fetchedAt, windows };
}
// Published Command Code plan allotments (commandcode.ai/docs/plans). First matching key in this longest-first list wins.
const COMMAND_CODE_MONTHLY_USD = [
    ['individual-max-20', 300],
    ['individual-goat', 70],
    ['individual-pro', 80],
    ['individual-max', 150],
    ['individual-go', 10],
    ['max-20', 300],
    ['20x', 300],
];
function commandCodeMonthlyCap(planId) {
    if (planId === undefined)
        return undefined;
    const id = planId.toLowerCase();
    const match = COMMAND_CODE_MONTHLY_USD.find(([key]) => id.startsWith(key) || id.includes(key));
    return match?.[1];
}
function decodeCommandCodeUsage(usage) {
    if (!nonEmptyString(usage.fetchedAt))
        return undefined;
    if (usage.failures !== undefined && (!Array.isArray(usage.failures) || usage.failures.some(item => typeof item !== 'string')))
        return undefined;
    const credits = usage.credits;
    if (credits === undefined)
        return { fetchedAt: usage.fetchedAt, windows: [] };
    const value = recordUsageValue(credits);
    if (value === undefined)
        return undefined;
    const windows = [];
    const monthly = value.monthlyCredits;
    const plan = recordUsageValue(usage.plan);
    const planId = plan !== undefined && nonEmptyString(plan.planId) ? plan.planId : undefined;
    // Studio USAGE LIMITS order: 5-hour, weekly, monthly.
    for (const [key, label] of [['fiveHour', '5-hour'], ['weekly', 'Week']]) {
        const raw = value[key];
        if (raw === undefined)
            continue;
        const item = recordUsageValue(raw);
        if (item === undefined || !nonNegativeNumber(item.used) || !nonNegativeNumber(item.cap))
            return undefined;
        const resetAt = nonEmptyString(item.resetAt) ? item.resetAt : undefined;
        if (item.resetAt !== undefined && resetAt === undefined)
            return undefined;
        windows.push(remainingWindow({
            id: key,
            label,
            used: item.used,
            limit: item.cap,
            ...(resetAt === undefined ? {} : { resetsAt: resetAt }),
        }));
    }
    if (monthly !== undefined) {
        if (!nonNegativeNumber(monthly))
            return undefined;
        const cap = commandCodeMonthlyCap(planId);
        if (cap !== undefined && cap > 0 && monthly <= cap) {
            // Studio's MONTHLY LIMIT reset is the billing cycle end, not a windowLimits.resetAt.
            const periodEnd = plan !== undefined && nonEmptyString(plan.currentPeriodEnd) ? plan.currentPeriodEnd : undefined;
            windows.push(remainingWindow({
                id: 'monthly',
                label: 'Month',
                used: cap - monthly,
                limit: cap,
                ...(periodEnd === undefined ? {} : { resetsAt: periodEnd }),
            }));
        }
    }
    return { fetchedAt: usage.fetchedAt, windows };
}
function codexWindowLabel(seconds) {
    if (seconds === 18_000)
        return '5h';
    if (seconds === 604_800)
        return 'Week';
    const hours = seconds / 3_600;
    return Number.isInteger(hours) ? String(hours) + 'h' : 'Usage';
}
function decodeCodexAuthStatus(value) {
    const response = recordUsageValue(value);
    if (response === undefined || !secretFree(response))
        return { status: 'error', message: 'malformed usage response' };
    if (response.status === 'signed-out' || response.status === 'signing-in' || response.status === 'reauth-required')
        return { status: 'logged-out' };
    if (response.status !== 'signed-in')
        return { status: 'error', message: 'Codex usage unavailable' };
    const usage = recordUsageValue(response.usage);
    if (usage === undefined || !Array.isArray(usage.rateLimits))
        return { status: 'error', message: 'malformed usage response' };
    const windows = [];
    for (const rateLimitValue of usage.rateLimits) {
        const rateLimit = recordUsageValue(rateLimitValue);
        if (rateLimit === undefined || !nonEmptyString(rateLimit.id) || !Array.isArray(rateLimit.windows))
            return { status: 'error', message: 'malformed usage response' };
        if (rateLimit.name !== undefined && !nonEmptyString(rateLimit.name))
            return { status: 'error', message: 'malformed usage response' };
        for (const [index, windowValue] of rateLimit.windows.entries()) {
            const quotaWindow = recordUsageValue(windowValue);
            if (quotaWindow === undefined || !nonNegativeNumber(quotaWindow.remainingPercent) || quotaWindow.remainingPercent > 100 || !nonNegativeNumber(quotaWindow.windowSeconds) || quotaWindow.windowSeconds === 0)
                return { status: 'error', message: 'malformed usage response' };
            if (quotaWindow.resetsAt !== undefined && !nonEmptyString(quotaWindow.resetsAt))
                return { status: 'error', message: 'malformed usage response' };
            const duration = codexWindowLabel(quotaWindow.windowSeconds);
            const label = rateLimit.name === undefined || rateLimit.windows.length === 1 ? rateLimit.name ?? duration : rateLimit.name + ' · ' + duration;
            windows.push({
                id: rateLimit.id + '-' + String(index),
                label,
                shortLabel: shortLabel(duration),
                remainingPercent: percentage(quotaWindow.remainingPercent),
                valueText: percentageText(quotaWindow.remainingPercent),
                ...(quotaWindow.resetsAt === undefined ? {} : { resetsAt: quotaWindow.resetsAt }),
            });
        }
    }
    return { status: 'ready', fetchedAt: new Date().toISOString(), windows };
}
const CODEX_USAGE_WAIT_MS = 15_000;
async function waitForCodexUsage(signal) {
    await new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, 150);
        const onAbort = () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); };
        if (signal.aborted) {
            onAbort();
            return;
        }
        signal.addEventListener('abort', onAbort, { once: true });
    });
}
async function readCodexUsage(rpc, signal) {
    const deadline = Date.now() + CODEX_USAGE_WAIT_MS;
    let last = { status: 'error', message: 'Codex usage unavailable' };
    while (!signal.aborted) {
        // The UI store owns freshness; auth/status otherwise retains nonempty quota indefinitely.
        const result = await rpc.call('/codex', 'auth/status', { refresh: true }, signal);
        last = result.ok
            ? decodeCodexAuthStatus(result.value)
            : credentialFailure(result.error) ? { status: 'logged-out' } : { status: 'error', message: result.error.message };
        if (last.status !== 'ready' || last.windows.length > 0 || Date.now() >= deadline)
            return last;
        await waitForCodexUsage(signal);
    }
    return last;
}
async function readUsage(rpc, channel, payload, signal, decode) {
    const result = await rpc.call(channel, 'usage/read', payload, signal);
    if (result.ok)
        return usageResult(result.value, decode);
    if (credentialFailure(result.error))
        return { status: 'logged-out' };
    return { status: 'error', message: result.error.message };
}
/** Create the Codex quota reader declared by the Codex client plugin. */
export function createCodexUsageReader() {
    return { providerKey: 'llm-codex', name: 'Codex', read: (rpc, _refresh, signal) => readCodexUsage(rpc, signal) };
}
/** Create the Cursor quota reader declared by the Cursor client plugin. */
export function createCursorUsageReader() {
    return { providerKey: 'llm-cursor', name: 'Cursor', read: async (rpc, refresh, signal) => {
            const first = await readUsage(rpc, '/cursor', refresh ? { refresh: true } : {}, signal, decodePercentUsage);
            if (first.status !== 'unsupported')
                return first;
            return readUsage(rpc, '/cursor', { refresh: true }, signal, decodePercentUsage);
        } };
}
/** Create the Grok quota reader declared by the Grok client plugin. */
export function createGrokUsageReader() {
    return { providerKey: 'llm-grok', name: 'Grok', read: (rpc, _refresh, signal) => readUsage(rpc, '/grok', {}, signal, decodePercentUsage) };
}
/** Create the Ollama Cloud quota reader declared by the Ollama client plugin. */
export function createOllamaUsageReader() {
    return { providerKey: 'llm-ollama', name: 'Ollama Cloud', read: (rpc, _refresh, signal) => readUsage(rpc, '/ollama-cloud', {}, signal, value => decodeFractionUsage(['session', 'weekly', 'monthly'], value)) };
}
/** Create the CommandCode quota reader declared by the CommandCode client plugin. */
export function createCommandCodeUsageReader() {
    return { providerKey: 'llm-commandcode', name: 'CommandCode', read: (rpc, _refresh, signal) => readUsage(rpc, '/commandcode', {}, signal, decodeCommandCodeUsage) };
}
/** Create the OpenCode Go quota reader declared by the OpenCode Go client plugin. */
export function createOpenCodeGoUsageReader() {
    return { providerKey: 'llm-opencode-go', name: 'OpenCode Go', read: (rpc, _refresh, signal) => readUsage(rpc, '/opencode-go', {}, signal, value => decodeFractionUsage(['session', 'weekly', 'monthly'], value)) };
}
const USAGE_CACHE_KEY = 'dsh-llm-providers-ui:usage-cache';
/**
 * Browser last-good usage cache shared across bundles: the sidebar store and
 * each provider Settings card bundle their own copy of this module, so the
 * module-level memory map below is per-bundle while storage is shared.
 * Readable storage is authoritative, including empty after invalidation; memory
 * is only a fallback while storage is unavailable. Stale status persists
 * honestly, and collapsed-header headlines never replace a full multi-window
 * summary (a later full read upgrades a headline).
 */
let memoryUsageCache = new Map();
/** Whether a ready or stale summary retains displayable usage windows.
 * @param summary - Current or retained provider usage.
 * @returns Whether its windows can be displayed and persisted.
 */
export function hasUsageData(summary) {
    return summary !== undefined && summary.windows.length > 0 && (summary.status === 'ready' || summary.status === 'stale');
}
function cachedSummary(value) {
    const item = recordUsageValue(value);
    if (item === undefined || !nonEmptyString(item.providerKey) || !nonEmptyString(item.name))
        return undefined;
    const status = item.status;
    if (status !== 'ready' && status !== 'stale')
        return undefined;
    if (!Array.isArray(item.windows) || item.windows.length === 0)
        return undefined;
    const windows = [];
    for (const windowValue of item.windows) {
        const quotaWindow = recordUsageValue(windowValue);
        if (quotaWindow === undefined || !nonEmptyString(quotaWindow.id) || !nonEmptyString(quotaWindow.label) || !nonEmptyString(quotaWindow.shortLabel) || !nonEmptyString(quotaWindow.valueText))
            return undefined;
        if (quotaWindow.remainingPercent !== undefined && (!nonNegativeNumber(quotaWindow.remainingPercent) || quotaWindow.remainingPercent > 100))
            return undefined;
        if (quotaWindow.resetsAt !== undefined && !nonEmptyString(quotaWindow.resetsAt))
            return undefined;
        windows.push({
            id: quotaWindow.id,
            label: quotaWindow.label,
            shortLabel: quotaWindow.shortLabel,
            valueText: quotaWindow.valueText,
            ...(quotaWindow.remainingPercent === undefined ? {} : { remainingPercent: quotaWindow.remainingPercent }),
            ...(quotaWindow.resetsAt === undefined ? {} : { resetsAt: quotaWindow.resetsAt }),
        });
    }
    return {
        providerKey: item.providerKey,
        name: item.name,
        status,
        windows,
        ...(nonEmptyString(item.fetchedAt) ? { fetchedAt: item.fetchedAt } : {}),
    };
}
/** Readable storage backends. A backend that throws on read is unusable and skipped. */
function usageStorageBackends() {
    const backends = [];
    for (const name of ['localStorage', 'sessionStorage']) {
        try {
            const backend = globalThis[name];
            if (backend === undefined || backend === null)
                continue;
            backend.getItem(USAGE_CACHE_KEY);
            backends.push(backend);
        }
        catch { /* unreadable backend */ }
    }
    return backends;
}
function storageRead() {
    const backends = usageStorageBackends();
    if (backends.length === 0)
        return { available: false, raw: null };
    for (const backend of backends) {
        try {
            const raw = backend.getItem(USAGE_CACHE_KEY);
            if (raw !== null)
                return { available: true, raw };
        }
        catch { /* unreadable backend; try the next one */ }
    }
    return { available: true, raw: null };
}
function storageWrite(value) {
    for (const backend of usageStorageBackends()) {
        try {
            backend.setItem(USAGE_CACHE_KEY, value);
        }
        catch { /* quota */ }
    }
}
function storageRemove() {
    for (const backend of usageStorageBackends()) {
        try {
            backend.removeItem?.(USAGE_CACHE_KEY);
        }
        catch { /* ignore */ }
    }
}
function parseUsageCache(raw) {
    const cached = new Map();
    if (raw === null)
        return cached;
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed))
            return cached;
        for (const value of parsed) {
            const item = cachedSummary(value);
            if (item !== undefined)
                cached.set(item.providerKey, item);
        }
    }
    catch { /* malformed */ }
    return cached;
}
export function readUsageCache() {
    const { available, raw } = storageRead();
    if (!available)
        return new Map(memoryUsageCache);
    const fromStorage = parseUsageCache(raw);
    memoryUsageCache = new Map(fromStorage);
    return fromStorage;
}
/** Persistable copy: status stays ready/stale as the caller holds it, never laundered to ready. */
function persistableUsage(summary) {
    return {
        providerKey: summary.providerKey,
        name: summary.name,
        status: summary.status,
        windows: summary.windows,
        ...(summary.fetchedAt === undefined ? {} : { fetchedAt: summary.fetchedAt }),
    };
}
/** A collapsed-header single window, never a full multi-window summary. */
function isHeadlineOnly(summary) {
    return summary.windows.length === 1 && summary.windows[0]?.id === 'headline';
}
export function writeUsageCache(current) {
    const entries = [...current.values()].filter(hasUsageData);
    const { available, raw } = storageRead();
    if (!available) {
        for (const item of entries)
            memoryUsageCache.set(item.providerKey, persistableUsage(item));
        return;
    }
    const merged = parseUsageCache(raw);
    for (const item of entries) {
        const previous = merged.get(item.providerKey);
        if (previous !== undefined && !isHeadlineOnly(previous) && isHeadlineOnly(item))
            continue;
        merged.set(item.providerKey, persistableUsage(item));
    }
    memoryUsageCache = new Map(merged);
    if (merged.size === 0)
        return;
    storageWrite(JSON.stringify([...merged.values()]));
}
export function dropPersistedUsageKeys(keys) {
    const drop = new Set(keys);
    for (const key of drop)
        memoryUsageCache.delete(key);
    const { available, raw } = storageRead();
    if (!available || raw === null)
        return;
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        return;
    }
    if (!Array.isArray(parsed))
        return;
    const kept = parsed.filter(value => {
        const item = recordUsageValue(value);
        return item === undefined || !nonEmptyString(item.providerKey) || !drop.has(item.providerKey);
    });
    if (kept.length === parsed.length)
        return;
    storageWrite(JSON.stringify(kept));
}
export function clearProviderUsageCache() {
    memoryUsageCache = new Map();
    storageRemove();
}
/** Last-good quota for a Provider card header, available on first paint. */
export function peekCachedUsage(providerKey) {
    return readUsageCache().get(providerKey);
}
export function rememberCachedUsage(summary) {
    if (!hasUsageData(summary))
        return;
    writeUsageCache(new Map([[summary.providerKey, summary]]));
}
/**
 * Collapsed-header last-good quota for first paint. Ignores headlines without
 * a finite in-range remaining percent so missing quota renders no meter, never
 * a zero bar. Never replaces a cached full multi-window summary, and records
 * no fetchedAt: a headline is display data, not a fetch, so freshness checks
 * treat it as expired and refetch.
 */
export function rememberHeadlineQuota(providerKey, name, quota) {
    if (quota?.remainingPercent === undefined || !Number.isFinite(quota.remainingPercent))
        return;
    const remainingPercent = Math.round(quota.remainingPercent * 10) / 10;
    if (remainingPercent < 0 || remainingPercent > 100)
        return;
    const label = quota.label ?? 'Quota';
    rememberCachedUsage({
        providerKey,
        name,
        status: 'ready',
        windows: [{ id: 'headline', label, shortLabel: label, valueText: String(remainingPercent) + '%', remainingPercent }],
    });
}
export function headerQuotaFromCache(summary) {
    if (summary === undefined)
        return undefined;
    const quotaWindow = pickPrimaryWindow(summary.windows);
    if (quotaWindow === undefined)
        return undefined;
    const instant = formatResetInstant(quotaWindow.resetsAt);
    const detail = instant === undefined ? undefined : instant.when;
    return {
        label: quotaWindow.shortLabel || quotaWindow.label,
        ...(quotaWindow.remainingPercent === undefined ? {} : { remainingPercent: quotaWindow.remainingPercent }),
        ...(detail === undefined ? {} : { detail }),
    };
}
//# sourceMappingURL=usage-readers.js.map