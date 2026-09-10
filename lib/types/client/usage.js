/** Secret-free subscription usage readers and an abortable sidebar store. */
import { applySavedOrder } from '../order.js';
import { readUsageCache, writeUsageCache, dropPersistedUsageKeys, hasUsageData } from '../usage-readers.js';
export { peekCachedUsage, rememberCachedUsage, rememberHeadlineQuota, headerQuotaFromCache, clearProviderUsageCache } from '../usage-readers.js';
export { createCodexUsageReader, createCommandCodeUsageReader, createCursorUsageReader, createGrokUsageReader, createOllamaUsageReader, createOpenCodeGoUsageReader, pickPrimaryWindow } from '../usage-readers.js';
export const USAGE_POLL_MS = 15 * 60 * 1000;
export const USAGE_MIN_REFETCH_MS = 5 * 60 * 1000;
export const USAGE_READ_TIMEOUT_MS = 20_000;
const USAGE_MAX_IN_FLIGHT = 3;
function keepUsage(old, next) {
    // Signed out means those windows are not this account's any more, so they are
    // dropped rather than relabelled stale. A provider that still has credentials
    // and merely failed to answer keeps its last good windows, marked stale.
    if (next.status === 'logged-out')
        return next;
    if (!hasUsageData(next) && hasUsageData(old))
        return { ...old, status: 'stale' };
    return next;
}
function isFresh(summary, now) {
    if (!hasUsageData(summary) || summary.fetchedAt === undefined)
        return false;
    const fetched = Date.parse(summary.fetchedAt);
    return Number.isFinite(fetched) && now - fetched < USAGE_MIN_REFETCH_MS;
}
/** External store: one request per visible Provider, stale data survives failures, and dispose aborts every request. */
export function createProviderUsageStore(rpc, readerForKey) {
    let snapshot = { providers: [], hiddenKeys: [], refreshing: false };
    let configuredKeys = [];
    const current = readUsageCache();
    const active = new Map();
    const queued = [];
    const listeners = new Set();
    let disposed = false;
    let refreshGeneration = 0;
    let pollTimer;
    const notify = () => { for (const listener of listeners)
        listener(); };
    const pending = (key) => active.has(key) || queued.some(item => item.key === key);
    const publish = () => {
        snapshot = {
            providers: configuredKeys.map(key => {
                const item = current.get(key);
                if (item === undefined)
                    return undefined;
                return pending(key) ? { ...item, refreshing: true } : item;
            }).filter((item) => item !== undefined),
            hiddenKeys: [...snapshot.hiddenKeys],
            refreshing: active.size > 0 || queued.length > 0,
        };
        writeUsageCache(current);
        notify();
    };
    const pump = () => {
        while (!disposed && active.size < USAGE_MAX_IN_FLIGHT && queued.length > 0) {
            const item = queued.shift();
            if (item !== undefined)
                startRead(item.key, item.refresh);
        }
    };
    const enqueue = (key, refresh) => {
        if (disposed || active.has(key) || queued.some(item => item.key === key))
            return;
        queued.push({ key, refresh });
        pump();
    };
    const startRead = (key, refresh) => {
        const reader = readerForKey(key);
        if (reader === undefined || active.has(key) || disposed)
            return;
        const previous = current.get(key);
        if (previous === undefined) {
            current.set(key, { providerKey: key, name: reader.name, status: 'loading', windows: [] });
            publish();
        }
        const controller = new AbortController();
        const failOpen = () => {
            if (disposed || active.get(key) !== controller)
                return;
            const old = current.get(key);
            current.set(key, keepUsage(old, { providerKey: key, name: reader.name, status: 'error', windows: [] }));
            active.delete(key);
            publish();
            pump();
        };
        const timer = setTimeout(() => { controller.abort('timeout'); failOpen(); }, USAGE_READ_TIMEOUT_MS);
        active.set(key, controller);
        const generation = refreshGeneration;
        void reader.read(rpc, refresh, controller.signal).then(result => {
            if (disposed || generation !== refreshGeneration || controller.signal.aborted)
                return;
            const old = current.get(key);
            const next = result.status === 'ready'
                ? { providerKey: key, name: reader.name, status: 'ready', fetchedAt: result.fetchedAt, windows: result.windows }
                : { providerKey: key, name: reader.name, status: result.status, windows: [] };
            current.set(key, keepUsage(old, next));
        }).catch(() => {
            if (disposed || generation !== refreshGeneration || controller.signal.aborted)
                return;
            failOpen();
        }).finally(() => {
            clearTimeout(timer);
            if (active.get(key) === controller)
                active.delete(key);
            if (!disposed) {
                publish();
                pump();
            }
        });
    };
    const visibleKeys = (keys) => {
        const wanted = keys === undefined ? configuredKeys : keys.filter(key => configuredKeys.includes(key));
        return wanted.filter(key => !snapshot.hiddenKeys.includes(key));
    };
    const sync = (force = false, keys) => {
        const now = Date.now();
        for (const key of visibleKeys(keys))
            if (force || !isFresh(current.get(key), now))
                enqueue(key, force);
        publish();
    };
    const startPoll = () => {
        if (pollTimer !== undefined)
            return;
        pollTimer = setInterval(() => { if (!disposed)
            sync(false); }, USAGE_POLL_MS);
    };
    return {
        getSnapshot: () => snapshot,
        subscribe: listener => { listeners.add(listener); return () => { listeners.delete(listener); }; },
        configure: config => {
            const ordered = applySavedOrder(config.registeredKeys, config.savedOrder).filter(key => readerForKey(key) !== undefined);
            configuredKeys = [...new Set(ordered)];
            snapshot = { ...snapshot, hiddenKeys: [...new Set(config.hiddenKeys)] };
            for (const [key, controller] of active)
                if (!configuredKeys.includes(key) || snapshot.hiddenKeys.includes(key)) {
                    controller.abort();
                    active.delete(key);
                }
            for (let index = queued.length - 1; index >= 0; index -= 1) {
                const item = queued[index];
                if (item !== undefined && (!configuredKeys.includes(item.key) || snapshot.hiddenKeys.includes(item.key)))
                    queued.splice(index, 1);
            }
            const persisted = readUsageCache();
            if (configuredKeys.length > 0) {
                for (const key of [...current.keys()])
                    if (!configuredKeys.includes(key))
                        current.delete(key);
            }
            for (const key of configuredKeys) {
                const existing = current.get(key);
                if (hasUsageData(existing))
                    continue;
                const cached = persisted.get(key);
                if (hasUsageData(cached))
                    current.set(key, cached);
                else if (existing === undefined) {
                    const reader = readerForKey(key);
                    if (reader !== undefined)
                        current.set(key, { providerKey: key, name: reader.name, status: 'loading', windows: [] });
                }
            }
            sync(false);
            startPoll();
        },
        refresh: (keys) => {
            refreshGeneration += 1;
            const targets = visibleKeys(keys);
            for (const [key, controller] of active)
                if (targets.includes(key)) {
                    controller.abort();
                    active.delete(key);
                }
            for (let index = queued.length - 1; index >= 0; index -= 1) {
                const item = queued[index];
                if (item !== undefined && targets.includes(item.key))
                    queued.splice(index, 1);
            }
            sync(true, keys);
        },
        invalidate: (keys) => {
            const targets = keys === undefined ? [...configuredKeys] : keys.filter(key => configuredKeys.includes(key));
            if (targets.length === 0)
                return;
            refreshGeneration += 1;
            for (const [key, controller] of active)
                if (targets.includes(key)) {
                    controller.abort();
                    active.delete(key);
                }
            for (let index = queued.length - 1; index >= 0; index -= 1) {
                const item = queued[index];
                if (item !== undefined && targets.includes(item.key))
                    queued.splice(index, 1);
            }
            for (const key of targets)
                current.delete(key);
            dropPersistedUsageKeys(targets);
            for (const key of targets) {
                const reader = readerForKey(key);
                if (reader !== undefined)
                    current.set(key, { providerKey: key, name: reader.name, status: 'loading', windows: [] });
            }
            publish();
            sync(true, keys);
        },
        dispose: () => {
            disposed = true;
            if (pollTimer !== undefined)
                clearInterval(pollTimer);
            pollTimer = undefined;
            for (const controller of active.values())
                controller.abort();
            active.clear();
            listeners.clear();
            current.clear();
            configuredKeys = [];
        },
    };
}
//# sourceMappingURL=usage.js.map