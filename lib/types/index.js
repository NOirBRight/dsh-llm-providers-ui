/** Host half: shared llm-providers settings section (first writer wins). */
import z from '@deepseek-ai/schemastery';
import { settingsNamespace } from '@deepseek-ai/dsh-settings';
import { PROVIDERS_SETTINGS_NS } from "./order.js";
export { PROVIDERS_SECTION_ID, PROVIDERS_ITEM_SLOT, PROVIDERS_LOCALE_NS, PROVIDERS_SETTINGS_NS, PROVIDER_ITEM_ORDER, PROVIDER_ROUTES, applySavedOrder, decodeProviderOrder, providerRoute, sortCatalogGroups, } from "./order.js";
export const name = 'dsh-llm-providers-ui';
const NS = settingsNamespace(PROVIDERS_SETTINGS_NS);
export const OrderConfig = z.object({
    order: z.array(String).default([]),
});
function alreadyRegistered(error) {
    return error instanceof Error && /already registered/.test(error.message);
}
/**
 * Register llm-providers when missing. Duplicate registrations from a
 * second installed llm plugin are ignored; the first loaded fiber owns the
 * section until it unloads.
 * @param ctx - Cordis plugin context; uses public inject(['settings']).
 */
export function ensureProviderOrderSettings(ctx) {
    ctx.inject(['settings'], (sctx) => {
        const occupied = sctx.settings.describe().some(entry => entry.ns === PROVIDERS_SETTINGS_NS);
        if (occupied)
            return;
        try {
            sctx.settings.register(NS, OrderConfig, { base: { order: [] } });
        }
        catch (error) {
            if (!alreadyRegistered(error))
                throw error;
        }
    });
}
//# sourceMappingURL=index.js.map