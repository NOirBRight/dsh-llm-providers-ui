/** Shared provider card header: monochrome role badge plus a segmented remaining-quota meter, and the header's binding to the shared quota cache. No RPC, no provider knowledge. */
import type { ReactNode } from 'react';
/** Card role shown as a monochrome badge. Unknown cards stay LLM. */
export type ProviderCardRole = 'llm' | 'agent';
/** Remaining quota for one window. Percent (0-100) wins; fraction (0-1) is the fallback. */
export interface ProviderQuotaState {
    /** Remaining quota, 0-100. Values outside 0-100 are unavailable, never clamped. */
    remainingPercent?: number;
    /** Remaining quota, 0-1. Used only when remainingPercent is absent. */
    remainingFraction?: number;
    /** Window label (for example 5h). Names the meter for assistive technology. */
    label?: string;
    /** Reset caption rendered under the meter. */
    detail?: string;
}
/**
 * Normalize remaining quota to a 0-100 percent value.
 * Valid readings keep their precision (99.9 stays 99.9, never rounds to 100).
 * NaN, Infinity, and out-of-range readings are unavailable, not clamped:
 * clamping would fabricate a full or empty bar from bad data.
 * @param input - percent and/or fraction quota reading.
 * @returns the 0-100 remaining value, or undefined when unavailable.
 */
export declare function normalizeQuotaRemaining(input: Pick<ProviderQuotaState, 'remainingPercent' | 'remainingFraction'>): number | undefined;
/** Settled state of the account read that decides whether a card may show quota at all. */
export interface ProviderAuthState {
    /** False while the account read is still pending, so a cached quota may still paint. */
    answered: boolean;
    /** True only for a settled sign-out or re-authentication requirement, which also drops the stored entry. */
    signedOut: boolean;
    /**
     * True when the provider's verdict forbids any header meter: a settled query that
     * returned no usable quota, an unsupported endpoint, or an account switch in flight.
     * Withholding keeps the truthful unavailable dash instead of a stale percent, and
     * writes nothing to the shared cache.
     */
    withheld?: boolean;
}
/**
 * Remaining quota for a provider card header, from one cache shared with the
 * Provider Usage sidebar. The first frame paints the cached entry, a live answer
 * wins and is written back, and a known sign-out drops the entry rather than
 * leaving another account's quota behind.
 * @param providerKey - usage cache key, identical to the sidebar reader's key.
 * @param providerName - display name recorded with the cached quota.
 * @param quota - the live answer, or null while none has arrived.
 * @param auth - settled state of the account read.
 * @returns the live quota, else the cached one; null when withheld or when neither is displayable.
 */
export declare function useProviderQuotaCache(providerKey: string, providerName: string, quota: ProviderQuotaState | null, auth: ProviderAuthState): ProviderQuotaState | null;
/** Props of {@link ProviderQuotaMeter}. */
export interface ProviderQuotaMeterProps {
    /** Remaining quota, 0-100. Values outside 0-100 are unavailable, never clamped. */
    remainingPercent?: number;
    /** Remaining quota, 0-1. Used only when remainingPercent is absent. */
    remainingFraction?: number;
    /** Window label naming the meter. Defaults to Quota. */
    label?: string;
    /** Reset caption rendered under the meter. */
    detail?: string;
    /** Placeholder shown when quota is unavailable. Defaults to an em dash. */
    emptyLabel?: string;
    /** Optional id for the meter wrapper. */
    id?: string;
}
/** Segmented remaining-quota meter. Unavailable quota renders a placeholder, never a zero bar. */
export declare function ProviderQuotaMeter(props: ProviderQuotaMeterProps): ReactNode;
/** Props of {@link ProviderCardHeader}. The legacy codex signature keeps working unchanged. */
export interface ProviderCardHeaderProps {
    /** Provider display name. */
    title: string;
    /** Provider brand mark. */
    mark: ReactNode;
    /** Provider-supplied count line (for example models enabled). Rendered as-is. */
    summary: string;
    /** Whether the card body is expanded. Rotates the chevron. */
    open: boolean;
    /** Show the unsaved-changes hint. */
    unsaved?: boolean;
    /** Unsaved-changes text, shown only together with unsaved. */
    unsavedLabel?: string;
    /** Card role for the monochrome badge. Defaults to llm. */
    role?: ProviderCardRole;
    /** Caller-supplied status node. Rendered only when provided; never defaults to summary. */
    status?: ReactNode;
    /** Headline quota window. Absent quota renders no meter, never a zero bar. */
    quota?: ProviderQuotaState | null;
}
/** Props of {@link ProviderRoleBadge}. */
export interface ProviderRoleBadgeProps {
    /** Card role for the monochrome badge. Defaults to llm. */
    role?: ProviderCardRole;
}
/**
 * Monochrome role badge: outlined message glyph for LLM, filled terminal glyph
 * for Agent. Shared by migrated card headers and the shell legacy fallback.
 */
export declare function ProviderRoleBadge(props: ProviderRoleBadgeProps): ReactNode;
/**
 * Approved A header geometry in one row: identity (mark beside title, badge,
 * and count) on the left, headline quota at the right, caller status, and the
 * chevron. Narrow screens stack identity plus chevron over quota plus status.
 * Renders a fragment for the caller-owned header button; props keep the legacy
 * codex provider-chrome signature so existing call sites keep working.
 */
export declare function ProviderCardHeader(props: ProviderCardHeaderProps): ReactNode;
/**
 * Scoped provider chrome CSS: plain card reset, header button layout, body and
 * model rows, quota meter responsive rules, and coarse-pointer touch targets.
 * The shell injects it once per page; provider cards may also inject it once
 * for standalone use. Duplicate style tags are harmless: every rule is scoped
 * to a data-provider-* attribute; shared geometry overrides legacy inline layout styles.
 */
export declare const providerUiCss: string;
//# sourceMappingURL=provider-ui.d.ts.map