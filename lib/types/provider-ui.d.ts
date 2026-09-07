/**
 * Stable built ESM re-export for the shared provider header and quota meter.
 * Provider plugins acquire the components from the built artifact
 * `dsh-llm-providers-ui/provider-ui` (alwaysBundle), never from source.
 * @module dsh-llm-providers-ui/provider-ui
 */
export { ProviderCardHeader, ProviderQuotaMeter, ProviderRoleBadge, normalizeQuotaRemaining, providerUiCss } from './client/provider-ui.js';
export { ProviderMark } from './client/provider-marks.js';
export type { ProviderCardHeaderProps, ProviderCardRole, ProviderQuotaMeterProps, ProviderQuotaState, ProviderRoleBadgeProps } from './client/provider-ui.js';
//# sourceMappingURL=provider-ui.d.ts.map