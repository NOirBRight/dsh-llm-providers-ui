# LLM Provider settings controls (six plugins)

> Status: read-only inventory for prototype `prototype/provider-settings-system-v2`.
> Captured from live `~/.dsh/profiles/web` versions and matching `feat/provider-settings-a` source worktrees.
> ACP / native-agent cards are out of scope.
> No production edits. Do not treat workspace `dsh-llm-*` mains as live; they lag these versions.

Live profile: `/home/noirbright/.dsh/profiles/web`
Prototype UI: `/home/noirbright/Workstation/.worktrees/dsh-provider-settings-system-v2` @ `3427b94` (`dsh-llm-providers-ui` 0.1.12)

## Copies

| Copy | Path | Version / HEAD |
|---|---|---|
| LIVE runtime | `/home/noirbright/.dsh/profiles/web` | UI 0.1.12 tgz; six LLMs below |
| Prototype branch | `/home/noirbright/Workstation/.worktrees/dsh-provider-settings-system-v2` | UI 0.1.12 @ `3427b94` |
| UI settings-a | `/home/noirbright/Workstation/.worktrees/dsh-providers-settings-a` | 0.1.12 @ `3427b94` `feat/provider-settings-a` |
| UI directory (older) | `/home/noirbright/Workstation/.worktrees/dsh-llm-providers-ui-directory` | 0.1.6 @ `fbfc8f6` — not the live contract |
| Workspace main | `/home/noirbright/Workstation/dsh-llm-providers-ui` | 0.1.8 @ `eaef99f`, behind origin, dirty `src/client/provider-marks.tsx` |

Live profile packages (source worktrees whose `package.json` version matches live):

| Plugin | Live | Source worktree | HEAD |
|---|---|---|---|
| `dsh-llm-providers-ui` | 0.1.12 | `.worktrees/dsh-providers-settings-a` and this prototype | `3427b94` |
| `dsh-llm-codex` | 0.3.15 | `.worktrees/dsh-codex-settings-a` | `e3d0e74` |
| `dsh-llm-cursor` | 0.2.18 | `.worktrees/dsh-cursor-settings-a` | `3cc5bb0` |
| `dsh-llm-grok` | 0.3.12 | `.worktrees/dsh-grok-settings-a` | `6f5d390` |
| `dsh-llm-ollama` | 0.6.19 | `.worktrees/dsh-ollama-settings-a` | `7b5fda8` |
| `dsh-llm-commandcode` | 0.1.21 | `.worktrees/dsh-commandcode-settings-a` | `d6f2c2e` |
| `dsh-llm-opencode-go` | 0.1.22 | `.worktrees/dsh-opencode-go-settings-a` | `db78a09` |

Workspace mains are older (codex 0.3.13, cursor 0.2.17, grok 0.3.10, ollama 0.6.16, commandcode 0.1.18, opencode-go 0.1.20). Lab profile `~/.dsh-lab/profiles/web` is also older (UI 0.1.10).

All worktree paths below are under `/home/noirbright/Workstation/.worktrees/`.

## Shared card chrome

Collapsed header: BrandMark + title + `{n} models` + Signed in / Configured + optional quota chip + unsaved + expand.

Expanded body order (typical): description → auth/connection → quota (refresh) → model catalog disclosure → optional capabilities → discard/save.

Catalog row: Model ID text + Display name text + details chevron + remove. Details = context number + vision checkbox + thinking checkbox + default-effort select (when thinking). `SortableList` drag + move up/down. Fetch picker modal + Add model + Discard/Save. Remote-host warning when settings are not writable.

Duplicated per plugin (live UI 0.1.12 already exports `./provider-ui`, `./model-catalog`, `./usage-readers`):

- `src/client/*PluginCard.tsx` (Command Code: `CommandCodeSettingsCard.tsx`)
- `src/client/provider-chrome.tsx` — AuthToolbar, UsageHeader, refresh glyph, bars
- `src/client/model-catalog-ui.tsx` — picker modal
- `src/client/locales.ts` — en + zh
- `src/client-contract.ts` — RPC constants + secret-free views
- `src/client/index.ts` — `settings.provider.item` key + `providerDirectory.register({ key, role:'llm', header:'shared', usage })`

Shell seam (live 0.1.12):

- Slot `settings.provider.item` (keyed)
- Namespace `llm-providers` `{ order[], hiddenUsageProviders[], usageOrder[] }`
- `ProviderDirectory.register({ key, role?: 'llm'|'agent', header?: 'shared'|'legacy', usage?: reader })`
- Quota tiles consume `UsageWindowSummary { id, label, shortLabel, remainingPercent?, valueText, resetsAt? ISO }`
- Card also shows local reset via `toLocaleString` / "Resets {time}" / "Usage limits reset on {date} ({count} days left)"

