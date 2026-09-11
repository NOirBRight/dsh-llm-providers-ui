# ACP provider settings — control inventory (prototype research)

> Status: read-only research for a high-fidelity interactive LLM Providers settings prototype.
> No production changes. Do not treat this as a shipping spec.
> Prototype branch: `prototype/provider-settings-system-v2` at `/home/noirbright/Workstation/.worktrees/dsh-provider-settings-system-v2`.

This file inventories **UI-visible** fields, **config-only** fields, and **native-only** capabilities from the live Antigravity ACP package and the in-progress Cursor ACP checkout. Cursor quota windows are **unsupported** — do not invent remaining-percent meters.

## 0. Live source map

Verified 2026-09-10. Byte hashes compared for live vs worktree artifacts.

| Package | Live | Matching source | Git |
|---|---|---|---|
| `@deepseek-ai/dsh-acp-antigravity` **0.1.4** | `/home/noirbright/.dsh/profiles/web/node_modules/@deepseek-ai/dsh-acp-antigravity` | `/home/noirbright/Workstation/.worktrees/dsh-acp-antigravity-tool-row` | `2ca027a` tag `v0.1.4` / `release/0.1.4`. Worktree list still labels the checkout `[release/0.1.2]` but HEAD is v0.1.4. `package.json`, `dist/index.js`, `dist/settings.js`, `lib/client.js` **byte-identical** to live. |
| `@deepseek-ai/dsh-acp-provider` **0.1.2** | `/home/noirbright/.dsh/profiles/web/node_modules/@deepseek-ai/dsh-acp-provider` | `/home/noirbright/Workstation/.worktrees/dsh-acp-provider-settings` | `1ef3151` tag `v0.1.2`. `dist/index.js` and `dist/settings.js` match live. |
| `@deepseek-ai/dsh-acp-cursor` **0.1.5** | **not installed** in the live web profile | `/home/noirbright/Workstation/dsh-acp-cursor` | **Not a git repo** (no `.git`). In-progress checkout. Depends on provider tarball v0.1.2. |

**Do not use as live ACP settings source:**

- `/home/noirbright/Workstation/dsh-acp-antigravity` — docs-only `main` at `354898e`.
- `/home/noirbright/Workstation/.worktrees/dsh-acp-antigravity-settings` — `agent/antigravity-settings` @ `6727397`, package 0.1.0.
- `/home/noirbright/Workstation/.worktrees/dsh-acp-antigravity-card` — `agent/agy-3-provider-card` @ `467ec44`, package 0.1.0.
- `/home/noirbright/Workstation/.worktrees/dsh-acp-provider-platform-core` — same commit as provider `main` (`f28aa55`), package **0.1.0**, **not** live 0.1.2.
- `dsh-llm-cursor` worktrees (`dsh-cursor-settings-a`, `dsh-llm-cursor-ui10`) — old unofficial LLM plugin, provider key `cursor`, **not** ACP `cursor-agent`.

Untracked Antigravity login/settings HTML prototypes exist under the live worktree `src/web/login-settings-hifi.prototype.*` (not shipped).

---

## 1. Shared host contract (no UI)

Source: `dsh-acp-provider-settings/src/settings.ts`.

The shared package is a **host join model**, not a rendered page. Web cards are owned by each ACP plugin via `settings.provider.item`.

**Status:** `installed`, `authenticated`, `live`, `ready`, optional `message`. Liveness is not readiness.

**Generic field kinds** (host editor snapshot only): `text` | `password` | `boolean` | `status`.

**Generic action ids:** `validate-installation` | `refresh-models` | `sign-in` | `sign-out` | open string.

**Page title:** `'External Agents'`.

**Serialized settings values:** `Record<string, string | boolean | number | null>` — paths, never credentials.

**Credential metadata:** `authenticated`, optional `accountLabel`. No secrets.

The live web card **does not render** this generic field list. It uses a custom React card. Treat the generic editor as a host API, not as the prototype surface.

---

## 2. Suggested consistent display grouping

Use the same section order as the live Antigravity card (`ExternalAgentsSection.tsx` file comment: Install → Sign in → Account / Quota / Model). Hide runtime paths.

