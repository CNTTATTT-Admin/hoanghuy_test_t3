import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { A as emphasize, E as exactProp, Q as require_jsx_runtime, U as generateUtilityClass, dt as clsx, ft as require_prop_types, i as useTheme, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as memoTheme } from "./memoTheme-PLhiQ1dZ.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
import { t as Paper } from "./Paper-C4ekxLBX.js";
import { n as extractEventHandlers } from "./mergeSlotProps-vUdbMN4H.js";
import { t as useForkRef } from "./useForkRef-D_V19Hay.js";
import { t as useSlot } from "./useSlot-B3bIL9ix.js";
import { t as useEventCallback } from "./useEventCallback-DApYgXZO.js";
import { n as useTimeout } from "./useTimeout-BLUJLZXi.js";
import { t as capitalize_default } from "./capitalize-C7D-9Jwf.js";
import { t as ownerDocument } from "./ownerDocument-Dzd9Sqgp.js";
import { t as elementAcceptingRef } from "./elementAcceptingRef-i5vNeZgf.js";
import { t as getReactElementRef } from "./getReactElementRef-BLmlkTO-.js";
import { t as Grow } from "./Grow-C0UZGo71.js";
//#region node_modules/@mui/material/esm/Snackbar/useSnackbar.js
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function useSnackbar(parameters = {}) {
	const { autoHideDuration = null, disableWindowBlurListener = false, onClose, open, resumeHideDuration } = parameters;
	const timerAutoHide = useTimeout();
	import_react.useEffect(() => {
		if (!open) return;
		/**
		* @param {KeyboardEvent} nativeEvent
		*/
		function handleKeyDown(nativeEvent) {
			if (!nativeEvent.defaultPrevented) {
				if (nativeEvent.key === "Escape") onClose?.(nativeEvent, "escapeKeyDown");
			}
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [open, onClose]);
	const handleClose = useEventCallback((event, reason) => {
		onClose?.(event, reason);
	});
	const setAutoHideTimer = useEventCallback((autoHideDurationParam) => {
		if (!onClose || autoHideDurationParam == null) return;
		timerAutoHide.start(autoHideDurationParam, () => {
			handleClose(null, "timeout");
		});
	});
	import_react.useEffect(() => {
		if (open) setAutoHideTimer(autoHideDuration);
		return timerAutoHide.clear;
	}, [
		open,
		autoHideDuration,
		setAutoHideTimer,
		timerAutoHide
	]);
	const handleClickAway = (event) => {
		onClose?.(event, "clickaway");
	};
	const handlePause = timerAutoHide.clear;
	const handleResume = import_react.useCallback(() => {
		if (autoHideDuration != null) setAutoHideTimer(resumeHideDuration != null ? resumeHideDuration : autoHideDuration * .5);
	}, [
		autoHideDuration,
		resumeHideDuration,
		setAutoHideTimer
	]);
	const createHandleBlur = (otherHandlers) => (event) => {
		const onBlurCallback = otherHandlers.onBlur;
		onBlurCallback?.(event);
		handleResume();
	};
	const createHandleFocus = (otherHandlers) => (event) => {
		const onFocusCallback = otherHandlers.onFocus;
		onFocusCallback?.(event);
		handlePause();
	};
	const createMouseEnter = (otherHandlers) => (event) => {
		const onMouseEnterCallback = otherHandlers.onMouseEnter;
		onMouseEnterCallback?.(event);
		handlePause();
	};
	const createMouseLeave = (otherHandlers) => (event) => {
		const onMouseLeaveCallback = otherHandlers.onMouseLeave;
		onMouseLeaveCallback?.(event);
		handleResume();
	};
	import_react.useEffect(() => {
		if (!disableWindowBlurListener && open) {
			window.addEventListener("focus", handleResume);
			window.addEventListener("blur", handlePause);
			return () => {
				window.removeEventListener("focus", handleResume);
				window.removeEventListener("blur", handlePause);
			};
		}
	}, [
		disableWindowBlurListener,
		open,
		handleResume,
		handlePause
	]);
	const getRootProps = (externalProps = {}) => {
		const externalEventHandlers = {
			...extractEventHandlers(parameters),
			...extractEventHandlers(externalProps)
		};
		return {
			role: "presentation",
			...externalProps,
			...externalEventHandlers,
			onBlur: createHandleBlur(externalEventHandlers),
			onFocus: createHandleFocus(externalEventHandlers),
			onMouseEnter: createMouseEnter(externalEventHandlers),
			onMouseLeave: createMouseLeave(externalEventHandlers)
		};
	};
	return {
		getRootProps,
		onClickAway: handleClickAway
	};
}
//#endregion
//#region node_modules/@mui/material/esm/ClickAwayListener/ClickAwayListener.js
function mapEventPropToEvent(eventProp) {
	return eventProp.substring(2).toLowerCase();
}
function clickedRootScrollbar(event, doc) {
	return doc.documentElement.clientWidth < event.clientX || doc.documentElement.clientHeight < event.clientY;
}
/**
* Listen for click events that occur somewhere in the document, outside of the element itself.
* For instance, if you need to hide a menu when people click anywhere else on your page.
*
* Demos:
*
* - [Click-Away Listener](https://mui.com/material-ui/react-click-away-listener/)
* - [Menu](https://mui.com/material-ui/react-menu/)
*
* API:
*
* - [ClickAwayListener API](https://mui.com/material-ui/api/click-away-listener/)
*/
function ClickAwayListener(props) {
	const { children, disableReactTree = false, mouseEvent = "onClick", onClickAway, touchEvent = "onTouchEnd" } = props;
	const movedRef = import_react.useRef(false);
	const nodeRef = import_react.useRef(null);
	const activatedRef = import_react.useRef(false);
	const syntheticEventRef = import_react.useRef(false);
	import_react.useEffect(() => {
		setTimeout(() => {
			activatedRef.current = true;
		}, 0);
		return () => {
			activatedRef.current = false;
		};
	}, []);
	const handleRef = useForkRef(getReactElementRef(children), nodeRef);
	const handleClickAway = useEventCallback((event) => {
		const insideReactTree = syntheticEventRef.current;
		syntheticEventRef.current = false;
		const doc = ownerDocument(nodeRef.current);
		if (!activatedRef.current || !nodeRef.current || "clientX" in event && clickedRootScrollbar(event, doc)) return;
		if (movedRef.current) {
			movedRef.current = false;
			return;
		}
		let insideDOM;
		if (event.composedPath) insideDOM = event.composedPath().includes(nodeRef.current);
		else insideDOM = !doc.documentElement.contains(event.target) || nodeRef.current.contains(event.target);
		if (!insideDOM && (disableReactTree || !insideReactTree)) onClickAway(event);
	});
	const createHandleSynthetic = (handlerName) => (event) => {
		syntheticEventRef.current = true;
		const childrenPropsHandler = children.props[handlerName];
		if (childrenPropsHandler) childrenPropsHandler(event);
	};
	const childrenProps = { ref: handleRef };
	if (touchEvent !== false) childrenProps[touchEvent] = createHandleSynthetic(touchEvent);
	import_react.useEffect(() => {
		if (touchEvent !== false) {
			const mappedTouchEvent = mapEventPropToEvent(touchEvent);
			const doc = ownerDocument(nodeRef.current);
			const handleTouchMove = () => {
				movedRef.current = true;
			};
			doc.addEventListener(mappedTouchEvent, handleClickAway);
			doc.addEventListener("touchmove", handleTouchMove);
			return () => {
				doc.removeEventListener(mappedTouchEvent, handleClickAway);
				doc.removeEventListener("touchmove", handleTouchMove);
			};
		}
	}, [handleClickAway, touchEvent]);
	if (mouseEvent !== false) childrenProps[mouseEvent] = createHandleSynthetic(mouseEvent);
	import_react.useEffect(() => {
		if (mouseEvent !== false) {
			const mappedMouseEvent = mapEventPropToEvent(mouseEvent);
			const doc = ownerDocument(nodeRef.current);
			doc.addEventListener(mappedMouseEvent, handleClickAway);
			return () => {
				doc.removeEventListener(mappedMouseEvent, handleClickAway);
			};
		}
	}, [handleClickAway, mouseEvent]);
	return /* @__PURE__ */ import_react.cloneElement(children, childrenProps);
}
ClickAwayListener.propTypes = {
	children: elementAcceptingRef.isRequired,
	disableReactTree: import_prop_types.default.bool,
	mouseEvent: import_prop_types.default.oneOf([
		"onClick",
		"onMouseDown",
		"onMouseUp",
		"onPointerDown",
		"onPointerUp",
		false
	]),
	onClickAway: import_prop_types.default.func.isRequired,
	touchEvent: import_prop_types.default.oneOf([
		"onTouchEnd",
		"onTouchStart",
		false
	])
};
ClickAwayListener["propTypes"] = exactProp(ClickAwayListener.propTypes);
//#endregion
//#region node_modules/@mui/material/esm/SnackbarContent/snackbarContentClasses.js
function getSnackbarContentUtilityClass(slot) {
	return generateUtilityClass("MuiSnackbarContent", slot);
}
generateUtilityClasses("MuiSnackbarContent", [
	"root",
	"message",
	"action"
]);
//#endregion
//#region node_modules/@mui/material/esm/SnackbarContent/SnackbarContent.js
var import_jsx_runtime = require_jsx_runtime();
var useUtilityClasses$1 = (ownerState) => {
	const { classes } = ownerState;
	return composeClasses({
		root: ["root"],
		action: ["action"],
		message: ["message"]
	}, getSnackbarContentUtilityClass, classes);
};
var SnackbarContentRoot = styled(Paper, {
	name: "MuiSnackbarContent",
	slot: "Root"
})(memoTheme(({ theme }) => {
	const emphasis = theme.palette.mode === "light" ? .8 : .98;
	return {
		...theme.typography.body2,
		color: theme.vars ? theme.vars.palette.SnackbarContent.color : theme.palette.getContrastText(emphasize(theme.palette.background.default, emphasis)),
		backgroundColor: theme.vars ? theme.vars.palette.SnackbarContent.bg : emphasize(theme.palette.background.default, emphasis),
		display: "flex",
		alignItems: "center",
		flexWrap: "wrap",
		padding: "6px 16px",
		flexGrow: 1,
		[theme.breakpoints.up("sm")]: {
			flexGrow: "initial",
			minWidth: 288
		}
	};
}));
var SnackbarContentMessage = styled("div", {
	name: "MuiSnackbarContent",
	slot: "Message"
})({ padding: "8px 0" });
var SnackbarContentAction = styled("div", {
	name: "MuiSnackbarContent",
	slot: "Action"
})({
	display: "flex",
	alignItems: "center",
	marginLeft: "auto",
	paddingLeft: 16,
	marginRight: -8
});
var SnackbarContent = /* @__PURE__ */ import_react.forwardRef(function SnackbarContent(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiSnackbarContent"
	});
	const { action, className, message, role = "alert", ...other } = props;
	const ownerState = props;
	const classes = useUtilityClasses$1(ownerState);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SnackbarContentRoot, {
		role,
		elevation: 6,
		className: clsx(classes.root, className),
		ownerState,
		ref,
		...other,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SnackbarContentMessage, {
			className: classes.message,
			ownerState,
			children: message
		}), action ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SnackbarContentAction, {
			className: classes.action,
			ownerState,
			children: action
		}) : null]
	});
});
SnackbarContent.propTypes = {
	action: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	message: import_prop_types.default.node,
	role: import_prop_types.default.string,
	sx: import_prop_types.default.oneOfType([
		import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
			import_prop_types.default.func,
			import_prop_types.default.object,
			import_prop_types.default.bool
		])),
		import_prop_types.default.func,
		import_prop_types.default.object
	])
};
//#endregion
//#region node_modules/@mui/material/esm/Snackbar/snackbarClasses.js
function getSnackbarUtilityClass(slot) {
	return generateUtilityClass("MuiSnackbar", slot);
}
var snackbarClasses = generateUtilityClasses("MuiSnackbar", [
	"root",
	"anchorOriginTopCenter",
	"anchorOriginBottomCenter",
	"anchorOriginTopRight",
	"anchorOriginBottomRight",
	"anchorOriginTopLeft",
	"anchorOriginBottomLeft"
]);
//#endregion
//#region node_modules/@mui/material/esm/Snackbar/Snackbar.js
var useUtilityClasses = (ownerState) => {
	const { classes, anchorOrigin } = ownerState;
	return composeClasses({ root: ["root", `anchorOrigin${capitalize_default(anchorOrigin.vertical)}${capitalize_default(anchorOrigin.horizontal)}`] }, getSnackbarUtilityClass, classes);
};
var SnackbarRoot = styled("div", {
	name: "MuiSnackbar",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [styles.root, styles[`anchorOrigin${capitalize_default(ownerState.anchorOrigin.vertical)}${capitalize_default(ownerState.anchorOrigin.horizontal)}`]];
	}
})(memoTheme(({ theme }) => ({
	zIndex: (theme.vars || theme).zIndex.snackbar,
	position: "fixed",
	display: "flex",
	left: 8,
	right: 8,
	justifyContent: "center",
	alignItems: "center",
	variants: [
		{
			props: ({ ownerState }) => ownerState.anchorOrigin.vertical === "top",
			style: {
				top: 8,
				[theme.breakpoints.up("sm")]: { top: 24 }
			}
		},
		{
			props: ({ ownerState }) => ownerState.anchorOrigin.vertical !== "top",
			style: {
				bottom: 8,
				[theme.breakpoints.up("sm")]: { bottom: 24 }
			}
		},
		{
			props: ({ ownerState }) => ownerState.anchorOrigin.horizontal === "left",
			style: {
				justifyContent: "flex-start",
				[theme.breakpoints.up("sm")]: {
					left: 24,
					right: "auto"
				}
			}
		},
		{
			props: ({ ownerState }) => ownerState.anchorOrigin.horizontal === "right",
			style: {
				justifyContent: "flex-end",
				[theme.breakpoints.up("sm")]: {
					right: 24,
					left: "auto"
				}
			}
		},
		{
			props: ({ ownerState }) => ownerState.anchorOrigin.horizontal === "center",
			style: { [theme.breakpoints.up("sm")]: {
				left: "50%",
				right: "auto",
				transform: "translateX(-50%)"
			} }
		}
	]
})));
var Snackbar = /* @__PURE__ */ import_react.forwardRef(function Snackbar(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiSnackbar"
	});
	const theme = useTheme();
	const defaultTransitionDuration = {
		enter: theme.transitions.duration.enteringScreen,
		exit: theme.transitions.duration.leavingScreen
	};
	const { action, anchorOrigin: { vertical, horizontal } = {
		vertical: "bottom",
		horizontal: "left"
	}, autoHideDuration = null, children, className, ClickAwayListenerProps: ClickAwayListenerPropsProp, ContentProps: ContentPropsProp, disableWindowBlurListener = false, message, onBlur, onClose, onFocus, onMouseEnter, onMouseLeave, open, resumeHideDuration, slots = {}, slotProps = {}, TransitionComponent: TransitionComponentProp, transitionDuration = defaultTransitionDuration, TransitionProps: { onEnter, onExited, ...TransitionPropsProp } = {}, ...other } = props;
	const ownerState = {
		...props,
		anchorOrigin: {
			vertical,
			horizontal
		},
		autoHideDuration,
		disableWindowBlurListener,
		TransitionComponent: TransitionComponentProp,
		transitionDuration
	};
	const classes = useUtilityClasses(ownerState);
	const { getRootProps, onClickAway } = useSnackbar(ownerState);
	const [exited, setExited] = import_react.useState(true);
	const handleExited = (node) => {
		setExited(true);
		if (onExited) onExited(node);
	};
	const handleEnter = (node, isAppearing) => {
		setExited(false);
		if (onEnter) onEnter(node, isAppearing);
	};
	const externalForwardedProps = {
		slots: {
			transition: TransitionComponentProp,
			...slots
		},
		slotProps: {
			content: ContentPropsProp,
			clickAwayListener: ClickAwayListenerPropsProp,
			transition: TransitionPropsProp,
			...slotProps
		}
	};
	const [Root, rootProps] = useSlot("root", {
		ref,
		className: [classes.root, className],
		elementType: SnackbarRoot,
		getSlotProps: getRootProps,
		externalForwardedProps: {
			...externalForwardedProps,
			...other
		},
		ownerState
	});
	const [ClickAwaySlot, { ownerState: clickAwayOwnerStateProp, ...clickAwayListenerProps }] = useSlot("clickAwayListener", {
		elementType: ClickAwayListener,
		externalForwardedProps,
		getSlotProps: (handlers) => ({ onClickAway: (...params) => {
			const event = params[0];
			handlers.onClickAway?.(...params);
			if (event?.defaultMuiPrevented) return;
			onClickAway(...params);
		} }),
		ownerState
	});
	const [ContentSlot, contentSlotProps] = useSlot("content", {
		elementType: SnackbarContent,
		shouldForwardComponentProp: true,
		externalForwardedProps,
		additionalProps: {
			message,
			action
		},
		ownerState
	});
	const [TransitionSlot, transitionProps] = useSlot("transition", {
		elementType: Grow,
		externalForwardedProps,
		getSlotProps: (handlers) => ({
			onEnter: (...params) => {
				handlers.onEnter?.(...params);
				handleEnter(...params);
			},
			onExited: (...params) => {
				handlers.onExited?.(...params);
				handleExited(...params);
			}
		}),
		additionalProps: {
			appear: true,
			in: open,
			timeout: transitionDuration,
			direction: vertical === "top" ? "down" : "up"
		},
		ownerState
	});
	if (!open && exited) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClickAwaySlot, {
		...clickAwayListenerProps,
		...slots.clickAwayListener && { ownerState: clickAwayOwnerStateProp },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
			...rootProps,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransitionSlot, {
				...transitionProps,
				children: children || /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContentSlot, { ...contentSlotProps })
			})
		})
	});
});
Snackbar.propTypes = {
	action: import_prop_types.default.node,
	anchorOrigin: import_prop_types.default.shape({
		horizontal: import_prop_types.default.oneOf([
			"center",
			"left",
			"right"
		]).isRequired,
		vertical: import_prop_types.default.oneOf(["bottom", "top"]).isRequired
	}),
	autoHideDuration: import_prop_types.default.number,
	children: import_prop_types.default.element,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	ClickAwayListenerProps: import_prop_types.default.object,
	ContentProps: import_prop_types.default.object,
	disableWindowBlurListener: import_prop_types.default.bool,
	key: () => null,
	message: import_prop_types.default.node,
	onBlur: import_prop_types.default.func,
	onClose: import_prop_types.default.func,
	onFocus: import_prop_types.default.func,
	onMouseEnter: import_prop_types.default.func,
	onMouseLeave: import_prop_types.default.func,
	open: import_prop_types.default.bool,
	resumeHideDuration: import_prop_types.default.number,
	slotProps: import_prop_types.default.shape({
		clickAwayListener: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		content: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		root: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		transition: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object])
	}),
	slots: import_prop_types.default.shape({
		clickAwayListener: import_prop_types.default.elementType,
		content: import_prop_types.default.elementType,
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
	TransitionComponent: import_prop_types.default.elementType,
	transitionDuration: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.shape({
		appear: import_prop_types.default.number,
		enter: import_prop_types.default.number,
		exit: import_prop_types.default.number
	})]),
	TransitionProps: import_prop_types.default.object
};
//#endregion
export { Snackbar as default, getSnackbarUtilityClass, snackbarClasses };

//# sourceMappingURL=@mui_material_Snackbar.js.map