Host-only YAML **not on any card** (keep; do not invent UI unless asked):

- `streamIdleTimeoutMs` default `300000` (all)
- `retryPolicy` (codex/cursor/grok `maxRetries` 2; commandcode/opencode 3; AUTH added to normal)
- Cursor `runLifecycle`
- Ollama/OpenCode `defaultContextWindow` + `maxTokens`
- Command Code `requestTimeoutMs` / `defaultContextWindow` / `defaultMaxTokens` / `usageEnabled`

---

## 1. Codex — `dsh-llm-codex` 0.3.15

Evidence:

- `dsh-codex-settings-a/src/client/CodexPluginCard.tsx`
- `dsh-codex-settings-a/src/client/locales.ts`
- `dsh-codex-settings-a/src/client-contract.ts`
- `dsh-codex-settings-a/src/catalog.ts`
- `dsh-codex-settings-a/src/usage.ts`
- `dsh-codex-settings-a/src/auth.ts`
- `dsh-codex-settings-a/src/index.ts`
- `dsh-codex-settings-a/src/client/index.ts`

Namespace `llm-codex`. Route `codex`. RPC `/codex`.

### Auth (ChatGPT OAuth, no API key)

Status: `signed-out` | `signing-in` | `signed-in` | `reauth-required` | `error` | `loading`.

Buttons: "Sign in with ChatGPT" / "Sign in again" / "Sign out" / "Cancel".

Device-code path: `userCode` + "Copy code" + "Open ChatGPT device page", or URL "Open ChatGPT authorization".

RPC: `auth/status {refresh?}` · `auth/begin` · `auth/attempt-status {attemptId}` · `auth/cancel {attemptId}` · `auth/logout`.

Quota rides `auth/status` when signed-in (not `usage/read`). Wait-loop up to 15s for `rateLimits`.

### Quota

Raw: `remainingPercent` + `windowSeconds` + `resetsAt` ISO; `credits`; `individualLimit`.

Windows:

- 5-hour (`18000s`) — "5-hour limit"
- weekly (`604800s`) — "Weekly limit"
- other Nh — "{count}-hour limit"

Credits: unlimited → "Unlimited"; else "{remaining} of {limit} credits remaining".

Labels: "Usage limits" + Refresh. `quotaError` → "Usage limits are temporarily unavailable."

Must keep: `remainingPercent`, `resetsAt` ISO, `windowSeconds`, `credits.unlimited` / `balance`, `individualLimit.remaining` / `remainingPercent`.

### Catalog

Default displayed ids: `gpt-5.6-sol`, `gpt-5.6-sol-fast`, `gpt-5.6-terra`, `gpt-5.6-terra-fast`, `gpt-5.6-luna`, `gpt-5.6-luna-fast`.

Official also: `gpt-5.5`, `gpt-5.4`, `gpt-5.4-mini`, `gpt-5.3-codex-spark`.

Fast and 1M are separate picker rows.

Per-row **on card**:

| Control | Type | Default / notes |
|---|---|---|
| Model ID | text | required, unique |
| Display name | text | |
| Context window | number | placeholder "Provider default"; official 272000 / maxTokens 128000 |
| Vision | checkbox | from official / fetch |
| Reasoning | checkbox | |
| Default thinking | select if thinking | `minimal` `low` `medium` `high` `xhigh` `max` — labels Minimal / Low / Medium / High / Extra high / Max. Retired `ultra` decoded → undefined |

Fetch: "Choose from official catalog" → `models/fetch`.

Stored but **not** a card checkbox: `tools`, `fast`, `efforts[]`, `maxTokens`, `description`.

RPC: `settings/read` · `settings/save {models, enableSearch, enableImageTool, enableImageGeneration, searchModel, imageGenerationModel, searchMode, searchContextSize, searchMaxOutputTokens, expectedRevision}`.

### Advanced / capabilities

Section "Optional capabilities". All default **off**.

| Control | Type | Default | Reveals |
|---|---|---|---|
| Enable Codex search provider | checkbox | false | Search model select (official models) default `gpt-5.6-luna`; Web access select `cached` / `indexed` / `live` labels Cached / Indexed / Live web default `cached`; Search context select `low` / `medium` / `high` default `medium`; Maximum search output tokens number min=1 default `10000` |
| Enable view_image tool | checkbox | false | |
| Enable codex_generate_image tool | checkbox | false | Image generation model select default `gpt-5.6-luna` (vision official) |

