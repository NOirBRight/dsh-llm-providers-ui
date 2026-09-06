import { Fragment, jsx, jsxs } from "react/jsx-runtime";
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
const headerMainStyle = {
	display: "flex",
	minWidth: 0,
	flex: 1,
	flexDirection: "column",
	gap: 4
};
const headerTitleStyle = {
	display: "inline-flex",
	alignItems: "center",
	gap: 8,
	fontSize: 14,
	fontWeight: 600,
	lineHeight: 1
};
const headerMarkStyle = {
	width: 18,
	height: 18,
	flex: "none",
	display: "block",
	overflow: "visible"
};
const headerNameStyle = { lineHeight: "20px" };
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
	borderColor: "var(--dsw-alias-border-secondary)",
	background: "transparent"
};
const headerBadgeAgent = {
	color: "var(--dsw-alias-bg-layer-1)",
	borderColor: "var(--dsw-alias-label-primary)",
	background: "var(--dsw-alias-label-primary)"
};
const headerSummaryStyle = {
	fontSize: 13,
	lineHeight: "18px",
	color: "var(--dsw-alias-label-tertiary)",
	whiteSpace: "nowrap",
	overflow: "hidden",
	textOverflow: "ellipsis"
};
const headerStatusStyle = {
	fontSize: 12,
	lineHeight: "18px",
	color: "var(--dsw-alias-label-secondary)"
};
const headerSideStyle = {
	display: "inline-flex",
	alignItems: "center",
	gap: 10,
	flex: "none"
};
const headerUnsavedStyle = {
	fontSize: 12,
	color: "var(--dsw-alias-label-tertiary)"
};
const headerChevronStyle = {
	fontSize: 18,
	lineHeight: 1
};
const headerMiniStyle = {
	minWidth: 0,
	maxWidth: 220,
	paddingTop: 2
};
/**
* Collapsed header contents: mark, title, monochrome role badge, provider
* summary, optional caller status, and an optional compact quota meter.
* Renders a fragment for the caller-owned header button, matching the legacy
* codex provider-chrome layout so existing call sites keep working.
*/
function ProviderCardHeader(props) {
	const role = props.role ?? "llm";
	const quota = props.quota === void 0 || props.quota === null ? void 0 : {
		...props.quota.remainingPercent === void 0 ? {} : { remainingPercent: props.quota.remainingPercent },
		...props.quota.remainingFraction === void 0 ? {} : { remainingFraction: props.quota.remainingFraction },
		...props.quota.label === void 0 ? {} : { label: props.quota.label },
		...props.quota.detail === void 0 ? {} : { detail: props.quota.detail }
	};
	return jsxs(Fragment, { children: [jsxs("span", {
		"data-provider-header-main": "",
		style: headerMainStyle,
		children: [
			jsxs("span", {
				style: headerTitleStyle,
				children: [
					jsx("span", {
						style: headerMarkStyle,
						children: props.mark
					}),
					jsx("span", {
						style: headerNameStyle,
						children: props.title
					}),
					jsx("span", {
						"data-provider-role-badge": role,
						style: {
							...headerBadgeBase,
							...role === "agent" ? headerBadgeAgent : headerBadgeLlm
						},
						children: role === "agent" ? "Agent" : "LLM"
					})
				]
			}),
			jsx("span", {
				"data-provider-header-summary": "",
				style: headerSummaryStyle,
				children: props.summary
			}),
			props.status === void 0 ? null : jsx("span", {
				"data-provider-header-status": "",
				style: headerStatusStyle,
				children: props.status
			}),
			quota === void 0 ? null : jsx("span", {
				"data-provider-quota-mini": "",
				style: headerMiniStyle,
				children: jsx(ProviderQuotaMeter, { ...quota })
			})
		]
	}), jsxs("span", {
		style: headerSideStyle,
		children: [props.unsaved === true && props.unsavedLabel !== void 0 ? jsx("span", {
			style: headerUnsavedStyle,
			children: props.unsavedLabel
		}) : null, jsx("span", {
			"data-provider-header-chevron": "",
			"aria-hidden": "true",
			style: {
				...headerChevronStyle,
				transform: props.open ? "rotate(180deg)" : "none"
			},
			children: "\\u2304"
		})]
	})] });
}
/**
* Scoped provider chrome CSS: plain card reset, header button layout, body and
* model rows, quota meter responsive rules, and coarse-pointer touch targets.
* The shell injects it once per page; provider cards may also inject it once
* for standalone use. Duplicate style tags are harmless: every rule is scoped
* to a data-provider-* attribute and only narrows unstyled markup.
*/
const providerUiCss = [
	"[data-provider-card]{margin:0;border:0;border-radius:0;background:none;box-shadow:none;overflow:visible}",
	"[data-provider-card-header]{box-sizing:border-box;width:100%;min-height:68px;display:flex;align-items:center;justify-content:space-between;gap:16px;border:0;padding:12px 14px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer}",
	"[data-provider-card-header]:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent)}",
	"[data-provider-body]{display:flex;flex-direction:column;gap:18px;border-top:1px solid var(--dsw-alias-border-l2);padding:16px 14px 18px}",
	"[data-provider-model]{display:flex;align-items:center;gap:9px;min-height:40px}",
	"[data-provider-quota-mini]{display:block}",
	"[data-providers-list]{display:flex;flex-direction:column}",
	"[data-providers-list] [data-sortable-row]+[data-sortable-row]{border-top:1px solid var(--dsw-alias-border-l2)}",
	"@media (max-width:680px){[data-provider-card-header]{min-height:76px;padding:14px 4px}[data-provider-quota-mini]{max-width:none}[data-provider-model]{min-height:48px}[data-provider-model] input{width:17px;height:17px}[data-providers-section] button,[data-provider-card] button{min-height:44px}}",
	"@media (pointer:coarse){[data-sortable-handle],[data-sortable-move]{min-width:44px;min-height:44px}}"
].join("\n");
//#endregion
export { ProviderCardHeader, ProviderQuotaMeter, normalizeQuotaRemaining, providerUiCss };
