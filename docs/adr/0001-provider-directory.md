# Provider directory is an open port

Plugins declare `{ key, role, header, quota reader, account?, catalogId?, binding? }` on the client Provider directory. The shell draws Role badges (default LLM), the settings C ledger, and Provider Usage tiles from that directory only. There is no builtin reader fallback. `account()` is an overview snapshot (`connected` / `configured` / `unconnected` / `unknown`); it never carries an email. `unknown` means the plugin has not resolved auth or credential status yet. `catalogId` is the model-picker group id. Runtime picker sort uses `catalogRoutes()` only; `PROVIDER_ITEM_ORDER` remains the default settings-card order. Native-agent plugins also declare `binding: { channel, endpoint }`; `nativeBindings()` lists those descriptors for Agent entries that published both `catalogId` and `binding`. The directory is not an execution registry and does not store credentials.

This change migrates Codex, Cursor, Grok, Ollama Cloud, CommandCode, and OpenCode Go in the same pass: each client plugin registers. Decode helpers stay in this repo and are exported so those plugins do not copy quota JSON parsing. Antigravity and Cursor Agent register as Agent with their own readers and binding descriptors.

**Status:** accepted

## Considered

- Keep appending readers in the shell — rejected; every new vendor would edit this repo.
- Leave builtins until each plugin's next release — rejected; the directory would lie until six uncoordinated ships.
- Put `role` on DSH slot register options — rejected; that is DSH core.
- Show quota on dsh-usage-monitor — rejected; that page folds session tokens. Quota is Provider Usage tiles only.
- Keep a six-name runtime catalog map beside live routes — rejected; declared `catalogId` is the runtime identity.
- Derive overview login from quota ready/error — rejected; account facts come from auth, credential, or settings snapshot data.

## Consequences

- An unregistered plugin has no Usage tile and a default LLM badge.
- New vendors add a register call; they do not open a PR here unless they need a new shared decoder.
- Picker sort without live `catalogRoutes()` keeps catalog order. Model Switch subscribes to the directory for live routes.
