// THROWAWAY DEMO — not production, not live credentials, not a fetched quota snapshot.
// Frozen clock: 2026-09-10T09:34:00+08:00. All account / quota / config values are DEMO.
// Parent HTML/CSS/behavior consumes window.PROVIDER_DEMO. Do not import this file.
// Parent banner already states ALL DEMO — user-facing labels/facts use production copy.
//
// Evidence (read-only):
// - docs/specs/provider-controls-llm.md  (Codex 0.3.15, Cursor 0.2.18, Grok 0.3.12,
//   Ollama 0.6.19, Command Code 0.1.21, OpenCode Go 0.1.22)
// - docs/specs/provider-controls-acp.md  (Antigravity 0.1.4 live; Cursor ACP 0.1.5 in-progress,
//   not installed on live web profile)
// - catalogs: dsh-codex-settings-a/src/catalog.ts (no gpt-6-astra in official rows; tests only)
//   dsh-grok-settings-a/src/reasoning.ts (grok-4.5 excludes xhigh)
//   dsh-opencode-go-settings-a/src/reasoning.ts + catalog.ts
//   dsh-commandcode-settings-a/src/reasoning-catalog.ts
//   dsh-ollama-settings-a/src/reasoning.ts
//   ~/.dsh/plugin-data/antigravity/models.json (collapsed; native id "default" is not a row)
//   dsh-acp-cursor/src/catalog-group.ts (quota always unsupported)
// Screenshot remaining (comments only): Codex weekly 39 reset 2026-09-15; Spark 5h 100
//   2026-09-10T14:34 + weekly 100 2026-09-17; Grok weekly 25 2026-09-14; OpenCode monthly 52
//   2026-09-26 (5h/week representative 82/68); CommandCode weekly 100 reset unknown, 5h 72;
//   Cursor Models 49.9 2026-09-17, Other Models 64; Ollama windows []; Antigravity Gemini
//   weekly 97 2026-09-11T03:24:33, other groups representative; CursorACP unsupported.
// Unknown remaining uses remaining:null / reset:null — never disabled (disabled = product-disabled).
// Optional Model.efforts when source publishes a constraint; default effort is always in that list.
// Cursor ACP: live = development / not installed; this demo runtime is installed + login-ready.
// No 127.0.0.1 callback fields. No invented quota API. No config-only runtime toggles.
// Selected catalog counts 4/2/2/3/0/0/4/2. Fast / 1M stay separate candidate rows.

