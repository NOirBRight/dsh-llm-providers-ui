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
//#endregion
//#region lib/types/client/settings-c-css.js
/** Locked settings C chrome, scoped under [data-providers-section]. */
const settingsCCss = `
[data-providers-section]{--c-ink:var(--dsw-alias-label-primary);--c-muted:var(--dsw-alias-label-secondary);--c-faint:var(--dsw-alias-label-tertiary);--c-line:var(--dsw-alias-border-l2);--c-bg:var(--dsw-alias-bg-layer-1);--c-subtle:var(--dsw-alias-bg-module-platform);--c-hover:color-mix(in srgb,var(--dsw-alias-label-primary) 6%,var(--dsw-alias-bg-layer-1));display:flex;flex-direction:column;width:100%;min-width:0;color:var(--c-ink);font-size:13px;line-height:1.5}
[data-providers-section] button{font:inherit;color:inherit;cursor:pointer;border:0;background:none}
[data-providers-section] .c-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:34px;border:1px solid var(--c-line);border-radius:9px;padding:6px 12px;background:var(--c-bg);white-space:nowrap;font-size:12px;font-weight:500}
[data-providers-section] .c-btn:hover{background:var(--c-hover);border-color:var(--c-faint)}
[data-providers-section] .c-btn.quiet{background:transparent;border-color:transparent}
[data-providers-section] .c-btn.quiet:hover{background:var(--c-hover)}
[data-providers-section] .c-sort{min-width:128px}
[data-providers-section] .c-ico{width:14px;height:14px;flex:none}
[data-providers-section] .c-page-title{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin:3px 0 24px}
[data-providers-section] .c-page-title h2{margin:0;font-size:20px;line-height:28px;font-weight:600;letter-spacing:-.5px}
[data-providers-section] .c-page-title p{margin:5px 0 0;color:var(--c-muted);font-size:12px}
[data-providers-section] .c-note{padding:14px 16px;background:var(--c-subtle);border:1px solid var(--c-line);border-radius:11px;margin-bottom:19px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
[data-providers-section] .c-number{font-size:27px;line-height:1;font-weight:550;font-variant-numeric:tabular-nums;letter-spacing:-1px}
[data-providers-section] .c-copy{flex:1;min-width:140px}
[data-providers-section] .c-copy strong{display:block;font-size:13px}
[data-providers-section] .c-copy p{margin:3px 0 0;font-size:11px;color:var(--c-muted)}
[data-providers-section] .c-switch{display:flex;align-items:center;gap:8px;min-height:44px;flex:none;font-size:11px;white-space:nowrap;cursor:pointer}
[data-providers-section] .c-switch input[role=switch]{appearance:none;-webkit-appearance:none;position:relative;width:32px;height:18px;min-height:18px;padding:2px;border:0;border-radius:20px;background:var(--c-faint);cursor:inherit}
[data-providers-section] .c-switch input::before{content:"";display:block;width:14px;height:14px;background:var(--c-bg);border-radius:50%;transition:transform .15s}
[data-providers-section] .c-switch input:checked{background:var(--c-ink)}
[data-providers-section] .c-switch input:checked::before{transform:translateX(14px)}
[data-providers-section] .c-filters{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:13px}
[data-providers-section] .c-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
[data-providers-section] .c-zone{font-size:11px;color:var(--c-faint)}
[data-providers-section] .c-ledger{display:flex;flex-direction:column}
[data-providers-section] .c-labels,[data-providers-section] .c-row-grid{display:grid;--quota-column:minmax(170px,calc((100% - 90px)/2.05));grid-template-columns:minmax(140px,1fr) var(--quota-column) 72px;gap:20px;align-items:center}
[data-providers-section] .c-labels{padding:0 12px 10px;font-size:10px;color:var(--c-faint);border-bottom:1px solid var(--c-line)}
[data-providers-section] .c-row-grid{position:relative;padding:19px 12px;border-bottom:1px solid var(--c-line);min-height:96px;box-sizing:border-box}
[data-providers-section] .c-probe{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);pointer-events:none}
[data-providers-section] .c-row-grid:last-child{border-bottom:0}
[data-providers-section][data-sorting] .c-labels,[data-providers-section][data-sorting] .c-row-grid{grid-template-columns:minmax(0,1fr) var(--quota-column)}
[data-providers-section][data-sorting] .c-labels>span:last-child,[data-providers-section][data-sorting] [data-action=open-provider]{display:none}
[data-providers-section] .c-identity{display:flex;align-items:center;gap:10px;min-width:0}
[data-providers-section] .c-brand{width:26px;height:28px;display:grid;place-items:center;flex:none}
[data-providers-section] .c-name{font-size:13px;font-weight:600;overflow-wrap:anywhere;line-height:20px}
[data-providers-section] .c-name-line{display:flex;align-items:center;flex-wrap:wrap;gap:7px}
[data-providers-section] .c-sub{margin-top:4px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;color:var(--c-faint);font-size:11px}
[data-providers-section] .c-dot{display:inline-block;width:6px;height:6px;flex:none;border-radius:50%;background:var(--c-faint)}
[data-providers-section] .c-dot.good{background:#3b7759}
[data-providers-section] .c-missing{display:flex;flex-direction:column;gap:4px;color:var(--c-faint);font-size:12px;min-height:48px;justify-content:center}
[data-providers-section] .c-crumb{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--c-faint);margin-bottom:21px}
[data-providers-section] .c-crumb button{font-size:11px;color:var(--c-muted);padding:0;display:flex;align-items:center;gap:5px}
[data-providers-section] .c-full{display:flex;flex-direction:column;width:100%;min-width:0;max-width:650px;margin:0 auto;box-sizing:border-box}
[data-providers-section] .c-full *{min-width:0;box-sizing:border-box}
[data-providers-section] .c-plugin,[data-providers-section] .c-plugin [data-provider-slot],[data-providers-section] .c-plugin [data-provider-card],[data-providers-section] .c-plugin [data-provider-body]{display:contents!important}
[data-providers-section] .c-plugin [data-provider-body]>p{margin:0 0 16px;color:var(--c-muted);font-size:12px}
[data-providers-section] .c-full:not([data-ready]) [data-provider-body]>*{visibility:hidden}
[data-providers-section] .c-detail-title{padding:0 0 16px;border-bottom:1px solid var(--c-line);margin-bottom:16px}
[data-providers-section] .c-detail-title .c-name{font-size:18px}
[data-providers-section] .c-quota-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:13px}
[data-providers-section] .c-quota-head h3{margin:0;font-size:13px;font-weight:650}
[data-providers-section] .c-quota-list{display:grid;gap:17px}
[data-providers-section] .c-quota-meta{margin-top:12px;display:flex;gap:8px;align-items:center;justify-content:space-between;color:var(--c-faint);font-size:10px;flex-wrap:wrap}
[data-providers-section] .c-empty{color:var(--c-faint);font-size:13px}
[data-providers-section] .c-full [data-provider-card-header]{display:none!important}
[data-providers-section] .c-full [data-provider-body],[data-providers-section] .c-full [data-provider-body][hidden]{display:contents!important}
[data-providers-section] .c-full [data-provider-card]{display:contents!important}
[data-providers-section] .c-plugin [data-provider-quota],[data-providers-section] .c-plugin [data-provider-quota-mini],[data-providers-section] .c-plugin [data-provider-quota-missing]{display:none!important}
[data-providers-section] .c-plugin *:has(> [data-provider-quota]),[data-providers-section] .c-plugin *:has(> [data-provider-quota-mini]){display:none!important}
[data-providers-section] .c-plugin section[aria-label*=usage i],[data-providers-section] .c-plugin section[aria-label*=Usage],[data-providers-section] .c-plugin section[aria-label*=用量]{display:none!important}
[data-providers-section] .c-account{display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:space-between!important;text-align:left!important;gap:12px;padding:12px 14px!important;border:1px solid var(--c-line);border-radius:12px;background:var(--c-subtle);margin:0 0 22px;min-height:0}
[data-providers-section] .c-account-head{margin:22px 0 10px;font-size:13px;font-weight:650}
[data-providers-section] .c-account-copy{display:block!important;flex:1 1 auto;min-width:0;text-align:left!important}
[data-providers-section] .c-account-name{display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:6px;font-size:13px;font-weight:600;text-align:left!important}
[data-providers-section] .c-account-meta{margin-top:3px;font-size:11px;color:var(--c-faint);text-align:left!important}
[data-providers-section] .c-account button{flex:none;min-height:34px}
[data-providers-section] .c-full [data-c-plugin-chrome],[data-providers-section] .c-full [data-c-hide]{display:none!important}
[data-providers-section] .c-full details.c-advanced{border:1px solid var(--c-line);border-radius:12px;margin:6px 0 0;background:transparent}
[data-providers-section] .c-full details.c-advanced>summary{display:flex;align-items:center;gap:8px;padding:12px 14px;min-height:44px;list-style:none;cursor:pointer;font-size:13px;font-weight:650}
[data-providers-section] .c-full details.c-advanced>summary::-webkit-details-marker{display:none}
[data-providers-section] .c-full details.c-advanced>summary .c-ico{flex:none;transition:transform .15s}
[data-providers-section] .c-full details.c-advanced[open]>summary .c-ico{transform:rotate(90deg)}
[data-providers-section] .c-full details.c-advanced>summary .c-advanced-note{margin-left:auto;font-size:11px;font-weight:400;color:var(--c-faint)}
[data-providers-section] .c-full details.c-advanced>section{padding:0 14px 16px}
[data-providers-section] .c-full details.c-advanced>section>section{padding:0}
[data-providers-section] .c-models-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px 12px;flex-wrap:wrap!important;margin:0 0 10px}
[data-providers-section] .c-models-title{display:flex;align-items:baseline;gap:7px;min-width:0}
[data-providers-section] .c-models-title h3{margin:0;font-size:13px;font-weight:650}
[data-providers-section] .c-models-title .c-count{font-size:11px;color:var(--c-faint)}
[data-providers-section] .c-models-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
[data-providers-section] .c-models-actions .c-btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:6px!important;min-height:34px;padding:6px 10px!important;font-size:12px;line-height:1;white-space:nowrap}
[data-providers-section] .c-models-actions .c-btn .c-ico{display:block;flex:none;width:14px;height:14px}
[data-providers-section] .c-models-actions .c-btn.quiet{border-color:transparent!important;background:transparent!important}
[data-providers-section] .c-models-actions .c-btn.quiet:hover{background:var(--c-hover)!important}
[data-providers-section] .c-models-actions .c-btn[disabled]{opacity:.5;cursor:default}
[data-providers-section] .c-models-hint{margin:0 0 12px;font-size:11px;color:var(--c-faint)}
[data-providers-section] .c-full [data-c-own=add]{display:inline-flex!important;align-items:center!important;justify-content:flex-start!important;gap:6px!important;width:auto!important;max-width:100%;align-self:flex-start;margin-top:12px;min-height:34px;padding:6px 10px!important;font-size:12px}
[data-providers-section] .c-full [data-c-own=add] .c-ico{display:block;flex:none;width:14px;height:14px}
[data-providers-section] .c-plugin .c-sort{min-width:96px}
[data-providers-section] .c-full [data-sortable-move]{display:none!important}
[data-providers-section] .c-full [data-sortable-row]:has([data-sortable-handle]:not([hidden])){grid-template-columns:32px minmax(0,1fr)!important;align-items:center}
[data-providers-section] .c-full [data-sortable-row]:has([data-sortable-handle]:not([hidden])) [data-sortable-handle]{width:32px!important;min-width:32px!important;min-height:32px;align-self:center}
[data-providers-section] .c-full [data-provider-model]{grid-template-columns:minmax(0,1.15fr) minmax(0,1fr) 32px 32px!important;align-items:center!important;column-gap:8px;row-gap:4px;padding:10px 8px!important}
[data-providers-section] .c-full [data-provider-model]>.c-field-label{grid-row:1;font-size:11px;color:var(--c-muted);line-height:1.2;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
[data-providers-section] .c-full [data-provider-model]>.c-field-label:nth-of-type(1){grid-column:1}
[data-providers-section] .c-full [data-provider-model]>.c-field-label:nth-of-type(2){grid-column:2}
[data-providers-section] .c-full [data-provider-model]>input:nth-of-type(1){grid-column:1;grid-row:2}
[data-providers-section] .c-full [data-provider-model]>input:nth-of-type(2){grid-column:2;grid-row:2}
[data-providers-section] .c-full [data-provider-model]>button{grid-row:2;align-self:center;justify-self:center;width:32px;height:32px;min-height:32px}
[data-providers-section] .c-full [data-provider-model]>button[aria-expanded]{grid-column:3}
[data-providers-section] .c-full [data-provider-model]>button:not([aria-expanded]){grid-column:4}
[data-providers-section] .c-full [data-sortable-row]:has([data-sortable-handle]:not([hidden])) [data-provider-model]{grid-template-columns:minmax(0,1.15fr) minmax(0,1fr) 32px!important}
[data-providers-section] .c-full [data-sortable-row]:has([data-sortable-handle]:not([hidden])) [data-provider-model]>button[aria-expanded]{display:none!important}
[data-providers-section] .c-full [data-sortable-row]:has([data-sortable-handle]:not([hidden])) [data-provider-model]>button:not([aria-expanded]){grid-column:3}
[data-providers-section] .c-full [data-sortable-row]:has([data-sortable-handle]:not([hidden])) [data-provider-model] input{pointer-events:none;background:var(--c-subtle);color:var(--c-muted);border-color:var(--c-line)}
[data-providers-section] .c-notice{margin:0;color:var(--c-muted);font-size:12px;line-height:1.5}
[data-providers-section] .c-account-actions{display:flex;align-items:center;gap:8px;flex:none}
[data-providers-section] .c-account-body{margin-top:10px}
[data-providers-section] .c-advanced-body{padding:0 14px 16px}
[data-providers-section] .c-advanced>summary .c-ico{flex:none}
[data-providers-section] .c-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:14px;border-top:1px solid var(--c-line);color:var(--c-faint);font-size:11px}
[data-providers-section] .c-draft{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding-top:12px}
[data-providers-section] .sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}
@media (max-width:560px){
 [data-providers-section] .c-labels,[data-providers-section] .c-row-grid{grid-template-columns:minmax(0,1fr);gap:10px}
 [data-providers-section] .c-labels{display:none}
 [data-providers-section] .c-row-grid{min-height:0;padding:14px 4px}
}
@media (max-width:760px){
 [data-providers-section] .c-full{max-width:none;margin:0}
 [data-providers-section] .c-account{flex-wrap:wrap;gap:10px}
 [data-providers-section] .c-quota-meta{flex-direction:column;align-items:flex-start;gap:4px}
 [data-providers-section] .c-models-head{gap:8px}
 [data-providers-section] .c-models-title{width:100%}
 [data-providers-section] .c-full [data-provider-model]{grid-template-columns:minmax(0,1fr) minmax(0,1fr) 32px!important;column-gap:6px}
 [data-providers-section] .c-full [data-provider-model]>button[aria-expanded]{grid-column:3;grid-row:1}
 [data-providers-section] .c-full [data-provider-model]>button:not([aria-expanded]){grid-column:3;grid-row:2}
}
@media (max-width:520px){
 [data-providers-section] .c-full [data-provider-model]{grid-template-columns:minmax(0,1fr) 32px!important;row-gap:4px}
 [data-providers-section] .c-full [data-provider-model]>.c-field-label:nth-of-type(1){grid-column:1;grid-row:1}
 [data-providers-section] .c-full [data-provider-model]>input:nth-of-type(1){grid-column:1;grid-row:2}
 [data-providers-section] .c-full [data-provider-model]>.c-field-label:nth-of-type(2){grid-column:1;grid-row:3}
 [data-providers-section] .c-full [data-provider-model]>input:nth-of-type(2){grid-column:1;grid-row:4}
 [data-providers-section] .c-full [data-provider-model]>button{grid-row:1/span 4;grid-column:2}
 [data-providers-section] .c-account{flex-direction:column!important;align-items:flex-start!important}
 [data-providers-section] .c-plugin .c-sort{min-width:0!important}
 [data-providers-section] .c-models-actions .c-btn{padding:6px 8px!important}
 [data-providers-section] .c-detail-title .c-name{font-size:16px}
 [data-providers-section] .c-quota-head h3{font-size:12px}
}
`;
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
			jsx("style", { children: settingsCCss }),
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
					props.models.list
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
