import { jsx as _jsx } from "react/jsx-runtime";
/** Mounts the Provider Usage store into the sidebar footer slot. */
import { useSyncExternalStore } from 'react';
import { PROVIDERS_ITEM_SLOT } from '../order.js';
import { ProviderUsagePanel } from './ProviderUsagePanel.js';
import { createProviderUsageStore } from './usage.js';
import { disposeReverse } from './cleanup.js';
function ProviderUsageAction(props) {
    const usage = useSyncExternalStore(props.usage.subscribe, props.usage.getSnapshot, props.usage.getSnapshot);
    if (!props.wide)
        return null;
    return (_jsx(ProviderUsagePanel, { providers: usage.providers, hiddenKeys: usage.hiddenKeys, refreshing: usage.refreshing, onRefresh: key => { key === undefined ? props.usage.refresh() : props.usage.refresh([key]); }, onToggleVisibility: props.toggleVisibility, onShowAll: props.showAll, onReorder: keys => { props.reorder(keys); } }));
}
function providerKeys(ctx) {
    return ctx.slots.entriesOfSlot(PROVIDERS_ITEM_SLOT)
        .map(entry => entry.options.key)
        .filter((key) => key !== undefined && key.length > 0);
}
/** Install one root-scoped footer action and keep it synchronized with provider/settings slots. */
export function installProviderUsage(ctx, orderScope, directory) {
    let connection;
    try {
        const candidate = ctx.get('connection');
        if (candidate === undefined || candidate === null || typeof candidate !== 'object' || !('rpc' in candidate))
            return () => { };
        connection = candidate;
    }
    catch {
        return () => { };
    }
    const usage = createProviderUsageStore(connection.rpc, key => directory.reader(key));
    let directoryGeneration = 0;
    let lastConfig = '';
    const reconcile = () => {
        const settings = orderScope.getSnapshot();
        const keys = providerKeys(ctx);
        const usageOrder = settings.value?.usageOrder ?? [];
        const hidden = settings.value?.hiddenUsageProviders ?? [];
        const config = JSON.stringify([keys, usageOrder, hidden, directoryGeneration]);
        if (config === lastConfig)
            return;
        lastConfig = config;
        usage.configure({ registeredKeys: keys, savedOrder: usageOrder, hiddenKeys: hidden });
    };
    const writeList = (field, value) => {
        const settings = orderScope.getSnapshot();
        if (settings.status !== 'ready' || !settings.writable)
            return;
        void orderScope.set(field, [...value]).catch(error => {
            console.warn('[dsh-llm-providers-ui] failed to save Provider Usage ' + field, error);
        });
    };
    const writeHidden = (hidden) => {
        writeList('hiddenUsageProviders', [...new Set(hidden)]);
    };
    const toggleVisibility = (providerKey, visible) => {
        const hidden = new Set(orderScope.getSnapshot().value?.hiddenUsageProviders ?? []);
        if (visible)
            hidden.delete(providerKey);
        else
            hidden.add(providerKey);
        writeHidden([...hidden]);
    };
    const showAll = () => { writeHidden([]); };
    const reorder = (keys) => { writeList('usageOrder', keys); };
    reconcile();
    const action = ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
        name: 'sidebar.footer.action',
        id: 'llm-providers-usage',
        order: 0,
        inject: () => ({ usage, toggleVisibility, showAll, reorder }),
    }, ProviderUsageAction));
    const stopSlot = ctx.slots.subscribe(PROVIDERS_ITEM_SLOT, reconcile);
    const stopSettings = orderScope.subscribe(reconcile);
    const stopDirectory = directory.subscribe(() => {
        directoryGeneration += 1;
        reconcile();
    });
    const stopInvalidate = directory.onInvalidateUsage(key => { usage.invalidate([key]); });
    return () => {
        disposeReverse([stopInvalidate, stopDirectory, stopSettings, stopSlot, action, () => { usage.dispose(); }], 'dsh-llm-providers-ui: usage cleanup failed');
    };
}
//# sourceMappingURL=usage-action.js.map