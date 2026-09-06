# Provider Settings — selected A prototype

User decision: A (inline accordion), not B or C. Remove decorative role stripes, tinted badges, rounded card stacks, marketing-style headings and ornamental progress bars. Current visual revision is pending user confirmation. Earlier alternatives remain in this throwaway branch history: `prototype/provider-settings-three`; do not merge prototype code into production.

Run: `python3 -m http.server 3083 --bind 127.0.0.1 --directory src/client/prototype`. Open <http://127.0.0.1:3083/providers.html?variant=A&theme=light> or use `theme=dark`. The preview control switches themes; the initial system preference applies when no theme is specified.

The page is a plain divided settings list. LLM uses an outlined monochrome message badge; Agent uses a filled monochrome terminal badge, without a provider side accent. Quota summaries are text; detailed quota bars appear only after expanding. On phones the summary occupies a second row and expanded windows use a single column.

All accounts, capabilities, model names and quota values are illustrative. Settings navigation is a labeled replica, not the live DSH shell. No real authentication, API requests, storage or profile mutations occur. Model checkboxes and save work in memory; advanced fields and routing/catalog buttons are stubs. Reordering, adding providers and lifecycle behavior remain outside this visual prototype. No 3080/3082 artifacts are changed.

Run `node src/client/prototype/check.mjs` with Chrome CDP on `127.0.0.1:9228`. It checks light/dark at 1280/390/320px, zero Agent side border, collapsed/expanded overflow, model changes and save. Screenshots: `/tmp/provider-clean-{1280,390,320}-{light,dark}.png`.

Implementation handoff: use shared providers-ui components and provider declarations, preserve Antigravity quota ADR 0001, and bind the accepted design to actual DSH theme tokens. Keep this branch as the visual primary source; do not promote its mock state or shell.