| Group | When | Prototype controls |
|---|---|---|
| **Header** | always | Brand mark, title, role=agent, model-count summary, status badge, unsaved pill, headline quota (Antigravity only) |
| **Install** | missing / install in flight / failed | Install runtime, Refresh status, progress text + percent |
| **Account** | always after install gate | Connected / sign-in required / not installed. Sign in, Manage account → Switch / Sign out (confirm). Access-kind hint. Login URL open/copy. |
| **Quota** | connected | Antigravity: group grid of meters + reset + updated-at. Cursor: **unsupported** empty state, no fake windows. |
| **Models** | connected | Disclosure catalog: fetch picker, sort, add manual, per-row details. Save/Discard at card foot. |
| **Advanced (config-only)** | collapsed / not in live card | Paths, timeout, enable, selected model, profile dir, version. Show as read-only in prototype if needed; do not invent toggles the live card lacks unless labelled “config-only”. |

---

## 3. Antigravity — live v0.1.4 (implemented)

Evidence roots:

- `.../dsh-acp-antigravity-tool-row/src/web/ExternalAgentsSection.tsx`
- `.../src/web/settings-state.ts`
- `.../src/web/locales.ts`
- `.../src/web/index.ts`
- `.../src/client-contract.ts`
- `.../src/dsh-plugin.ts`
- `.../src/settings.ts`
- `.../src/auth.ts`
- `.../src/quota.ts`
- `.../src/catalog.ts`
- `.../src/model-metadata.ts`

### 3.1 Card states

`loading` | `missing` | `login` | `connected`

Derived only from snapshot row: missing if `!installed`, login if `!authenticated`, else connected. (`settings-state.ts`)

**Access kind** (login hint only; Google loopback auto-completes on `local`):

| Kind | Detection | Hint key |
|---|---|---|
| `app` | UA contains `; wv)`, `dsh-mobile`, `dshmobile` | `accessApp` |
| `local` | hostname 127.0.0.1 / localhost / ::1 | `accessLocal` |
| `lan` | RFC1918 IPv4 | `accessLan` |
| `remote` | else | `accessRemote` |

### 3.2 Header (UI)

| Control | Source | Notes |
|---|---|---|
| Title | hard-coded `"Antigravity"` | |
| Mark | `BrandMark` | |
| Role | `"agent"` | |
| Summary | `modelCount` → `"{count} models"` | |
| Status | loading / Disabled / Not installed / Sign-in required / Connected | `!row.enabled` shows Disabled even though the card has **no enable toggle** |
| Unsaved | dirty flag | label `Unsaved changes` |
| Headline quota | first non-disabled bucket with `remainingFraction` | percent 100 if ≥1 else min(99, round*100); label `group · window|displayName`; detail `Resets {local datetime}` or stale |

### 3.3 Install (UI, when missing / downloading / extracting / verifying / failed)

**Actions (host implemented):**

| Action | Label | Host |
|---|---|---|
| `install-runtime` | Install Antigravity / Installing… | Managed download of pinned Google ACP zip; SHA-256; extracts `agy_acp_server.par` + `localharness_external`. Progress phases: `idle` | `downloading` | `extracting` | `verifying` | `succeeded` | `failed`. Poll snapshot every 500ms while in flight. |
| `probe-installation` | auto on first load if executablePath empty | PATH probe; may fill empty paths. |
| refresh (`load`) | Refresh status | |

Progress text: `install.message` plus percent when `totalBytes > 0`.

### 3.4 Auth (UI + host) — **implemented**

**Method:** personal Google OAuth only (`authMethod: 'oauth-personal'`). No API-key / Vertex / enterprise path in this release.

**States / attempt:** `pending` | `failed` | `expired`. Timeout **10 minutes** (`AUTH_TIMEOUT_MS`). Host also stores `authorizationUrl`, `expiresAt`.

**UI actions:**

| Control | RPC action | Host behaviour |
|---|---|---|
| Sign in | `sign-in` | Coalesced `provider.signIn`; desktop opener tries the Google URL; Settings still shows it. |
| Open login page | `<a href>` | Google `https://accounts.google.com/o/oauth2/v2/auth`, `response_type=code`, `redirect_uri=http://127.0.0.1:{port}/` |
| Copy login link | clipboard | |
| Cancel | `cancel-login` | Abort in-flight sign-in. |
| Continue sign-in | `complete-login` + pasted URL | Rebuilds loopback callback; GET to native 127.0.0.1. Required for LAN/remote/app. |
| Manage account → Switch account | confirm then `sign-in` | Same instance; other devices share the new account. |
| Manage account → Sign out | confirm then `sign-out` | Clears isolated Google profile on this DSH instance; does **not** revoke Google / web GUI / App pairing. |

