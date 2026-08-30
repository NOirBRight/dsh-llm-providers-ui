/** Shared Settings > LLM Providers section. First installed provider plugin wins the nav row. */
import { installProvidersNavIcon } from "./nav-icon.js";
import { bindProvidersSection } from "./ProvidersSection.js";
import { decodeProviderOrder, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS, PROVIDERS_SECTION_ID, PROVIDERS_SETTINGS_NS, } from "../order.js";
export { PROVIDERS_SECTION_ID, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS, PROVIDERS_SETTINGS_NS, PROVIDER_ITEM_ORDER, PROVIDER_ROUTES, applySavedOrder, decodeProviderOrder, providerRoute, sortCatalogGroups, } from "../order.js";
const copy = {
    zh: {
        nav: 'LLM 供应商',
        title: 'LLM 供应商',
        subtitle: '连接账号，并选择哪些模型出现在对话的模型列表里。拖动卡片会改变对话模型列表里的供应商顺序。',
        empty: '安装 Cursor、Grok、Codex 或 Ollama Cloud 后，在这里连接账号并选择模型。',
        drag: '拖动排序',
    },
    en: {
        nav: 'LLM Providers',
        title: 'LLM Providers',
        subtitle: 'Connect accounts and choose which models appear in the chat picker. Drag cards to change provider order in the picker.',
        empty: 'Install Cursor, Grok, Codex, or Ollama Cloud to connect an account and pick models here.',
        drag: 'Reorder',
    },
};
function isOccupied(slots) {
    return slots.entries('settings.section').some(entry => entry.options.id === PROVIDERS_SECTION_ID);
}
function duplicateSection(error) {
    return error instanceof Error && /already has|requires options/.test(error.message);
}
function isSettingsScopeFace(value) {
    return typeof value === 'object' && value !== null && typeof value.bind === 'function';
}
function bindOrder(ctx) {
    let value;
    try {
        value = ctx.get('settingsScope');
    }
    catch {
        return undefined;
    }
    if (!isSettingsScopeFace(value))
        return undefined;
    try {
        return value.bind({ namespace: PROVIDERS_SETTINGS_NS, decode: decodeProviderOrder });
    }
    catch {
        return undefined;
    }
}
/**
 * Register the shared LLM Providers section when missing. Uninstalling every
 * provider plugin drops the nav row because only they call this helper.
 * @param ctx - browser plugin context (slots + locale; settingsScope via ctx.get).
 */
export function ensureProviderSection(ctx) {
    const slots = ctx.slots;
    const locale = ctx.locale;
    const orderScope = bindOrder(ctx);
    slots.inject('settings.section', () => {
        let disposeSection;
        let disposeLocale;
        let disposeIcon;
        const claim = () => {
            if (disposeSection !== undefined || isOccupied(slots))
                return;
            disposeLocale ??= locale.register(PROVIDERS_LOCALE_NS, copy);
            const t = locale.bind(PROVIDERS_LOCALE_NS);
            try {
                disposeSection = slots.register({
                    name: 'settings.section',
                    id: PROVIDERS_SECTION_ID,
                    order: 12,
                    label: () => t('nav'),
                    locale: PROVIDERS_LOCALE_NS,
                    children: { [PROVIDERS_ITEM_SLOT]: { kind: 'keyed', scope: 'root' } },
                }, bindProvidersSection(() => slots.entries(PROVIDERS_ITEM_SLOT)
                    .map(entry => entry.options.key)
                    .filter((key) => typeof key === 'string' && key.length > 0), listener => {
                    const stopSlot = slots.subscribe?.(PROVIDERS_ITEM_SLOT, listener);
                    const stopSaved = orderScope?.subscribe(listener);
                    return () => {
                        stopSlot?.();
                        stopSaved?.();
                    };
                }, () => {
                    const snapshot = orderScope?.getSnapshot();
                    return {
                        keys: snapshot?.value?.order ?? [],
                        disabled: snapshot !== undefined && (snapshot.status !== 'ready' || snapshot.writable !== true),
                    };
                }, keys => { void orderScope?.set('order', keys); }));
                disposeIcon ??= installProvidersNavIcon();
            }
            catch (error) {
                if (!duplicateSection(error))
                    throw error;
            }
        };
        claim();
        const stop = slots.subscribe?.('settings.section', () => {
            if (!isOccupied(slots)) {
                disposeSection = undefined;
                claim();
            }
        });
        return () => {
            stop?.();
            disposeIcon?.();
            disposeIcon = undefined;
            disposeSection?.();
            disposeSection = undefined;
            disposeLocale?.();
            disposeLocale = undefined;
        };
    });
}
//# sourceMappingURL=provider-section.js.map