import { jsx as _jsx } from "react/jsx-runtime";
/** Mounts the Provider Usage store into the sidebar footer slot. */
import { useSyncExternalStore } from 'react';
import { PROVIDERS_ITEM_SLOT, providerKeyForRoute } from '../order.js';
import { ProviderUsagePanel } from './ProviderUsagePanel.js';
import { createProviderUsageStore } from './usage.js';
import { disposeReverse } from './cleanup.js';
function currentProviderKey(state) {
    const currentSessionId = state.current;
    if (currentSessionId === undefined)
        return undefined;
    const session = state.byId[currentSessionId];
    const selection = session?.projectionValues?.modelSelection;
    const provider = selection?.next?.provider;
    return provider === undefined ? undefined : providerKeyForRoute(provider);
}
function ProviderUsageAction(props) {
    const usage = useSyncExternalStore(props.usage.subscribe, props.usage.getSnapshot, props.usage.getSnapshot);
    const activeProviderKey = props.useSessions(currentProviderKey);
    if (!props.wide)
        return null;
    return (_jsx(ProviderUsagePanel, { providers: usage.providers, hiddenKeys: usage.hiddenKeys, ...activeProviderKey === undefined ? {} : { currentProviderKey: activeProviderKey }, refreshing: usage.refreshing, onRefresh: props.usage.refresh, onToggleVisibility: props.toggleVisibility, onShowAll: props.showAll }));
}
function providerKeys(ctx) {
    return ctx.slots.entriesOfSlot(PROVIDERS_ITEM_SLOT)
        .map(entry => entry.options.key)
        .filter((key) => key !== undefined && key.length > 0);
}
/** Install one root-scoped footer action and keep it synchronized with provider/settings slots. */
export function installProviderUsage(ctx, orderScope) {
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
    const usage = createProviderUsageStore(connection.rpc);
    let lastConfig = '';
    const reconcile = () => {
        const settings = orderScope.getSnapshot();
        const keys = providerKeys(ctx);
        const order = settings.value?.order ?? [];
        const hidden = settings.value?.hiddenUsageProviders ?? [];
        const config = JSON.stringify([keys, order, hidden]);
        if (config === lastConfig)
            return;
        lastConfig = config;
        usage.configure({ registeredKeys: keys, savedOrder: order, hiddenKeys: hidden });
    };
    const writeHidden = (hidden) => {
        const settings = orderScope.getSnapshot();
        if (settings.status !== 'ready' || !settings.writable)
            return;
        void orderScope.set('hiddenUsageProviders', [...new Set(hidden)]).catch(error => {
            console.warn('[dsh-llm-providers-ui] failed to save Provider Usage visibility', error);
        });
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
    reconcile();
    const action = ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
        name: 'sidebar.footer.action',
        id: 'llm-providers-usage',
        order: 0,
        inject: () => ({ usage, toggleVisibility, showAll }),
    }, ProviderUsageAction));
    const stopSlot = ctx.slots.subscribe(PROVIDERS_ITEM_SLOT, reconcile);
    const stopSettings = orderScope.subscribe(reconcile);
    return () => {
        disposeReverse([stopSettings, stopSlot, action, () => { usage.dispose(); }], 'dsh-llm-providers-ui: usage cleanup failed');
    };
}
//# sourceMappingURL=usage-action.js.map