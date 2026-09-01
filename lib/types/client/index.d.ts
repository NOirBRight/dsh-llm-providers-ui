/** Browser owner of the LLM Providers Settings page. */
import z from '@deepseek-ai/schemastery';
import type { Context as ClientContext } from '@deepseek-ai/cordis';
export declare const name = "dsh-llm-providers-ui-client";
export declare const inject: string[];
/** Client configuration for the Providers page owner. */
export interface Config {
}
export declare const Config: z<Config>;
/**
 * Mount the sole LLM Providers page, locale, slot, and nav-icon adapter.
 * The page is independent of shell/provider load order and appears only after
 * the Host-owned settings namespace is available.
 * @param ctx - Web Cordis context with official slot, locale, and settingsScope faces.
 */
export declare function apply(ctx: ClientContext, _config?: Config): void;
//# sourceMappingURL=index.d.ts.map