---

## 2. Cursor — `dsh-llm-cursor` 0.2.18

Unofficial. ToS warning on the card.

Evidence:

- `dsh-cursor-settings-a/src/client/CursorPluginCard.tsx`
- `dsh-cursor-settings-a/src/client/locales.ts`
- `dsh-cursor-settings-a/src/client-contract.ts`
- `dsh-cursor-settings-a/src/catalog-group.ts`
- `dsh-cursor-settings-a/src/usage.ts`
- `dsh-cursor-settings-a/src/oauth.ts`
- `dsh-cursor-settings-a/src/index.ts`
- `dsh-cursor-settings-a/src/client/index.ts`
- `dsh-cursor-settings-a/src/run-registry.ts` (host-only lifecycle)

Namespace `llm-cursor`. Route `cursor`. RPC `/cursor`.

### Auth (PKCE / Deep Control, browser)

Status `loggedIn` + email ("Signed in as {email}." / "Signed in.").

Buttons: "Sign in with Cursor" / "Sign out" / "Cancel"; `fallbackUrl` reopen.

RPC: `auth/start` · `auth/cancel {attemptId}` · `auth/status {attemptId?}` · `auth/logout`.

Sign-in required to fetch models.

### Quota — `usage/read {refresh?}`

Windows from `/auth/usage` keys + usage-summary:

- "Cursor Models" percent (`plan.autoPercentUsed`)
- "Other Models" percent (`plan.apiPercentUsed`)
- "Personal Usage" used/limit
- "On-Demand" used/limit (omit unused unlimited)
- plus raw `/auth/usage` bucket keys

Shared `resetsAt` from `billingCycleEnd` ISO — must keep raw.

`unit:'percent'` vs used/limit; limit 0 → Unlimited.

Labels: "Subscription usage", Used, Unlimited.

### Catalog

Offline fallback: `composer-2.5` "Composer 2.5" thinking+vision context `200000`.

Live: `models/list` after sign-in. Picker groups by brand. Auto: "Cursor chooses a model… wire id is default". Thinking levels chosen in chat, not picker.

Per-row **on card**: Model ID, Display name, Context window number placeholder `200000`, Vision, Reasoning, Default thinking select.

Effort enum: `none` `low` `medium` `high` `xhigh` `max` — labels None / Low / Medium / High / Extra High / Max.

Max context 1M rows via picker. `maxMode` boolean stored from fetch but **not** a card checkbox (locale `maxMode` unused). Fast families stay separate rows.

Save: `settings/save {models, expectedRevision}`.

No capabilities section.

Host-only `runLifecycle` default: `parkedRunTtlMs` 900000, `bindingIdleTtlMs` 3600000, `maxOpenRuns` 64, `maxBindings` 256, `heartbeatIntervalMs` 5000, `heartbeatJitterRatio` 0.1.

---

## 3. Grok — `dsh-llm-grok` 0.3.12

Evidence:

- `dsh-grok-settings-a/src/client/GrokPluginCard.tsx`
- `dsh-grok-settings-a/src/client/locales.ts`
- `dsh-grok-settings-a/src/client-contract.ts`
- `dsh-grok-settings-a/src/reasoning.ts`
- `dsh-grok-settings-a/src/usage.ts`
- `dsh-grok-settings-a/src/oauth.ts`
- `dsh-grok-settings-a/src/index.ts`
- `dsh-grok-settings-a/src/client/index.ts`

Namespace `llm-grok`. Route `grok`. RPC `/grok`. Distinct from builtin `xai` key route.

### Auth (xAI PKCE)

Buttons: "Sign in with xAI" / "Sign out" / "Cancel".

Paste-code path: "Sign-in code" text + "Submit code" → `auth/complete {code, attemptId?}`.

RPC: `auth/start` · `auth/attempt-status` · `auth/status` · `auth/complete` · `auth/cancel` · `auth/logout`.

### Quota — `usage/read`

Percent windows from `productUsage[].product` + `usagePercent`, period `week` | `month`, `resetsAt` ISO must keep.

Fallback id `monthly` | `weekly` from `creditUsagePercent`.

Prepaid `{monthlyLimit, used}` money window id `monthly` (0/0 SuperGrok omitted).

Labels: "Subscription usage", Used.

### Catalog

Offline: `grok-4.6` / `grok-4.5`, thinking+vision, context `500000`, `defaultReasoningEffort` `high`.

`grok-4.6` efforts `xhigh` / `high` / `medium` / `low` labels Extra High / High / Medium / Low Effort.

