# Provider Settings — throwaway UI prototype

Question: should Provider settings prioritize inline configuration (A), focused editing (B), or connection/usage triage (C)? Verdict: pending user review. Branch: `prototype/provider-settings-three`; do not merge the prototype into production.

Run from this worktree: `python3 -m http.server 3083 --bind 127.0.0.1 --directory src/client/prototype`. Open <http://127.0.0.1:3083/providers.html?variant=A>. The floating bar or left/right arrow keys select A/B/C; the theme button switches light/dark.

This standalone HTML replicates Settings context instead of replacing the live slot: reviewing three structural alternatives must not replace the providers currently needed for authentication and ongoing lab work. The surrounding navigation is a labeled replica, not the real DSH shell. No 3080/3082 assets or profile dependencies are changed. The file is not imported into any production entry. All accounts, model names, capabilities and quota values are demonstrative, not provider compatibility claims.

## What to compare

- A / Inline list: low navigation cost, easy status scan, good on narrow screens. Expanding a large provider lengthens the page and pushes its siblings away.
- B / Workbench: stable provider selector with a focused account/models/capabilities editor; good for frequent configuration. Uses more horizontal space and adds a second navigation level; mobile uses a horizontal selector.
- C / Overview: connection issues lead, tabular providers retain comparable status and quota columns, configuration opens in a drawer. Good for maintenance; adds a step for model editing and a narrower editor.

Try Antigravity multi-window quota, Grok re-authentication, a provider without quota data, disabling/saving a model, and the mobile layout. No action calls an API or persists data; refresh resets everything. Advanced fields and routing/catalog buttons are labeled stubs. Reordering, adding providers, actual credentials and asynchronous lifecycle behavior are outside this visual comparison.

## Check

With local Chrome CDP on `127.0.0.1:9228`, run `node src/client/prototype/check.mjs`. It checks all variants at desktop/mobile widths, drawer/model/save interaction and JS exceptions, and writes screenshots to `/tmp/provider-{A,B,C}-{1280,390}.png`.

Implementation handoff: keep production quota decision ADR 0001 in the Antigravity worktree; after the user chooses, implement only the validated design through the shared providers-ui slot and provider declarations. Reference this branch as the primary source; do not promote its mock state or hand-built shell.
