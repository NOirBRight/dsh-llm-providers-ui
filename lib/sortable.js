import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
const ghostStyle = {
	...rowStyle,
	position: "fixed",
	zIndex: 1e4,
	pointerEvents: "none",
	opacity: .96,
	boxShadow: "var(--dsw-shadow-lv2, 0 10px 30px rgba(0, 0, 0, 0.18))",
	outline: "2px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 22%, transparent)"
};
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
* Pointer-driven sortable list: a portal ghost follows the pointer, a preview
* array records the prospective order, and FLIP animations move sibling rows.
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
						...plain ? {
							...plainRowStyle,
							gridTemplateColumns: (showHandle ? "30px " : "") + "minmax(0,1fr)" + (moveButtons ? " auto auto" : "")
						} : card ? cardRowStyle : rowStyle,
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
							style: plain ? plainItemStyle : card ? cardItemStyle : { minWidth: 0 },
							children: renderItem(item, index)
						}),
						moveButtons ? jsxs(Fragment, { children: [jsx("button", {
							type: "button",
							"data-sortable-move": "up",
							style: moveButtonStyle,
							"aria-label": upLabel(item, index),
							title: upLabel(item, index),
							disabled: !interactive || index === 0,
							hidden: !showHandle,
							onClick: () => {
								moveBy(id, -1);
							},
							children: "\\u2191"
						}), jsx("button", {
							type: "button",
							"data-sortable-move": "down",
							style: moveButtonStyle,
							"aria-label": downLabel(item, index),
							title: downLabel(item, index),
							disabled: !interactive || index === renderedItems.length - 1,
							hidden: !showHandle,
							onClick: () => {
								moveBy(id, 1);
							},
							children: "\\u2193"
						})] }) : null
					]
				}, id);
			}),
			dragGhost !== null && draggedItem !== void 0 ? createPortal(jsxs("div", {
				"data-sortable-ghost": "true",
				style: {
					...ghostStyle,
					...card ? cardRowStyle : {},
					position: "fixed",
					left: dragGhost.x,
					top: dragGhost.y,
					width: dragGhost.width,
					minHeight: dragGhost.height
				},
				children: [jsx("div", {
					style: {
						...handleStyle,
						cursor: "grabbing"
					},
					children: jsx(IconGrip, {})
				}), jsx("div", {
					"data-sortable-item": "",
					style: card ? cardItemStyle : { minWidth: 0 },
					children: renderItem(draggedItem, renderedItems.findIndex((item) => getId(item) === draggedId))
				})]
			}), document.body) : null
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
export { SortableList };