**Callback paste constraints** (`parseAntigravityCallbackUrl`): http://127.0.0.1:{same port}/, state must match, query keys only `code|state|error|error_description|scope|authuser|prompt|hd`, exactly one of code/error.

**Host-only auth actions not wired in the card:** `open-login` (opens default browser; UI uses `<a>` instead), generic editor `validate-installation`.

### 3.5 Quota (UI + host) — **implemented for Antigravity**

CLI-free. Reuses isolated ACP OAuth profile. Never estimates from tokens. Missing fields stay absent, never zero.

**Snapshot status:** `ready` | `authentication-required` | `not-entitled` | `account-changed` | `error`.

**Cache:** 60s TTL. HTTP timeout 20s. Invalidate on sign-in/out, instance/stateDirectory change.

**Tier (optional, not rendered in card):** `tier.current`, `tier.paid` (e.g. test fixture `free-tier`).

**Group/bucket fields (pass-through from `v1internal:retrieveUserQuotaSummary`):**

| Field | Type | UI |
|---|---|---|
| group.displayName | string? | section heading (fallback “Account quota”) |
| group.description | string? | **not rendered** |
| bucket.bucketId | string? | React key |
| bucket.displayName | string? | meter label |
| bucket.description | string? | **not rendered** |
| bucket.window | string? | label fallback; live evidence uses `weekly` and 5h |
| bucket.remainingFraction | number? | meter; ≥1 → 100%, else min(99, round%) |
| bucket.remainingAmount | string? | **not rendered** |
| bucket.disabled | boolean? | emptyLabel “Disabled” |
| bucket.resetTime | string? | `Resets {toLocaleString()}` |
| observedAt | ISO string | `Updated {toLocaleString()}` |

**Do not hardcode family names in the prototype as the only windows.** ADR 0003: preserve each returned group/bucket. Lab evidence (one personal-OAuth account, one runtime) saw **Gemini** and **Claude/GPT** groups, each with **weekly** and **five-hour** windows. Tests use:

- group `Gemini Models` / `Gemini` / `Claude / GPT`
- buckets `gemini-weekly` window `weekly`, `gemini-5h`, window `5h`
- `remainingFraction`, `remainingAmount`, `resetTime`

UI grid: 2 columns desktop, 1 column ≤680px. Refresh quota button.

**Usage directory headline** (`usage-reader.ts`): same first-ready bucket; `not-entitled` → status `unsupported`.

### 3.6 Models catalog (UI editable)

Availability from native ACP `listModels`. Facts: CCPA `fetchAvailableModels` wins, then exact `models.dev` id, else unknown. Explicit `false` is kept.

**Collapsed picker row** (`catalog.ts`): peel `-high|medium|low` and display-name `(High|Medium|Low)`. Native id `default` is a session routing marker, **never a selectable catalog row**.

**Effort ids:** `high` / `medium` / `low` (labels High/Medium/Low). Optional discovered `defaultEffort`. CCPA `thinkingLevel` enum is **not** used as defaultEffort (0/unspecified unknown; 1 low, 2 medium, 3 high, 4 minimal, 5 extra_high).

**Live editor fields** (`ModelCatalogEditor` `fields={{ vision, thinking, defaultEffort, context }}`):

| Field | Type | Constraint | Default / empty |
|---|---|---|---|
| Model ID | text | unique, non-empty to save | manual add starts `''` |
| Display name | text | | falls back to id |
| Vision | boolean checkbox (not tri-state in live card) | | unknown omitted |
| Reasoning (thinking) | boolean checkbox | thinking false clears defaultEffort | unknown omitted |
| Default thinking | select from discovered efforts | | omitted if none |
| Context window | text digits, positive safe integer | invalid keystroke ignored | unknown |
| Source | per-field `upstream` | `models.dev` | labels exist; live card does **not** pass `labels.source` so source line hidden | |
| Restore auto | | labels exist; live card does **not** enable `restoreAuto` / `onRestore` | |

**Catalog actions:** Fetch available models (picker dialog, search, apply selected), Sort / Done, Add model manually, Remove, drag reorder, Save / Discard.

**Picker:** one section id `antigravity`, hint “Reasoning” if efforts present.

