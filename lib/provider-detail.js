import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
		done: "完成",
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
		windowHour: "5 小时窗口",
		windowWeek: "每周窗口",
		windowMonth: "每月窗口",
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
		modelIdLabel: "Model ID",
		modelNameLabel: "显示名称",
		addModelLabel: "手动添加模型",
		removeModelLabel: "删除",
		dragModelLabel: "拖动排序",
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
		done: "Done",
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
		windowHour: "5-hour window",
		windowWeek: "Weekly window",
		windowMonth: "Monthly window",
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
		modelIdLabel: "Model ID",
		modelNameLabel: "Display name",
		addModelLabel: "Add model manually",
		removeModelLabel: "Remove",
		dragModelLabel: "Reorder",
		modelsHeading: "Models",
		modelsCount: "{n}",
		modelsHint: "Names and IDs always show; expand a row for capacity and capability parameters.",
		sortModels: "Sort",
		chooseFromAccount: "Choose from account",
		addModel: "Add model manually"
	}
};
//#endregion
//#region lib/types/client/SortableList.js
/** Pointer-driven sortable list with a floating ghost and animated live preview. */
const listStyle = {
	display: "flex",
	flexDirection: "column",
	gap: 8
};
const rowStyle = {
	display: "grid",
	gridTemplateColumns: "30px minmax(0, 1fr)",
	alignItems: "stretch",
	overflow: "hidden",
	border: "1px solid var(--dsw-alias-border-l2)",
	borderRadius: 8,
	background: "var(--dsw-alias-bg-layer-1)",
	transition: "box-shadow 150ms ease, opacity 150ms ease, transform 150ms ease"
};
const handleStyle = {
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	width: 30,
	minHeight: 42,
	alignSelf: "stretch",
	border: 0,
	borderRight: "1px solid var(--dsw-alias-border-l2)",
	padding: 0,
	flex: "none",
	touchAction: "none",
	userSelect: "none",
	background: "transparent",
	color: "var(--dsw-alias-label-tertiary)",
	position: "relative",
	zIndex: 2
};
const cardRowStyle = {
	...rowStyle,
	borderRadius: 10,
	background: "var(--dsw-alias-bg-module-platform)",
	overflow: "hidden"
};
const cardItemStyle = {
	minWidth: 0,
	display: "flex",
	flexDirection: "column"
};
const bareRowStyle = {
	...rowStyle,
	border: 0,
	borderRadius: 0,
	background: "transparent",
	overflow: "visible"
};
const bareHandleStyle = {
	...handleStyle,
	width: 22,
	minHeight: 0,
	borderRight: 0,
	color: "var(--dsw-alias-label-tertiary)"
};
const plainRowStyle = {
	display: "grid",
	alignItems: "stretch",
	background: "transparent"
};
const plainItemStyle = {
	minWidth: 0,
	display: "flex",
	flexDirection: "column",
	padding: "4px 0"
};
const moveButtonStyle = {
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	minWidth: 34,
	minHeight: 34,
	alignSelf: "center",
	border: 0,
	padding: 0,
	flex: "none",
	background: "transparent",
	color: "var(--dsw-alias-label-tertiary)",
	fontSize: 16,
	cursor: "pointer"
};
const touchCss = "@media (pointer:coarse){[data-sortable-handle],[data-sortable-move]{min-width:44px;min-height:44px}}";
const cardCss = "[data-sortable-card] [data-sortable-item] li,[data-sortable-ghost] [data-sortable-item] li{border:0!important;border-radius:0!important;background:transparent!important;overflow:visible!important;list-style:none;margin:0}";
/** Grip glyph marking one row's pointer handle. */
function IconGrip() {
	return jsxs("svg", {
		width: "10",
		height: "14",
		viewBox: "0 0 10 14",
		fill: "currentColor",
		"aria-hidden": true,
		children: [
			jsx("circle", {
				cx: "2.5",
				cy: "2.5",
				r: "1.2"
			}),
			jsx("circle", {
				cx: "7.5",
				cy: "2.5",
				r: "1.2"
			}),
			jsx("circle", {
				cx: "2.5",
				cy: "7",
				r: "1.2"
			}),
			jsx("circle", {
				cx: "7.5",
				cy: "7",
				r: "1.2"
			}),
			jsx("circle", {
				cx: "2.5",
				cy: "11.5",
				r: "1.2"
			}),
			jsx("circle", {
				cx: "7.5",
				cy: "11.5",
				r: "1.2"
			})
		]
	});
}
/**
* Pointer-driven sortable list: an in-tree floating ghost follows the pointer,
* a preview array records the prospective order, and FLIP animations move
* sibling rows. The ghost stays inside the list ancestry so ancestor-scoped
* row styles keep matching it while it floats (position:fixed escapes
* overflow clipping without leaving the scope). Constraint: no
* transform/filter/perspective on list ancestors, which would re-anchor
* the fixed ghost to that ancestor instead of the viewport.
*/
function SortableList({ items, getId, renderItem, dragLabel, onReorder, disabled = false, chrome = "row", sorting = true, moveButtons = false, moveUpLabel, moveDownLabel }) {
	const card = chrome === "card";
	const plain = chrome === "plain";
	const bare = chrome === "bare";
	const interactive = sorting && !disabled;
	const showHandle = sorting;
	const upLabel = moveUpLabel ?? (() => "Move up");
	const downLabel = moveDownLabel ?? (() => "Move down");
	/** Commit a durable reorder moving one row by an offset. Pointer preview stays untouched. */
	const moveBy = (id, offset) => {
		if (!interactive || draggedId !== null) return;
		const from = items.findIndex((item) => getId(item) === id);
		if (from < 0) return;
		const to = from + offset;
		if (to < 0 || to >= items.length) return;
		const next = [...items];
		const moved = next.splice(from, 1)[0];
		if (moved === void 0) return;
		next.splice(to, 0, moved);
		onReorder(next);
	};
	/** Arrow keys on a handle commit the same reorder as a pointer drag. */
	const handleKeyDown = (event, id) => {
		if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
		event.preventDefault();
		moveBy(id, event.key === "ArrowUp" ? -1 : 1);
	};
	const [draggedId, setDraggedId] = useState(null);
	const [dropTargetId, setDropTargetId] = useState(null);
	const [previewItems, setPreviewItems] = useState(null);
	const [dragGhost, setDragGhost] = useState(null);
	const rowRefs = useRef(/* @__PURE__ */ new Map());
	const previousRects = useRef(null);
	const previewRef = useRef(null);
	const dragGhostRef = useRef(null);
	const renderedItems = previewItems ?? items;
	const draggedItem = draggedId === null ? void 0 : renderedItems.find((item) => getId(item) === draggedId) ?? items.find((item) => getId(item) === draggedId);
	useEffect(() => {
		if (draggedId === null) return;
		const style = document.createElement("style");
		style.textContent = "html.providers-sortable-dragging, html.providers-sortable-dragging * { cursor: grabbing !important; user-select: none !important; }";
		const previousRootCursor = document.documentElement.style.cursor;
		const previousBodyCursor = document.body.style.cursor;
		document.head.appendChild(style);
		document.documentElement.classList.add("providers-sortable-dragging");
		document.documentElement.style.cursor = "grabbing";
		document.body.style.cursor = "grabbing";
		return () => {
			document.documentElement.classList.remove("providers-sortable-dragging");
			style.remove();
			document.documentElement.style.cursor = previousRootCursor;
			document.body.style.cursor = previousBodyCursor;
		};
	}, [draggedId]);
	useEffect(() => {
		if (draggedId === null) return;
		const handlePointerMove = (event) => {
			const currentGhost = dragGhostRef.current;
			if (currentGhost === null) return;
			event.preventDefault();
			const nextGhost = {
				...currentGhost,
				x: event.clientX - currentGhost.offsetX,
				y: event.clientY - currentGhost.offsetY
			};
			dragGhostRef.current = nextGhost;
			setDragGhost(nextGhost);
			movePreviewFromPointer(nextGhost.y + nextGhost.height / 2);
		};
		const handlePointerUp = (event) => {
			event.preventDefault();
			finishDrag(true);
		};
		const handlePointerCancel = (event) => {
			event.preventDefault();
			finishDrag(false);
		};
		const handleKeyDown = (event) => {
			if (event.key !== "Escape") return;
			event.preventDefault();
			finishDrag(false);
		};
		window.addEventListener("pointermove", handlePointerMove, { passive: false });
		window.addEventListener("pointerup", handlePointerUp, { passive: false });
		window.addEventListener("pointercancel", handlePointerCancel, { passive: false });
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);
			window.removeEventListener("pointercancel", handlePointerCancel);
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [draggedId]);
	useLayoutEffect(() => {
		const rects = previousRects.current;
		if (rects === null) return;
		previousRects.current = null;
		rowRefs.current.forEach((node, id) => {
			const previous = rects.get(id);
			if (previous === void 0) return;
			const next = node.getBoundingClientRect();
			const deltaX = previous.left - next.left;
			const deltaY = previous.top - next.top;
			if (deltaX === 0 && deltaY === 0 || typeof node.animate !== "function") return;
			node.animate([{ transform: "translate(" + String(deltaX) + "px, " + String(deltaY) + "px)" }, { transform: "translate(0, 0)" }], {
				duration: 160,
				easing: "cubic-bezier(0.2, 0, 0, 1)"
			});
		});
	}, [renderedItems]);
	const startDrag = (event, id) => {
		if (!interactive || dragGhostRef.current !== null) return;
		if (event.pointerType === "mouse" && event.button !== 0) return;
		const row = event.currentTarget.closest("[data-sortable-row=\"true\"]");
		if (!(row instanceof HTMLElement)) return;
		event.preventDefault();
		if (typeof event.currentTarget.focus === "function") event.currentTarget.focus();
		try {
			event.currentTarget.setPointerCapture(event.pointerId);
		} catch {}
		const rect = row.getBoundingClientRect();
		const nextGhost = {
			id,
			x: rect.left,
			y: rect.top,
			width: rect.width,
			height: rect.height,
			offsetX: event.clientX - rect.left,
			offsetY: event.clientY - rect.top
		};
		dragGhostRef.current = nextGhost;
		const initial = [...items];
		previewRef.current = initial;
		setPreviewItems(initial);
		setDragGhost(nextGhost);
		setDraggedId(id);
	};
	const finishDrag = (commit) => {
		const next = previewRef.current;
		if (commit && next !== null && !sameOrder(next, items, getId)) onReorder(next);
		previewRef.current = null;
		dragGhostRef.current = null;
		setPreviewItems(null);
		setDragGhost(null);
		setDraggedId(null);
		setDropTargetId(null);
	};
	const captureRects = () => {
		previousRects.current = new Map(Array.from(rowRefs.current.entries()).map(([id, node]) => [id, node.getBoundingClientRect()]));
	};
	const setRowRef = (id, node) => {
		if (node === null) rowRefs.current.delete(id);
		else rowRefs.current.set(id, node);
	};
	/** The ghost clones live row controls: keep the copy unfocusable. React 18 types no inert prop, so set the DOM flag behind a support guard. */
	const setGhostInert = (node) => {
		if (node !== null && "inert" in node) node.inert = true;
	};
	const movePreviewFromPointer = (pointerY) => {
		if (draggedId === null) return;
		const current = previewRef.current ?? [...items];
		const from = current.findIndex((item) => getId(item) === draggedId);
		if (from < 0) return;
		const dragged = current[from];
		if (dragged === void 0) return;
		const remaining = current.filter((item) => getId(item) !== draggedId);
		let insertionIndex = remaining.length;
		let nextDropTargetId = remaining.length === 0 ? null : getId(remaining[remaining.length - 1]);
		for (let index = 0; index < remaining.length; index += 1) {
			const item = remaining[index];
			if (item === void 0) continue;
			const id = getId(item);
			const node = rowRefs.current.get(id);
			if (node === void 0) continue;
			const rect = node.getBoundingClientRect();
			if (pointerY < rect.top + rect.height / 2) {
				insertionIndex = index;
				nextDropTargetId = id;
				break;
			}
		}
		const next = [
			...remaining.slice(0, insertionIndex),
			dragged,
			...remaining.slice(insertionIndex)
		];
		setDropTargetId(nextDropTargetId);
		if (sameOrder(next, current, getId)) return;
		captureRects();
		previewRef.current = next;
		setPreviewItems(next);
	};
	const rowChromeStyle = bare ? bareRowStyle : plain ? plainRowStyle : card ? cardRowStyle : rowStyle;
	const rowGridColumns = (showHandle ? "44px " : "") + "minmax(0,1fr)" + (moveButtons && showHandle ? " auto auto" : "");
	const rowItemStyle = plain ? plainItemStyle : card ? cardItemStyle : { minWidth: 0 };
	return jsxs("div", {
		"data-sortable-card": card ? "" : void 0,
		"data-sortable-plain": plain ? "" : void 0,
		style: {
			...listStyle,
			...card ? { gap: 12 } : {},
			...plain ? { gap: 0 } : {}
		},
		children: [
			card ? jsx("style", { children: cardCss }) : null,
			plain || moveButtons ? jsx("style", { children: touchCss }) : null,
			renderedItems.map((item, index) => {
				const id = getId(item);
				const dragging = draggedId === id;
				const targeted = dropTargetId === id && draggedId !== id;
				return jsxs("div", {
					ref: (node) => {
						setRowRef(id, node);
					},
					"data-sortable-row": "true",
					style: {
						...rowChromeStyle,
						gridTemplateColumns: rowGridColumns,
						visibility: dragging ? "hidden" : "visible",
						pointerEvents: dragging ? "none" : "auto",
						borderColor: dragging ? "transparent" : "var(--dsw-alias-border-l2)",
						boxShadow: targeted ? "0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 20%, transparent)" : "none"
					},
					onPointerDown: (event) => {
						const target = event.target;
						if (target instanceof Element && target.closest("a, input, select, textarea, label, button:not([data-sortable-handle])") !== null) return;
						startDrag(event, id);
					},
					children: [
						jsx("button", {
							type: "button",
							"data-sortable-handle": "",
							style: {
								...bare ? bareHandleStyle : handleStyle,
								display: showHandle ? "flex" : "none",
								...plain ? { borderRight: 0 } : {},
								cursor: disabled ? "default" : draggedId === null ? "grab" : "grabbing"
							},
							"aria-label": dragLabel(item, index),
							"aria-grabbed": dragging,
							title: dragLabel(item, index),
							disabled,
							hidden: !showHandle,
							onDragStart: (event) => {
								event.preventDefault();
							},
							onPointerDown: (event) => {
								startDrag(event, id);
							},
							onKeyDown: (event) => {
								handleKeyDown(event, id);
							},
							children: jsx(IconGrip, {})
						}),
						jsx("div", {
							"data-sortable-item": "",
							style: rowItemStyle,
							children: renderItem(item, index)
						}),
						moveButtons ? jsxs(Fragment, { children: [jsx("button", {
							type: "button",
							"data-sortable-move": "up",
							style: {
								...moveButtonStyle,
								display: showHandle ? "inline-flex" : "none"
							},
							"aria-label": upLabel(item, index),
							title: upLabel(item, index),
							disabled: !interactive || index === 0,
							hidden: !showHandle,
							onClick: () => {
								moveBy(id, -1);
							},
							children: "↑"
						}), jsx("button", {
							type: "button",
							"data-sortable-move": "down",
							style: {
								...moveButtonStyle,
								display: showHandle ? "inline-flex" : "none"
							},
							"aria-label": downLabel(item, index),
							title: downLabel(item, index),
							disabled: !interactive || index === renderedItems.length - 1,
							hidden: !showHandle,
							onClick: () => {
								moveBy(id, 1);
							},
							children: "↓"
						})] }) : null
					]
				}, id);
			}),
			dragGhost !== null && draggedItem !== void 0 ? jsxs("div", {
				"data-sortable-row": "true",
				"data-sortable-ghost": "true",
				"aria-hidden": "true",
				ref: setGhostInert,
				style: {
					...rowChromeStyle,
					gridTemplateColumns: rowGridColumns,
					position: "fixed",
					boxSizing: "border-box",
					left: dragGhost.x,
					top: dragGhost.y,
					width: dragGhost.width,
					minHeight: dragGhost.height,
					zIndex: 1e4,
					pointerEvents: "none",
					opacity: .96,
					boxShadow: "var(--dsw-shadow-lv2, 0 10px 30px rgba(0, 0, 0, 0.18))",
					outline: "2px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 22%, transparent)"
				},
				children: [
					jsx("div", {
						"data-sortable-handle": "",
						style: {
							...handleStyle,
							display: showHandle ? "flex" : "none",
							...plain ? { borderRight: 0 } : {},
							cursor: "grabbing"
						},
						children: jsx(IconGrip, {})
					}),
					jsx("div", {
						"data-sortable-item": "",
						style: rowItemStyle,
						children: renderItem(draggedItem, renderedItems.findIndex((item) => getId(item) === draggedId))
					}),
					moveButtons && showHandle ? jsxs(Fragment, { children: [jsx("span", {
						"aria-hidden": "true",
						style: {
							...moveButtonStyle,
							visibility: "hidden"
						},
						children: "↑"
					}), jsx("span", {
						"aria-hidden": "true",
						style: {
							...moveButtonStyle,
							visibility: "hidden"
						},
						children: "↓"
					})] }) : null
				]
			}) : null
		]
	});
}
function sameOrder(left, right, getId) {
	return left.length === right.length && left.every((item, index) => {
		const other = right[index];
		return other !== void 0 && getId(item) === getId(other);
	});
}
//#endregion
//#region lib/types/client/provider-detail.js
/** Icon paths copied from the locked prototype so every card matches it. */
const ICON = {
	expand: "M2 4h12M2 12h12M5 2v4M11 10v4",
	sort: "M5 2v12m-3-3 3 3 3-3M11 14V2m-3 3 3-3 3 3",
	plus: "M8 3v10M3 8h10",
	chevron: "M6 3l5 5-5 5",
	trash: "M3 4h10M6 4V2h4v2M4 4l1 10h6l1-10M7 7v4M9 7v4"
};
function modelLabelOf(row, index) {
	const id = row.id.trim();
	if (id.length > 0) return id;
	return index === void 0 ? row.rowId : String(index + 1);
}
function DetailIcon({ path }) {
	return jsx("svg", {
		className: "c-ico",
		viewBox: "0 0 16 16",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "1.3",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		"aria-hidden": "true",
		children: jsx("path", { d: path })
	});
}
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
		modelIdLabel: source.modelIdLabel,
		modelNameLabel: source.modelNameLabel,
		addModelLabel: source.addModelLabel,
		removeModelLabel: source.removeModelLabel,
		dragModelLabel: source.dragModelLabel,
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
								props.models.onToggleAll === void 0 ? null : jsxs("button", {
									type: "button",
									className: "c-btn quiet c-icon-label",
									"aria-pressed": props.models.allOpen === true,
									onClick: props.models.onToggleAll,
									children: [jsx(DetailIcon, { path: ICON.expand }), props.models.allOpen === true ? props.copy.collapseAll : props.copy.expandAll]
								}),
								props.models.onToggleSorting === void 0 ? null : jsxs("button", {
									type: "button",
									className: "c-btn quiet c-icon-label",
									"aria-pressed": props.models.sorting === true,
									disabled: props.models.sortDisabled === true,
									onClick: props.models.onToggleSorting,
									children: [jsx(DetailIcon, { path: ICON.sort }), props.models.sorting === true ? props.copy.done : props.copy.sort]
								}),
								props.models.onChooseFromAccount === void 0 ? null : jsxs("button", {
									type: "button",
									className: "c-btn c-icon-label",
									disabled: props.models.chooseDisabled === true,
									onClick: props.models.onChooseFromAccount,
									children: [jsx(DetailIcon, { path: ICON.plus }), props.copy.chooseFromAccount]
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
						children: props.models.items === void 0 ? null : jsxs(Fragment, { children: [jsx(SortableList, {
							items: props.models.items,
							getId: (row) => row.rowId,
							chrome: "bare",
							disabled: props.models.onReorder === void 0,
							sorting: props.models.sorting === true,
							moveButtons: props.models.sorting === true,
							dragLabel: (row) => props.copy.dragModelLabel + ": " + modelLabelOf(row),
							moveUpLabel: (row) => props.copy.dragModelLabel + ": " + modelLabelOf(row),
							moveDownLabel: (row) => props.copy.dragModelLabel + ": " + modelLabelOf(row),
							onReorder: (rows) => {
								props.models?.onReorder?.(rows.map((row) => row.rowId));
							},
							renderItem: (row, index) => {
								const label = modelLabelOf(row, index);
								const expanded = props.models?.sorting !== true && (props.models?.allOpen === true || props.models?.expanded?.includes(row.rowId) === true);
								return jsxs("div", {
									className: "c-model-card",
									"data-model-row": label,
									children: [jsxs("div", {
										className: "c-model-top",
										children: [
											jsxs("label", {
												className: "c-field",
												children: [jsx("span", {
													className: "c-field-label",
													children: props.copy.modelIdLabel
												}), jsx("input", {
													className: "c-input",
													value: row.id,
													readOnly: props.models?.sorting === true,
													spellCheck: false,
													autoComplete: "off",
													placeholder: props.copy.modelIdLabel,
													"aria-label": props.copy.modelIdLabel + " " + String(index + 1),
													onChange: (event) => {
														props.models?.onPatch?.(row.rowId, { id: event.target.value });
													}
												})]
											}),
											jsxs("label", {
												className: "c-field",
												children: [jsx("span", {
													className: "c-field-label",
													children: props.copy.modelNameLabel
												}), jsx("input", {
													className: "c-input",
													value: row.name ?? "",
													readOnly: props.models?.sorting === true,
													autoComplete: "off",
													placeholder: props.copy.modelNameLabel,
													"aria-label": props.copy.modelNameLabel + " " + String(index + 1),
													onChange: (event) => {
														props.models?.onPatch?.(row.rowId, { name: event.target.value });
													}
												})]
											}),
											props.models?.onToggle === void 0 ? null : jsx("button", {
												type: "button",
												className: "c-btn quiet c-icon-only",
												"aria-expanded": expanded,
												"aria-label": props.copy.details + ": " + label,
												onClick: () => {
													props.models?.onToggle?.(row.rowId);
												},
												children: jsx(DetailIcon, { path: ICON.chevron })
											}),
											props.models?.onRemove === void 0 ? null : jsx("button", {
												type: "button",
												className: "c-btn quiet c-icon-only",
												"aria-label": props.copy.removeModelLabel + " " + label,
												onClick: () => {
													props.models?.onRemove?.(row.rowId);
												},
												children: jsx(DetailIcon, { path: ICON.trash })
											})
										]
									}), props.models?.extra === void 0 || !expanded ? null : jsx("div", {
										className: "c-model-extra",
										children: props.models.extra(row)
									})]
								});
							}
						}), props.models.onAdd === void 0 ? null : jsxs("button", {
							type: "button",
							className: "c-btn c-icon-label c-add-model",
							disabled: props.models.addDisabled === true,
							onClick: props.models.onAdd,
							children: [jsx(DetailIcon, { path: ICON.plus }), props.copy.addModelLabel]
						})] })
					})
				]
			}),
			props.advanced === void 0 ? null : jsxs("details", {
				className: "c-advanced",
				children: [jsxs("summary", { children: [
					jsx(DetailIcon, { path: ICON.chevron }),
					jsx("span", { children: props.copy.advancedHeading }),
					jsx("span", {
						className: "c-advanced-note",
						children: props.copy.advancedNote
					})
				] }), jsx("div", {
					className: "c-advanced-content",
					children: props.advanced
				})]
			}),
			props.footer === void 0 ? null : jsx("div", {
				className: "c-footer",
				children: props.footer
			}),
			props.draft === void 0 ? null : jsx("div", {
				className: "c-draft",
				children: jsx("div", {
					className: "c-draft-actions",
					children: props.draft
				})
			})
		]
	});
}
//#endregion
export { ProviderDetail, providerDetailCopy };
