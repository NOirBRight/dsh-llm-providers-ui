# Provider Settings — throwaway UI prototype

Question: should Provider settings prioritize inline configuration (A) or connection/usage triage (C)? User verdict: retain A and C, reject B; strengthen mobile layouts and LLM/Agent differentiation in both themes. Final A/C choice is pending. Branch: `prototype/provider-settings-three`; do not merge the prototype into production.

Run from this worktree: `python3 -m http.server 3083 --bind 127.0.0.1 --directory src/client/prototype`. Open <http://127.0.0.1:3083/providers.html?variant=A>. The floating bar or left/right arrow keys select A/C; the theme button switches light/dark and writes `?theme=light|dark` for shareable links. With no theme parameter, the prototype follows the initial system preference.

This standalone HTML replicates Settings context instead of replacing the live slot: reviewing structural alternatives must not replace the providers currently needed for authentication and ongoing lab work. The surrounding navigation is a labeled replica, not the real DSH shell. No 3080/3082 assets or profile dependencies are changed. The file is not imported into any production entry. All accounts, model names, capabilities and quota values are demonstrative, not provider compatibility claims.

LLM badges use a blue message icon and Agent badges a violet execution icon, with explicit text in both cases; role styling is separate from green connection status. Phone controls use touch-sized targets, single-column quota windows, and safe-area-aware action placement. Styling retains neutral settings surfaces, thin dividers and blue actions; exact live DSH theme-token integration is deferred to implementation.

## What to compare

- A / Inline list: low navigation cost, easy status scan, good on narrow screens. Expanding a large provider lengthens the page and pushes its siblings away.
- C / Overview: connection issues lead, tabular providers retain comparable status and quota columns, configuration opens in a drawer. On phones, the table becomes summary cards retaining connection state, capabilities and quota; the drawer becomes a full-width editor. Good for maintenance; adds a step for model editing.

Try Antigravity multi-window quota, Grok re-authentication, a provider without quota data, disabling/saving a model, and the mobile layout. No action calls an API or persists data; refresh resets everything. Advanced fields and routing/catalog buttons are labeled stubs. Reordering, adding providers, actual credentials and asynchronous lifecycle behavior are outside this visual comparison.

## Check

With local Chrome CDP on `127.0.0.1:9228`, run `node src/client/prototype/check.mjs`. It checks all variants in both themes at 1280/390/320px widths, drawer/model/save interaction and JS exceptions, and writes screenshots to `/tmp/provider-{A,C}-{1280,390,320}-{light,dark}.png`.

Implementation handoff: keep production quota decision ADR 0001 in the Antigravity worktree; after the user chooses, implement only the validated design through the shared providers-ui slot and provider declarations. Reference this branch as the primary source; do not promote its mock state or hand-built shell.
