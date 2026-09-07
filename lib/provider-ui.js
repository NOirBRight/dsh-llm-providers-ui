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
	alignItems: "center",
	gap: 14,
	minWidth: 0,
	flex: 1
};
const headerIdentityStyle = {
	display: "flex",
	alignItems: "center",
	gap: 12,
	minWidth: 0,
	flex: 1
};
const headerMarkStyle = {
	width: 28,
	height: 28,
	flex: "none",
	display: "grid",
	placeItems: "center",
	overflow: "visible"
};
const headerTitleColStyle = {
	display: "flex",
	flexDirection: "column",
	minWidth: 0,
	flex: 1
};
const headerTitleStyle = {
	display: "inline-flex",
	alignItems: "center",
	gap: 8,
	fontSize: 14,
	fontWeight: 600,
	lineHeight: "20px"
};
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
const headerSummaryStyle = {
	fontSize: 11,
	lineHeight: "16px",
	color: "var(--dsw-alias-label-tertiary)",
	whiteSpace: "nowrap",
	overflow: "hidden",
	textOverflow: "ellipsis"
};
const headerMiniStyle = {
	width: 172,
	flex: "none",
	minWidth: 0
};
const headerStatusStyle = {
	width: 96,
	flex: "none",
	textAlign: "right",
	fontSize: 11,
	lineHeight: "16px",
	color: "var(--dsw-alias-label-tertiary)",
	whiteSpace: "nowrap",
	overflow: "hidden",
	textOverflow: "ellipsis"
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
	width: 15,
	fontSize: 20,
	lineHeight: 1,
	textAlign: "center",
	color: "var(--dsw-alias-label-tertiary)"
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
/**
* Approved A header geometry in one row: identity (mark beside title, badge,
* and count) on the left, headline quota at the right, caller status, and the
* chevron. Narrow screens stack identity plus chevron over quota plus status.
* Renders a fragment for the caller-owned header button; props keep the legacy
* codex provider-chrome signature so existing call sites keep working.
*/
function ProviderCardHeader(props) {
	const quota = props.quota === void 0 || props.quota === null ? void 0 : {
		...props.quota.remainingPercent === void 0 ? {} : { remainingPercent: props.quota.remainingPercent },
		...props.quota.remainingFraction === void 0 ? {} : { remainingFraction: props.quota.remainingFraction },
		...props.quota.label === void 0 ? {} : { label: props.quota.label },
		...props.quota.detail === void 0 ? {} : { detail: props.quota.detail }
	};
	return jsxs("span", {
		"data-provider-header-main": "",
		style: headerMainStyle,
		children: [
			jsxs("span", {
				"data-provider-header-identity": "",
				style: headerIdentityStyle,
				children: [jsx("span", {
					"data-provider-header-mark": "",
					style: headerMarkStyle,
					children: props.mark
				}), jsxs("span", {
					style: headerTitleColStyle,
					children: [jsxs("span", {
						style: headerTitleStyle,
						children: [jsx("span", { children: props.title }), jsx(ProviderRoleBadge, { ...props.role === void 0 ? {} : { role: props.role } })]
					}), jsx("span", {
						"data-provider-header-summary": "",
						style: headerSummaryStyle,
						children: props.summary
					})]
				})]
			}),
			quota === void 0 ? null : jsx("span", {
				"data-provider-quota-mini": "",
				style: headerMiniStyle,
				children: jsx(ProviderQuotaMeter, { ...quota })
			}),
			props.status === void 0 ? null : jsx("span", {
				"data-provider-header-status": "",
				style: headerStatusStyle,
				children: props.status
			}),
			jsxs("span", {
				"data-provider-header-side": "",
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
					children: "⌄"
				})]
			})
		]
	});
}
/**
* Scoped provider chrome CSS: plain card reset, header button layout, body and
* model rows, quota meter responsive rules, and coarse-pointer touch targets.
* The shell injects it once per page; provider cards may also inject it once
* for standalone use. Duplicate style tags are harmless: every rule is scoped
* to a data-provider-* attribute; shared geometry overrides legacy inline layout styles.
*/
const providerUiCss = [
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
//#region lib/types/client/provider-marks.js
function Svg(props) {
	return jsxs("svg", {
		className: "pu-logo",
		viewBox: props.viewBox,
		preserveAspectRatio: "xMidYMid meet",
		"aria-hidden": true,
		children: [
			" ",
			props.children,
			" "
		]
	});
}
const DEEPSEEK_FISH_PATH = "M22.9168 1.43018C22.6713 1.31018 22.5658 1.53918 22.4223 1.65519C22.3733 1.69269 22.3318 1.74169 22.2903 1.78669C21.9317 2.1697 21.5127 2.42121 20.9657 2.39121C20.1657 2.34621 19.4827 2.59771 18.8787 3.20973C18.7502 2.45521 18.3236 2.0047 17.6746 1.71569C17.3351 1.56568 16.9916 1.41518 16.7536 1.08867C16.5876 0.856163 16.5421 0.597155 16.4591 0.341647C16.4061 0.187643 16.3536 0.0301382 16.1761 0.00363739C15.9836 -0.0263635 15.9081 0.135141 15.8326 0.270145C15.5306 0.822162 15.4136 1.43018 15.4251 2.0462C15.4516 3.43174 16.0366 4.53527 17.1991 5.3203C17.3311 5.4103 17.3651 5.5003 17.3236 5.63181C17.2441 5.90231 17.1501 6.16482 17.0671 6.43533C17.0141 6.60784 16.9351 6.64584 16.7501 6.57033C16.1121 6.30383 15.5611 5.90931 15.074 5.4328C14.2475 4.63328 13.5 3.75075 12.568 3.05973C12.349 2.89822 12.13 2.74822 11.9034 2.60522C10.9524 1.68169 12.028 0.923165 12.277 0.833162C12.5375 0.739159 12.3675 0.41615 11.5259 0.42015C10.6844 0.42365 9.91439 0.705658 8.93286 1.08117C8.78935 1.13767 8.63835 1.17867 8.48384 1.21267C7.59332 1.04367 6.66829 1.00617 5.70226 1.11517C3.88321 1.31768 2.43016 2.1777 1.36213 3.64575C0.0790928 5.4103 -0.222916 7.41536 0.146595 9.50642C0.535106 11.7105 1.66014 13.535 3.38869 14.9616C5.18125 16.4406 7.24581 17.1657 9.60138 17.0266C11.0319 16.9441 12.6245 16.7526 14.421 15.2321C14.874 15.4576 15.3496 15.5476 16.1381 15.6151C16.7456 15.6716 17.3306 15.5851 17.7836 15.4911C18.4931 15.3411 18.4441 14.6841 18.1876 14.5636C16.1081 13.595 16.5646 13.9891 16.1496 13.67C17.2061 12.42 18.8202 10.1979 19.3182 7.17235C19.3672 6.83834 19.4297 6.36783 19.4222 6.09732C19.4182 5.93231 19.4562 5.86831 19.6447 5.84931C20.1657 5.78931 20.6712 5.64681 21.1357 5.3913C22.4833 4.65528 23.0268 3.44624 23.1548 1.9972C23.1738 1.77569 23.1508 1.54668 22.9168 1.43018ZM11.1749 14.4736C9.15936 12.889 8.18184 12.3675 7.77832 12.39C7.40081 12.4125 7.46881 12.8445 7.55182 13.126C7.63882 13.404 7.75182 13.5955 7.91033 13.8396C8.01983 14.0011 8.09533 14.2411 7.80083 14.4216C7.15181 14.8231 6.02327 14.2866 5.97027 14.2601C4.65673 13.4865 3.5587 12.4655 2.78467 11.069C2.03715 9.72493 1.60314 8.28289 1.53164 6.74384C1.51264 6.37233 1.62214 6.24082 1.99215 6.17332C2.47916 6.08332 2.98118 6.06432 3.46769 6.13582C5.52476 6.43633 7.27581 7.35586 8.74385 8.8129C9.58188 9.64243 10.2159 10.634 10.8689 11.6025C11.5634 12.631 12.3105 13.611 13.262 14.4146C13.598 14.6961 13.866 14.9101 14.1225 15.0681C13.349 15.1546 12.058 15.1731 11.1749 14.4746L11.1749 14.4736ZM12.141 8.25988C12.141 8.09488 12.273 7.96338 12.439 7.96338C12.4765 7.96338 12.5105 7.97088 12.541 7.98188C12.5825 7.99688 12.6205 8.01938 12.6505 8.05338C12.7035 8.10588 12.7335 8.18088 12.7335 8.25988C12.7335 8.42489 12.6015 8.55639 12.4355 8.55639C12.2695 8.55639 12.141 8.42489 12.141 8.25988ZM15.1415 9.79893C14.949 9.87793 14.7565 9.94544 14.5715 9.95294C14.2845 9.96794 13.9715 9.85143 13.8015 9.70893C13.5375 9.48742 13.3485 9.36342 13.2695 8.97691C13.2355 8.8119 13.2545 8.55639 13.2845 8.40989C13.3525 8.09438 13.277 7.89187 13.0545 7.70787C12.8735 7.55786 12.643 7.51636 12.39 7.51636C12.2955 7.51636 12.209 7.47486 12.1445 7.44136C12.039 7.38886 11.9519 7.25735 12.035 7.09585C12.0615 7.04335 12.19 6.91584 12.22 6.89334C12.5635 6.69784 12.9595 6.76184 13.326 6.90834C13.6655 7.04735 13.9225 7.30236 14.292 7.66287C14.6695 8.09838 14.7375 8.21838 14.9525 8.54539C15.1225 8.8009 15.277 9.06341 15.3831 9.36392C15.4471 9.55142 15.3641 9.70493 15.1415 9.79893Z";
const GENERIC_GLOBE_PATH = "M7.00018 0.353516C10.6708 0.353535 13.6468 3.32958 13.6469 7.00018C13.6468 10.6708 10.6708 13.6468 7.00018 13.6469C3.32957 13.6468 0.353535 10.6708 0.353516 7.00018C0.353535 3.32957 3.32957 0.353531 7.00018 0.353516ZM5.44643 7.59661C5.49463 8.97506 5.70762 10.191 6.02136 11.0793C6.20141 11.5891 6.40328 11.9585 6.59898 12.1889C6.79501 12.4196 6.93213 12.454 7.00018 12.454C7.06822 12.454 7.20533 12.4197 7.40138 12.1889C7.59708 11.9585 7.79895 11.589 7.979 11.0793C8.29274 10.191 8.50574 8.97506 8.55394 7.59661H5.44643ZM1.57861 7.59661C1.80785 9.70467 3.2386 11.4509 5.1715 12.1388C5.07135 11.9317 4.97972 11.7098 4.89746 11.477C4.53084 10.4391 4.30224 9.0828 4.25357 7.59661H1.57861ZM9.74679 7.59661C9.69813 9.0828 9.46952 10.4391 9.1029 11.477C9.0206 11.7099 8.92818 11.9316 8.82797 12.1388C10.7613 11.4511 12.1925 9.70496 12.4218 7.59661H9.74679ZM5.1706 1.8616C3.23814 2.54963 1.80876 4.29604 1.5795 6.40376H4.25357C4.30224 4.91756 4.53083 3.56129 4.89746 2.5234C4.97968 2.29066 5.07051 2.0686 5.1706 1.8616ZM7.00018 1.54637C6.93213 1.54638 6.79503 1.5807 6.59898 1.81145C6.40332 2.04177 6.20139 2.41058 6.02136 2.92012C5.70754 3.80851 5.49461 5.02499 5.44643 6.40376H8.55394C8.50575 5.025 8.29282 3.80851 7.979 2.92012C7.79898 2.41059 7.59705 2.04177 7.40138 1.81145C7.20531 1.58067 7.06823 1.54637 7.00018 1.54637ZM8.82887 1.8616C8.92902 2.0687 9.02064 2.29053 9.1029 2.5234C9.46953 3.56129 9.69812 4.91756 9.74679 6.40376H12.4209C12.1916 4.29575 10.7618 2.54943 8.82887 1.8616Z";
function ProviderMark(props) {
	switch (props.providerKey.startsWith("llm-") ? props.providerKey : props.providerKey === "opencode" ? "llm-opencode-go" : "llm-" + props.providerKey) {
		case "llm-cursor": return jsx(Svg, {
			viewBox: "0 0 24 24",
			children: jsx("path", {
				fill: "currentColor",
				d: "M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23"
			})
		});
		case "llm-antigravity": return jsx(Svg, {
			viewBox: "0 0 169 148",
			children: jsx("path", {
				fill: "currentColor",
				d: "M84.5 16C64 16 57 39 49 67C42 93 36 111 24 122C18 128 22 132 28 132C42 132 50 116 59 99C66 85 72 78 84.5 78C97 78 103 85 110 99C119 116 127 132 141 132C147 132 151 128 145 122C133 111 127 93 120 67C112 39 105 16 84.5 16Z"
			})
		});
		case "llm-codex": return jsx(Svg, {
			viewBox: "0 0 24 24",
			children: jsx("path", {
				fill: "currentColor",
				d: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
			})
		});
		case "llm-ollama": return jsx(Svg, {
			viewBox: "0 0 24 24",
			children: jsx("path", {
				fill: "currentColor",
				d: "M16.361 10.26a.894.894 0 0 0-.558.47l-.072.148.001.207c0 .193.004.217.059.353.076.193.152.312.291.448.24.238.51.3.872.205a.86.86 0 0 0 .517-.436.752.752 0 0 0 .08-.498c-.064-.453-.33-.782-.724-.897a1.06 1.06 0 0 0-.466 0zm-9.203.005c-.305.096-.533.32-.65.639a1.187 1.187 0 0 0-.06.52c.057.309.31.59.598.667.362.095.632.033.872-.205.14-.136.215-.255.291-.448.055-.136.059-.16.059-.353l.001-.207-.072-.148a.894.894 0 0 0-.565-.472 1.02 1.02 0 0 0-.474.007Zm4.184 2c-.131.071-.223.25-.195.383.031.143.157.288.353.407.105.063.112.072.117.136.004.038-.01.146-.029.243-.02.094-.036.194-.036.222.002.074.07.195.143.253.064.052.076.054.255.059.164.005.198.001.264-.03.169-.082.212-.234.15-.525-.052-.243-.042-.28.087-.355.137-.08.281-.219.324-.314a.365.365 0 0 0-.175-.48.394.394 0 0 0-.181-.033c-.126 0-.207.03-.355.124l-.085.053-.053-.032c-.219-.13-.259-.145-.391-.143a.396.396 0 0 0-.193.032zm.39-2.195c-.373.036-.475.05-.654.086-.291.06-.68.195-.951.328-.94.46-1.589 1.226-1.787 2.114-.04.176-.045.234-.045.53 0 .294.005.357.043.524.264 1.16 1.332 2.017 2.714 2.173.3.033 1.596.033 1.896 0 1.11-.125 2.064-.727 2.493-1.571.114-.226.169-.372.22-.602.039-.167.044-.23.044-.523 0-.297-.005-.355-.045-.531-.288-1.29-1.539-2.304-3.072-2.497a6.873 6.873 0 0 0-.855-.031zm.645.937a3.283 3.283 0 0 1 1.44.514c.223.148.537.458.671.662.166.251.26.508.303.82.02.143.01.251-.043.482-.08.345-.332.705-.672.957a3.115 3.115 0 0 1-.689.348c-.382.122-.632.144-1.525.138-.582-.006-.686-.01-.853-.042-.57-.107-1.022-.334-1.35-.68-.264-.28-.385-.535-.45-.946-.03-.192.025-.509.137-.776.136-.326.488-.73.836-.963.403-.269.934-.46 1.422-.512.187-.02.586-.02.773-.002zm-5.503-11a1.653 1.653 0 0 0-.683.298C5.617.74 5.173 1.666 4.985 2.819c-.07.436-.119 1.04-.119 1.503 0 .544.064 1.24.155 1.721.02.107.031.202.023.208a8.12 8.12 0 0 1-.187.152 5.324 5.324 0 0 0-.949 1.02 5.49 5.49 0 0 0-.94 2.339 6.625 6.625 0 0 0-.023 1.357c.091.78.325 1.438.727 2.04l.13.195-.037.064c-.269.452-.498 1.105-.605 1.732-.084.496-.095.629-.095 1.294 0 .67.009.803.088 1.266.095.555.288 1.143.503 1.534.071.128.243.393.264.407.007.003-.014.067-.046.141a7.405 7.405 0 0 0-.548 1.873c-.062.417-.071.552-.071.991 0 .56.031.832.148 1.279L3.42 24h1.478l-.05-.091c-.297-.552-.325-1.575-.068-2.597.117-.472.25-.819.498-1.296l.148-.29v-.177c0-.165-.003-.184-.057-.293a.915.915 0 0 0-.194-.25 1.74 1.74 0 0 1-.385-.543c-.424-.92-.506-2.286-.208-3.451.124-.486.329-.918.544-1.154a.787.787 0 0 0 .223-.531c0-.195-.07-.355-.224-.522a3.136 3.136 0 0 1-.817-1.729c-.14-.96.114-2.005.69-2.834.563-.814 1.353-1.336 2.237-1.475.199-.033.57-.028.776.01.226.04.367.028.512-.041.179-.085.268-.19.374-.431.093-.215.165-.333.36-.576.234-.29.46-.489.822-.729.413-.27.884-.467 1.352-.561.17-.035.25-.04.569-.04.319 0 .398.005.569.04a4.07 4.07 0 0 1 1.914.997c.117.109.398.457.488.602.034.057.095.177.132.267.105.241.195.346.374.43.14.068.286.082.503.045.343-.058.607-.053.943.016 1.144.23 2.14 1.173 2.581 2.437.385 1.108.276 2.267-.296 3.153-.097.15-.193.27-.333.419-.301.322-.301.722-.001 1.053.493.539.801 1.866.708 3.036-.062.772-.26 1.463-.533 1.854a2.096 2.096 0 0 1-.224.258.916.916 0 0 0-.194.25c-.054.109-.057.128-.057.293v.178l.148.29c.248.476.38.823.498 1.295.253 1.008.231 2.01-.059 2.581a.845.845 0 0 0-.044.098c0 .006.329.009.732.009h.73l.02-.074.036-.134c.019-.076.057-.3.088-.516.029-.217.029-1.016 0-1.258-.11-.875-.295-1.57-.597-2.226-.032-.074-.053-.138-.046-.141.008-.005.057-.074.108-.152.376-.569.607-1.284.724-2.228.031-.26.031-1.378 0-1.628-.083-.645-.182-1.082-.348-1.525a6.083 6.083 0 0 0-.329-.7l-.038-.064.131-.194c.402-.604.636-1.262.727-2.04a6.625 6.625 0 0 0-.024-1.358 5.512 5.512 0 0 0-.939-2.339 5.325 5.325 0 0 0-.95-1.02 8.097 8.097 0 0 1-.186-.152.692.692 0 0 1 .023-.208c.208-1.087.201-2.443-.017-3.503-.19-.924-.535-1.658-.98-2.082-.354-.338-.716-.482-1.15-.455-.996.059-1.8 1.205-2.116 3.01a6.805 6.805 0 0 0-.097.726c0 .036-.007.066-.015.066a.96.96 0 0 1-.149-.078A4.857 4.857 0 0 0 12 3.03c-.832 0-1.687.243-2.456.698a.958.958 0 0 1-.148.078c-.008 0-.015-.03-.015-.066a6.71 6.71 0 0 0-.097-.725C8.997 1.392 8.337.319 7.46.048a2.096 2.096 0 0 0-.585-.041Zm.293 1.402c.248.197.523.759.682 1.388.03.113.06.244.069.292.007.047.026.152.041.233.067.365.098.76.102 1.24l.002.475-.12.175-.118.178h-.278c-.324 0-.646.041-.954.124l-.238.06c-.033.007-.038-.003-.057-.144a8.438 8.438 0 0 1 .016-2.323c.124-.788.413-1.501.696-1.711.067-.05.079-.049.157.013zm9.825-.012c.17.126.358.46.498.888.28.854.36 2.028.212 3.145-.019.14-.024.151-.057.144l-.238-.06a3.693 3.693 0 0 0-.954-.124h-.278l-.119-.178-.119-.175.002-.474c.004-.669.066-1.19.214-1.772.157-.623.434-1.185.68-1.382.078-.062.09-.063.159-.012z"
			})
		});
		case "llm-grok": return jsxs(Svg, {
			viewBox: "0 0 562 545",
			children: [jsx("path", {
				fill: "currentColor",
				d: "M411 105C376 80 334 66 289 66C173 66 79 160 79 276C79 306 85 329 95 353C117 407 87 451 0 542L178 383C150 355 134 318 134 277C134 192 203 123 289 123C310 123 330 127 348 134Z"
			}), jsx("path", {
				fill: "currentColor",
				d: "M167 448L230 418C248 426 268 430 289 430C374 430 443 361 443 277C443 256 439 234 431 214C427 206 416 204 407 210L217 349L562 2C480 103 475 144 494 229C518 333 468 422 391 459C319 494 235 498 167 448Z"
			})]
		});
		case "llm-commandcode": return jsxs(Svg, {
			viewBox: "0 0 137 137",
			children: [
				jsx("path", {
					fill: "currentColor",
					d: "m0 66.7959c0-31.4879 0-47.2318 9.78204-57.01386 9.78206-9.78204 25.52596-9.78204 57.01396-9.78204h2.5357c31.4883 0 47.2323 0 57.0143 9.78204 9.782 9.78206 9.782 25.52596 9.782 57.01396v2.5357c0 31.4883 0 47.2323-9.782 57.0143s-25.526 9.782-57.0144 9.782h-2.5357c-31.4879 0-47.2318 0-57.01386-9.782-9.78204-9.782-9.78204-25.526-9.78204-57.0144z"
				}),
				jsx("path", {
					clipRule: "evenodd",
					fill: "currentColor",
					fillRule: "evenodd",
					d: "m69.3317 5.56633h-2.5357c-15.9014 0-27.2674.01182-35.905 1.17312-8.4775 1.13977-13.4886 3.29415-17.173 6.97855s-5.83878 8.6955-6.97855 17.173c-1.1613 8.6376-1.17312 20.0036-1.17312 35.9049v2.5357c0 15.9014.01182 27.2674 1.17312 35.9054 1.13977 8.477 3.29415 13.488 6.97855 17.173 3.6844 3.684 8.6955 5.838 17.173 6.978 8.6376 1.161 20.0036 1.173 35.9049 1.173h2.5357c15.9014 0 27.2674-.012 35.9054-1.173 8.477-1.14 13.488-3.294 17.173-6.978 3.684-3.685 5.838-8.696 6.978-17.173 1.161-8.638 1.173-20.004 1.173-35.9053v-2.5357c0-15.9014-.012-27.2674-1.173-35.905-1.14-8.4775-3.294-13.4886-6.978-17.173-3.685-3.6844-8.696-5.83878-17.173-6.97855-8.638-1.1613-20.004-1.17312-35.9053-1.17312zm-59.54966 4.21571c-9.78204 9.78206-9.78204 25.52596-9.78204 57.01386v2.5357c0 31.4884 0 47.2324 9.78204 57.0144 9.78206 9.782 25.52596 9.782 57.01386 9.782h2.5357c31.4884 0 47.2324 0 57.0144-9.782s9.782-25.526 9.782-57.0143v-2.5357c0-31.488 0-47.2319-9.782-57.01396-9.782-9.78204-25.526-9.78204-57.0143-9.78204h-2.5357c-31.488 0-47.2319 0-57.01396 9.78204z"
				}),
				jsx("path", {
					fill: "var(--dsw-alias-bg-layer-1)",
					d: "m93.6604 26.1784c-8.982 0-16.2887 7.3067-16.2887 16.2888v6.9809h-18.6158v-6.9809c0-8.9821-7.3067-16.2888-16.2887-16.2888-8.9821 0-16.2888 7.3067-16.2888 16.2888s7.3067 16.2887 16.2888 16.2887h6.9809v18.6158h-6.9809c-8.9821 0-16.2888 7.3067-16.2888 16.2888 0 8.9825 7.3067 16.2885 16.2888 16.2885 8.982 0 16.2887-7.306 16.2887-16.2885v-6.981h18.6158v6.981c0 8.9825 7.3067 16.2885 16.2887 16.2885 8.9826 0 16.2886-7.306 16.2886-16.2885 0-8.9821-7.306-16.2888-16.2886-16.2888h-6.9809v-18.6158h6.9809c8.9826 0 16.2886-7.3066 16.2886-16.2887s-7.306-16.2888-16.2886-16.2888zm-6.9809 23.2697v-6.9809c0-3.8628 3.1182-6.9809 6.9809-6.9809 3.8628 0 6.9806 3.1181 6.9806 6.9809 0 3.8627-3.1178 6.9809-6.9806 6.9809zm-44.2123 0c-3.8628 0-6.9809-3.1182-6.9809-6.9809 0-3.8628 3.1181-6.9809 6.9809-6.9809 3.8627 0 6.9809 3.1181 6.9809 6.9809v6.9809zm16.2887 27.9236v-18.6158h18.6158v18.6158zm34.9045 23.2693c-3.8627 0-6.9809-3.1178-6.9809-6.9805v-6.981h6.9809c3.8628 0 6.9806 3.1182 6.9806 6.981 0 3.8627-3.1178 6.9805-6.9806 6.9805zm-51.1932 0c-3.8628 0-6.9809-3.1178-6.9809-6.9805 0-3.8628 3.1181-6.981 6.9809-6.981h6.9809v6.981c0 3.8627-3.1182 6.9805-6.9809 6.9805z"
				})
			]
		});
		case "llm-deepseek":
		case "llm-deepseek-official": return jsx(Svg, {
			viewBox: "0 0 23.16 17.04",
			children: jsx("path", {
				fill: "currentColor",
				d: DEEPSEEK_FISH_PATH
			})
		});
		case "llm-opencode-go": return jsxs(Svg, {
			viewBox: "128 96 256 320",
			children: [jsx("path", {
				fill: "currentColor",
				opacity: ".35",
				d: "M320 224V352H192V224H320Z"
			}), jsx("path", {
				fill: "currentColor",
				fillRule: "evenodd",
				d: "M384 416H128V96H384V416ZM320 160H192V352H320V160Z"
			})]
		});
		default: return jsx(Svg, {
			viewBox: "0 0 14 14",
			children: jsx("path", {
				fill: "currentColor",
				fillRule: "evenodd",
				clipRule: "evenodd",
				d: GENERIC_GLOBE_PATH
			})
		});
	}
}
//#endregion
export { ProviderCardHeader, ProviderMark, ProviderQuotaMeter, ProviderRoleBadge, normalizeQuotaRemaining, providerUiCss };