**Save payload:** `catalogOrder` (ids), `catalogOverrides` only for flagged fields: vision, thinking, contextWindow, maxOutputTokens (`flags.output`), defaultEffort. Empty order **hides every discovered row**.

### 3.7 Config-only (in snapshot/save, **not rendered** as controls)

| Key | Type | Default | Constraints |
|---|---|---|---|
| `executablePath` | string | `''` | filled by install/probe |
| `harnessPath` | string | `''` | sibling `localharness_external` |
| `stateDirectory` | string | `~/.dsh/profiles/web/antigravity` | isolated; hashed instance subdir |
| `instanceId` | string | `'default'` | non-empty trim |
| `modelDiscoveryTimeoutMs` | integer? | **30000** | 1..0xffffffff |
| `model` | string? | account default | non-empty if set |
| `enabled` | boolean | **true** (`!== false`) | header can show Disabled; **no checkbox** |
| `declaredDefaultModelId` | string? | from CCPA | locales `declaredDefault` / `followNative` **unused in card** |
| `profileDirectory` | status | sha256(instanceId) under state | generic editor only |
| `version` | status | ACP agent version | generic editor only |
| `fullAccessWarning` | status | static warning text | generic editor only |
| `pick` / `pick-harness-sibling` | path picker | | injected on face, **unused** in card |
| `inputTokenLimit` / `maxOutputTokens` | number? | CCPA maxTokens / maxOutputTokens | locales `inputLimit` / `output` exist; editor **does not** enable those fields. Save still forwards `flags.output`. |
| `thinkingBudget` / `minThinkingBudget` | number? | CCPA | facts only, not UI |

Persist file: `~/.dsh/profiles/{profile}/acp-antigravity.settings.json`. Catalog cache: `plugin-data/antigravity/models.json`. Facts: `model-facts.json`.

### 3.8 Generic host editor fields (not the web card)

From `createAntigravitySettingsEditor`:

- text: Antigravity ACP executable, localharness_external executable, State directory
- status: Selected private profile, Installation and account status, Detected ACP version, Selected model (`health.model ?? config.model ?? 'account default'`), Full-access warning
- actions: Validate installation, Refresh models, Sign in with personal Google OAuth, Sign out and close native session

### 3.9 Native-only (not Settings)

Not required on the settings prototype except as capability names:

- Permission modes advertised: `approval-required` → native `default`; `auto-accept-edits` → `auto_edit`; `full-access` → `yolo`. Full-access needs explicit confirmation + audit; native terminal may leave DSH filesystem roots.
- Plan mode via session projection `plan.active`.
- Native tool activity tree, subagents, ownership, native turn container in Chat.
- User questions, native approval service.
- Optional usage-forwarding / request-telemetry **runtime patches** (not enabled by plugin install alone).
- Composer catalog overlay (`CATALOG_ENDPOINT`) for Model Switch — same collapsed groups.
- Client filesystem `readTextFile` / `writeTextFile` when a session has the adapter.

---

## 4. Cursor ACP — in-progress v0.1.5 (implemented vs cloned)

Evidence roots: `/home/noirbright/Workstation/dsh-acp-cursor/src/**`.

**This is not live.** The settings card is a near-clone of Antigravity’s `ExternalAgentsSection.tsx` (diff is mostly identifiers). Several cloned UI controls have **no host implementation**. Prototype must not present them as working Cursor features.

### 4.1 Implemented (host + real Cursor behaviour)

| Capability | Evidence | Prototype |
|---|---|---|
| Provider key | `cursor-agent` | not `cursor` |
| Install runtime | `install-runtime` → `installManagedCursorAgentRuntime` | Install Cursor |
| Probe PATH | `probe-installation` | same as AGY |
| CLI login | `cursor-agent login` with `NO_OPEN_BROWSER=1`; URL regex `https://cursor.com/loginDeepControl?...` | Open/copy **that** URL. Host **does not** xdg-open. |
| CLI status / email | `cursor-agent status --format json` → `isAuthenticated`, `userInfo.email` | snapshot `accountEmail`; health message `Signed in as {email}` |
| ACP authenticate | `authenticate { methodId: 'cursor_login' }` | |
| Sign out | ACP `logout` if available, then delete instance plugin files. README: `cursor-agent logout` on this machine. Global CLI store, not an isolated Google profile. | confirm Sign out |
| Model list | ACP session configOptions select `model` | Fetch models |
| Catalog grouping | `catalog-group.ts` (from dsh-llm-cursor): efforts `none|low|medium|high|xhigh|max`; Fast SKUs stay own family; optional `-1m` max-context sibling | picker rows |
| Context constants (grouping, not quota) | default 200_000; Grok 256_000; GPT-5.6 272_000; Claude 5 300_000; Max row 1_000_000 | may show as contextWindow on grouped rows |
| Vision default in grouping | `vision: true` hardcoded when grouping ACP ids | not an account fact feed |
| Thinking heuristic | `model.id.includes('thinking')` | weak; not CCPA |
| Quota reader | **always** `{ status: 'not-entitled', groups: [], observedAt: new Date(0).toISOString() }` | map to **unsupported** |
| Usage reader | `not-entitled` → `unsupported` | no sidebar meter |
| Native modes type | `agent` | `plan` | `ask` | DSH permission modes all map to native **`agent`** (`mapping.ts`) |
| Resume | `session/resume` or `session/load` if advertised | not settings |