`grok-4.5` same minus `xhigh`.

Fetch: "Choose from account" `models/list`.

Per-row **on card**: Model ID, Display name, Context placeholder `500000`, Vision, Reasoning, Default thinking select.

`maxTokens` default `32768` stored not shown. Locale `tools` unused.

Save includes `enableImageGen`.

### Advanced

Checkbox "Enable grok_image_gen tool" default false (distinct from Codex).

---

## 4. Ollama Cloud — `dsh-llm-ollama` 0.6.19

Evidence:

- `dsh-ollama-settings-a/src/client/OllamaPluginCard.tsx`
- `dsh-ollama-settings-a/src/client/locales.ts`
- `dsh-ollama-settings-a/src/client-contract.ts`
- `dsh-ollama-settings-a/src/reasoning.ts`
- `dsh-ollama-settings-a/src/usage.ts`
- `dsh-ollama-settings-a/src/index.ts`
- `dsh-ollama-settings-a/src/client/index.ts`

Namespace `llm-ollama`. Route `ollama-cloud`. RPC `/ollama-cloud`.

### Auth = API key (password) + API URL

`apiKeyEnv` default `OLLAMA_API_KEY` (not shown).

API key password: placeholder "Enter API key" / "Configured — enter a new value to replace it"; pending "New key entered — discovery uses it now; Save stores it".

API URL `type=url` default `https://ollama.com/api` editable.

RPC: `settings/read` · `credential/status` · `credential/set {ref,value}` · `models/discover {baseURL?, apiKey?}` · `settings/save {baseURL, models, expectedRevision}` · `usage/read`.

### Quota (fraction 0–1 → "Used {pct}%")

- Session usage — fallback "Resets every 5 hours" + `resetsAt` ISO if present
- Weekly usage — fallback "Resets every 7 days" + `resetsAt`
- Models used this week: name + "{n} requests"
- `unsupported` (self-host 404) · `needs-restart` · unreachable

Must keep `session` / `weekly` `.usage`, `models[]`, `resetsAt` ISO.

### Catalog

Empty default `[]`; fetch populates.

Per-row **on card**: Model ID, Display name, Context window number (fallback `262144`), Vision, Reasoning, Default thinking if efforts exist.

Effort order `off` `low` `medium` `high` `xhigh` `max` — labels Off / Low / Medium / High / Extra high / Max.

Locale has `modelOutput` + `tools` but **not** rendered.

Picker peels `-fast` and `-<n>k/m` context tiers.

No card capabilities. Host web search (`src/web.ts`) is not a settings toggle.

---

## 5. Command Code — `dsh-llm-commandcode` 0.1.21

Evidence:

- `dsh-commandcode-settings-a/src/client/CommandCodeSettingsCard.tsx`
- `dsh-commandcode-settings-a/src/client/locales.ts`
- `dsh-commandcode-settings-a/src/client-contract.ts`
- `dsh-commandcode-settings-a/src/types.ts`
- `dsh-commandcode-settings-a/src/reasoning-catalog.ts`
- `dsh-commandcode-settings-a/src/usage.ts`
- `dsh-commandcode-settings-a/src/index.ts`
- `dsh-commandcode-settings-a/src/client/index.ts`

Namespace `llm-commandcode`. Route `commandcode`. RPC `/commandcode`.

Default models `[]` — fetch required.

### Auth = API key

Password + placeholder "Enter Command Code API key" / "Enter a new key to replace the saved key".

Provider API URL read-only `https://api.commandcode.ai/provider/v1` — hint "Fixed official…".

RPC: `settings/read` · `credentials/status` · `credentials/set {apiKey}` · `models/discover {}` · `settings/save {settings without key, expectedRevision}` · `usage/read`.

### Quota — "Account quota" (richest card; keep all)

Idle until key saved: "Enter and save an API key…".

- Account name
- Plan name/status
- Billing period ends {time} (`currentPeriodEnd` ISO)
- Monthly credits `$`
- Purchased credits `$`
- Free credits `$`
- 5-hour window used/cap + `resetAt` ISO
- Weekly window used/cap + `resetAt` ISO
- Period cost `$` · Period tokens (in+out)
- `failures[]` shown as "Quota read failed — …"

`usageEnabled` host default `true`; locale exists but **no** card checkbox.

### Catalog

Picker groups: Go · open models / Pro · premium models / Provider+ · frontier models / Other · verify access.

Per-row: Model ID, Name, Context window (placeholder "Provider value"; override vs provider), Vision (from `inputModalities` image), Reasoning, Default thinking select from official CLI table.

