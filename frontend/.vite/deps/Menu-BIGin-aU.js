import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, T as useRtl, U as generateUtilityClass, dt as clsx, ft as require_prop_types, lt as require_react_is, n as rootShouldForwardProp, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
import { i as integerPropType, t as Paper } from "./Paper-C4ekxLBX.js";
import { t as chainPropTypes } from "./chainPropTypes-Cq73wFmt.js";
import { t as List } from "./List-vkJ873nD.js";
import { t as elementTypeAcceptingRef_default } from "./elementTypeAcceptingRef-CI0c6K4q.js";
import { a as isHostComponent } from "./mergeSlotProps-vUdbMN4H.js";
import { i as useForkRef_default } from "./TransitionGroupContext-CmouUOv0.js";
import { t as useSlot } from "./useSlot-B3bIL9ix.js";
import { t as refType } from "./refType-BhGfNeog.js";
import { t as useEnhancedEffect_default } from "./useEnhancedEffect-0NPUm_ZL.js";
import { i as getScrollbarSize, t as Modal } from "./Modal-DHeZEtdP.js";
import { n as debounce_default, t as ownerWindow_default } from "./ownerWindow-Be0gh_y7.js";
import { t as ownerDocument_default } from "./ownerDocument-B4HNuzMK.js";
import { n as HTMLElementType } from "./Portal-iqMkn9e7.js";
import { t as mergeSlotProps } from "./mergeSlotProps-CDPvwt2P.js";
import { t as Grow } from "./Grow-C0UZGo71.js";
import { t as useSlotProps } from "./useSlotProps-CORw1pTM.js";
import { t as isLayoutSupported } from "./isLayoutSupported-BD5ceJG4.js";
import { t as getActiveElement_default } from "./getActiveElement-CPtfW8YK.js";
//#region node_modules/@mui/material/esm/utils/getScrollbarSize.js
var getScrollbarSize_default = getScrollbarSize;
//#endregion
//#region node_modules/@mui/material/esm/MenuList/MenuList.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_react_is = require_react_is();
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
var import_jsx_runtime = require_jsx_runtime();
function nextItem(list, item, disableListWrap) {
	if (list === item) return list.firstChild;
	if (item && item.nextElementSibling) return item.nextElementSibling;
	return disableListWrap ? null : list.firstChild;
}
function previousItem(list, item, disableListWrap) {
	if (list === item) return disableListWrap ? list.firstChild : list.lastChild;
	if (item && item.previousElementSibling) return item.previousElementSibling;
	return disableListWrap ? null : list.lastChild;
}
function textCriteriaMatches(nextFocus, textCriteria) {
	if (textCriteria === void 0) return true;
	let text = nextFocus.innerText;
	if (text === void 0) text = nextFocus.textContent;
	text = text.trim().toLowerCase();
	if (text.length === 0) return false;
	if (textCriteria.repeating) return text[0] === textCriteria.keys[0];
	return text.startsWith(textCriteria.keys.join(""));
}
function moveFocus(list, currentFocus, disableListWrap, disabledItemsFocusable, traversalFunction, textCriteria) {
	let wrappedOnce = false;
	let nextFocus = traversalFunction(list, currentFocus, currentFocus ? disableListWrap : false);
	while (nextFocus) {
		if (nextFocus === list.firstChild) {
			if (wrappedOnce) return false;
			wrappedOnce = true;
		}
		const nextFocusDisabled = disabledItemsFocusable ? false : nextFocus.disabled || nextFocus.getAttribute("aria-disabled") === "true";
		if (!nextFocus.hasAttribute("tabindex") || !textCriteriaMatches(nextFocus, textCriteria) || nextFocusDisabled) nextFocus = traversalFunction(list, nextFocus, disableListWrap);
		else {
			nextFocus.focus();
			return true;
		}
	}
	return false;
}
/**
* A permanently displayed menu following https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/.
* It's exposed to help customization of the [`Menu`](/material-ui/api/menu/) component if you
* use it separately you need to move focus into the component manually. Once
* the focus is placed inside the component it is fully keyboard accessible.
*/
var MenuList = /* @__PURE__ */ import_react.forwardRef(function MenuList(props, ref) {
	const { actions, autoFocus = false, autoFocusItem = false, children, className, disabledItemsFocusable = false, disableListWrap = false, onKeyDown, variant = "selectedMenu", ...other } = props;
	const listRef = import_react.useRef(null);
	const textCriteriaRef = import_react.useRef({
		keys: [],
		repeating: true,
		previousKeyMatched: true,
		lastTime: null
	});
	useEnhancedEffect_default(() => {
		if (autoFocus) listRef.current.focus();
	}, [autoFocus]);
	import_react.useImperativeHandle(actions, () => ({ adjustStyleForScrollbar: (containerElement, { direction }) => {
		const noExplicitWidth = !listRef.current.style.width;
		if (containerElement.clientHeight < listRef.current.clientHeight && noExplicitWidth) {
			const scrollbarSize = `${getScrollbarSize_default(ownerWindow_default(containerElement))}px`;
			listRef.current.style[direction === "rtl" ? "paddingLeft" : "paddingRight"] = scrollbarSize;
			listRef.current.style.width = `calc(100% + ${scrollbarSize})`;
		}
		return listRef.current;
	} }), []);
	const handleKeyDown = (event) => {
		const list = listRef.current;
		const key = event.key;
		if (event.ctrlKey || event.metaKey || event.altKey) {
			if (onKeyDown) onKeyDown(event);
			return;
		}
		/**
		* @type {Element} - will always be defined since we are in a keydown handler
		* attached to an element. A keydown event is either dispatched to the activeElement
		* or document.body or document.documentElement. Only the first case will
		* trigger this specific handler.
		*/
		const currentFocus = getActiveElement_default(ownerDocument_default(list));
		if (key === "ArrowDown") {
			event.preventDefault();
			moveFocus(list, currentFocus, disableListWrap, disabledItemsFocusable, nextItem);
		} else if (key === "ArrowUp") {
			event.preventDefault();
			moveFocus(list, currentFocus, disableListWrap, disabledItemsFocusable, previousItem);
		} else if (key === "Home") {
			event.preventDefault();
			moveFocus(list, null, disableListWrap, disabledItemsFocusable, nextItem);
		} else if (key === "End") {
			event.preventDefault();
			moveFocus(list, null, disableListWrap, disabledItemsFocusable, previousItem);
		} else if (key.length === 1) {
			const criteria = textCriteriaRef.current;
			const lowerKey = key.toLowerCase();
			const currTime = performance.now();
			if (criteria.keys.length > 0) {
				if (currTime - criteria.lastTime > 500) {
					criteria.keys = [];
					criteria.repeating = true;
					criteria.previousKeyMatched = true;
				} else if (criteria.repeating && lowerKey !== criteria.keys[0]) criteria.repeating = false;
			}
			criteria.lastTime = currTime;
			criteria.keys.push(lowerKey);
			const keepFocusOnCurrent = currentFocus && !criteria.repeating && textCriteriaMatches(currentFocus, criteria);
			if (criteria.previousKeyMatched && (keepFocusOnCurrent || moveFocus(list, currentFocus, false, disabledItemsFocusable, nextItem, criteria))) event.preventDefault();
			else criteria.previousKeyMatched = false;
		}
		if (onKeyDown) onKeyDown(event);
	};
	const handleRef = useForkRef_default(listRef, ref);
	/**
	* the index of the item should receive focus
	* in a `variant="selectedMenu"` it's the first `selected` item
	* otherwise it's the very first item.
	*/
	let activeItemIndex = -1;
	import_react.Children.forEach(children, (child, index) => {
		if (!/* @__PURE__ */ import_react.isValidElement(child)) {
			if (activeItemIndex === index) {
				activeItemIndex += 1;
				if (activeItemIndex >= children.length) activeItemIndex = -1;
			}
			return;
		}
		if ((0, import_react_is.isFragment)(child)) console.error(["MUI: The Menu component doesn't accept a Fragment as a child.", "Consider providing an array instead."].join("\n"));
		if (!child.props.disabled) {
			if (variant === "selectedMenu" && child.props.selected) activeItemIndex = index;
			else if (activeItemIndex === -1) activeItemIndex = index;
		}
		if (activeItemIndex === index && (child.props.disabled || child.props.muiSkipListHighlight || child.type.muiSkipListHighlight)) {
			activeItemIndex += 1;
			if (activeItemIndex >= children.length) activeItemIndex = -1;
		}
	});
	const items = import_react.Children.map(children, (child, index) => {
		if (index === activeItemIndex) {
			const newChildProps = {};
			if (autoFocusItem) newChildProps.autoFocus = true;
			if (child.props.tabIndex === void 0 && variant === "selectedMenu") newChildProps.tabIndex = 0;
			return /* @__PURE__ */ import_react.cloneElement(child, newChildProps);
		}
		return child;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
		role: "menu",
		ref: handleRef,
		className,
		onKeyDown: handleKeyDown,
		tabIndex: autoFocus ? 0 : -1,
		...other,
		children: items
	});
});
MenuList.propTypes = {
	autoFocus: import_prop_types.default.bool,
	autoFocusItem: import_prop_types.default.bool,
	children: import_prop_types.default.node,
	className: import_prop_types.default.string,
	disabledItemsFocusable: import_prop_types.default.bool,
	disableListWrap: import_prop_types.default.bool,
	onKeyDown: import_prop_types.default.func,
	variant: import_prop_types.default.oneOf(["menu", "selectedMenu"])
};
//#endregion
//#region node_modules/@mui/material/esm/Popover/popoverClasses.js
function getPopoverUtilityClass(slot) {
	return generateUtilityClass("MuiPopover", slot);
}
generateUtilityClasses("MuiPopover", ["root", "paper"]);
//#endregion
//#region node_modules/@mui/material/esm/Popover/Popover.js
function getOffsetTop(rect, vertical) {
	let offset = 0;
	if (typeof vertical === "number") offset = vertical;
	else if (vertical === "center") offset = rect.height / 2;
	else if (vertical === "bottom") offset = rect.height;
	return offset;
}
function getOffsetLeft(rect, horizontal) {
	let offset = 0;
	if (typeof horizontal === "number") offset = horizontal;
	else if (horizontal === "center") offset = rect.width / 2;
	else if (horizontal === "right") offset = rect.width;
	return offset;
}
function getTransformOriginValue(transformOrigin) {
	return [transformOrigin.horizontal, transformOrigin.vertical].map((n) => typeof n === "number" ? `${n}px` : n).join(" ");
}
function resolveAnchorEl(anchorEl) {
	return typeof anchorEl === "function" ? anchorEl() : anchorEl;
}
var useUtilityClasses$1 = (ownerState) => {
	const { classes } = ownerState;
	return composeClasses({
		root: ["root"],
		paper: ["paper"]
	}, getPopoverUtilityClass, classes);
};
var PopoverRoot = styled(Modal, {
	name: "MuiPopover",
	slot: "Root"
})({});
var PopoverPaper = styled(Paper, {
	name: "MuiPopover",
	slot: "Paper"
})({
	position: "absolute",
	overflowY: "auto",
	overflowX: "hidden",
	minWidth: 16,
	minHeight: 16,
	maxWidth: "calc(100% - 32px)",
	maxHeight: "calc(100% - 32px)",
	outline: 0
});
var Popover = /* @__PURE__ */ import_react.forwardRef(function Popover(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiPopover"
	});
	const { action, anchorEl, anchorOrigin = {
		vertical: "top",
		horizontal: "left"
	}, anchorPosition, anchorReference = "anchorEl", children, className, container: containerProp, elevation = 8, marginThreshold = 16, open, PaperProps: PaperPropsProp = {}, slots = {}, slotProps = {}, transformOrigin = {
		vertical: "top",
		horizontal: "left"
	}, TransitionComponent, transitionDuration: transitionDurationProp = "auto", TransitionProps = {}, disableScrollLock = false, ...other } = props;
	const paperRef = import_react.useRef();
	const ownerState = {
		...props,
		anchorOrigin,
		anchorReference,
		elevation,
		marginThreshold,
		transformOrigin,
		TransitionComponent,
		transitionDuration: transitionDurationProp,
		TransitionProps
	};
	const classes = useUtilityClasses$1(ownerState);
	const getAnchorOffset = import_react.useCallback(() => {
		if (anchorReference === "anchorPosition") {
			if (!anchorPosition) console.error("MUI: You need to provide a `anchorPosition` prop when using <Popover anchorReference=\"anchorPosition\" />.");
			return anchorPosition;
		}
		const resolvedAnchorEl = resolveAnchorEl(anchorEl);
		const anchorElement = resolvedAnchorEl && resolvedAnchorEl.nodeType === 1 ? resolvedAnchorEl : ownerDocument_default(paperRef.current).body;
		const anchorRect = anchorElement.getBoundingClientRect();
		{
			const box = anchorElement.getBoundingClientRect();
			if (isLayoutSupported() && box.top === 0 && box.left === 0 && box.right === 0 && box.bottom === 0) console.warn([
				"MUI: The `anchorEl` prop provided to the component is invalid.",
				"The anchor element should be part of the document layout.",
				"Make sure the element is present in the document or that it's not display none."
			].join("\n"));
		}
		return {
			top: anchorRect.top + getOffsetTop(anchorRect, anchorOrigin.vertical),
			left: anchorRect.left + getOffsetLeft(anchorRect, anchorOrigin.horizontal)
		};
	}, [
		anchorEl,
		anchorOrigin.horizontal,
		anchorOrigin.vertical,
		anchorPosition,
		anchorReference
	]);
	const getTransformOrigin = import_react.useCallback((elemRect) => {
		return {
			vertical: getOffsetTop(elemRect, transformOrigin.vertical),
			horizontal: getOffsetLeft(elemRect, transformOrigin.horizontal)
		};
	}, [transformOrigin.horizontal, transformOrigin.vertical]);
	const getPositioningStyle = import_react.useCallback((element) => {
		const elemRect = {
			width: element.offsetWidth,
			height: element.offsetHeight
		};
		const elemTransformOrigin = getTransformOrigin(elemRect);
		if (anchorReference === "none") return {
			top: null,
			left: null,
			transformOrigin: getTransformOriginValue(elemTransformOrigin)
		};
		const anchorOffset = getAnchorOffset();
		let top = anchorOffset.top - elemTransformOrigin.vertical;
		let left = anchorOffset.left - elemTransformOrigin.horizontal;
		const bottom = top + elemRect.height;
		const right = left + elemRect.width;
		const containerWindow = ownerWindow_default(resolveAnchorEl(anchorEl));
		const heightThreshold = containerWindow.innerHeight - marginThreshold;
		const widthThreshold = containerWindow.innerWidth - marginThreshold;
		if (marginThreshold !== null && top < marginThreshold) {
			const diff = top - marginThreshold;
			top -= diff;
			elemTransformOrigin.vertical += diff;
		} else if (marginThreshold !== null && bottom > heightThreshold) {
			const diff = bottom - heightThreshold;
			top -= diff;
			elemTransformOrigin.vertical += diff;
		}
		if (elemRect.height > heightThreshold && elemRect.height && heightThreshold) console.error([
			"MUI: The popover component is too tall.",
			`Some part of it can not be seen on the screen (${elemRect.height - heightThreshold}px).`,
			"Please consider adding a `max-height` to improve the user-experience."
		].join("\n"));
		if (marginThreshold !== null && left < marginThreshold) {
			const diff = left - marginThreshold;
			left -= diff;
			elemTransformOrigin.horizontal += diff;
		} else if (right > widthThreshold) {
			const diff = right - widthThreshold;
			left -= diff;
			elemTransformOrigin.horizontal += diff;
		}
		return {
			top: `${Math.round(top)}px`,
			left: `${Math.round(left)}px`,
			transformOrigin: getTransformOriginValue(elemTransformOrigin)
		};
	}, [
		anchorEl,
		anchorReference,
		getAnchorOffset,
		getTransformOrigin,
		marginThreshold
	]);
	const [isPositioned, setIsPositioned] = import_react.useState(open);
	const setPositioningStyles = import_react.useCallback(() => {
		const element = paperRef.current;
		if (!element) return;
		const positioning = getPositioningStyle(element);
		if (positioning.top !== null) element.style.setProperty("top", positioning.top);
		if (positioning.left !== null) element.style.left = positioning.left;
		element.style.transformOrigin = positioning.transformOrigin;
		setIsPositioned(true);
	}, [getPositioningStyle]);
	import_react.useEffect(() => {
		if (disableScrollLock) window.addEventListener("scroll", setPositioningStyles);
		return () => window.removeEventListener("scroll", setPositioningStyles);
	}, [
		anchorEl,
		disableScrollLock,
		setPositioningStyles
	]);
	const handleEntering = () => {
		setPositioningStyles();
	};
	const handleExited = () => {
		setIsPositioned(false);
	};
	import_react.useEffect(() => {
		if (open) setPositioningStyles();
	});
	import_react.useImperativeHandle(action, () => open ? { updatePosition: () => {
		setPositioningStyles();
	} } : null, [open, setPositioningStyles]);
	import_react.useEffect(() => {
		if (!open) return;
		const handleResize = debounce_default(() => {
			setPositioningStyles();
		});
		const containerWindow = ownerWindow_default(resolveAnchorEl(anchorEl));
		containerWindow.addEventListener("resize", handleResize);
		return () => {
			handleResize.clear();
			containerWindow.removeEventListener("resize", handleResize);
		};
	}, [
		anchorEl,
		open,
		setPositioningStyles
	]);
	let transitionDuration = transitionDurationProp;
	const externalForwardedProps = {
		slots: {
			transition: TransitionComponent,
			...slots
		},
		slotProps: {
			transition: TransitionProps,
			paper: PaperPropsProp,
			...slotProps
		}
	};
	const [TransitionSlot, transitionSlotProps] = useSlot("transition", {
		elementType: Grow,
		externalForwardedProps,
		ownerState,
		getSlotProps: (handlers) => ({
			...handlers,
			onEntering: (element, isAppearing) => {
				handlers.onEntering?.(element, isAppearing);
				handleEntering();
			},
			onExited: (element) => {
				handlers.onExited?.(element);
				handleExited();
			}
		}),
		additionalProps: {
			appear: true,
			in: open
		}
	});
	if (transitionDurationProp === "auto" && !TransitionSlot.muiSupportAuto) transitionDuration = void 0;
	const container = containerProp || (anchorEl ? ownerDocument_default(resolveAnchorEl(anchorEl)).body : void 0);
	const [RootSlot, { slots: rootSlotsProp, slotProps: rootSlotPropsProp, ...rootProps }] = useSlot("root", {
		ref,
		elementType: PopoverRoot,
		externalForwardedProps: {
			...externalForwardedProps,
			...other
		},
		shouldForwardComponentProp: true,
		additionalProps: {
			slots: { backdrop: slots.backdrop },
			slotProps: { backdrop: mergeSlotProps(typeof slotProps.backdrop === "function" ? slotProps.backdrop(ownerState) : slotProps.backdrop, { invisible: true }) },
			container,
			open
		},
		ownerState,
		className: clsx(classes.root, className)
	});
	const [PaperSlot, paperProps] = useSlot("paper", {
		ref: paperRef,
		className: classes.paper,
		elementType: PopoverPaper,
		externalForwardedProps,
		shouldForwardComponentProp: true,
		additionalProps: {
			elevation,
			style: isPositioned ? void 0 : { opacity: 0 }
		},
		ownerState
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RootSlot, {
		...rootProps,
		...!isHostComponent(RootSlot) && {
			slots: rootSlotsProp,
			slotProps: rootSlotPropsProp,
			disableScrollLock
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransitionSlot, {
			...transitionSlotProps,
			timeout: transitionDuration,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperSlot, {
				...paperProps,
				children
			})
		})
	});
});
Popover.propTypes = {
	action: refType,
	anchorEl: chainPropTypes(import_prop_types.default.oneOfType([HTMLElementType, import_prop_types.default.func]), (props) => {
		if (props.open && (!props.anchorReference || props.anchorReference === "anchorEl")) {
			const resolvedAnchorEl = resolveAnchorEl(props.anchorEl);
			if (resolvedAnchorEl && resolvedAnchorEl.nodeType === 1) {
				const box = resolvedAnchorEl.getBoundingClientRect();
				if (isLayoutSupported() && box.top === 0 && box.left === 0 && box.right === 0 && box.bottom === 0) return new Error([
					"MUI: The `anchorEl` prop provided to the component is invalid.",
					"The anchor element should be part of the document layout.",
					"Make sure the element is present in the document or that it's not display none."
				].join("\n"));
			} else return new Error(["MUI: The `anchorEl` prop provided to the component is invalid.", `It should be an Element or PopoverVirtualElement instance but it's \`${resolvedAnchorEl}\` instead.`].join("\n"));
		}
		return null;
	}),
	anchorOrigin: import_prop_types.default.shape({
		horizontal: import_prop_types.default.oneOfType([import_prop_types.default.oneOf([
			"center",
			"left",
			"right"
		]), import_prop_types.default.number]).isRequired,
		vertical: import_prop_types.default.oneOfType([import_prop_types.default.oneOf([
			"bottom",
			"center",
			"top"
		]), import_prop_types.default.number]).isRequired
	}),
	anchorPosition: import_prop_types.default.shape({
		left: import_prop_types.default.number.isRequired,
		top: import_prop_types.default.number.isRequired
	}),
	anchorReference: import_prop_types.default.oneOf([
		"anchorEl",
		"anchorPosition",
		"none"
	]),
	BackdropComponent: import_prop_types.default.elementType,
	BackdropProps: import_prop_types.default.object,
	children: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	container: import_prop_types.default.oneOfType([HTMLElementType, import_prop_types.default.func]),
	disableScrollLock: import_prop_types.default.bool,
	elevation: integerPropType,
	marginThreshold: import_prop_types.default.number,
	onClose: import_prop_types.default.func,
	open: import_prop_types.default.bool.isRequired,
	PaperProps: import_prop_types.default.shape({ component: elementTypeAcceptingRef_default }),
	slotProps: import_prop_types.default.shape({
		backdrop: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		paper: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		root: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		transition: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object])
	}),
	slots: import_prop_types.default.shape({
		backdrop: import_prop_types.default.elementType,
		paper: import_prop_types.default.elementType,
		root: import_prop_types.default.elementType,
		transition: import_prop_types.default.elementType
	}),
	sx: import_prop_types.default.oneOfType([
		import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
			import_prop_types.default.func,
			import_prop_types.default.object,
			import_prop_types.default.bool
		])),
		import_prop_types.default.func,
		import_prop_types.default.object
	]),
	transformOrigin: import_prop_types.default.shape({
		horizontal: import_prop_types.default.oneOfType([import_prop_types.default.oneOf([
			"center",
			"left",
			"right"
		]), import_prop_types.default.number]).isRequired,
		vertical: import_prop_types.default.oneOfType([import_prop_types.default.oneOf([
			"bottom",
			"center",
			"top"
		]), import_prop_types.default.number]).isRequired
	}),
	TransitionComponent: import_prop_types.default.elementType,
	transitionDuration: import_prop_types.default.oneOfType([
		import_prop_types.default.oneOf(["auto"]),
		import_prop_types.default.number,
		import_prop_types.default.shape({
			appear: import_prop_types.default.number,
			enter: import_prop_types.default.number,
			exit: import_prop_types.default.number
		})
	]),
	TransitionProps: import_prop_types.default.object
};
//#endregion
//#region node_modules/@mui/material/esm/Menu/menuClasses.js
function getMenuUtilityClass(slot) {
	return generateUtilityClass("MuiMenu", slot);
}
var menuClasses = generateUtilityClasses("MuiMenu", [
	"root",
	"paper",
	"list"
]);
//#endregion
//#region node_modules/@mui/material/esm/Menu/Menu.js
var RTL_ORIGIN = {
	vertical: "top",
	horizontal: "right"
};
var LTR_ORIGIN = {
	vertical: "top",
	horizontal: "left"
};
var useUtilityClasses = (ownerState) => {
	const { classes } = ownerState;
	return composeClasses({
		root: ["root"],
		paper: ["paper"],
		list: ["list"]
	}, getMenuUtilityClass, classes);
};
var MenuRoot = styled(Popover, {
	shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === "classes",
	name: "MuiMenu",
	slot: "Root"
})({});
var MenuPaper = styled(PopoverPaper, {
	name: "MuiMenu",
	slot: "Paper"
})({
	maxHeight: "calc(100% - 96px)",
	WebkitOverflowScrolling: "touch"
});
var MenuMenuList = styled(MenuList, {
	name: "MuiMenu",
	slot: "List"
})({ outline: 0 });
var Menu = /* @__PURE__ */ import_react.forwardRef(function Menu(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiMenu"
	});
	const { autoFocus = true, children, className, disableAutoFocusItem = false, MenuListProps = {}, onClose, open, PaperProps = {}, PopoverClasses, transitionDuration = "auto", TransitionProps: { onEntering, ...TransitionProps } = {}, variant = "selectedMenu", slots = {}, slotProps = {}, ...other } = props;
	const isRtl = useRtl();
	const ownerState = {
		...props,
		autoFocus,
		disableAutoFocusItem,
		MenuListProps,
		onEntering,
		PaperProps,
		transitionDuration,
		TransitionProps,
		variant
	};
	const classes = useUtilityClasses(ownerState);
	const autoFocusItem = autoFocus && !disableAutoFocusItem && open;
	const menuListActionsRef = import_react.useRef(null);
	const handleEntering = (element, isAppearing) => {
		if (menuListActionsRef.current) menuListActionsRef.current.adjustStyleForScrollbar(element, { direction: isRtl ? "rtl" : "ltr" });
		if (onEntering) onEntering(element, isAppearing);
	};
	const handleListKeyDown = (event) => {
		if (event.key === "Tab") {
			event.preventDefault();
			if (onClose) onClose(event, "tabKeyDown");
		}
	};
	/**
	* the index of the item should receive focus
	* in a `variant="selectedMenu"` it's the first `selected` item
	* otherwise it's the very first item.
	*/
	let activeItemIndex = -1;
	import_react.Children.map(children, (child, index) => {
		if (!/* @__PURE__ */ import_react.isValidElement(child)) return;
		if ((0, import_react_is.isFragment)(child)) console.error(["MUI: The Menu component doesn't accept a Fragment as a child.", "Consider providing an array instead."].join("\n"));
		if (!child.props.disabled) {
			if (variant === "selectedMenu" && child.props.selected) activeItemIndex = index;
			else if (activeItemIndex === -1) activeItemIndex = index;
		}
	});
	const externalForwardedProps = {
		slots,
		slotProps: {
			list: MenuListProps,
			transition: TransitionProps,
			paper: PaperProps,
			...slotProps
		}
	};
	const rootSlotProps = useSlotProps({
		elementType: slots.root,
		externalSlotProps: slotProps.root,
		ownerState,
		className: [classes.root, className]
	});
	const [PaperSlot, paperSlotProps] = useSlot("paper", {
		className: classes.paper,
		elementType: MenuPaper,
		externalForwardedProps,
		shouldForwardComponentProp: true,
		ownerState
	});
	const [ListSlot, listSlotProps] = useSlot("list", {
		className: clsx(classes.list, MenuListProps.className),
		elementType: MenuMenuList,
		shouldForwardComponentProp: true,
		externalForwardedProps,
		getSlotProps: (handlers) => ({
			...handlers,
			onKeyDown: (event) => {
				handleListKeyDown(event);
				handlers.onKeyDown?.(event);
			}
		}),
		ownerState
	});
	const resolvedTransitionProps = typeof externalForwardedProps.slotProps.transition === "function" ? externalForwardedProps.slotProps.transition(ownerState) : externalForwardedProps.slotProps.transition;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuRoot, {
		onClose,
		anchorOrigin: {
			vertical: "bottom",
			horizontal: isRtl ? "right" : "left"
		},
		transformOrigin: isRtl ? RTL_ORIGIN : LTR_ORIGIN,
		slots: {
			root: slots.root,
			paper: PaperSlot,
			backdrop: slots.backdrop,
			...slots.transition && { transition: slots.transition }
		},
		slotProps: {
			root: rootSlotProps,
			paper: paperSlotProps,
			backdrop: typeof slotProps.backdrop === "function" ? slotProps.backdrop(ownerState) : slotProps.backdrop,
			transition: {
				...resolvedTransitionProps,
				onEntering: (...args) => {
					handleEntering(...args);
					resolvedTransitionProps?.onEntering?.(...args);
				}
			}
		},
		open,
		ref,
		transitionDuration,
		ownerState,
		...other,
		classes: PopoverClasses,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSlot, {
			actions: menuListActionsRef,
			autoFocus: autoFocus && (activeItemIndex === -1 || disableAutoFocusItem),
			autoFocusItem,
			variant,
			...listSlotProps,
			children
		})
	});
});
Menu.propTypes = {
	anchorEl: import_prop_types.default.oneOfType([HTMLElementType, import_prop_types.default.func]),
	autoFocus: import_prop_types.default.bool,
	children: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	disableAutoFocusItem: import_prop_types.default.bool,
	MenuListProps: import_prop_types.default.object,
	onClose: import_prop_types.default.func,
	open: import_prop_types.default.bool.isRequired,
	PaperProps: import_prop_types.default.object,
	PopoverClasses: import_prop_types.default.object,
	slotProps: import_prop_types.default.shape({
		backdrop: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		list: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		paper: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		root: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		transition: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object])
	}),
	slots: import_prop_types.default.shape({
		backdrop: import_prop_types.default.elementType,
		list: import_prop_types.default.elementType,
		paper: import_prop_types.default.elementType,
		root: import_prop_types.default.elementType,
		transition: import_prop_types.default.elementType
	}),
	sx: import_prop_types.default.oneOfType([
		import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
			import_prop_types.default.func,
			import_prop_types.default.object,
			import_prop_types.default.bool
		])),
		import_prop_types.default.func,
		import_prop_types.default.object
	]),
	transitionDuration: import_prop_types.default.oneOfType([
		import_prop_types.default.oneOf(["auto"]),
		import_prop_types.default.number,
		import_prop_types.default.shape({
			appear: import_prop_types.default.number,
			enter: import_prop_types.default.number,
			exit: import_prop_types.default.number
		})
	]),
	TransitionProps: import_prop_types.default.object,
	variant: import_prop_types.default.oneOf(["menu", "selectedMenu"])
};
//#endregion
export { getMenuUtilityClass as n, menuClasses as r, Menu as t };

//# sourceMappingURL=Menu-BIGin-aU.js.map