/** Shared Settings > LLM Providers section. First installed provider plugin wins the nav row. */
export { PROVIDERS_SECTION_ID, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS, PROVIDERS_SETTINGS_NS, PROVIDER_ITEM_ORDER, PROVIDER_ROUTES, applySavedOrder, decodeProviderOrder, providerRoute, sortCatalogGroups, } from '../order.ts';
export type { CatalogGroup, ProviderItemKey, ProviderOrderSettings } from '../order.ts';
declare const copy: {
    zh: {
        nav: string;
        title: string;
        subtitle: string;
        empty: string;
        drag: string;
    };
    en: {
        nav: string;
        title: string;
        subtitle: string;
        empty: string;
        drag: string;
    };
};
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        'settings.provider.item': {
            kind: 'keyed';
            scope: 'root';
        };
    }
    interface LocaleNamespaceMap {
        'settings.providers': keyof typeof copy.en;
    }
}
/** Public slots surface used by ensureProviderSection. */
export interface SlotsFace {
    inject(name: string, factory: () => unknown): void;
    register(options: Record<string, unknown>, component: unknown): () => void;
    entries(name: string): readonly {
        options: {
            id?: string;
            key?: string;
        };
    }[];
    subscribe?(name: string, listener: () => void): () => void;
}
/** Public locale surface used by ensureProviderSection. */
export interface LocaleFace {
    register(namespace: string, dicts: {
        zh: Record<string, string>;
        en: Record<string, string>;
    }): () => void;
    bind(namespace: string): (key: string) => string;
}
/** Browser ctx: Cordis optional get plus the slots/locale services every UI plugin injects. */
export interface ProviderSectionContext {
    get(name: string): unknown;
    slots: SlotsFace;
    locale: LocaleFace;
}
/**
 * Register the shared LLM Providers section when missing. Uninstalling every
 * provider plugin drops the nav row because only they call this helper.
 * @param ctx - browser plugin context (slots + locale; settingsScope via ctx.get).
 */
export declare function ensureProviderSection(ctx: ProviderSectionContext): void;
//# sourceMappingURL=provider-section.d.ts.map