Effort labels Low / Medium / High / Extra high / Max; per-id tables in `src/reasoning-catalog.ts`.

Default context `1000000`, `maxTokens` `32768` (host, not card).

`thinking: false` clears `defaultEffort`.

### Advanced

Checkbox "Zero data retention" default false. Hint: adds `x-cmd-zdr: 1`; unused ZDR may HTTP 422.

---

## 6. OpenCode Go — `dsh-llm-opencode-go` 0.1.22

Evidence:

- `dsh-opencode-go-settings-a/src/client/OpenCodeGoPluginCard.tsx`
- `dsh-opencode-go-settings-a/src/client/locales.ts`
- `dsh-opencode-go-settings-a/src/client-contract.ts`
- `dsh-opencode-go-settings-a/src/reasoning.ts`
- `dsh-opencode-go-settings-a/src/usage.ts`
- `dsh-opencode-go-settings-a/src/index.ts`
- `dsh-opencode-go-settings-a/src/client/index.ts`

Namespace `llm-opencode-go`. Route `opencode-go`. RPC `/opencode-go`.

### Auth = API key + API URL

`apiKeyEnv` `OPENCODE_API_KEY`.

Password same pattern as Ollama; pending "Fetch or Refresh stores it, then Host uses the stored credential".

API URL default `https://opencode.ai/zen/go/v1` editable.

RPC: `settings/read` · `credentials/status` · `credentials/set {apiKey}` · `models/discover {baseURL?}` · `settings/save {baseURL, models, expectedRevision}` · `usage/read`.

Usage is idle until Refresh ("Click Refresh… Saving does not fetch it.").

### Quota (fraction windows)

- 5-hour usage (`session`) fallback every 5 hours + `resetsAt`
- Weekly usage fallback every 7 days
- Monthly usage fallback every 30 days
- Models used this week + request counts

Must keep `session` / `weekly` / `monthly` `.usage`, `models[]`, `resetsAt` ISO.

### Catalog

Empty default; fetch from endpoint.

Per-row **on card**: Model ID, Display name, Context (fallback `262144`), Vision, Reasoning, Default thinking if thinking.

Effort order `off` `minimal` `low` `medium` `high` `xhigh` `max`; `formatEffortName` capitalizes (`Xhigh`, not Extra high).

Stored not shown: `maxTokens` (32768 default), `thinkingEfforts[]`, `api` `openai-completions` | `openai-responses` | `anthropic-messages`, `tools`.

Locale `modelOutput` unused.

No capabilities section.

---

## Shared vs special (prototype WYSIWYG)

Common blocks (every card):

1. Collapsible header (mark, title, model count, auth/config status, quota chip, unsaved)
2. Description + remote/read-only banners
3. Auth: OAuth buttons (+ device/paste extras) **or** API key password (+ optional URL)
4. Quota: title + refresh + windows (percent or used/cap or credits text) + local reset time from raw ISO
5. Catalog: disclosure, sort, fetch picker, rows (id, name, details: context, vision, thinking, default effort), add, remove, discard/save

Specialize per provider:

- **Codex**: device code; quota via `auth/status` rateLimits+credits; Fast/1M rows; capabilities search / view_image / generate_image nested selects
- **Cursor**: ToS warning; email; picker Auto + brand groups; Max/Fast as rows not maxMode checkbox; quota product names Cursor Models / Other Models / Personal Usage / On-Demand; `billingCycleEnd`
- **Grok**: paste-code; `grok_image_gen`; `productUsage` percent windows
- **Ollama**: editable base URL; session+weekly fractions + per-model request list; key used immediately for discover
- **CommandCode**: locked URL; ZDR; `$` credits + 5h/weekly bars + plan/account/cost/tokens; picker plan groups; context override vs provider
- **OpenCode Go**: editable URL; usage idle until refresh; 5h+week+month; mixed APIs hidden

Unused locales (do not invent controls): Cursor `maxMode` checkbox; CommandCode `usageEnabled` checkbox; Codex/Grok/Ollama/OpenCode `tools` checkbox; Ollama/OpenCode `modelOutput` field.

## Recommended common presentation seam

Keep live 0.1.12 `ProviderDirectory` + `settings.provider.item`. Lift duplicated chrome into `dsh-llm-providers-ui/provider-ui` and catalog editor into `./model-catalog` (already exported on live 0.1.12). Each plugin keeps: auth adapter, usage decoder (preserve `resetsAt` ISO + vendor-specific windows), capability cluster, catalog row extras (Fast/1M, context override, ZDR). Do not put retry/timeout/runLifecycle on the card.
