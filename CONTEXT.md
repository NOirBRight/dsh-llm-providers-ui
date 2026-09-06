# Provider shell

The Providers settings page and the sidebar Provider Usage tiles. Installed LLM routes and native agents appear as cards; quota is optional.

## Language

**Provider directory**:
The open registration port. A plugin declares its card key, role, header ownership (`shared` once it renders the provider-ui header), and quota reader. The shell does not own a per-plugin reader list.
_Avoid_: Builtin reader table, Provider registry (DSH core)

**Role badge**:
`LLM` or `Agent` on a card and on a Model Switch group. Default is `LLM`. A native-agent plugin declares `Agent`.
_Avoid_: Type, Kind, Runtime badge

**Quota**:
Vendor remaining percent (windows such as 5h / weekly). Shown on the Provider card and Provider Usage tiles. Missing quota renders no meter, never zero; out-of-range readings are unavailable, never clamped. Not DSH session token fold.
_Avoid_: tok/s footer, estimated tokens, usage-monitor