window.PROVIDER_DEMO = [
  {
    "id": "codex",
    "name": "Codex",
    "role": "llm",
    "version": "0.3.15",
    "auth": "chatgpt",
    "account": "chatgpt-demo@example.com",
    "connected": true,
    "installed": true,
    "description": "使用 ChatGPT 登录。本插件不使用 API key。",
    "catalogLabel": "从官方目录选取",
    "contextDefault": 272000,
    "efforts": [
      "minimal",
      "low",
      "medium",
      "high",
      "xhigh",
      "max"
    ],
    "models": [
      {
        "uid": "gpt-5.6-sol",
        "id": "gpt-5.6-sol",
        "name": "GPT-5.6 Sol",
        "context": "272000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "efforts": [
          "minimal",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.6-sol-fast",
        "id": "gpt-5.6-sol-fast",
        "name": "GPT-5.6 Sol Fast",
        "context": "272000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "hint": "Fast 独立行",
        "efforts": [
          "minimal",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.6-terra",
        "id": "gpt-5.6-terra",
        "name": "GPT-5.6 Terra",
        "context": "272000",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "efforts": [
          "minimal",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.6-terra-fast",
        "id": "gpt-5.6-terra-fast",
        "name": "GPT-5.6 Terra Fast",
        "context": "272000",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "hint": "Fast 独立行",
        "efforts": [
          "minimal",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      }
    ],
    "candidates": [
      {
        "uid": "gpt-5.6-sol",
        "id": "gpt-5.6-sol",
        "name": "GPT-5.6 Sol",
        "context": "272000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "efforts": [
          "minimal",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.6-sol-fast",
        "id": "gpt-5.6-sol-fast",
        "name": "GPT-5.6 Sol Fast",
        "context": "272000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "hint": "Fast 独立行",
        "efforts": [
          "minimal",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.6-sol-1m",
        "id": "gpt-5.6-sol-1m",
        "name": "GPT-5.6 Sol 1M",
        "context": "1000000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "hint": "1M 独立行",
        "efforts": [
          "minimal",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.6-sol-1m-fast",
        "id": "gpt-5.6-sol-1m-fast",
        "name": "GPT-5.6 Sol 1M Fast",
        "context": "1000000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "hint": "1M + Fast 独立行",
        "efforts": [
          "minimal",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.6-terra",
        "id": "gpt-5.6-terra",
        "name": "GPT-5.6 Terra",
        "context": "272000",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "efforts": [
          "minimal",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.6-terra-fast",
        "id": "gpt-5.6-terra-fast",
        "name": "GPT-5.6 Terra Fast",
        "context": "272000",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "hint": "Fast 独立行",
        "efforts": [
          "minimal",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.6-terra-1m",
        "id": "gpt-5.6-terra-1m",
        "name": "GPT-5.6 Terra 1M",
        "context": "1000000",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "hint": "1M 独立行",
        "efforts": [
          "minimal",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.6-terra-1m-fast",
        "id": "gpt-5.6-terra-1m-fast",
        "name": "GPT-5.6 Terra 1M Fast",
        "context": "1000000",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "hint": "1M + Fast 独立行",
        "efforts": [
          "minimal",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.6-luna",
        "id": "gpt-5.6-luna",
        "name": "GPT-5.6 Luna",
        "context": "272000",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "efforts": [
          "minimal",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.6-luna-fast",
        "id": "gpt-5.6-luna-fast",
        "name": "GPT-5.6 Luna Fast",
        "context": "272000",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "hint": "Fast 独立行",
        "efforts": [
          "minimal",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.6-luna-1m",
        "id": "gpt-5.6-luna-1m",
        "name": "GPT-5.6 Luna 1M",
        "context": "1000000",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "hint": "1M 独立行",
        "efforts": [
          "minimal",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.6-luna-1m-fast",
        "id": "gpt-5.6-luna-1m-fast",
        "name": "GPT-5.6 Luna 1M Fast",
        "context": "1000000",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "hint": "1M + Fast 独立行",
        "efforts": [
          "minimal",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.5",
        "id": "gpt-5.5",
        "name": "GPT-5.5",
        "context": "272000",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "efforts": [
          "minimal",
          "high",
          "xhigh"
        ]
      },
      {
        "uid": "gpt-5.5-fast",
        "id": "gpt-5.5-fast",
        "name": "GPT-5.5 Fast",
        "context": "272000",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "hint": "Fast 独立行",
        "efforts": [
          "minimal",
          "high",
          "xhigh"
        ]
      },
      {
        "uid": "gpt-5.4",
        "id": "gpt-5.4",
        "name": "GPT-5.4",
        "context": "272000",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "efforts": [
          "minimal",
          "high",
          "xhigh"
        ]
      },
      {
        "uid": "gpt-5.4-fast",
        "id": "gpt-5.4-fast",
        "name": "GPT-5.4 Fast",
        "context": "272000",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "hint": "Fast 独立行",
        "efforts": [
          "minimal",
          "high",
          "xhigh"
        ]
      },
      {
        "uid": "gpt-5.4-mini",
        "id": "gpt-5.4-mini",
        "name": "GPT-5.4 mini",
        "context": "272000",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "efforts": [
          "minimal",
          "high",
          "xhigh"
        ]
      },
      {
        "uid": "gpt-5.3-codex-spark",
        "id": "gpt-5.3-codex-spark",
        "name": "GPT-5.3 Codex Spark",
        "context": "128000",
        "vision": false,
        "thinking": true,
        "effort": "xhigh",
        "efforts": [
          "minimal",
          "high",
          "xhigh"
        ]
      }
    ],
    "quota": {
      "status": "ready",
      "windows": [
        {
          "id": "codex-weekly",
          "label": "Codex · 每周额度",
          "remaining": 39,
          "reset": "2026-09-15T00:00:00+08:00",
          "period": "每周"
        },
        {
          "id": "spark-5h",
          "label": "GPT-5.3 Codex Spark · 5 小时额度",
          "remaining": 100,
          "reset": "2026-09-10T14:34:00+08:00",
          "period": "每5小时"
        },
        {
          "id": "spark-weekly",
          "label": "GPT-5.3 Codex Spark · 每周额度",
          "remaining": 100,
          "reset": "2026-09-17T00:00:00+08:00",
          "period": "每周"
        }
      ],
      "facts": [
        {
          "label": "积分",
          "value": "120 / 200 积分"
        }
      ],
      "activity": []
    },
    "advanced": [
      {
        "key": "enableSearch",
        "label": "启用 Codex 搜索提供方",
        "type": "checkbox",
        "value": false,
        "hint": "让 Codex 可被选作搜索提供方，但不会自动改动全局搜索路由。"
      },
      {
        "key": "searchModel",
        "label": "搜索模型",
        "type": "select",
        "value": "gpt-5.6-luna",
        "when": [
          "enableSearch",
          true
        ],
        "options": [
          {
            "value": "gpt-5.6-sol",
            "label": "GPT-5.6 Sol"
          },
          {
            "value": "gpt-5.6-terra",
            "label": "GPT-5.6 Terra"
          },
          {
            "value": "gpt-5.6-luna",
            "label": "GPT-5.6 Luna"
          },
          {
            "value": "gpt-5.5",
            "label": "GPT-5.5"
          },
          {
            "value": "gpt-5.4",
            "label": "GPT-5.4"
          },
          {
            "value": "gpt-5.4-mini",
            "label": "GPT-5.4 mini"
          },
          {
            "value": "gpt-5.3-codex-spark",
            "label": "GPT-5.3 Codex Spark"
          }
        ]
      },
      {
        "key": "searchMode",
        "label": "联网方式",
        "type": "select",
        "value": "cached",
        "when": [
          "enableSearch",
          true
        ],
        "options": [
          {
            "value": "cached",
            "label": "缓存"
          },
          {
            "value": "indexed",
            "label": "索引"
          },
          {
            "value": "live",
            "label": "实时联网"
          }
        ]
      },
      {
        "key": "searchContextSize",
        "label": "搜索上下文",
        "type": "select",
        "value": "medium",
        "when": [
          "enableSearch",
          true
        ],
        "options": [
          {
            "value": "low",
            "label": "低"
          },
          {
            "value": "medium",
            "label": "中"
          },
          {
            "value": "high",
            "label": "高"
          }
        ]
      },
      {
        "key": "searchMaxOutputTokens",
        "label": "搜索最大输出 Tokens",
        "type": "number",
        "value": 10000,
        "min": 1,
        "when": [
          "enableSearch",
          true
        ]
      },
      {
        "key": "enableImageTool",
        "label": "启用 view_image 工具",
        "type": "checkbox",
        "value": false,
        "hint": "允许具备视觉能力的模型在审批后读取本地图片或获取公网图片。"
      },
      {
        "key": "enableImageGeneration",
        "label": "启用 codex_generate_image 工具",
        "type": "checkbox",
        "value": false,
        "hint": "让任意会话模型通过 ChatGPT Codex（gpt-image-2）生图。使用本卡登录和 Codex 额度，大约是普通一轮的 3–5 倍。与其它 generate_image 工具不同名。"
      },
      {
        "key": "imageGenerationModel",
        "label": "生图路由模型",
        "type": "select",
        "value": "gpt-5.6-luna",
        "when": [
          "enableImageGeneration",
          true
        ],
        "options": [
          {
            "value": "gpt-5.6-sol",
            "label": "GPT-5.6 Sol"
          },
          {
            "value": "gpt-5.6-terra",
            "label": "GPT-5.6 Terra"
          },
          {
            "value": "gpt-5.6-luna",
            "label": "GPT-5.6 Luna"
          },
          {
            "value": "gpt-5.5",
            "label": "GPT-5.5"
          },
          {
            "value": "gpt-5.4",
            "label": "GPT-5.4"
          },
          {
            "value": "gpt-5.4-mini",
            "label": "GPT-5.4 mini"
          }
        ]
      }
    ]
  },
  {
    "id": "grok",
    "name": "Grok",
    "role": "llm",
    "version": "0.3.12",
    "auth": "xai",
    "account": "xai-demo@example.com",
    "connected": true,
    "installed": true,
    "description": "使用 xAI 订阅登录。本插件不使用 console API key。",
    "catalogLabel": "从账户目录选取",
    "contextDefault": 500000,
    "efforts": [
      "xhigh",
      "high",
      "medium",
      "low"
    ],
    "models": [
      {
        "uid": "grok-4.6",
        "id": "grok-4.6",
        "name": "Grok 4.6",
        "context": "500000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "efforts": [
          "xhigh",
          "high",
          "medium",
          "low"
        ]
      },
      {
        "uid": "grok-4.5",
        "id": "grok-4.5",
        "name": "Grok 4.5",
        "context": "500000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "hint": "无 Extra High",
        "efforts": [
          "high",
          "medium",
          "low"
        ]
      }
    ],
    "candidates": [
      {
        "uid": "grok-4.6",
        "id": "grok-4.6",
        "name": "Grok 4.6",
        "context": "500000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "efforts": [
          "xhigh",
          "high",
          "medium",
          "low"
        ]
      },
      {
        "uid": "grok-4.5",
        "id": "grok-4.5",
        "name": "Grok 4.5",
        "context": "500000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "hint": "无 Extra High",
        "efforts": [
          "high",
          "medium",
          "low"
        ]
      }
    ],
    "quota": {
      "status": "ready",
      "windows": [
        {
          "id": "weekly",
          "label": "Grok · 每周额度",
          "remaining": 25,
          "reset": "2026-09-14T00:00:00+08:00",
          "period": "每周"
        }
      ],
      "facts": [],
      "activity": []
    },
    "advanced": [
      {
        "key": "enableImageGen",
        "label": "启用 grok_image_gen 工具",
        "type": "checkbox",
        "value": false,
        "hint": "让任意会话模型用本卡的 SuperGrok 登录调用 Grok Imagine 生图。与 Codex 的 codex_generate_image 不同名。"
      }
    ]
  },
  {
    "id": "opencode",
    "name": "OpenCode Go",
    "role": "llm",
    "version": "0.1.22",
    "auth": "api-key",
    "account": "configured",
    "connected": true,
    "installed": true,
    "description": "配置 OpenCode Go API 密钥、地址和模型目录。",
    "baseURL": {
      "value": "https://opencode.ai/zen/go/v1",
      "editable": true
    },
    "catalogLabel": "从端点获取目录",
    "contextDefault": 262144,
    "efforts": [
      "off",
      "minimal",
      "low",
      "medium",
      "high",
      "xhigh",
      "max"
    ],
    "models": [
      {
        "uid": "grok-4.6",
        "id": "grok-4.6",
        "name": "Grok 4.6",
        "context": "500000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "grok",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh"
        ]
      },
      {
        "uid": "gpt-5.6-luna",
        "id": "gpt-5.6-luna",
        "name": "GPT 5.6 Luna",
        "context": "1050000",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "group": "gpt",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      }
    ],
    "candidates": [
      {
        "uid": "grok-4.6",
        "id": "grok-4.6",
        "name": "Grok 4.6",
        "context": "500000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "grok",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh"
        ]
      },
      {
        "uid": "grok-4.5",
        "id": "grok-4.5",
        "name": "Grok 4.5",
        "context": "500000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "grok",
        "efforts": [
          "low",
          "medium",
          "high"
        ]
      },
      {
        "uid": "gpt-5.6-luna",
        "id": "gpt-5.6-luna",
        "name": "GPT 5.6 Luna",
        "context": "1050000",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "group": "gpt",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "muse-spark-1.2-contributor",
        "id": "muse-spark-1.2-contributor",
        "name": "Muse Spark 1.2 Contributor",
        "context": "1048576",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "group": "muse",
        "efforts": [
          "minimal",
          "low",
          "medium",
          "high",
          "xhigh"
        ]
      },
      {
        "uid": "muse-spark-1.3-contributor",
        "id": "muse-spark-1.3-contributor",
        "name": "Muse Spark 1.3 Contributor",
        "context": "1048576",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "group": "muse",
        "efforts": [
          "minimal",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "glm-5.3-flash",
        "id": "glm-5.3-flash",
        "name": "GLM-5.3-Flash",
        "context": "1000000",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "group": "glm",
        "efforts": [
          "low",
          "high",
          "max"
        ]
      },
      {
        "uid": "glm-5.3",
        "id": "glm-5.3",
        "name": "GLM-5.3",
        "context": "1000000",
        "vision": false,
        "thinking": true,
        "effort": "max",
        "group": "glm",
        "efforts": [
          "low",
          "high",
          "max"
        ]
      },
      {
        "uid": "glm-5.2",
        "id": "glm-5.2",
        "name": "GLM-5.2",
        "context": "1000000",
        "vision": false,
        "thinking": true,
        "effort": "max",
        "group": "glm",
        "efforts": [
          "off",
          "high",
          "max"
        ]
      },
      {
        "uid": "glm-5.1",
        "id": "glm-5.1",
        "name": "GLM-5.1",
        "context": "202752",
        "vision": false,
        "thinking": true,
        "effort": "high",
        "group": "glm",
        "efforts": [
          "off",
          "high"
        ]
      },
      {
        "uid": "glm-5",
        "id": "glm-5",
        "name": "GLM-5",
        "context": "202752",
        "vision": false,
        "thinking": true,
        "effort": "high",
        "group": "glm",
        "efforts": [
          "off",
          "high"
        ]
      },
      {
        "uid": "kimi-k3",
        "id": "kimi-k3",
        "name": "Kimi K3",
        "context": "1048576",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "group": "kimi",
        "efforts": [
          "low",
          "high",
          "max"
        ]
      },
      {
        "uid": "kimi-k2.7-code",
        "id": "kimi-k2.7-code",
        "name": "Kimi K2.7 Code",
        "context": "262144",
        "vision": true,
        "thinking": false,
        "effort": "",
        "group": "kimi"
      },
      {
        "uid": "kimi-k2.6",
        "id": "kimi-k2.6",
        "name": "Kimi K2.6",
        "context": "262144",
        "vision": true,
        "thinking": false,
        "effort": "",
        "group": "kimi"
      },
      {
        "uid": "kimi-k2.5",
        "id": "kimi-k2.5",
        "name": "Kimi K2.5",
        "context": "262144",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "group": "kimi",
        "efforts": [
          "low",
          "high",
          "max"
        ]
      },
      {
        "uid": "longcat-2.0",
        "id": "longcat-2.0",
        "name": "LongCat-2.0",
        "context": "1000000",
        "vision": false,
        "thinking": true,
        "effort": "high",
        "group": "longcat",
        "efforts": [
          "off",
          "high"
        ]
      },
      {
        "uid": "deepseek-v4-pro",
        "id": "deepseek-v4-pro",
        "name": "DeepSeek V4 Pro",
        "context": "1000000",
        "vision": false,
        "thinking": true,
        "effort": "max",
        "group": "deepseek",
        "efforts": [
          "off",
          "low",
          "high",
          "max"
        ]
      },
      {
        "uid": "deepseek-v4-flash",
        "id": "deepseek-v4-flash",
        "name": "DeepSeek V4 Flash",
        "context": "1000000",
        "vision": false,
        "thinking": true,
        "effort": "max",
        "group": "deepseek",
        "efforts": [
          "off",
          "low",
          "high",
          "max"
        ]
      },
      {
        "uid": "deepseek-v4-flash-vision-exp",
        "id": "deepseek-v4-flash-vision-exp",
        "name": "DeepSeek V4 Flash Vision Exp",
        "context": "1000000",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "group": "deepseek",
        "efforts": [
          "high",
          "max"
        ]
      },
      {
        "uid": "mimo-v2.5",
        "id": "mimo-v2.5",
        "name": "MiMo-V2.5",
        "context": "1000000",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "group": "mimo",
        "efforts": [
          "low",
          "medium",
          "xhigh"
        ]
      },
      {
        "uid": "mimo-v2.5-pro",
        "id": "mimo-v2.5-pro",
        "name": "MiMo-V2.5-Pro",
        "context": "1048576",
        "vision": false,
        "thinking": true,
        "effort": "xhigh",
        "group": "mimo",
        "efforts": [
          "low",
          "medium",
          "xhigh"
        ]
      },
      {
        "uid": "mimo-v2-pro",
        "id": "mimo-v2-pro",
        "name": "MiMo-V2-Pro",
        "context": "1048576",
        "vision": false,
        "thinking": true,
        "effort": "xhigh",
        "group": "mimo",
        "efforts": [
          "low",
          "medium",
          "xhigh"
        ]
      },
      {
        "uid": "mimo-v2-omni",
        "id": "mimo-v2-omni",
        "name": "MiMo-V2-Omni",
        "context": "262144",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "group": "mimo",
        "efforts": [
          "low",
          "medium",
          "xhigh"
        ]
      },
      {
        "uid": "hy3",
        "id": "hy3",
        "name": "Hy3",
        "context": "256000",
        "vision": false,
        "thinking": true,
        "effort": "high",
        "group": "hy3",
        "efforts": [
          "low",
          "medium",
          "high"
        ]
      },
      {
        "uid": "hy3-preview",
        "id": "hy3-preview",
        "name": "Hy3 Preview",
        "context": "256000",
        "vision": false,
        "thinking": true,
        "effort": "high",
        "group": "hy3",
        "efforts": [
          "low",
          "medium",
          "high"
        ]
      },
      {
        "uid": "hy4-preview",
        "id": "hy4-preview",
        "name": "Hy4 preview",
        "context": "1024000",
        "vision": false,
        "thinking": true,
        "effort": "high",
        "group": "hy3",
        "efforts": [
          "off",
          "high"
        ]
      },
      {
        "uid": "minimax-m3",
        "id": "minimax-m3",
        "name": "MiniMax M3",
        "context": "1000000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "minimax",
        "efforts": [
          "off",
          "high"
        ]
      },
      {
        "uid": "minimax-m2.7",
        "id": "minimax-m2.7",
        "name": "MiniMax M2.7",
        "context": "204800",
        "vision": false,
        "thinking": true,
        "effort": "high",
        "group": "minimax",
        "efforts": [
          "high"
        ]
      },
      {
        "uid": "minimax-m2.5",
        "id": "minimax-m2.5",
        "name": "MiniMax M2.5",
        "context": "204800",
        "vision": false,
        "thinking": true,
        "effort": "high",
        "group": "minimax",
        "efforts": [
          "high"
        ]
      },
      {
        "uid": "qwen3.8-max",
        "id": "qwen3.8-max",
        "name": "Qwen3.8 Max",
        "context": "1000000",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "group": "qwen",
        "efforts": [
          "low",
          "medium",
          "xhigh"
        ]
      },
      {
        "uid": "qwen3.7-max",
        "id": "qwen3.7-max",
        "name": "Qwen3.7 Max",
        "context": "1000000",
        "vision": false,
        "thinking": true,
        "effort": "high",
        "group": "qwen",
        "efforts": [
          "off",
          "high"
        ]
      },
      {
        "uid": "qwen3.7-plus",
        "id": "qwen3.7-plus",
        "name": "Qwen3.7 Plus",
        "context": "1000000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "qwen",
        "efforts": [
          "off",
          "high"
        ]
      },
      {
        "uid": "qwen3.6-plus",
        "id": "qwen3.6-plus",
        "name": "Qwen3.6 Plus",
        "context": "1000000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "qwen",
        "efforts": [
          "off",
          "high"
        ]
      },
      {
        "uid": "qwen3.5-plus",
        "id": "qwen3.5-plus",
        "name": "Qwen3.5 Plus",
        "context": "262144",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "qwen",
        "efforts": [
          "off",
          "high"
        ]
      },
      {
        "uid": "qwen3.8-flash",
        "id": "qwen3.8-flash",
        "name": "Qwen3.8 Flash",
        "context": "1000000",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "group": "qwen",
        "efforts": [
          "low",
          "medium",
          "xhigh"
        ]
      },
      {
        "uid": "omen-alpha",
        "id": "omen-alpha",
        "name": "Omen Alpha",
        "context": "500000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "other",
        "efforts": [
          "low",
          "high"
        ]
      }
    ],
    "quota": {
      "status": "ready",
      "windows": [
        {
          "id": "monthly",
          "label": "每月用量",
          "remaining": 52,
          "reset": "2026-09-26T00:00:00+08:00",
          "period": "每30天"
        },
        {
          "id": "session",
          "label": "5 小时用量",
          "remaining": 82,
          "reset": "2026-09-10T14:34:00+08:00",
          "period": "每5小时"
        },
        {
          "id": "weekly",
          "label": "每周用量",
          "remaining": 68,
          "reset": "2026-09-17T00:00:00+08:00",
          "period": "每7天"
        }
      ],
      "facts": [],
      "activity": [
        {
          "name": "grok-4.6",
          "count": 18
        },
        {
          "name": "gpt-5.6-luna",
          "count": 7
        },
        {
          "name": "kimi-k3",
          "count": 3
        }
      ]
    },
    "advanced": []
  },
  {
    "id": "commandcode",
    "name": "Command Code",
    "role": "llm",
    "version": "0.1.21",
    "auth": "api-key",
    "account": "configured",
    "connected": true,
    "installed": true,
    "description": "配置 Command Code Provider API、实时模型和账户额度。",
    "baseURL": {
      "value": "https://api.commandcode.ai/provider/v1",
      "editable": false
    },
    "catalogLabel": "获取实时目录",
    "contextDefault": 1000000,
    "efforts": [
      "low",
      "medium",
      "high",
      "xhigh",
      "max"
    ],
    "models": [
      {
        "uid": "gpt-5.6-luna",
        "id": "gpt-5.6-luna",
        "name": "GPT-5.6 Luna",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "claude-sonnet-5",
        "id": "claude-sonnet-5",
        "name": "Claude Sonnet 5",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Pro · 高级模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "claude-opus-5",
        "id": "claude-opus-5",
        "name": "Claude Opus 5",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Provider+ · 前沿模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      }
    ],
    "candidates": [
      {
        "uid": "gpt-5.6-sol",
        "id": "gpt-5.6-sol",
        "name": "GPT-5.6 Sol",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.6-luna",
        "id": "gpt-5.6-luna",
        "name": "GPT-5.6 Luna",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "google/gemini-3.7-flash",
        "id": "google/gemini-3.7-flash",
        "name": "Gemini 3.7 Flash",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "high"
        ]
      },
      {
        "uid": "google/gemini-3.8-flash",
        "id": "google/gemini-3.8-flash",
        "name": "Gemini 3.8 Flash",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "high"
        ]
      },
      {
        "uid": "google/gemini-3.6-flash",
        "id": "google/gemini-3.6-flash",
        "name": "Gemini 3.6 Flash",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "high"
        ]
      },
      {
        "uid": "xai/grok-4.6",
        "id": "xai/grok-4.6",
        "name": "Grok 4.6",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh"
        ]
      },
      {
        "uid": "xai/grok-4.5",
        "id": "xai/grok-4.5",
        "name": "Grok 4.5",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "high"
        ]
      },
      {
        "uid": "deepseek/deepseek-v4-pro",
        "id": "deepseek/deepseek-v4-pro",
        "name": "DeepSeek V4 Pro",
        "context": "",
        "vision": false,
        "thinking": true,
        "effort": "max",
        "group": "Go · 开源模型",
        "efforts": [
          "high",
          "max"
        ]
      },
      {
        "uid": "deepseek/deepseek-v4-flash",
        "id": "deepseek/deepseek-v4-flash",
        "name": "DeepSeek V4 Flash",
        "context": "",
        "vision": false,
        "thinking": true,
        "effort": "max",
        "group": "Go · 开源模型",
        "efforts": [
          "high",
          "max"
        ]
      },
      {
        "uid": "deepseek/deepseek-v4-flash-vision-exp",
        "id": "deepseek/deepseek-v4-flash-vision-exp",
        "name": "DeepSeek V4 Flash Vision Exp",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "group": "Go · 开源模型",
        "efforts": [
          "high",
          "max"
        ]
      },
      {
        "uid": "deepseek/deepseek-v4-flash-fast",
        "id": "deepseek/deepseek-v4-flash-fast",
        "name": "DeepSeek V4 Flash Fast",
        "context": "",
        "vision": false,
        "thinking": true,
        "effort": "max",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "high",
          "max"
        ]
      },
      {
        "uid": "moonshotai/kimi-k3",
        "id": "moonshotai/kimi-k3",
        "name": "Kimi K3",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "high",
          "max"
        ]
      },
      {
        "uid": "moonshotai/kimi-k2.7-code",
        "id": "moonshotai/kimi-k2.7-code",
        "name": "Kimi K2.7 Code",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "high",
          "max"
        ]
      },
      {
        "uid": "moonshotai/kimi-k2.7-code-highspeed",
        "id": "moonshotai/kimi-k2.7-code-highspeed",
        "name": "Kimi K2.7 Code Highspeed",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "high",
          "max"
        ]
      },
      {
        "uid": "moonshotai/kimi-k2.6",
        "id": "moonshotai/kimi-k2.6",
        "name": "Kimi K2.6",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "high",
          "max"
        ]
      },
      {
        "uid": "moonshotai/kimi-k2.5",
        "id": "moonshotai/kimi-k2.5",
        "name": "Kimi K2.5",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "high",
          "max"
        ]
      },
      {
        "uid": "z-ai/glm-5.3-flash",
        "id": "z-ai/glm-5.3-flash",
        "name": "GLM-5.3-Flash",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "high",
          "max"
        ]
      },
      {
        "uid": "zai-org/glm-5.3",
        "id": "zai-org/glm-5.3",
        "name": "GLM-5.3",
        "context": "",
        "vision": false,
        "thinking": true,
        "effort": "max",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "high",
          "max"
        ]
      },
      {
        "uid": "zai-org/glm-5.2",
        "id": "zai-org/glm-5.2",
        "name": "GLM-5.2",
        "context": "",
        "vision": false,
        "thinking": true,
        "effort": "max",
        "group": "Go · 开源模型",
        "efforts": [
          "high",
          "max"
        ]
      },
      {
        "uid": "minimax/minimax-m3-free",
        "id": "minimax/minimax-m3-free",
        "name": "MiniMax M3 Free",
        "context": "",
        "vision": true,
        "thinking": false,
        "effort": "",
        "group": "Go · 开源模型"
      },
      {
        "uid": "minimax/minimax-m2.7-free",
        "id": "minimax/minimax-m2.7-free",
        "name": "MiniMax M2.7 Free",
        "context": "",
        "vision": false,
        "thinking": true,
        "effort": "xhigh",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "xhigh"
        ]
      },
      {
        "uid": "minimaxai/minimax-m3",
        "id": "minimaxai/minimax-m3",
        "name": "MiniMax M3",
        "context": "",
        "vision": true,
        "thinking": false,
        "effort": "",
        "group": "Go · 开源模型"
      },
      {
        "uid": "minimaxai/minimax-m2.5",
        "id": "minimaxai/minimax-m2.5",
        "name": "MiniMax M2.5",
        "context": "",
        "vision": false,
        "thinking": true,
        "effort": "xhigh",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "xhigh"
        ]
      },
      {
        "uid": "xiaomi/mimo-v2.5",
        "id": "xiaomi/mimo-v2.5",
        "name": "MiMo-V2.5",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "xhigh"
        ]
      },
      {
        "uid": "xiaomi/mimo-v2.5-pro",
        "id": "xiaomi/mimo-v2.5-pro",
        "name": "MiMo-V2.5-Pro",
        "context": "",
        "vision": false,
        "thinking": true,
        "effort": "xhigh",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "xhigh"
        ]
      },
      {
        "uid": "qwen/qwen3.8-max",
        "id": "qwen/qwen3.8-max",
        "name": "Qwen3.8 Max",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "xhigh"
        ]
      },
      {
        "uid": "qwen/qwen3.8-max-0902",
        "id": "qwen/qwen3.8-max-0902",
        "name": "Qwen3.8 Max 0902",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "xhigh"
        ]
      },
      {
        "uid": "qwen/qwen3.8-27b",
        "id": "qwen/qwen3.8-27b",
        "name": "Qwen3.8 27B",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "xhigh"
        ]
      },
      {
        "uid": "qwen/qwen3.8-flash",
        "id": "qwen/qwen3.8-flash",
        "name": "Qwen3.8 Flash",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "xhigh"
        ]
      },
      {
        "uid": "qwen/qwen3.7-plus",
        "id": "qwen/qwen3.7-plus",
        "name": "Qwen3.7 Plus",
        "context": "",
        "vision": true,
        "thinking": false,
        "effort": "",
        "group": "Go · 开源模型"
      },
      {
        "uid": "qwen/qwen3.7-flash",
        "id": "qwen/qwen3.7-flash",
        "name": "Qwen3.7 Flash",
        "context": "",
        "vision": true,
        "thinking": false,
        "effort": "",
        "group": "Go · 开源模型"
      },
      {
        "uid": "qwen/qwen3.6-plus",
        "id": "qwen/qwen3.6-plus",
        "name": "Qwen3.6 Plus",
        "context": "",
        "vision": true,
        "thinking": false,
        "effort": "",
        "group": "Go · 开源模型"
      },
      {
        "uid": "stepfun/step-3.7-flash",
        "id": "stepfun/step-3.7-flash",
        "name": "Step 3.7 Flash",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "high"
        ]
      },
      {
        "uid": "stepfun/step-3.5-flash",
        "id": "stepfun/step-3.5-flash",
        "name": "Step 3.5 Flash",
        "context": "",
        "vision": false,
        "thinking": true,
        "effort": "high",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "high"
        ]
      },
      {
        "uid": "tencent/hy3",
        "id": "tencent/hy3",
        "name": "Hy3",
        "context": "",
        "vision": false,
        "thinking": true,
        "effort": "high",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "high"
        ]
      },
      {
        "uid": "tencent/hy3-paid",
        "id": "tencent/hy3-paid",
        "name": "Hy3 Paid",
        "context": "",
        "vision": false,
        "thinking": true,
        "effort": "high",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "high"
        ]
      },
      {
        "uid": "tencent/hy4-preview",
        "id": "tencent/hy4-preview",
        "name": "Hy4 Preview",
        "context": "",
        "vision": false,
        "thinking": true,
        "effort": "high",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "high"
        ]
      },
      {
        "uid": "meta/muse-spark-1.2",
        "id": "meta/muse-spark-1.2",
        "name": "Muse Spark 1.2",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh"
        ]
      },
      {
        "uid": "meta/muse-spark-1.2-contributor",
        "id": "meta/muse-spark-1.2-contributor",
        "name": "Muse Spark 1.2 Contributor",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh"
        ]
      },
      {
        "uid": "meta/muse-spark-1.3",
        "id": "meta/muse-spark-1.3",
        "name": "Muse Spark 1.3",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "meta/muse-spark-1.3-contributor",
        "id": "meta/muse-spark-1.3-contributor",
        "name": "Muse Spark 1.3 Contributor",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "group": "Go · 开源模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "thinkingmachines/inkling",
        "id": "thinkingmachines/inkling",
        "name": "Inkling",
        "context": "",
        "vision": true,
        "thinking": false,
        "effort": "",
        "group": "Go · 开源模型"
      },
      {
        "uid": "thinkingmachines/inkling-small",
        "id": "thinkingmachines/inkling-small",
        "name": "Inkling Small",
        "context": "",
        "vision": true,
        "thinking": false,
        "effort": "",
        "group": "Go · 开源模型"
      },
      {
        "uid": "gpt-5.6-terra",
        "id": "gpt-5.6-terra",
        "name": "GPT-5.6 Terra",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "group": "Pro · 高级模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.5",
        "id": "gpt-5.5",
        "name": "GPT-5.5",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "group": "Pro · 高级模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh"
        ]
      },
      {
        "uid": "gpt-5.4",
        "id": "gpt-5.4",
        "name": "GPT-5.4",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "group": "Pro · 高级模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh"
        ]
      },
      {
        "uid": "gpt-5.3-codex",
        "id": "gpt-5.3-codex",
        "name": "GPT-5.3 Codex",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "group": "Pro · 高级模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh"
        ]
      },
      {
        "uid": "gpt-5.4-mini",
        "id": "gpt-5.4-mini",
        "name": "GPT-5.4 mini",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Pro · 高级模型",
        "efforts": [
          "low",
          "medium",
          "high"
        ]
      },
      {
        "uid": "claude-sonnet-5",
        "id": "claude-sonnet-5",
        "name": "Claude Sonnet 5",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Pro · 高级模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "claude-sonnet-4-6",
        "id": "claude-sonnet-4-6",
        "name": "Claude Sonnet 4.6",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Pro · 高级模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "claude-haiku-4-5-20251001",
        "id": "claude-haiku-4-5-20251001",
        "name": "Claude Haiku 4.5",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Pro · 高级模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "google/gemini-3.5-flash",
        "id": "google/gemini-3.5-flash",
        "name": "Gemini 3.5 Flash",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Pro · 高级模型",
        "efforts": [
          "low",
          "medium",
          "high"
        ]
      },
      {
        "uid": "google/gemini-3.5-flash-lite",
        "id": "google/gemini-3.5-flash-lite",
        "name": "Gemini 3.5 Flash Lite",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Pro · 高级模型",
        "efforts": [
          "low",
          "medium",
          "high"
        ]
      },
      {
        "uid": "google/gemini-3.1-flash-lite",
        "id": "google/gemini-3.1-flash-lite",
        "name": "Gemini 3.1 Flash Lite",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Pro · 高级模型",
        "efforts": [
          "low",
          "medium",
          "high"
        ]
      },
      {
        "uid": "sakana/fugu-ultra",
        "id": "sakana/fugu-ultra",
        "name": "Fugu Ultra",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "group": "Pro · 高级模型",
        "efforts": [
          "high",
          "xhigh"
        ]
      },
      {
        "uid": "meta/muse-spark-1.1",
        "id": "meta/muse-spark-1.1",
        "name": "Muse Spark 1.1",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "group": "Pro · 高级模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh"
        ]
      },
      {
        "uid": "claude-fable-5",
        "id": "claude-fable-5",
        "name": "Claude Fable 5",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Provider+ · 前沿模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "claude-fable-5-1",
        "id": "claude-fable-5-1",
        "name": "Claude Fable 5.1",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Pro · 高级模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "claude-opus-5",
        "id": "claude-opus-5",
        "name": "Claude Opus 5",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Provider+ · 前沿模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "claude-opus-4-8",
        "id": "claude-opus-4-8",
        "name": "Claude Opus 4.8",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Provider+ · 前沿模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "claude-opus-4-7",
        "id": "claude-opus-4-7",
        "name": "Claude Opus 4.7",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Provider+ · 前沿模型",
        "efforts": [
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "claude-opus-4-6",
        "id": "claude-opus-4-6",
        "name": "Claude Opus 4.6",
        "context": "",
        "vision": false,
        "thinking": false,
        "effort": "",
        "group": "Provider+ · 前沿模型"
      },
      {
        "uid": "claude-opus-4-5-20251101",
        "id": "claude-opus-4-5-20251101",
        "name": "Claude Opus 4.5",
        "context": "",
        "vision": false,
        "thinking": false,
        "effort": "",
        "group": "Provider+ · 前沿模型"
      }
    ],
    "quota": {
      "status": "ready",
      "windows": [
        {
          "id": "weekly",
          "label": "每周窗口",
          "remaining": 100,
          "reset": null,
          "period": "每周"
        },
        {
          "id": "fiveHour",
          "label": "5 小时窗口",
          "remaining": 72,
          "reset": "2026-09-10T14:34:00+08:00",
          "period": "每5小时"
        }
      ],
      "facts": [
        {
          "label": "账户",
          "value": "Ada Chen"
        },
        {
          "label": "套餐",
          "value": "Provider"
        },
        {
          "label": "状态",
          "value": "active"
        },
        {
          "label": "计费周期结束",
          "value": "2026-09-30T23:59:59+08:00"
        },
        {
          "label": "月度额度",
          "value": "$15"
        },
        {
          "label": "购买额度",
          "value": "$4"
        },
        {
          "label": "免费额度",
          "value": "$1"
        },
        {
          "label": "周期成本",
          "value": "$1.25"
        },
        {
          "label": "周期 tokens",
          "value": "100 in + 50 out"
        }
      ],
      "activity": []
    },
    "advanced": [
      {
        "key": "zeroDataRetention",
        "label": "零数据留存",
        "type": "checkbox",
        "value": false,
        "hint": "会添加 x-cmd-zdr: 1；没有模型强制需要它，但无可用 ZDR upstream 时可能返回 HTTP 422。"
      }
    ]
  },
  {
    "id": "cursor",
    "name": "Cursor",
    "role": "llm",
    "version": "0.2.18",
    "auth": "cursor",
    "account": "cursor-demo@example.com",
    "connected": true,
    "installed": true,
    "description": "非官方。走 Cursor CLI 私有会话入口。Cursor 员工认定此类用法违反 ToS，账号可能被封。",
    "notice": "Unofficial / ToS 风险。maxMode 只存在于拉取结果，不是卡片勾选项。思考等级在对话里选，不在选取器里。",
    "catalogLabel": "登录后从账户获取",
    "contextDefault": 200000,
    "efforts": [
      "none",
      "low",
      "medium",
      "high",
      "xhigh",
      "max"
    ],
    "models": [],
    "candidates": [
      {
        "uid": "auto",
        "id": "auto",
        "name": "Auto",
        "context": "",
        "vision": true,
        "thinking": false,
        "effort": "",
        "group": "Auto",
        "hint": "Cursor 代选，wire id 为 default"
      },
      {
        "uid": "composer-2.5",
        "id": "composer-2.5",
        "name": "Composer 2.5",
        "context": "200000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Cursor",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "composer-2.5-fast",
        "id": "composer-2.5-fast",
        "name": "Composer 2.5 Fast",
        "context": "200000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Cursor",
        "hint": "Fast 独立行",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "grok-4.6",
        "id": "grok-4.6",
        "name": "Cursor Grok 4.6",
        "context": "256000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Cursor",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "grok-4.6-fast",
        "id": "grok-4.6-fast",
        "name": "Cursor Grok 4.6 Fast",
        "context": "256000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Cursor",
        "hint": "Fast 独立行",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.6-sol",
        "id": "gpt-5.6-sol",
        "name": "GPT-5.6 Sol",
        "context": "272000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "OpenAI",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.5",
        "id": "gpt-5.5",
        "name": "GPT-5.5",
        "context": "272000",
        "vision": true,
        "thinking": true,
        "effort": "xhigh",
        "group": "OpenAI",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.2",
        "id": "gpt-5.2",
        "name": "GPT-5.2",
        "context": "200000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "OpenAI",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.2-fast",
        "id": "gpt-5.2-fast",
        "name": "GPT-5.2 Fast",
        "context": "200000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "OpenAI",
        "hint": "Fast 独立行",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.3-codex",
        "id": "gpt-5.3-codex",
        "name": "GPT-5.3 Codex",
        "context": "200000",
        "vision": true,
        "thinking": false,
        "effort": "",
        "group": "OpenAI"
      },
      {
        "uid": "claude-opus-5",
        "id": "claude-opus-5",
        "name": "Claude Opus 5",
        "context": "300000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Anthropic",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "claude-opus-5-1m",
        "id": "claude-opus-5-1m",
        "name": "Claude Opus 5 Max",
        "context": "1000000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Anthropic",
        "hint": "1M 独立行",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "claude-fable-5",
        "id": "claude-fable-5",
        "name": "Claude Fable 5",
        "context": "300000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Anthropic",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "claude-4.6-sonnet",
        "id": "claude-4.6-sonnet",
        "name": "Claude 4.6 Sonnet",
        "context": "300000",
        "vision": true,
        "thinking": true,
        "effort": "medium",
        "group": "Anthropic",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "claude-4.6-sonnet-1m",
        "id": "claude-4.6-sonnet-1m",
        "name": "Claude 4.6 Sonnet Max",
        "context": "1000000",
        "vision": true,
        "thinking": true,
        "effort": "medium",
        "group": "Anthropic",
        "hint": "1M 独立行",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      }
    ],
    "quota": {
      "status": "ready",
      "windows": [
        {
          "id": "cursor-models",
          "label": "Cursor Models",
          "remaining": 49.9,
          "reset": "2026-09-17T00:00:00+08:00",
          "period": "计费周期"
        },
        {
          "id": "other-models",
          "label": "Other Models",
          "remaining": 64,
          "reset": "2026-09-17T00:00:00+08:00",
          "period": "计费周期"
        }
      ],
      "facts": [
        {
          "label": "计费周期结束",
          "value": "2026-09-17T00:00:00+08:00"
        },
        {
          "label": "Personal Usage",
          "value": "无限"
        },
        {
          "label": "On-Demand",
          "value": "重置时间未提供"
        }
      ],
      "activity": []
    },
    "advanced": []
  },
  {
    "id": "ollama",
    "name": "Ollama Cloud",
    "role": "llm",
    "version": "0.6.19",
    "auth": "api-key",
    "account": "configured",
    "connected": true,
    "installed": true,
    "description": "配置原生 Ollama Cloud API 密钥、地址和模型目录。",
    "baseURL": {
      "value": "https://ollama.com/api",
      "editable": true
    },
    "catalogLabel": "发现模型",
    "contextDefault": 262144,
    "efforts": [
      "off",
      "low",
      "medium",
      "high",
      "xhigh",
      "max"
    ],
    "models": [],
    "candidates": [
      {
        "uid": "gpt-oss:20b",
        "id": "gpt-oss:20b",
        "name": "gpt-oss:20b",
        "context": "",
        "vision": false,
        "thinking": true,
        "effort": "medium",
        "efforts": [
          "low",
          "medium",
          "high"
        ]
      },
      {
        "uid": "gemma3",
        "id": "gemma3",
        "name": "gemma3",
        "context": "131072",
        "vision": true,
        "thinking": false,
        "effort": ""
      },
      {
        "uid": "qwen3",
        "id": "qwen3",
        "name": "qwen3",
        "context": "131072",
        "vision": false,
        "thinking": true,
        "effort": "low",
        "efforts": [
          "off",
          "low",
          "medium",
          "high",
          "max"
        ]
      },
      {
        "uid": "qwen3-1m-fast",
        "id": "qwen3-1m-fast",
        "name": "qwen3 1M Fast",
        "context": "1000000",
        "vision": false,
        "thinking": true,
        "effort": "low",
        "hint": "Fast + 1M 独立行",
        "efforts": [
          "off",
          "low",
          "medium",
          "high",
          "max"
        ]
      },
      {
        "uid": "deepseek-v4-flash:0731",
        "id": "deepseek-v4-flash:0731",
        "name": "deepseek-v4-flash:0731",
        "context": "",
        "vision": false,
        "thinking": true,
        "effort": "high",
        "efforts": [
          "off",
          "low",
          "high",
          "max"
        ]
      },
      {
        "uid": "kimi-k2.7-code",
        "id": "kimi-k2.7-code",
        "name": "kimi-k2.7-code",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "efforts": [
          "high"
        ]
      },
      {
        "uid": "kimi-k3-max",
        "id": "kimi-k3-max",
        "name": "kimi-k3-max",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "max",
        "hint": "产品名 -max，不剥成上下文档",
        "efforts": [
          "low",
          "high",
          "max"
        ]
      },
      {
        "uid": "glm-5.2",
        "id": "glm-5.2",
        "name": "glm-5.2",
        "context": "",
        "vision": false,
        "thinking": true,
        "effort": "max",
        "efforts": [
          "off",
          "high",
          "max"
        ]
      },
      {
        "uid": "minimax-m3",
        "id": "minimax-m3",
        "name": "minimax-m3",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "efforts": [
          "off",
          "high"
        ]
      },
      {
        "uid": "llava",
        "id": "llava",
        "name": "LLaVA",
        "context": "",
        "vision": true,
        "thinking": false,
        "effort": ""
      }
    ],
    "quota": {
      "status": "empty",
      "windows": [],
      "facts": [
        {
          "label": "额度",
          "value": "暂无额度数据"
        }
      ],
      "activity": [
        {
          "name": "deepseek-v4-flash:0731",
          "count": 784
        },
        {
          "name": "gpt-oss:20b",
          "count": 42
        },
        {
          "name": "gemma3",
          "count": 11
        }
      ]
    },
    "advanced": []
  },
  {
    "id": "antigravity",
    "name": "Antigravity",
    "role": "agent",
    "version": "0.1.4",
    "auth": "google",
    "account": "google-demo@example.com",
    "connected": true,
    "installed": true,
    "description": "原生 ACP 运行时，无需 CLI。",
    "catalogLabel": "获取可用模型",
    "contextDefault": 1048576,
    "efforts": [
      "high",
      "medium",
      "low"
    ],
    "models": [
      {
        "uid": "gemini-3.8-flash",
        "id": "gemini-3.8-flash",
        "name": "Gemini 3.8 Flash",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "efforts": [
          "high",
          "medium",
          "low"
        ]
      },
      {
        "uid": "gemini-3.7-flash",
        "id": "gemini-3.7-flash",
        "name": "Gemini 3.7 Flash",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "efforts": [
          "high",
          "medium",
          "low"
        ]
      },
      {
        "uid": "gemini-3.6-flash",
        "id": "gemini-3.6-flash",
        "name": "Gemini 3.6 Flash",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "efforts": [
          "high",
          "medium",
          "low"
        ]
      },
      {
        "uid": "gemini-pro-agent",
        "id": "gemini-pro-agent",
        "name": "Gemini 3.1 Pro",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "efforts": [
          "high",
          "medium",
          "low"
        ]
      }
    ],
    "candidates": [
      {
        "uid": "gemini-3.8-flash",
        "id": "gemini-3.8-flash",
        "name": "Gemini 3.8 Flash",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "hint": "折叠 high/medium/low",
        "efforts": [
          "high",
          "medium",
          "low"
        ]
      },
      {
        "uid": "gemini-3.7-flash",
        "id": "gemini-3.7-flash",
        "name": "Gemini 3.7 Flash",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "hint": "折叠 high/medium/low",
        "efforts": [
          "high",
          "medium",
          "low"
        ]
      },
      {
        "uid": "gemini-3.6-flash",
        "id": "gemini-3.6-flash",
        "name": "Gemini 3.6 Flash",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "hint": "折叠 high/medium/low",
        "efforts": [
          "high",
          "medium",
          "low"
        ]
      },
      {
        "uid": "gemini-pro-agent",
        "id": "gemini-pro-agent",
        "name": "Gemini 3.1 Pro",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "hint": "账户 native id gemini-pro-agent",
        "efforts": [
          "high",
          "medium",
          "low"
        ]
      },
      {
        "uid": "gemini-3.1-pro",
        "id": "gemini-3.1-pro",
        "name": "Gemini 3.1 Pro",
        "context": "",
        "vision": true,
        "thinking": true,
        "effort": "low",
        "hint": "由 gemini-3.1-pro-low 折叠",
        "efforts": [
          "high",
          "medium",
          "low"
        ]
      }
    ],
    "quota": {
      "status": "ready",
      "windows": [
        {
          "id": "gemini-weekly",
          "label": "Gemini · 每周",
          "remaining": 97,
          "reset": "2026-09-11T03:24:33+08:00",
          "period": "每周"
        },
        {
          "id": "gemini-5h",
          "label": "Gemini · 5 小时",
          "remaining": 83,
          "reset": "2026-09-10T14:34:00+08:00",
          "period": "每5小时"
        },
        {
          "id": "claude-weekly",
          "label": "Claude / GPT · 每周",
          "remaining": 64,
          "reset": "2026-09-17T00:00:00+08:00",
          "period": "每周"
        },
        {
          "id": "claude-5h",
          "label": "Claude / GPT · 5 小时",
          "remaining": 92,
          "reset": "2026-09-10T14:34:00+08:00",
          "period": "每5小时"
        }
      ],
      "facts": [
        {
          "label": "更新时间",
          "value": "2026-09-10T09:34:00+08:00"
        }
      ],
      "activity": []
    },
    "advanced": []
  },
  {
    "id": "cursor-acp",
    "name": "Cursor ACP",
    "role": "agent",
    "version": "0.1.5",
    "auth": "cursor-cli",
    "account": "",
    "connected": false,
    "installed": true,
    "development": true,
    "description": "开发中的 Cursor Agent ACP 接入示例。线上 web profile 未安装本包。",
    "notice": "登录走 cursor-agent CLI（cursor.com/loginDeepControl）。主机不打开浏览器，也没有 127.0.0.1 回调粘贴。额度接口不受支持。思考等级来自 catalog-group，不是 CCPA。",
    "catalogLabel": "获取 ACP 模型",
    "contextDefault": 200000,
    "efforts": [
      "none",
      "low",
      "medium",
      "high",
      "xhigh",
      "max"
    ],
    "models": [
      {
        "uid": "composer-2.5",
        "id": "composer-2.5",
        "name": "Composer 2.5",
        "context": "200000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Cursor",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "grok-4.6",
        "id": "grok-4.6",
        "name": "Cursor Grok 4.6",
        "context": "256000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Cursor",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      }
    ],
    "candidates": [
      {
        "uid": "composer-2.5",
        "id": "composer-2.5",
        "name": "Composer 2.5",
        "context": "200000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Cursor",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "composer-2.5-fast",
        "id": "composer-2.5-fast",
        "name": "Composer 2.5 Fast",
        "context": "200000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Cursor",
        "hint": "Fast 独立行",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "grok-4.6",
        "id": "grok-4.6",
        "name": "Cursor Grok 4.6",
        "context": "256000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Cursor",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.2",
        "id": "gpt-5.2",
        "name": "GPT-5.2",
        "context": "200000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "OpenAI",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.2-fast",
        "id": "gpt-5.2-fast",
        "name": "GPT-5.2 Fast",
        "context": "200000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "OpenAI",
        "hint": "Fast 独立行",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "gpt-5.6-sol",
        "id": "gpt-5.6-sol",
        "name": "GPT-5.6 Sol",
        "context": "272000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "OpenAI",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "claude-opus-5",
        "id": "claude-opus-5",
        "name": "Claude Opus 5",
        "context": "300000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Anthropic",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "claude-opus-5-1m",
        "id": "claude-opus-5-1m",
        "name": "Claude Opus 5 Max",
        "context": "1000000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Anthropic",
        "hint": "1M 独立行",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "uid": "claude-fable-5",
        "id": "claude-fable-5",
        "name": "Claude Fable 5",
        "context": "300000",
        "vision": true,
        "thinking": true,
        "effort": "high",
        "group": "Anthropic",
        "efforts": [
          "none",
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      }
    ],
    "quota": {
      "status": "unsupported",
      "windows": [],
      "facts": [
        {
          "label": "额度",
          "value": "此接入不提供剩余额度接口"
        }
      ],
      "activity": []
    },
    "advanced": []
  }
];