**Host RPC actions that exist:** `refresh-models`, `pick-harness-sibling`, `open-login` (returns `{ url }`, does not open browser), `sign-in`, `install-runtime`, `probe-installation`, `sign-out`, plus leftover generic editor.run.

**Auth method type** is still named `'oauth-personal'` in config, but transport is Cursor CLI + `cursor_login`, not Google loopback.

**Sign-in does not pass AbortSignal / 10-minute attempt / authAttempt** in `dsh-plugin.ts`. Snapshot has `authorizationUrl` and `accountEmail`, **no** `authAttempt`, **no** `install` progress object (install job exists but snapshot omits it).

**refresh-models returns raw ACP models**, not collapsed picker groups (Antigravity returns collapsed). UI `decodeCatalogModels` then feeds the picker.

### 4.2 Cloned UI with **no host support** — do not ship as Cursor controls

| UI control | Why it is hypothetical |
|---|---|
| Paste 127.0.0.1 callback / `complete-login` | Host has **no** `complete-login`. Cursor login URL is `cursor.com/loginDeepControl`, redirectUri stored as `cursor-agent://login`. |
| `cancel-login` | Host has **no** handler (falls through to editor.run → unavailable). |
| Access hints about Google/Cursor jumping to 127.0.0.1 | Copied locales. EN intro even says “Native ACP runtime; **no CLI required**” while ZH/README say host Cursor CLI. **CLI is required.** |
| Quota meters / weekly / 5h / remainingAmount | Host never returns groups. |
| `authAttempt` pending/failed/expired chrome | Snapshot never sends it. |
| Install percent from `snapshot.install` | Snapshot does not include `install`. |

### 4.3 Cursor quota — **unsupported**

Do **not** invent windows, reset times, remaining percents, Gemini/Claude groups, or Cursor-plan meters.

Comment in `quota.ts`: “Cursor CLI has no remaining-percent quota API. Do not register a usage reader.” The usage reader is still registered, but it maps `not-entitled` → `unsupported`.

Prototype: connected Cursor card shows quota section as **unsupported / unavailable**, no meters, no fake reset. Header must not show a cached headline percent.

### 4.4 Models catalog — partially real

**Editable in cloned card** (same editor fields as Antigravity): id, name, vision, thinking, defaultEffort, contextWindow. Save sends catalogOrder + overrides (no maxOutputTokens in Cursor `AcpCatalogModel`).

**Grouping extras (implemented in code, not a live account catalog):**

- Efforts: None, Low, Medium, High, Extra High, Max
- Fast sibling families (`gpt-5.2-fast`)
- Max context suffix `-1m` (product; avoids colliding with effort `-max`)
- Hardcoded context windows listed in 4.1

Do not present models.dev / CCPA fact sources for Cursor — there is no `model-metadata.ts` / `ccpa-models.ts`.

Locales `enableProvider`, `declaredDefault`, `followNative`, `inputLimit`, `output`, `restoreAuto` are unused in the card (same as Antigravity).

### 4.5 Config-only (same shape as Antigravity)

| Key | Default |
|---|---|
| executablePath / harnessPath | `''` until probe/install |
| stateDirectory | `~/.dsh/profiles/web/cursor-agent` |
| instanceId | `default` |
| modelDiscoveryTimeoutMs | 30000 |
| enabled | true |
| persist | `acp-cursor-agent.settings.json` |
| models cache | `plugin-data/cursor-agent/models.json` |

