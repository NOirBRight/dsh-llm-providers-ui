# Provider directory is an open port

New LLM or native-agent plugins must not require editing `dsh-llm-providers-ui`. They declare `{ key, role, quota reader }` on the client Provider directory. Default role is LLM, so existing Codex / Cursor / Grok / Ollama Cloud / CommandCode / OpenCode Go cards keep their badge with zero changes. Today's hardcoded usage readers stay as a fallback until each of those plugins registers on its next update; then the builtin list is deleted.

**Status:** accepted

## Considered

- Keep appending readers in `usage.ts` — rejected; the shell becomes the bottleneck for every new vendor.
- Migrate all six LLM plugins in the same change — rejected; each repo updates when it next ships. Issues filed.
- Put `role` on DSH slot `register` options — rejected; that is DSH core. The directory is a providers-ui service.

## Consequences

- A registered reader for the same key wins over the builtin.
- Antigravity (and later agents) register immediately, including `role: Agent` and a quota reader.
- Badge chrome is drawn by this shell from the directory, not copied into every card.

## Follow-ups

- https://github.com/NOirBRight/dsh-llm-providers-ui/issues/8
- https://github.com/NOirBRight/dsh-llm-codex/issues/5
- https://github.com/NOirBRight/dsh-llm-cursor/issues/4
- https://github.com/NOirBRight/dsh-llm-grok/issues/8
- https://github.com/NOirBRight/dsh-llm-ollama/issues/4
- https://github.com/NOirBRight/dsh-llm-commandcode/issues/2
- https://github.com/NOirBRight/dsh-llm-opencode-go/issues/3
