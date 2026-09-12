import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import "react";
//#region lib/types/usage-readers.js
/** Non-empty string guard shared by the reader factories and the sidebar cache validator. */
function nonEmptyString(value) {
	return typeof value === "string" && value.length > 0;
}
function formatRemainingDuration(ms) {
	const rtf = new Intl.RelativeTimeFormat(void 0, { numeric: "always" });
	const days = Math.round(ms / 864e5);
	if (Math.abs(days) >= 1) return rtf.format(days, "day");
	const hours = Math.round(ms / 36e5);
	if (Math.abs(hours) >= 1) return rtf.format(hours, "hour");
	const minutes = Math.max(1, Math.round(Math.abs(ms) / 6e4));
	return rtf.format(ms < 0 ? -minutes : minutes, "minute");
}
function parseResetTime(resetsAt) {
	if (/^\d{4}-\d{2}-\d{2}/u.test(resetsAt)) {
		const iso = Date.parse(resetsAt);
		return Number.isFinite(iso) ? iso : void 0;
	}
	if (!/^\d{10,}$/u.test(resetsAt)) return void 0;
	const n = Number(resetsAt);
	if (!Number.isFinite(n) || n <= 0) return void 0;
	return n < 0xe8d4a51000 ? n * 1e3 : n;
}
/** System-zone instant for a reset ISO. Language copy stays in the UI. */
function formatResetInstant(resetsAt) {
	if (!nonEmptyString(resetsAt)) return void 0;
	const time = parseResetTime(resetsAt);
	if (time === void 0) return void 0;
	const delta = time - Date.now();
	if (delta < -3456e7 || delta > 6912e7) return void 0;
	return {
		when: new Intl.DateTimeFormat(void 0, {
			dateStyle: "short",
			timeStyle: "short"
		}).format(new Date(time)),
		overdue: delta <= 0,
		relative: formatRemainingDuration(delta)
	};
}
/** Compose a reset caption. Missing ISO never becomes a fake calendar date. */
function formatResetLabel(resetsAt, period, copy) {
	const instant = formatResetInstant(resetsAt);
	if (instant !== void 0) return ((copy === void 0 ? "" : instant.overdue ? copy.overdue : copy.at) + instant.when + " · " + instant.relative).replace(/^ · /, "");
	if (nonEmptyString(resetsAt) && /reset|重置/iu.test(resetsAt)) return resetsAt;
	if (period === void 0 || period.length === 0) return void 0;
	return copy === void 0 ? period : copy.missing.replace("{period}", period);
}
//#endregion
//#region lib/types/client/provider-ui.js
/**
* Normalize remaining quota to a 0-100 percent value.
* Valid readings keep their precision (99.9 stays 99.9, never rounds to 100).
* NaN, Infinity, and out-of-range readings are unavailable, not clamped:
* clamping would fabricate a full or empty bar from bad data.
* @param input - percent and/or fraction quota reading.
* @returns the 0-100 remaining value, or undefined when unavailable.
*/
function normalizeQuotaRemaining(input) {
	const percent = input.remainingPercent;
	if (percent !== void 0) return Number.isFinite(percent) && percent >= 0 && percent <= 100 ? percent : void 0;
	const fraction = input.remainingFraction;
	if (fraction !== void 0) return Number.isFinite(fraction) && fraction >= 0 && fraction <= 1 ? fraction * 100 : void 0;
}
const meterWrapStyle = {
	display: "flex",
	flexDirection: "column",
	gap: 5,
	minWidth: 0
};
const meterTopStyle = {
	display: "flex",
	alignItems: "baseline",
	justifyContent: "space-between",
	gap: 8
};
const meterLabelStyle = {
	minWidth: 0,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
	color: "var(--dsw-alias-label-secondary)",
	fontSize: 12,
	lineHeight: "18px"
};
const meterValueStyle = {
	flex: "none",
	fontVariantNumeric: "tabular-nums",
	fontWeight: 500,
	fontSize: 12,
	lineHeight: "18px",
	color: "var(--dsw-alias-label-primary)"
};
const meterTrackStyle = {
	display: "block",
	width: "100%",
	height: 6,
	overflow: "hidden",
	border: 0,
	borderRadius: 2,
	background: "color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent)",
	position: "relative"
};
const meterFillBase = {
	display: "block",
	height: "100%",
	borderRadius: 2,
	position: "relative",
	background: "color-mix(in srgb, var(--dsw-alias-label-primary) 55%, var(--dsw-alias-label-secondary))"
};
const meterKnobStyle = {
	position: "absolute",
	right: 0,
	top: 0,
	bottom: 0,
	width: 2,
	background: "var(--dsw-alias-label-primary)"
};
const meterSegmentsStyle = {
	position: "absolute",
	inset: 0,
	pointerEvents: "none",
	background: "repeating-linear-gradient(to right, transparent 0, transparent calc(10% - 1px), var(--dsw-alias-bg-layer-1) calc(10% - 1px), var(--dsw-alias-bg-layer-1) 10%)"
};
/** Approved A low-quota fill: amber only, no red tier, no hardcoded hue. */
const meterWarnFill = { background: "var(--dsw-alias-state-warn-primary)" };
const meterDetailStyle = {
	color: "var(--dsw-alias-label-tertiary)",
	fontSize: 11,
	lineHeight: "16px"
};
const meterMissingStyle = {
	color: "var(--dsw-alias-label-tertiary)",
	fontSize: 12,
	lineHeight: "18px"
};
/** Segmented remaining-quota meter. Unavailable quota renders a placeholder, never a zero bar. */
function ProviderQuotaMeter(props) {
	const remaining = normalizeQuotaRemaining(props);
	const label = props.label ?? "Quota";
	if (remaining === void 0) return jsx("span", {
		"data-provider-quota-missing": "",
		style: meterMissingStyle,
		children: props.emptyLabel ?? "—"
	});
	const warn = remaining < 20;
	const text = String(remaining);
	return jsxs("span", {
		"data-provider-quota": "",
		style: meterWrapStyle,
		...props.id === void 0 ? {} : { id: props.id },
		children: [
			jsxs("span", {
				style: meterTopStyle,
				children: [jsx("span", {
					style: meterLabelStyle,
					children: label
				}), jsx("span", {
					style: meterValueStyle,
					children: text + "%"
				})]
			}),
			jsxs("span", {
				"data-provider-quota-meter": "",
				role: "meter",
				"aria-label": label,
				"aria-valuemin": 0,
				"aria-valuemax": 100,
				"aria-valuenow": remaining,
				style: meterTrackStyle,
				children: [jsx("span", {
					style: {
						...meterFillBase,
						...warn ? meterWarnFill : {},
						width: text + "%"
					},
					children: jsx("span", { style: meterKnobStyle })
				}), jsx("span", {
					"aria-hidden": "true",
					style: meterSegmentsStyle
				})]
			}),
			props.detail === void 0 ? null : jsx("span", {
				style: meterDetailStyle,
				children: props.detail
			})
		]
	});
}
const headerBadgeBase = {
	display: "inline-flex",
	alignItems: "center",
	gap: 4,
	whiteSpace: "nowrap",
	fontSize: 10,
	fontWeight: 500,
	lineHeight: "16px",
	padding: "0 5px",
	borderRadius: 3,
	border: "1px solid transparent"
};
const headerBadgeLlm = {
	color: "var(--dsw-alias-label-secondary)",
	borderColor: "var(--dsw-alias-border-l2)",
	background: "transparent"
};
const headerBadgeAgent = {
	color: "var(--dsw-alias-bg-layer-1)",
	borderColor: "var(--dsw-alias-label-primary)",
	background: "var(--dsw-alias-label-primary)"
};
/**
* Monochrome role badge: outlined message glyph for LLM, filled terminal glyph
* for Agent. Shared by migrated card headers and the shell legacy fallback.
*/
function ProviderRoleBadge(props) {
	const agent = (props.role ?? "llm") === "agent";
	return jsxs("span", {
		"data-provider-role-badge": agent ? "agent" : "llm",
		style: {
			...headerBadgeBase,
			...agent ? headerBadgeAgent : headerBadgeLlm
		},
		children: [jsx("svg", {
			viewBox: "0 0 16 16",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: 1.4,
			"aria-hidden": "true",
			children: agent ? jsxs(Fragment, { children: [jsx("rect", {
				x: "1.5",
				y: "2",
				width: "13",
				height: "12",
				rx: "2"
			}), jsx("path", { d: "m4 5 3 3-3 3m5 0h3" })] }) : jsxs(Fragment, { children: [jsx("rect", {
				x: "2",
				y: "2",
				width: "12",
				height: "9",
				rx: "3"
			}), jsx("path", { d: "m5 11-1 3 5-3M5 6h6" })] })
		}), agent ? "Agent" : "LLM"]
	});
}
[
	"[data-provider-card]{box-sizing:border-box;width:100%;min-width:0;list-style:none;margin:0!important;border:0!important;border-radius:0!important;background:none!important;box-shadow:none!important;overflow:visible}",
	"[data-provider-card-header]{box-sizing:border-box;width:100%;min-height:76px!important;display:flex;align-items:center;justify-content:space-between;gap:16px;border:0;padding:12px 14px!important;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer}",
	"[data-provider-body][hidden]{display:none!important}",
	"[data-provider-role-badge] svg{width:12px;height:12px}",
	"[data-provider-card-header]:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent)}",
	"[data-provider-body]{display:flex;flex-direction:column;gap:18px;border-top:1px solid var(--dsw-alias-border-l2);padding:16px 14px 18px}",
	"[data-provider-model]{display:flex;align-items:center;gap:9px;min-height:40px}",
	"[data-provider-quota-mini]{display:block}",
	"[data-providers-list]{display:flex;flex-direction:column}",
	"[data-providers-list] [data-sortable-row]+[data-sortable-row]{border-top:1px solid var(--dsw-alias-border-l2)}",
	"[data-providers-section]{container-type:inline-size}",
	"@media (max-width:680px){[data-provider-card-header]{min-height:106px!important;padding:17px 4px!important}[data-provider-header-main]{display:grid!important;grid-template-columns:minmax(0,1fr) auto;gap:7px 9px!important;align-items:center}[data-provider-header-identity]{grid-column:1;grid-row:1;gap:9px!important}[data-provider-header-mark]{width:25px!important;height:25px!important}[data-provider-role-badge]{margin-left:4px;font-size:9px!important}[data-provider-role-badge] svg{width:11px!important;height:11px!important}[data-provider-header-side]{grid-column:2;grid-row:1;justify-self:end}[data-provider-header-side] [data-provider-header-chevron]{width:18px}[data-provider-quota-mini]{grid-column:1;grid-row:2;width:auto!important;max-width:none!important;text-align:left;padding-left:34px!important}[data-provider-header-status]{grid-column:2;grid-row:2;width:auto!important;max-width:100px}[data-provider-model]{min-height:48px}[data-provider-model] input[type=checkbox]{width:17px;height:17px}[data-providers-section] button,[data-provider-card] button{min-height:44px}}",
	"@container (max-width:540px){[data-provider-card-header]{min-height:106px!important;padding:17px 4px!important}[data-provider-header-main]{display:grid!important;grid-template-columns:minmax(0,1fr) auto;gap:7px 9px!important;align-items:center}[data-provider-header-identity]{grid-column:1;grid-row:1;gap:9px!important}[data-provider-header-mark]{width:25px!important;height:25px!important}[data-provider-role-badge]{margin-left:4px;font-size:9px!important}[data-provider-role-badge] svg{width:11px!important;height:11px!important}[data-provider-header-side]{grid-column:2;grid-row:1;justify-self:end}[data-provider-header-side] [data-provider-header-chevron]{width:18px}[data-provider-quota-mini]{grid-column:1;grid-row:2;width:auto!important;max-width:none!important;text-align:left;padding-left:34px!important}[data-provider-header-status]{grid-column:2;grid-row:2;width:auto!important;max-width:100px}[data-provider-model]{min-height:48px}[data-provider-model] input[type=checkbox]{width:17px;height:17px}[data-providers-section] button,[data-provider-card] button{min-height:44px}}",
	"@media (pointer:coarse){[data-sortable-handle],[data-sortable-move]{min-width:44px;min-height:44px}}"
].join("\n");
new Map(Object.entries({
	"llm-cursor": "cursor",
	"llm-grok": "grok",
	"llm-codex": "codex",
	"llm-ollama": "ollama-cloud",
	"llm-commandcode": "commandcode",
	"llm-opencode-go": "opencode-go"
}).map(([key, route]) => [route, key]));
//#endregion
//#region lib/types/client/provider-section.js
/** Locale copy: empty state names all six providers. */
const copy = {
	zh: {
		nav: "LLM 供应商",
		title: "LLM 供应商",
		subtitle: "先看账户额度，再进入独立详情页配置。",
		empty: "安装 Cursor、Grok、Codex、Ollama Cloud、CommandCode 或 OpenCode Go 后，在这里连接账号并选择模型。",
		drag: "拖动排序",
		sort: "Provider 排序",
		done: "完成排序",
		modelCount: "{n} 个模型",
		moveUp: "上移",
		moveDown: "下移",
		sidebarToggle: "在侧边栏显示",
		sidebarToggleHint: "仅控制 Task Panel 的额度区域",
		filterAll: "全部",
		filterLlm: "LLM",
		filterAgent: "Agent",
		details: "详情",
		overview: "返回总览",
		connected: "已连接",
		configured: "已配置",
		unconnected: "未连接",
		connectedCount: "已连接的 Provider",
		connectedHint: "额度属于各自账户，不合并统计，也不互相替代。",
		colProvider: "Provider / 连接状态",
		colQuota: "主要窗口 · 剩余额度",
		colConfig: "配置",
		systemZone: "系统时区",
		breadcrumbOverview: "额度总览",
		quotaHeading: "剩余额度",
		quotaMeta: "账户剩余额度 · 各窗口独立计量",
		connectToSee: "连接后查看额度",
		unsupportedQuota: "暂不支持额度查询",
		loadingQuota: "正在读取额度…",
		errorQuota: "额度读取失败",
		resetAt: "重置于 ",
		resetOverdue: "已到期，等待更新 · ",
		resetMissing: "{period} · 重置时间未提供",
		refresh: "刷新",
		refreshing: "刷新中",
		accountHeading: "账号与连接",
		advancedHeading: "高级设置",
		advancedNote: "可选能力与工具",
		accountOauthMeta: "订阅授权，不使用 API Key",
		accountApiMeta: "API Key · 不会回显已保存的密钥",
		expandAll: "全部展开",
		collapseAll: "全部收起",
		modelsHeading: "模型",
		modelsCount: "{n} 个",
		modelsHint: "名称和 ID 始终显示；展开箭头查看容量与能力参数。",
		sortModels: "排序",
		chooseFromAccount: "从账户目录选取",
		addModel: "手动添加模型"
	},
	en: {
		nav: "LLM Providers",
		title: "LLM Providers",
		subtitle: "Review account quota, then open an independent detail page to configure.",
		empty: "Install Cursor, Grok, Codex, Ollama Cloud, CommandCode, or OpenCode Go to connect an account and pick models here.",
		drag: "Reorder",
		sort: "Sort providers",
		done: "Done sorting",
		modelCount: "{n} models",
		moveUp: "Move up",
		moveDown: "Move down",
		sidebarToggle: "Show in sidebar",
		sidebarToggleHint: "Only the Task Panel quota block",
		filterAll: "All",
		filterLlm: "LLM",
		filterAgent: "Agent",
		details: "Details",
		overview: "Back to overview",
		connected: "Connected",
		configured: "Configured",
		unconnected: "Not connected",
		connectedCount: "Connected providers",
		connectedHint: "Quota belongs to each account. Totals are not merged.",
		colProvider: "Provider / connection",
		colQuota: "Primary window · remaining",
		colConfig: "Setup",
		systemZone: "System time zone",
		breadcrumbOverview: "Quota overview",
		quotaHeading: "Remaining quota",
		quotaMeta: "Account remaining · each window is independent",
		connectToSee: "Connect to see quota",
		unsupportedQuota: "Quota is not available",
		loadingQuota: "Reading quota…",
		errorQuota: "Could not read quota",
		resetAt: "Resets ",
		resetOverdue: "Expired, waiting for update · ",
		resetMissing: "{period} · reset time not provided",
		refresh: "Refresh",
		refreshing: "Refreshing",
		accountHeading: "Account",
		advancedHeading: "Advanced",
		advancedNote: "Optional capabilities",
		accountOauthMeta: "Subscription · no API key",
		accountApiMeta: "API Key · saved keys are never echoed",
		expandAll: "Expand all",
		collapseAll: "Collapse all",
		modelsHeading: "Models",
		modelsCount: "{n}",
		modelsHint: "Names and IDs always show; expand a row for capacity and capability parameters.",
		sortModels: "Sort",
		chooseFromAccount: "Choose from account",
		addModel: "Add model manually"
	}
};
//#endregion
//#region lib/types/client/provider-detail.js
function detailCopyOf(locale) {
	const source = copy[locale];
	return {
		details: source.details,
		connected: source.connected,
		configured: source.configured,
		unconnected: source.unconnected,
		modelCount: source.modelCount,
		quotaHeading: source.quotaHeading,
		quotaMeta: source.quotaMeta,
		refresh: source.refresh,
		refreshing: source.refreshing,
		accountHeading: source.accountHeading,
		modelsHeading: source.modelsHeading,
		modelsCount: source.modelsCount,
		modelsHint: source.modelsHint,
		expandAll: source.expandAll,
		collapseAll: source.collapseAll,
		sort: source.sortModels,
		done: source.done,
		chooseFromAccount: source.chooseFromAccount,
		addModel: source.addModel,
		advancedHeading: source.advancedHeading,
		advancedNote: source.advancedNote,
		connectToSee: source.connectToSee,
		unsupportedQuota: source.unsupportedQuota,
		loadingQuota: source.loadingQuota,
		errorQuota: source.errorQuota,
		resetAt: source.resetAt,
		resetOverdue: source.resetOverdue,
		resetMissing: source.resetMissing
	};
}
/** Shared detail copy so every plugin renders the same words. */
const providerDetailCopy = {
	zh: detailCopyOf("zh"),
	en: detailCopyOf("en")
};
function quotaEmptyLabel(status, copy) {
	if (status === "unsupported") return copy.unsupportedQuota;
	if (status === "loading") return copy.loadingQuota;
	if (status === "error") return copy.errorQuota;
	return copy.connectToSee;
}
/**
* The single provider detail layout: identity, notice, account, quota, models,
* advanced, footer. Plugins pass data and content; geometry and copy live here so
* every provider looks and reads the same.
*/
function ProviderDetail(props) {
	const account = props.account;
	const state = account?.state ?? "unconnected";
	const stateLabel = state === "connected" ? props.copy.connected : state === "configured" ? props.copy.configured : props.copy.unconnected;
	const count = props.models?.count;
	return jsxs("article", {
		className: "c-full",
		"data-provider-detail": "",
		children: [
			jsx("div", {
				className: "c-detail-title",
				children: jsxs("div", {
					className: "c-identity",
					children: [props.mark === void 0 ? null : jsx("span", {
						className: "c-brand",
						children: props.mark
					}), jsxs("div", { children: [jsxs("div", {
						className: "c-name-line",
						children: [jsx("span", {
							className: "c-name",
							children: props.name
						}), jsx(ProviderRoleBadge, { ...props.role === void 0 ? {} : { role: props.role } })]
					}), jsxs("div", {
						className: "c-sub",
						children: [
							jsx("span", { className: "c-dot" + (state === "unconnected" ? "" : " good") }),
							stateLabel,
							count === void 0 ? null : jsxs(Fragment, { children: [jsx("span", {
								"aria-hidden": "true",
								children: "·"
							}), props.copy.modelCount.replace("{n}", String(count))] })
						]
					})] })]
				})
			}),
			props.notice === void 0 ? null : jsx("p", {
				className: "c-notice",
				children: props.notice
			}),
			account === void 0 ? null : jsxs("div", {
				className: "c-account-group",
				children: [
					jsx("div", {
						className: "c-account-head",
						children: props.copy.accountHeading
					}),
					jsxs("section", {
						className: "c-account",
						children: [jsxs("div", {
							className: "c-account-copy",
							children: [jsxs("div", {
								className: "c-account-name",
								children: [jsx("span", { className: "c-dot" + (state === "unconnected" ? "" : " good") }), account.label]
							}), account.meta === void 0 ? null : jsx("div", {
								className: "c-account-meta",
								children: account.meta
							})]
						}), account.actions === void 0 ? null : jsx("div", {
							className: "c-account-actions",
							children: account.actions
						})]
					}),
					account.body === void 0 ? null : jsx("div", {
						className: "c-account-body",
						children: account.body
					})
				]
			}),
			jsxs("section", {
				"data-c-quota": "",
				children: [
					jsxs("div", {
						className: "c-quota-head",
						children: [jsx("h3", { children: props.copy.quotaHeading }), props.quota.onRefresh === void 0 ? null : jsx("button", {
							type: "button",
							className: "c-btn quiet",
							disabled: props.quota.refreshing === true,
							onClick: props.quota.onRefresh,
							children: props.quota.refreshing === true ? props.copy.refreshing : props.copy.refresh
						})]
					}),
					jsx("div", {
						className: "c-quota-list",
						children: props.quota.windows.length === 0 ? jsx("div", {
							className: "c-missing",
							children: quotaEmptyLabel(props.quota.status, props.copy)
						}) : props.quota.windows.map((window) => {
							const detail = formatResetLabel(window.resetsAt, window.label, {
								at: props.copy.resetAt,
								overdue: props.copy.resetOverdue,
								missing: props.copy.resetMissing
							});
							return jsx(ProviderQuotaMeter, {
								label: window.label,
								...window.remainingPercent === void 0 ? {} : { remainingPercent: window.remainingPercent },
								emptyLabel: window.valueText,
								...detail === void 0 ? {} : { detail }
							}, window.id);
						})
					}),
					jsxs("div", {
						className: "c-quota-meta",
						children: [jsx("span", { children: props.copy.quotaMeta }), props.quota.updatedLabel === void 0 ? null : jsx("span", { children: props.quota.updatedLabel })]
					})
				]
			}),
			props.models === void 0 ? null : jsxs("section", {
				"data-provider-models": "",
				children: [
					jsxs("div", {
						className: "c-models-head",
						children: [jsxs("div", {
							className: "c-models-title",
							children: [jsx("h3", { children: props.copy.modelsHeading }), jsx("span", {
								className: "c-count",
								children: props.copy.modelsCount.replace("{n}", String(props.models.count ?? 0))
							})]
						}), jsxs("div", {
							className: "c-models-actions",
							children: [
								props.models.onToggleAll === void 0 ? null : jsx("button", {
									type: "button",
									className: "c-btn quiet",
									"aria-pressed": props.models.allOpen === true,
									onClick: props.models.onToggleAll,
									children: props.models.allOpen === true ? props.copy.collapseAll : props.copy.expandAll
								}),
								props.models.onToggleSorting === void 0 ? null : jsx("button", {
									type: "button",
									className: "c-btn quiet",
									"aria-pressed": props.models.sorting === true,
									disabled: props.models.sortDisabled === true,
									onClick: props.models.onToggleSorting,
									children: props.models.sorting === true ? props.copy.done : props.copy.sort
								}),
								props.models.onChooseFromAccount === void 0 ? null : jsx("button", {
									type: "button",
									className: "c-btn",
									disabled: props.models.chooseDisabled === true,
									onClick: props.models.onChooseFromAccount,
									children: props.copy.chooseFromAccount
								}),
								props.models.actions
							]
						})]
					}),
					jsx("p", {
						className: "c-models-hint",
						children: props.models.hint ?? props.copy.modelsHint
					}),
					jsx("div", {
						className: "c-models-list",
						children: props.models.list
					})
				]
			}),
			props.advanced === void 0 ? null : jsxs("details", {
				className: "c-advanced",
				children: [jsxs("summary", { children: [jsx("span", { children: props.copy.advancedHeading }), jsx("span", {
					className: "c-advanced-note",
					children: props.copy.advancedNote
				})] }), jsx("div", {
					className: "c-advanced-body",
					children: props.advanced
				})]
			}),
			props.footer === void 0 ? null : jsx("div", {
				className: "c-footer",
				children: props.footer
			}),
			props.draft === void 0 ? null : jsx("div", {
				className: "c-draft",
				children: props.draft
			})
		]
	});
}
//#endregion
export { ProviderDetail, providerDetailCopy };
