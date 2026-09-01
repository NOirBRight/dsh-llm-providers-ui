/**
 * Patches the LLM Providers navigation row with its globe icon.
 *
 * The adapter owns only the SVG attributes and markup it writes. Each install
 * receives a distinct marker so overlapping installs can restore in order.
 * @module dsh-llm-providers-ui/client/nav-icon
 */
/**
 * Install the navigation icon adapter.
 * @returns An idempotent disposer for the observer, frame, and owned SVG state.
 */
export declare function installProvidersNavIcon(): () => void;
//# sourceMappingURL=nav-icon.d.ts.map