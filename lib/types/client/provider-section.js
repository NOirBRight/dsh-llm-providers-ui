/** Shared Settings > LLM Providers section. The dsh-llm-providers-ui client owns the nav row. */
export { PROVIDERS_SECTION_ID, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS, PROVIDERS_SETTINGS_NS, PROVIDER_ITEM_ORDER, PROVIDER_ROUTES, applySavedOrder, decodeProviderOrder, providerRoute, sortCatalogGroups, } from '../order.js';
/** Locale copy: empty state names all six providers. */
export const copy = {
    zh: {
        nav: 'LLM 供应商',
        title: 'LLM 供应商',
        subtitle: '连接账号，并选择哪些模型出现在对话的模型列表里。拖动卡片会改变对话模型列表里的供应商顺序。',
        empty: '安装 Cursor、Grok、Codex、Ollama Cloud、CommandCode 或 OpenCode Go 后，在这里连接账号并选择模型。',
        drag: '拖动排序',
    },
    en: {
        nav: 'LLM Providers',
        title: 'LLM Providers',
        subtitle: 'Connect accounts and choose which models appear in the chat picker. Drag cards to change provider order in the picker.',
        empty: 'Install Cursor, Grok, Codex, Ollama Cloud, CommandCode, or OpenCode Go to connect an account and pick models here.',
        drag: 'Reorder',
    },
};
//# sourceMappingURL=provider-section.js.map