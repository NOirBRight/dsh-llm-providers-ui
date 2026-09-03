/** Secret-free subscription usage readers and an abortable sidebar store. */
import { applySavedOrder } from '../order.js';
function record(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : undefined;
}
const SECRET_KEY = /^(?:accessToken|refreshToken|access_token|refresh_token|id_token|idToken|token|apiKey|api_key|value)$/iu;
/** Reject any secret-shaped field before a provider response enters UI state. */
function secretFree(value) {
    if (Array.isArray(value))
        return value.every(secretFree);
    const item = record(value);
    if (item === undefined)
        return true;
    return Object.entries(item).every(([key, child]) => !SECRET_KEY.test(key) && secretFree(child));
}
function nonEmptyString(value) {
    return typeof value === 'string' && value.length > 0;
}
function finiteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
}
function nonNegativeNumber(value) {
    return finiteNumber(value) && value >= 0;
}
function displayNumber(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}
function percentage(value) {
    return Math.round(Math.max(0, Math.min(100, value)) * 10) / 10;
}
function percentageText(value) {
    return displayNumber(percentage(value)) + '%';
}
function shortLabel(value) {
    const normalized = value.toLowerCase();
    if (normalized.includes('five') || normalized.includes('5h') || normalized.includes('5-hour'))
        return '5h';
    if (normalized.includes('two-hour') || normalized.includes('2-hour') || normalized.includes('2h'))
        return '2h';
    if (normalized.includes('session'))
        return 'S';
    if (normalized.includes('week'))
        return 'W';
    if (normalized.includes('month'))
        return 'M';
    if (normalized.includes('credit'))
        return 'Cr';
    if (normalized.includes('agent'))
        return 'A';
    if (normalized.includes('daily') || normalized.includes('day'))
        return 'D';
    if (normalized.includes('local'))
        return 'L';
    if (normalized.includes('hour'))
        return 'H';
    return value.slice(0, 4);
}
function windowLabel(id, period) {
    return nonEmptyString(period) ? period : id;
}
function usageResult(value, decode) {
    const response = record(value);
    if (response === undefined || !secretFree(response))
        return { status: 'error', message: 'malformed usage response' };
    if (response.status === 'unsupported')
        return { status: 'unsupported' };
    if (response.status === 'logged-out')
        return { status: 'logged-out' };
    if (response.status !== 'ok')
        return { status: 'error', message: 'unknown usage status' };
    const usage = record(response.usage);
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
        const item = record(value);
        if (item === undefined || !nonEmptyString(item.id) || !nonNegativeNumber(item.used) || !nonNegativeNumber(item.limit))
            return undefined;
        if (item.period !== undefined && !nonEmptyString(item.period))
            return undefined;
        if (item.unit !== undefined && item.unit !== 'percent')
            return undefined;
        if (item.resetsAt !== undefined && !nonEmptyString(item.resetsAt))
            return undefined;
        const label = windowLabel(item.id, item.period);
        const remaining = item.unit === 'percent'
            ? percentage(100 - item.used)
            : item.limit === 0 ? undefined : percentage(100 * (1 - item.used / item.limit));
        const resetAt = item.resetsAt ?? viewReset;
        windows.push({
            id: item.id,
            label,
            shortLabel: shortLabel(label),
            ...(remaining === undefined ? { valueText: displayNumber(Math.max(0, item.limit - item.used)) + ' / ' + displayNumber(item.limit) } : { remainingPercent: remaining, valueText: percentageText(remaining) }),
            ...(resetAt === undefined ? {} : { resetsAt: resetAt }),
        });
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
        const item = record(value);
        if (item === undefined || !nonNegativeNumber(item.usage))
            return undefined;
        if (item.resetsAt !== undefined && !nonEmptyString(item.resetsAt))
            return undefined;
        const label = key === 'session' ? 'Session' : key === 'weekly' ? 'Weekly' : 'Monthly';
        const remaining = percentage(100 * (1 - item.usage));
        windows.push({
            id: key,
            label,
            shortLabel: shortLabel(label),
            remainingPercent: remaining,
            valueText: percentageText(remaining),
            ...(item.resetsAt === undefined ? {} : { resetsAt: item.resetsAt }),
        });
    }
    return { fetchedAt: usage.fetchedAt, windows };
}
function decodeCommandCodeUsage(usage) {
    if (!nonEmptyString(usage.fetchedAt))
        return undefined;
    if (usage.failures !== undefined && (!Array.isArray(usage.failures) || usage.failures.some(item => typeof item !== 'string')))
        return undefined;
    const credits = usage.credits;
    if (credits === undefined)
        return { fetchedAt: usage.fetchedAt, windows: [] };
    const value = record(credits);
    if (value === undefined)
        return undefined;
    const windows = [];
    const monthly = value.monthlyCredits;
    if (monthly !== undefined) {
        if (!nonNegativeNumber(monthly))
            return undefined;
        windows.push({ id: 'monthly-credits', label: 'Credits', shortLabel: 'Cr', valueText: displayNumber(monthly) });
    }
    for (const [key, label] of [['fiveHour', '5-hour'], ['weekly', 'Weekly']]) {
        const raw = value[key];
        if (raw === undefined)
            continue;
        const item = record(raw);
        if (item === undefined || !nonNegativeNumber(item.used) || !nonNegativeNumber(item.cap))
            return undefined;
        if (item.resetAt !== undefined && !nonEmptyString(item.resetAt))
            return undefined;
        const remaining = item.cap === 0 ? undefined : percentage(100 * (1 - item.used / item.cap));
        windows.push({
            id: key,
            label,
            shortLabel: shortLabel(label),
            ...(remaining === undefined ? { valueText: displayNumber(Math.max(0, item.cap - item.used)) + ' / ' + displayNumber(item.cap) } : { remainingPercent: remaining, valueText: percentageText(remaining) }),
            ...(item.resetAt === undefined ? {} : { resetsAt: item.resetAt }),
        });
    }
    return { fetchedAt: usage.fetchedAt, windows };
}
// RC1 Codex has no secret-free usage/read RPC; do not invent a credential path.
const readerDefinitions = [
    { providerKey: 'llm-cursor', name: 'Cursor', read: (rpc, refresh, signal) => rpc.call('/cursor', 'usage/read', refresh ? { refresh: true } : {}, signal).then(result => result.ok ? usageResult(result.value, decodePercentUsage) : { status: 'error', message: result.error.message }) },
    { providerKey: 'llm-grok', name: 'Grok', read: (rpc, refresh, signal) => rpc.call('/grok', 'usage/read', refresh ? { refresh: true } : {}, signal).then(result => result.ok ? usageResult(result.value, decodePercentUsage) : { status: 'error', message: result.error.message }) },
    { providerKey: 'llm-ollama', name: 'Ollama Cloud', read: (rpc, _refresh, signal) => rpc.call('/ollama-cloud', 'usage/read', {}, signal).then(result => result.ok ? usageResult(result.value, value => decodeFractionUsage(['session', 'weekly'], value)) : { status: 'error', message: result.error.message }) },
    { providerKey: 'llm-commandcode', name: 'CommandCode', read: (rpc, _refresh, signal) => rpc.call('/commandcode', 'usage/read', {}, signal).then(result => result.ok ? usageResult(result.value, decodeCommandCodeUsage) : { status: 'error', message: result.error.message }) },
    { providerKey: 'llm-opencode-go', name: 'OpenCode Go', read: (rpc, _refresh, signal) => rpc.call('/opencode-go', 'usage/read', {}, signal).then(result => result.ok ? usageResult(result.value, value => decodeFractionUsage(['session', 'weekly', 'monthly'], value)) : { status: 'error', message: result.error.message }) },
];
export const PROVIDER_USAGE_READERS = readerDefinitions;
const readerByKey = new Map(readerDefinitions.map(reader => [reader.providerKey, reader]));
export function providerUsageReader(key) {
    return readerByKey.get(key);
}
function hasUsageData(summary) {
    return summary !== undefined && summary.windows.length > 0 && (summary.status === 'ready' || summary.status === 'stale');
}
/** External store: one request per visible Provider, stale data survives failures, and dispose aborts every request. */
export function createProviderUsageStore(rpc) {
    let snapshot = { providers: [], hiddenKeys: [], refreshing: false, unavailable: rpc === undefined };
    let configuredKeys = [];
    const current = new Map();
    const active = new Map();
    const listeners = new Set();
    let disposed = false;
    let refreshGeneration = 0;
    const notify = () => { for (const listener of listeners)
        listener(); };
    const publish = () => {
        snapshot = { providers: configuredKeys.map(key => current.get(key)).filter((item) => item !== undefined), hiddenKeys: [...snapshot.hiddenKeys], refreshing: active.size > 0, unavailable: rpc === undefined };
        notify();
    };
    const read = (key, refresh) => {
        const reader = providerUsageReader(key);
        if (reader === undefined || rpc === undefined || active.has(key) || disposed)
            return;
        const previous = current.get(key);
        if (previous === undefined || !hasUsageData(previous)) {
            current.set(key, { providerKey: key, name: reader.name, status: 'loading', windows: [] });
            publish();
        }
        const controller = new AbortController();
        active.set(key, controller);
        const generation = refreshGeneration;
        void reader.read(rpc, refresh, controller.signal).then(result => {
            if (disposed || controller.signal.aborted || generation !== refreshGeneration)
                return;
            const old = current.get(key);
            const next = result.status === 'ready'
                ? { providerKey: key, name: reader.name, status: 'ready', fetchedAt: result.fetchedAt, windows: result.windows }
                : result.status === 'error' && hasUsageData(old)
                    ? { ...old, status: 'stale' }
                    : { providerKey: key, name: reader.name, status: result.status, windows: [] };
            current.set(key, next);
        }).catch(() => {
            if (disposed || controller.signal.aborted || generation !== refreshGeneration)
                return;
            const old = current.get(key);
            current.set(key, hasUsageData(old) ? { ...old, status: 'stale' } : { providerKey: key, name: reader.name, status: 'error', windows: [] });
        }).finally(() => {
            if (active.get(key) === controller)
                active.delete(key);
            if (!disposed)
                publish();
        });
    };
    const sync = (refresh = false) => {
        for (const key of configuredKeys)
            if (!snapshot.hiddenKeys.includes(key))
                read(key, refresh);
        publish();
    };
    return {
        getSnapshot: () => snapshot,
        subscribe: listener => { listeners.add(listener); return () => { listeners.delete(listener); }; },
        configure: (registeredKeys, savedOrder, hiddenKeys) => {
            const ordered = applySavedOrder(registeredKeys, savedOrder).filter(key => providerUsageReader(key) !== undefined);
            configuredKeys = [...new Set(ordered)];
            snapshot = { ...snapshot, hiddenKeys: [...new Set(hiddenKeys)] };
            for (const [key, controller] of active)
                if (!configuredKeys.includes(key) || snapshot.hiddenKeys.includes(key)) {
                    controller.abort();
                    active.delete(key);
                }
            for (const key of [...current.keys()])
                if (!configuredKeys.includes(key)) {
                    current.delete(key);
                }
            for (const key of configuredKeys)
                if (!current.has(key)) {
                    const reader = providerUsageReader(key);
                    if (reader !== undefined)
                        current.set(key, { providerKey: key, name: reader.name, status: 'loading', windows: [] });
                }
            sync();
        },
        refresh: () => {
            refreshGeneration += 1;
            for (const controller of active.values())
                controller.abort();
            active.clear();
            for (const key of configuredKeys)
                if (!snapshot.hiddenKeys.includes(key)) {
                    const reader = providerUsageReader(key);
                    const previous = current.get(key);
                    if (reader !== undefined && !hasUsageData(previous))
                        current.set(key, { providerKey: key, name: reader.name, status: 'loading', windows: [] });
                }
            sync(true);
        },
        dispose: () => { disposed = true; for (const controller of active.values())
            controller.abort(); active.clear(); listeners.clear(); current.clear(); configuredKeys = []; },
    };
}
//# sourceMappingURL=usage.js.map