Generic editor labels: “CursorAgent ACP executable”, “Sign in with Cursor CLI (link for this device)”, full-access warning about CursorAgent native terminal.

`accountEmail` is on the snapshot **but not rendered**. Prototype may show it as read-only account label.

### 4.6 Native-only Cursor

README: DSH is shell (chat, approvals, filesystem); Cursor owns the turn and tools. Stock ACP chrome: flat read-only tool cards, no usage footer, no Subagent tree. “Other” on a native question cancels it and sends the text as a later prompt.

Permission advertisement still lists DSH `approval-required` / `auto-accept-edits` / `full-access`, but **all map to native `agent`**. Native type also includes `plan` / `ask` — **not wired** through that mapper.

---

## 5. Shared ModelCatalogEditor capabilities (host UI kit)

From prototype worktree `src/client/ModelCatalogEditor.tsx` (dsh-llm-providers-ui). Live ACP cards only enable a subset.

| Field flag | Editor control | Live AGY | Live Cursor clone |
|---|---|---|---|
| vision | checkbox or tri-state select | checkbox | checkbox |
| thinking | same | checkbox | checkbox |
| defaultEffort | select | yes | yes |
| context | numeric text | yes | yes |
| inputLimit | numeric text | **off** | **off** |
| output | numeric text | **off** | **off** |
| triState | unknown/yes/no | **off** | **off** |
| restoreAuto | restore button | **off** | **off** |

Draft also has `sources` and `overrides`. Manual add allowed. Unique id required to Save.

---

## 6. Prototype control checklist

**Antigravity (functional):**

1. Header + status + headline quota from first ready bucket.
2. Missing: Install + Refresh + progress.
3. Login: Sign in, open/copy Google URL, access-kind hint, cancel, paste 127.0.0.1 callback, switch/sign-out confirms.
4. Connected quota: N groups × M buckets, remaining %, reset local time, updated-at, refresh. Empty/disabled/error/stale/not-entitled/account-changed.
5. Models: fetch picker, sort, add/remove/reorder, vision/thinking/defaultEffort/context, unique-id validation, save/discard.
6. Advanced drawer (optional, labelled config-only): paths, timeout 30000, enabled, selected model, version.

**Cursor (functional, no guesses):**

1. Header without quota percent.
2. Install + Refresh (no fake percent if snapshot has no install).
3. Sign in: open/copy `cursor.com/loginDeepControl` link; **no** callback paste; show email when present.
4. Quota: explicit **unsupported**.
5. Models: same editor chrome, grouping/efforts from catalog-group; no CCPA facts; no quota.
6. Do not copy Antigravity 127.0.0.1 flow or Gemini/Claude weekly/5h meters.

---

## 7. Evidence path index

| Topic | Path |
|---|---|
| Live AGY package | `/home/noirbright/.dsh/profiles/web/node_modules/@deepseek-ai/dsh-acp-antigravity` |
| Live AGY source | `/home/noirbright/Workstation/.worktrees/dsh-acp-antigravity-tool-row` @ `2ca027a` / v0.1.4 |
| Cursor ACP source | `/home/noirbright/Workstation/dsh-acp-cursor` v0.1.5 (no git) |
| Shared provider | `/home/noirbright/Workstation/.worktrees/dsh-acp-provider-settings` @ `1ef3151` / v0.1.2 |
| Web card | `src/web/ExternalAgentsSection.tsx` (both) |
| Card states | `src/web/settings-state.ts` |
| Copy | `src/web/locales.ts` |
| RPC contract | `src/client-contract.ts` |
| Host RPC | `src/dsh-plugin.ts` |
| Generic editor | `src/settings.ts` |
| AGY auth | `src/auth.ts` |
| Cursor CLI auth | `src/cli-auth.ts`, `src/provider.ts` `signIn`/`signOut` |
| AGY quota | `src/quota.ts`, `docs/adr/0003-cli-free-account-quota.md`, `tests/quota.test.ts`, `tests/settings-ui.test.ts` |
| Cursor quota | `src/quota.ts` (not-entitled only) |
| AGY catalog | `src/catalog.ts`, `src/ccpa-models.ts`, `src/model-metadata.ts` |
| Cursor catalog | `src/catalog.ts`, `src/catalog-group.ts` |
| Catalog editor kit | `dsh-provider-settings-system-v2/src/client/ModelCatalogEditor.tsx` |
| Permission map | `src/mapping.ts`, `src/types.ts` |
