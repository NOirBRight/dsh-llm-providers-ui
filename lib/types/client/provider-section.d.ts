/** Shared Settings > LLM Providers section. The dsh-llm-providers-ui client owns the nav row. */
export { PROVIDERS_SECTION_ID, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS, PROVIDERS_SETTINGS_NS, PROVIDER_ITEM_ORDER, PROVIDER_ROUTES, applySavedOrder, decodeProviderOrder, providerRoute, sortCatalogGroups, } from '../order.js';
export type { CatalogGroup, ProviderItemKey, ProviderOrderSettings } from '../order.js';
/** Locale copy: empty state names all six providers. */
export declare const copy: {
    readonly zh: {
        readonly nav: "LLM 供应商";
        readonly title: "LLM 供应商";
        readonly subtitle: "连接账号，并选择哪些模型出现在对话的模型列表里。拖动卡片会改变对话模型列表里的供应商顺序。";
        readonly empty: "安装 Cursor、Grok、Codex、Ollama Cloud、CommandCode 或 OpenCode Go 后，在这里连接账号并选择模型。";
        readonly drag: "拖动排序";
        readonly sort: "Provider 排序";
        readonly done: "完成排序";
        readonly moveUp: "上移";
        readonly moveDown: "下移";
    };
    readonly en: {
        readonly nav: "LLM Providers";
        readonly title: "LLM Providers";
        readonly subtitle: "Connect accounts and choose which models appear in the chat picker. Drag cards to change provider order in the picker.";
        readonly empty: "Install Cursor, Grok, Codex, Ollama Cloud, CommandCode, or OpenCode Go to connect an account and pick models here.";
        readonly drag: "Reorder";
        readonly sort: "Sort providers";
        readonly done: "Done";
        readonly moveUp: "Move up";
        readonly moveDown: "Move down";
    };
};
export type ProviderSectionLocaleKey = keyof typeof copy.en;
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
//# sourceMappingURL=provider-section.d.ts.map