# Provider shell

The Providers settings page and the sidebar Provider Usage tiles. Settings C is a quota overview ledger (brand, role, remaining percent, Details); the plugin card mounts only on the independent detail view. Quota is optional.

## Language

**Provider directory**:
The open registration port. A plugin declares its card key, role, header ownership (`shared` once it renders the provider-ui header), quota reader, optional `account()` snapshot (no email on the overview; `unknown` until auth or credential status resolves), `catalogId`, and optional native `binding`. Runtime picker identity is `catalogRoutes()`. Native-agent lookup is `nativeBindings()`. The shell does not own a per-plugin reader list.
_Avoid_: Builtin reader table, Provider registry (DSH core), login-by-quota

**Role badge**:
`LLM` or `Agent` on a card and on a Model Switch group. Default is `LLM`. A native-agent plugin declares `Agent`.
_Avoid_: Type, Kind, Runtime badge

**Quota**:
Vendor remaining percent (windows such as 5h / weekly). Shown on the settings overview ledger, the detail quota block, and Provider Usage tiles. Missing quota renders no meter, never zero; out-of-range readings are unavailable, never clamped. Not DSH session token fold. Quota is not account identity.
_Avoid_: tok/s footer, estimated tokens, usage-monitor
