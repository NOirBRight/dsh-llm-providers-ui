# 3080 plugin version audit

Checked: **2026-09-10T01:48:07Z** (local UTC+8 ~09:48).
Scope: live web profile plugins on DSH 3080. Public **stable latest release** vs installed. Local git tags are **local only**, never labeled online latest. No installs, no pushes, no restarts, no upgrades.

## Verdict

**Only `dshmarket` lags a confirmed public latest.** Installed `1.42.0` vs npm dist-tag `latest` **`1.45.1`**. Missed stables: `1.43.0`, `1.44.0`, `1.45.0`, `1.45.1`. npm `beta`/`dev` are older, not newer prereleases.

The other **15 GitHub-pinned plugins**:

- **Installed = local highest version tag** on every `/home/noirbright/Workstation/<repo>` (`git tag --sort=-v:refname`, all exit 0). Local only.
- **Online via `web_fetch` `/releases/latest`: unknown** (denied, non-public IP). Do not treat local tags as online latest.
- **Online via web_search:** `dsh-llm-providers-ui` **v0.1.12** (= installed). Other 14 GitHub plugins: no completed web_search.
- **CLI corroboration only (same host as denied web_fetch):** `gh api …/releases/latest` matched installed on all 15; no newer prerelease. Not a second public fetch.

Why 3080 is not “always latest”: profile pins **15 immutable GitHub release-asset URLs** plus exact npm **`dshmarket@1.42.0`**. Pins do not auto-follow new public releases or workspace `main`. PATH `dsh` 0.1.1-rc.1 is an unrelated older global CLI.

## Runtime / pinning (local primary)

| Fact | Evidence |
| --- | --- |
| Serving process | PID 1313462, launched local **2026-09-10 09:14:03**, executable `/home/noirbright/.local/opt/dsh-staging/dsh-v0.1.2-rc.1-a66e470204/node_modules/@deepseek-ai/dsh/lib/bin.js`, `--version` **0.1.2-rc.1** |
| Plugin home | process env `DSH_HOME=/home/noirbright/.dsh` |
| Profile | `/home/noirbright/.dsh/profiles/web/package.json` |
| 15 GitHub plugins | dependencies = immutable `…/releases/download/vX.Y.Z/*.tgz` |
| `dshmarket` | exact `"dshmarket": "1.42.0"` |
| PATH `dsh` | unrelated global **0.1.1-rc.1** under `~/.nvm` — not the 3080 runtime, not a plugin |
| Plugin list | parent `dsh plugin --profile web list` = 16 versions below; matches on-disk `node_modules/*/package.json` |

## Method

| Source | Role | Result |
| --- | --- | --- |
| profile + node_modules package.json + plugin list | installed | confirmed |
| `git -C /home/noirbright/Workstation/<repo> tag --sort=-v:refname` (parent, 15 repos, all exit 0) | **local highest tag only** | equals installed on all 15 |
| `web_fetch` `api.github.com/.../releases/latest` | requested online primary | **denied** (non-public IP) |
| `web_fetch` github.com HTML / npmjs.com | online HTML | **denied** |
| SDK `open_page` | online HTML | unavailable |
| `npm view dshmarket` + registry packument | requested online primary for dshmarket | **latest=1.45.1** |
| `web_search` | online discovery | dshmarket **1.45.1**; `dsh-llm-providers-ui` **v0.1.12**. Parent's web_search timed out. |
| `gh api …/releases/latest` + `/releases` + `/tags` | same API host as denied web_fetch | matched installed; **not** labeled web_fetch latest |

Tags ≠ releases: older tags without a matching release exist (`dsh-mobile-pairing` v0.1.10/9/8; `dsh-usage-monitor` v0.2.6/5). None newer than installed.

## Installed vs local tag vs online latest

