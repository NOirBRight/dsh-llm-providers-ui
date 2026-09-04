/** Mounts the Provider Usage store into the sidebar footer slot. */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { UseSessions } from '@deepseek-ai/dsh-client-ui-session/client';
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client';
import { type ProviderOrderSettings } from '../order.js';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        'sidebar.footer.action': {
            kind: 'list';
            scope: 'root';
            owner: {
                wide: boolean;
            };
        };
    }
    interface GlobalStandardProps {
        useSessions: UseSessions;
    }
}
/** Install one root-scoped footer action and keep it synchronized with provider/settings slots. */
export declare function installProviderUsage(ctx: ClientContext, orderScope: SettingsScope<ProviderOrderSettings>): () => void;
//# sourceMappingURL=usage-action.d.ts.map