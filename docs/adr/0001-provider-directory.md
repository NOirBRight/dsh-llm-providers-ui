# Provider directory is an open port

Plugins declare `{ key, role, quota reader }` on the client Provider directory. The shell draws Role badges (default LLM) and Provider Usage tiles from that directory only. There is no builtin reader fallback.

This change migrates Codex, Cursor, Grok, Ollama Cloud, CommandCode, and OpenCode Go in the same pass: each client plugin registers. Decode helpers stay in this repo and are exported so those plugins do not copy quota JSON parsing. Antigravity registers as Agent with its own reader.

**Status:** accepted

## Considered

- Keep appending readers in the shell — rejected; every new vendor would edit this repo.
- Leave builtins until each plugin's next release — rejected; the directory would lie until six uncoordinated ships.
- Put `role` on DSH slot register options — rejected; that is DSH core.
- Show quota on dsh-usage-monitor — rejected; that page folds session tokens. Quota is Provider Usage tiles only.

## Consequences

- An unregistered plugin has no Usage tile and a default LLM badge.
- New vendors add a register call; they do not open a PR here unless they need a new shared decoder.