| Plugin | Installed | Local highest tag (Workstation clone; not online) | Online stable latest | Status |
| --- | --- | --- | --- | --- |
| `@deepseek-ai/dsh-acp-antigravity` | 0.1.4 | v0.1.4 | **unknown** (`web_fetch` denied) | local tag = installed; online unknown |
| `@deepseek-ai/dsh-acp-provider` | 0.1.2 | v0.1.2 | **unknown** (`web_fetch` denied) | local tag = installed; online unknown |
| `@dsh-mobile/e2e-tunnel` | 0.1.5 | v0.1.5 | **unknown** (`web_fetch` denied) | local tag = installed; online unknown |
| `@dsh-mobile/pairing` | 0.1.15 | v0.1.15 | **unknown** (`web_fetch` denied) | local tag = installed; online unknown |
| `dsh-ainvestor` | 0.1.2 | v0.1.2 | **unknown** (`web_fetch` denied) | local tag = installed; online unknown |
| `dsh-llm-codex` | 0.3.15 | v0.3.15 | **unknown** (`web_fetch` denied) | local tag = installed; online unknown |
| `dsh-llm-commandcode` | 0.1.21 | v0.1.21 | **unknown** (`web_fetch` denied) | local tag = installed; online unknown |
| `dsh-llm-cursor` | 0.2.18 | v0.2.18 | **unknown** (`web_fetch` denied) | local tag = installed; online unknown |
| `dsh-llm-grok` | 0.3.12 | v0.3.12 | **unknown** (`web_fetch` denied) | local tag = installed; online unknown |
| `dsh-llm-ollama` | 0.6.19 | v0.6.19 | **unknown** (`web_fetch` denied) | local tag = installed; online unknown |
| `dsh-llm-opencode-go` | 0.1.22 | v0.1.22 | **unknown** (`web_fetch` denied) | local tag = installed; online unknown |
| `dsh-llm-providers-ui` | 0.1.12 | v0.1.12 | **v0.1.12** (web_search [releases](https://github.com/NOirBRight/dsh-llm-providers-ui/releases)) | **current** vs web_search |
| `dsh-model-switch` | 0.4.9 | v0.4.9 | **unknown** (`web_fetch` denied) | local tag = installed; online unknown |
| `dsh-ponytail` | 0.2.5 | v0.2.5 | **unknown** (`web_fetch` denied) | local tag = installed; online unknown |
| `dsh-usage-monitor` | 0.2.11 | v0.2.11 | **unknown** (`web_fetch` denied) | local tag = installed; online unknown |
| `dshmarket` | **1.42.0** | n/a (npm pin; repo `dsh-market/dsh-market` not in the 15 Workstation clones) | **1.45.1** npm dist-tag `latest` ([npm](https://www.npmjs.com/package/dshmarket)), time 2026-09-08T14:36:57.980Z | **LAG** 1.42.0 → 1.45.1 |

### dshmarket npm gap

| Version | npm time |
| --- | --- |
| 1.42.0 (installed) | 2026-09-04T16:52:19.276Z |
| 1.43.0 | 2026-09-05T04:30:31.908Z |
| 1.44.0 | 2026-09-05T15:22:34.101Z |
| 1.45.0 | 2026-09-07T15:18:15.069Z |
| **1.45.1 (latest)** | **2026-09-08T14:36:57.980Z** |

dist-tags: `latest=1.45.1`, `beta=1.19.0-beta.4`, `dev=1.16.0-dev.202608191514-19afba9`.

### gh api corroboration only (not online web_fetch)

Same host as denied `web_fetch`. Listed so numbers are not lost; **do not quote as public web_fetch latest**.

| Plugin | gh api `/releases/latest` | published_at | newer prerelease in `/releases`? |
| --- | --- | --- | --- |
| dsh-acp-antigravity | [v0.1.4](https://github.com/NOirBRight/dsh-acp-antigravity/releases/tag/v0.1.4) | 2026-09-10T01:13:28Z | no (older: v0.1.2, v0.1.1, ui-tool-v0.1.2-rc.1-native.1) |
| dsh-acp-provider | [v0.1.2](https://github.com/NOirBRight/dsh-acp-provider/releases/tag/v0.1.2) | 2026-09-09T03:47:18Z | no (older v0.1.1) |
| dsh-e2e-tunnel | [v0.1.5](https://github.com/NOirBRight/dsh-e2e-tunnel/releases/tag/v0.1.5) | 2026-09-02T16:58:44Z | no |
| dsh-mobile-pairing | [v0.1.15](https://github.com/NOirBRight/dsh-mobile-pairing/releases/tag/v0.1.15) | 2026-09-03T11:42:27Z | no |
| dsh-ainvestor | [v0.1.2](https://github.com/NOirBRight/dsh-ainvestor/releases/tag/v0.1.2) | 2026-09-03T11:41:55Z | no |
| dsh-llm-codex | [v0.3.15](https://github.com/NOirBRight/dsh-llm-codex/releases/tag/v0.3.15) | 2026-09-07T01:42:24Z | no |
| dsh-llm-commandcode | [v0.1.21](https://github.com/NOirBRight/dsh-llm-commandcode/releases/tag/v0.1.21) | 2026-09-09T03:50:20Z | no |
| dsh-llm-cursor | [v0.2.18](https://github.com/NOirBRight/dsh-llm-cursor/releases/tag/v0.2.18) | 2026-09-07T01:41:57Z | no |
| dsh-llm-grok | [v0.3.12](https://github.com/NOirBRight/dsh-llm-grok/releases/tag/v0.3.12) | 2026-09-07T01:42:12Z | no |
| dsh-llm-ollama | [v0.6.19](https://github.com/NOirBRight/dsh-llm-ollama/releases/tag/v0.6.19) | 2026-09-09T03:50:34Z | no |
| dsh-llm-opencode-go | [v0.1.22](https://github.com/NOirBRight/dsh-llm-opencode-go/releases/tag/v0.1.22) | 2026-09-09T03:50:46Z | no |
| dsh-llm-providers-ui | [v0.1.12](https://github.com/NOirBRight/dsh-llm-providers-ui/releases/tag/v0.1.12) | 2026-09-10T01:11:35Z | no |
| dsh-model-switch | [v0.4.9](https://github.com/NOirBRight/dsh-model-switch/releases/tag/v0.4.9) | 2026-09-09T03:49:59Z | no |
| dsh-ponytail | [v0.2.5](https://github.com/NOirBRight/dsh-ponytail/releases/tag/v0.2.5) | 2026-09-05T04:57:55Z | no |
| dsh-usage-monitor | [v0.2.11](https://github.com/NOirBRight/dsh-usage-monitor/releases/tag/v0.2.11) | 2026-09-03T11:41:59Z | no |
| dshmarket | n/a (npm) | GitHub [v1.45.1](https://github.com/dsh-market/dsh-market/releases/tag/v1.45.1) 2026-09-08T14:37:00Z | no |

## Primary URLs

Requested GitHub primaries (`web_fetch` denied):

- https://api.github.com/repos/NOirBRight/dsh-acp-antigravity/releases/latest
- https://api.github.com/repos/NOirBRight/dsh-acp-provider/releases/latest
- https://api.github.com/repos/NOirBRight/dsh-e2e-tunnel/releases/latest
- https://api.github.com/repos/NOirBRight/dsh-mobile-pairing/releases/latest
- https://api.github.com/repos/NOirBRight/dsh-ainvestor/releases/latest
- https://api.github.com/repos/NOirBRight/dsh-llm-codex/releases/latest
- https://api.github.com/repos/NOirBRight/dsh-llm-commandcode/releases/latest
- https://api.github.com/repos/NOirBRight/dsh-llm-cursor/releases/latest
- https://api.github.com/repos/NOirBRight/dsh-llm-grok/releases/latest
- https://api.github.com/repos/NOirBRight/dsh-llm-ollama/releases/latest
- https://api.github.com/repos/NOirBRight/dsh-llm-opencode-go/releases/latest
- https://api.github.com/repos/NOirBRight/dsh-llm-providers-ui/releases/latest
- https://api.github.com/repos/NOirBRight/dsh-model-switch/releases/latest
- https://api.github.com/repos/NOirBRight/dsh-ponytail/releases/latest
- https://api.github.com/repos/NOirBRight/dsh-usage-monitor/releases/latest

npm (succeeded): https://registry.npmjs.org/dshmarket · https://www.npmjs.com/package/dshmarket
dshmarket GitHub (from installed package.json): https://github.com/dsh-market/dsh-market/releases/latest

## Out of scope

- Workspace `main` vs release (parent).
- Whether to bump `dshmarket` (no upgrade requested).
- Host 0.1.2-rc.1 vs PATH 0.1.1-rc.1 (CLI confusion, not plugin lag).
