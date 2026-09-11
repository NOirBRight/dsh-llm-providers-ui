import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
//#region lib/types/client/model-catalog-ui.js
const inputStyle = {
	boxSizing: "border-box",
	width: "100%",
	minHeight: 36,
	border: "1px solid var(--dsw-alias-border-l2)",
	borderRadius: 8,
	padding: "7px 10px",
	background: "var(--dsw-alias-bg-layer-1)",
	color: "var(--dsw-alias-label-primary)",
	font: "inherit"
};
const rowInputStyle = {
	...inputStyle,
	minHeight: 32,
	padding: "4px 10px"
};
const selectStyle = {
	boxSizing: "border-box",
	minHeight: 32,
	border: "1px solid var(--dsw-alias-border-l2)",
	borderRadius: 8,
	padding: "4px 28px 4px 10px",
	backgroundColor: "var(--dsw-alias-bg-layer-1)",
	color: "var(--dsw-alias-label-primary)",
	font: "inherit",
	appearance: "none",
	backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
	backgroundRepeat: "no-repeat",
	backgroundPosition: "right 8px center"
};
const rowStyle$1 = {
	display: "grid",
	gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
	gap: 10
};
const modelContentStyle = {
	display: "grid",
	gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 1fr) auto auto",
	alignItems: "start",
	gap: 8,
	padding: "10px 8px"
};
const modelContentSortingStyle = {
	...modelContentStyle,
	gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 1fr) auto"
};
const modelDetailStyle = {
	display: "flex",
	flexDirection: "column",
	gap: 10,
	borderTop: "1px solid var(--dsw-alias-border-l2)",
	padding: "10px 4px 4px"
};
const capabilitiesStyle = {
	display: "flex",
	alignItems: "center",
	flexWrap: "wrap",
	gap: 14
};
const fieldStyle = {
	display: "flex",
	flexDirection: "column",
	gap: 6
};
const labelStyle = {
	fontSize: 13,
	color: "var(--dsw-alias-label-secondary)"
};
/** Expanded model details spanning the sortable row. */
function ModelCatalogDetails({ children }) {
	return jsx("div", {
		style: {
			...modelDetailStyle,
			gridColumn: "1 / -1"
		},
		children
	});
}
/** Two-column field row inside model details. */
function ModelCatalogRow({ children }) {
	return jsx("div", {
		style: rowStyle$1,
		children
	});
}
/** Capability and default-effort cluster. */
function ModelCatalogCapabilities({ children }) {
	return jsx("div", {
		style: capabilitiesStyle,
		children
	});
}
/** Header grid for id, name, and row actions. */
function ModelCatalogRowGrid({ children }) {
	return jsx("div", {
		style: modelContentStyle,
		children
	});
}
const catalogStyles = {
	inputStyle,
	rowInputStyle,
	selectStyle,
	rowStyle: rowStyle$1,
	modelContentStyle,
	modelContentSortingStyle,
	modelDetailStyle,
	capabilitiesStyle,
	fieldStyle,
	labelStyle
};
//#endregion
//#region lib/types/client/SortableList.js
/** Pointer-driven sortable list with a floating ghost and animated live preview. */
const listStyle$1 = {
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
	const rowChromeStyle = plain ? plainRowStyle : card ? cardRowStyle : rowStyle;
	const rowGridColumns = (showHandle ? "44px " : "") + "minmax(0,1fr)" + (moveButtons && showHandle ? " auto auto" : "");
	const rowItemStyle = plain ? plainItemStyle : card ? cardItemStyle : { minWidth: 0 };
	return jsxs("div", {
		"data-sortable-card": card ? "" : void 0,
		"data-sortable-plain": plain ? "" : void 0,
		style: {
			...listStyle$1,
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
								...handleStyle,
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
//#region lib/types/client/ModelCatalogEditor.js
const iconButtonStyle = {
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	width: 28,
	height: 28,
	border: 0,
	borderRadius: 8,
	background: "transparent",
	color: "var(--dsw-alias-label-secondary)",
	cursor: "pointer"
};
/** Copy declared draft keys, including contextWindow. Thinking false clears defaultEffort. */
function applyCatalogPatch(model, patch) {
	const next = {};
	for (const [key, value] of Object.entries(model)) next[key] = value;
	for (const [key, value] of Object.entries(patch)) if (value === void 0) delete next[key];
	else next[key] = value;
	if (patch.thinking === false) delete next.defaultEffort;
	return next;
}
function IconChevron({ open }) {
	return jsx("svg", {
		width: "12",
		height: "12",
		viewBox: "0 0 16 16",
		fill: "none",
		"aria-hidden": true,
		style: {
			flex: "none",
			transform: open ? "rotate(90deg)" : "none",
			transition: "transform 120ms ease"
		},
		children: jsx("path", {
			d: "M6 3.5L10.5 8L6 12.5",
			stroke: "currentColor",
			strokeWidth: "1.5",
			strokeLinecap: "round",
			strokeLinejoin: "round"
		})
	});
}
function IconTrash() {
	return jsx("svg", {
		width: "14",
		height: "14",
		viewBox: "0 0 16 16",
		fill: "none",
		"aria-hidden": true,
		children: jsx("path", {
			d: "M2.5 4h11M6.5 4V2.5h3V4M4 4l.7 9a1 1 0 001 .9h4.6a1 1 0 001-.9L12 4M6.5 6.8v4.4M9.5 6.8v4.4",
			stroke: "currentColor",
			strokeWidth: "1.3",
			strokeLinecap: "round",
			strokeLinejoin: "round"
		})
	});
}
function Capability({ label, value, disabled, triState, unknownLabel, supportedLabel, unsupportedLabel, onChange }) {
	if (!triState) return jsxs("label", {
		style: {
			...catalogStyles.labelStyle,
			display: "inline-flex",
			alignItems: "center",
			gap: 6
		},
		children: [jsx("input", {
			type: "checkbox",
			checked: value === true,
			disabled,
			onChange: (event) => {
				onChange(event.target.checked);
			}
		}), label]
	});
	const selected = value === true ? "yes" : value === false ? "no" : "unknown";
	return jsxs("label", {
		style: {
			...catalogStyles.labelStyle,
			display: "inline-flex",
			alignItems: "center",
			gap: 6
		},
		children: [label, jsxs("select", {
			style: catalogStyles.selectStyle,
			value: selected,
			disabled,
			"aria-label": label,
			onChange: (event) => {
				const next = event.target.value;
				onChange(next === "yes" ? true : next === "no" ? false : void 0);
			},
			children: [
				jsx("option", {
					value: "unknown",
					children: unknownLabel
				}),
				jsx("option", {
					value: "yes",
					children: supportedLabel
				}),
				jsx("option", {
					value: "no",
					children: unsupportedLabel
				})
			]
		})]
	});
}
function Source({ labels, sources, field }) {
	const source = sources?.[field];
	if (source === void 0 || labels.source === void 0) return null;
	return jsx("span", {
		style: {
			fontSize: 12,
			color: "var(--dsw-alias-label-tertiary)"
		},
		children: labels.source.replace("{source}", source)
	});
}
function Restore({ labels, field, overrides, disabled, onRestore }) {
	if (labels.restoreAuto === void 0 || onRestore === void 0 || overrides?.[field] !== true) return null;
	return jsx("button", {
		type: "button",
		style: {
			...iconButtonStyle,
			width: "auto",
			padding: "0 8px",
			fontSize: 12
		},
		disabled,
		onClick: () => {
			onRestore(field);
		},
		children: labels.restoreAuto
	});
}
/** Sortable catalog rows with optional vision, thinking, effort, and capacity fields. */
function ModelCatalogEditor(props) {
	const { items, fields, labels, disabled = false, sorting = false, expanded, onRestore } = props;
	const allClosed = items.length > 0 && items.every((model) => !expanded.has(model.rowId));
	const zh = typeof document !== "undefined" && document.documentElement.lang.toLowerCase().startsWith("zh");
	const expandLabel = labels.expandAll ?? (zh ? "全部展开" : "Expand all");
	const collapseLabel = labels.collapseAll ?? (zh ? "全部收起" : "Collapse all");
	return jsxs("div", { children: [items.length === 0 ? null : jsx("div", {
		style: {
			display: "flex",
			justifyContent: "flex-end",
			marginBottom: 8
		},
		children: jsx("button", {
			type: "button",
			disabled,
			"aria-pressed": !allClosed,
			style: {
				...iconButtonStyle,
				width: "auto",
				minWidth: 96,
				padding: "0 10px",
				gap: 6,
				fontSize: 12
			},
			onClick: () => {
				for (const model of items) {
					const open = expanded.has(model.rowId);
					if (allClosed && !open) props.onToggle(model.rowId);
					if (!allClosed && open) props.onToggle(model.rowId);
				}
			},
			children: allClosed ? expandLabel : collapseLabel
		})
	}), jsx(SortableList, {
		items: [...items],
		getId: (model) => model.rowId,
		disabled,
		sorting,
		chrome: "row",
		dragLabel: (model, index) => labels.drag + ": " + (model.id.trim() || String(index + 1)),
		onReorder: props.onReorder,
		renderItem: (model, index) => {
			const label = model.id.trim() || String(index + 1);
			const open = expanded.has(model.rowId);
			const efforts = model.efforts ?? [];
			const patch = (next) => {
				props.onPatch(index, next);
			};
			return jsxs("div", {
				"data-model-row": label,
				"data-provider-model": "",
				style: sorting ? catalogStyles.modelContentSortingStyle : catalogStyles.modelContentStyle,
				children: [
					jsxs("label", {
						style: catalogStyles.fieldStyle,
						children: [jsx("span", {
							style: catalogStyles.labelStyle,
							children: labels.modelId
						}), jsx("input", {
							style: catalogStyles.rowInputStyle,
							value: model.id,
							placeholder: labels.modelId,
							"aria-label": labels.modelId + " " + String(index + 1),
							disabled,
							onChange: (event) => {
								patch({ id: event.target.value });
							}
						})]
					}),
					jsxs("label", {
						style: catalogStyles.fieldStyle,
						children: [jsx("span", {
							style: catalogStyles.labelStyle,
							children: labels.modelName
						}), jsx("input", {
							style: catalogStyles.rowInputStyle,
							value: model.name ?? "",
							placeholder: labels.modelName,
							"aria-label": labels.modelName + " " + String(index + 1),
							disabled,
							onChange: (event) => {
								patch({ name: event.target.value || void 0 });
							}
						})]
					}),
					sorting ? null : jsx("button", {
						type: "button",
						style: {
							...iconButtonStyle,
							marginTop: 18
						},
						"aria-label": labels.modelDetails + ": " + label,
						"aria-expanded": open,
						title: labels.modelDetails,
						onClick: () => {
							props.onToggle(model.rowId);
						},
						children: jsx(IconChevron, { open })
					}),
					props.onRemove === void 0 ? null : jsx("button", {
						type: "button",
						style: {
							...iconButtonStyle,
							marginTop: 18
						},
						"aria-label": labels.remove + " " + label,
						title: labels.remove,
						disabled,
						onClick: () => {
							props.onRemove?.(index);
						},
						children: jsx(IconTrash, {})
					}),
					open ? jsxs(ModelCatalogDetails, { children: [fields.context || fields.inputLimit || fields.output ? jsxs(ModelCatalogRow, { children: [
						fields.context ? jsxs("label", {
							style: catalogStyles.fieldStyle,
							children: [
								jsx("span", {
									style: catalogStyles.labelStyle,
									children: labels.contextWindow
								}),
								jsx("input", {
									style: catalogStyles.inputStyle,
									inputMode: "numeric",
									placeholder: labels.contextWindowDefault,
									value: model.contextWindow ?? "",
									disabled,
									"aria-label": labels.contextWindow,
									onChange: (event) => {
										patch({ contextWindow: event.target.value });
									}
								}),
								jsx(Source, {
									labels,
									sources: model.sources,
									field: "contextWindow"
								}),
								jsx(Restore, {
									labels,
									field: "contextWindow",
									overrides: model.overrides,
									disabled,
									onRestore: (field) => {
										onRestore?.(index, field);
									}
								})
							]
						}) : null,
						fields.inputLimit ? jsxs("label", {
							style: catalogStyles.fieldStyle,
							children: [
								jsx("span", {
									style: catalogStyles.labelStyle,
									children: labels.inputLimit ?? labels.contextWindow
								}),
								jsx("input", {
									style: catalogStyles.inputStyle,
									inputMode: "numeric",
									placeholder: labels.contextWindowDefault,
									value: model.inputLimit ?? "",
									disabled,
									"aria-label": labels.inputLimit ?? labels.contextWindow,
									onChange: (event) => {
										patch({ inputLimit: event.target.value });
									}
								}),
								jsx(Source, {
									labels,
									sources: model.sources,
									field: "inputLimit"
								}),
								jsx(Restore, {
									labels,
									field: "inputLimit",
									overrides: model.overrides,
									disabled,
									onRestore: (field) => {
										onRestore?.(index, field);
									}
								})
							]
						}) : null,
						fields.output ? jsxs("label", {
							style: catalogStyles.fieldStyle,
							children: [
								jsx("span", {
									style: catalogStyles.labelStyle,
									children: labels.output ?? labels.contextWindow
								}),
								jsx("input", {
									style: catalogStyles.inputStyle,
									inputMode: "numeric",
									placeholder: labels.contextWindowDefault,
									value: model.output ?? "",
									disabled,
									"aria-label": labels.output ?? labels.contextWindow,
									onChange: (event) => {
										patch({ output: event.target.value });
									}
								}),
								jsx(Source, {
									labels,
									sources: model.sources,
									field: "output"
								}),
								jsx(Restore, {
									labels,
									field: "output",
									overrides: model.overrides,
									disabled,
									onRestore: (field) => {
										onRestore?.(index, field);
									}
								})
							]
						}) : null
					] }) : null, jsxs(ModelCatalogCapabilities, { children: [
						fields.vision ? jsxs(Fragment, { children: [
							jsx(Capability, {
								label: labels.vision,
								value: model.vision,
								disabled,
								triState: fields.triState === true,
								unknownLabel: labels.unknown ?? labels.contextWindowDefault,
								supportedLabel: labels.supported ?? labels.vision,
								unsupportedLabel: labels.unsupported ?? labels.thinking,
								onChange: (vision) => {
									patch({ vision });
								}
							}),
							jsx(Source, {
								labels,
								sources: model.sources,
								field: "vision"
							}),
							jsx(Restore, {
								labels,
								field: "vision",
								overrides: model.overrides,
								disabled,
								onRestore: (field) => {
									onRestore?.(index, field);
								}
							})
						] }) : null,
						fields.thinking ? jsxs(Fragment, { children: [
							jsx(Capability, {
								label: labels.thinking,
								value: model.thinking,
								disabled,
								triState: fields.triState === true,
								unknownLabel: labels.unknown ?? labels.contextWindowDefault,
								supportedLabel: labels.supported ?? labels.vision,
								unsupportedLabel: labels.unsupported ?? labels.thinking,
								onChange: (thinking) => {
									patch({ thinking });
								}
							}),
							jsx(Source, {
								labels,
								sources: model.sources,
								field: "thinking"
							}),
							jsx(Restore, {
								labels,
								field: "thinking",
								overrides: model.overrides,
								disabled,
								onRestore: (field) => {
									onRestore?.(index, field);
								}
							})
						] }) : null,
						fields.defaultEffort && efforts.length > 0 ? jsxs("label", {
							style: {
								...catalogStyles.labelStyle,
								display: "inline-flex",
								alignItems: "center",
								gap: 6
							},
							children: [
								labels.defaultEffort,
								jsxs("select", {
									style: catalogStyles.selectStyle,
									value: model.defaultEffort ?? (fields.triState ? "" : efforts[0]?.id ?? ""),
									disabled: disabled || model.thinking === false,
									"aria-label": labels.defaultEffort + " " + label,
									onChange: (event) => {
										const value = event.target.value;
										patch({ defaultEffort: value === "" ? void 0 : efforts.find((entry) => entry.id === value)?.id });
									},
									children: [fields.triState ? jsx("option", {
										value: "",
										children: labels.unknown ?? labels.contextWindowDefault
									}) : null, efforts.map((effort) => jsx("option", {
										value: effort.id,
										children: effort.name
									}, effort.id))]
								}),
								jsx(Source, {
									labels,
									sources: model.sources,
									field: "defaultEffort"
								}),
								jsx(Restore, {
									labels,
									field: "defaultEffort",
									overrides: model.overrides,
									disabled,
									onRestore: (field) => {
										onRestore?.(index, field);
									}
								})
							]
						}) : null
					] })] }) : null
				]
			});
		}
	})] });
}
//#endregion
//#region lib/types/client/ModelPickerDialog.js
/** Presentation-only model picker overlay. Callers supply grouped candidates. */
const rootStyle = {
	position: "fixed",
	inset: 0,
	zIndex: 1e3,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	boxSizing: "border-box",
	padding: 24
};
const maskStyle = {
	position: "absolute",
	inset: 0,
	background: "var(--dsw-alias-bg-mask-1)",
	backdropFilter: "var(--dsw-mask-blur)"
};
const dialogStyle = {
	position: "relative",
	zIndex: 1,
	display: "flex",
	flexDirection: "column",
	width: "min(520px, 100%)",
	maxHeight: "min(680px, calc(100vh - 48px))",
	overflow: "hidden",
	border: "1px solid var(--dsw-alias-border-inverted)",
	borderRadius: 24,
	background: "var(--dsw-alias-bg-layer-2)",
	boxShadow: "var(--dsw-shadow-lv3)",
	color: "var(--dsw-alias-label-primary)"
};
const headerStyle = {
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	gap: 8,
	padding: "22px 14px 12px 24px"
};
const titleStyle = {
	margin: 0,
	fontSize: 16,
	lineHeight: "24px",
	fontWeight: 500
};
const closeStyle = {
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	width: 28,
	height: 28,
	border: 0,
	borderRadius: 8,
	background: "transparent",
	color: "var(--dsw-alias-label-secondary)",
	cursor: "pointer",
	fontSize: 22
};
const descriptionStyle = {
	margin: 0,
	padding: "0 24px",
	fontSize: 14,
	lineHeight: "22px",
	color: "var(--dsw-alias-label-primary)"
};
const searchStyle = {
	boxSizing: "border-box",
	width: "calc(100% - 48px)",
	minHeight: 36,
	margin: "16px 24px 0",
	border: "1px solid var(--dsw-alias-border-l2)",
	borderRadius: 8,
	padding: "7px 10px",
	background: "var(--dsw-alias-bg-layer-1)",
	color: "var(--dsw-alias-label-primary)",
	font: "inherit"
};
const listStyle = {
	display: "flex",
	flexDirection: "column",
	gap: 16,
	minHeight: 0,
	margin: "12px 24px 20px",
	padding: 0,
	overflowY: "auto",
	listStyle: "none"
};
const brandHeaderStyle = {
	padding: "2px 0 0",
	fontSize: 12,
	lineHeight: "18px",
	fontWeight: 600,
	color: "var(--dsw-alias-label-tertiary)"
};
const brandListStyle = {
	display: "flex",
	flexDirection: "column",
	gap: 10,
	margin: 0,
	padding: 0,
	listStyle: "none"
};
const candidateStyle = {
	display: "flex",
	alignItems: "center",
	gap: 10,
	fontSize: 14,
	lineHeight: "22px",
	cursor: "pointer"
};
const footerStyle = {
	display: "flex",
	justifyContent: "flex-end",
	gap: 8,
	padding: "12px 24px 20px"
};
const buttonStyle = {
	minHeight: 36,
	border: "1px solid var(--dsw-alias-border-l2)",
	borderRadius: 8,
	padding: "7px 12px",
	background: "var(--dsw-alias-bg-layer-1)",
	color: "var(--dsw-alias-label-primary)",
	cursor: "pointer"
};
const statusStyle = {
	margin: "16px 24px",
	fontSize: 13,
	color: "var(--dsw-alias-label-secondary)"
};
const errorStyle = {
	...statusStyle,
	color: "var(--dsw-alias-state-error-primary)"
};
function matches(model, query) {
	if (query.trim() === "") return true;
	return ((model.name ?? "") + " " + model.id).toLowerCase().includes(query.trim().toLowerCase());
}
/** Searchable grouped checkbox dialog. Does not own discovery or brand rules. */
function ModelPickerDialog(props) {
	const { open, loading, error, labels } = props;
	const [query, setQuery] = useState("");
	const searchRef = useRef(null);
	useEffect(() => {
		if (!open) setQuery("");
	}, [open]);
	useEffect(() => {
		if (!open) return;
		const onKeyDown = (event) => {
			if (event.key === "Escape") props.onClose();
		};
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [open, props.onClose]);
	useEffect(() => {
		if (!open || loading || error !== void 0) return;
		searchRef.current?.focus();
	}, [
		open,
		loading,
		error
	]);
	if (!open || typeof document === "undefined") return null;
	const visible = props.sections.map((section) => ({
		...section,
		models: section.models.filter((model) => matches(model, query))
	})).filter((section) => section.models.length > 0);
	return createPortal(jsxs("div", {
		style: rootStyle,
		role: "presentation",
		children: [jsx("div", {
			style: maskStyle,
			"aria-hidden": "true",
			onClick: props.onClose
		}), jsxs("section", {
			style: dialogStyle,
			role: "dialog",
			"aria-modal": "true",
			"aria-label": labels.title,
			"aria-busy": loading,
			children: [
				jsxs("div", {
					style: headerStyle,
					children: [jsx("h2", {
						style: titleStyle,
						children: labels.title
					}), jsx("button", {
						type: "button",
						style: closeStyle,
						"aria-label": labels.close,
						onClick: props.onClose,
						children: "×"
					})]
				}),
				jsx("p", {
					style: descriptionStyle,
					children: labels.description
				}),
				loading ? jsx("p", {
					style: statusStyle,
					role: "status",
					children: labels.loading
				}) : error !== void 0 ? jsx("p", {
					style: errorStyle,
					role: "alert",
					children: error
				}) : jsxs(Fragment, { children: [jsx("input", {
					ref: searchRef,
					style: searchStyle,
					type: "search",
					value: query,
					placeholder: labels.search,
					"aria-label": labels.search,
					onChange: (event) => {
						setQuery(event.target.value);
					}
				}), visible.length === 0 ? jsx("p", {
					style: statusStyle,
					role: "status",
					children: labels.empty
				}) : jsx("ul", {
					style: listStyle,
					children: visible.map((section) => jsxs("li", { children: [jsx("div", {
						style: brandHeaderStyle,
						children: section.label
					}), jsx("ul", {
						style: brandListStyle,
						children: section.models.map((model) => jsx("li", { children: jsxs("label", {
							style: candidateStyle,
							children: [jsx("input", {
								type: "checkbox",
								checked: props.picked.has(model.id),
								onChange: () => {
									props.onToggle(model.id);
								}
							}), jsxs("span", {
								style: {
									display: "flex",
									flexDirection: "column",
									gap: 2
								},
								children: [jsxs("span", { children: [model.name ?? model.id, model.name !== void 0 && model.name !== model.id ? " (" + model.id + ")" : ""] }), model.hint === void 0 ? null : jsx("span", {
									style: {
										fontSize: 12,
										color: "var(--dsw-alias-label-tertiary)"
									},
									children: model.hint
								})]
							})]
						}) }, model.id))
					})] }, section.id))
				})] }),
				jsxs("div", {
					style: footerStyle,
					children: [jsx("button", {
						type: "button",
						style: buttonStyle,
						onClick: props.onClose,
						children: labels.cancel
					}), jsx("button", {
						type: "button",
						style: {
							...buttonStyle,
							...loading || error !== void 0 ? {
								cursor: "not-allowed",
								opacity: .4
							} : {}
						},
						disabled: loading || error !== void 0,
						onClick: props.onApply,
						children: labels.apply
					})]
				})
			]
		})]
	}), document.body);
}
//#endregion
export { ModelCatalogCapabilities, ModelCatalogDetails, ModelCatalogEditor, ModelCatalogRow, ModelCatalogRowGrid, ModelPickerDialog, applyCatalogPatch, catalogStyles, fieldStyle, inputStyle, labelStyle, rowInputStyle, selectStyle };
