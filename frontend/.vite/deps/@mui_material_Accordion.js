import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, U as generateUtilityClass, dt as clsx, ft as require_prop_types, i as useTheme, lt as require_react_is, m as duration, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as memoTheme } from "./memoTheme-PLhiQ1dZ.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
import { t as Paper } from "./Paper-C4ekxLBX.js";
import { t as chainPropTypes } from "./chainPropTypes-Cq73wFmt.js";
import { t as elementTypeAcceptingRef_default } from "./elementTypeAcceptingRef-CI0c6K4q.js";
import { i as useForkRef_default } from "./TransitionGroupContext-CmouUOv0.js";
import { t as useSlot } from "./useSlot-B3bIL9ix.js";
import { n as useTimeout } from "./useTimeout-BLUJLZXi.js";
import { r as Transition, t as getTransitionProps } from "./utils-C8xhvt8I.js";
import { t as useControlled_default } from "./useControlled-Da8YOFEU.js";
import { t as AccordionContext } from "./AccordionContext-DL8T_dAa.js";
//#region node_modules/@mui/material/esm/Collapse/collapseClasses.js
function getCollapseUtilityClass(slot) {
	return generateUtilityClass("MuiCollapse", slot);
}
generateUtilityClasses("MuiCollapse", [
	"root",
	"horizontal",
	"vertical",
	"entered",
	"hidden",
	"wrapper",
	"wrapperInner"
]);
//#endregion
//#region node_modules/@mui/material/esm/Collapse/Collapse.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
var import_jsx_runtime = require_jsx_runtime();
var useUtilityClasses$1 = (ownerState) => {
	const { orientation, classes } = ownerState;
	return composeClasses({
		root: ["root", orientation],
		entered: ["entered"],
		hidden: ["hidden"],
		wrapper: ["wrapper", orientation],
		wrapperInner: ["wrapperInner", orientation]
	}, getCollapseUtilityClass, classes);
};
var CollapseRoot = styled("div", {
	name: "MuiCollapse",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.root,
			styles[ownerState.orientation],
			ownerState.state === "entered" && styles.entered,
			ownerState.state === "exited" && !ownerState.in && ownerState.collapsedSize === "0px" && styles.hidden
		];
	}
})(memoTheme(({ theme }) => ({
	height: 0,
	overflow: "hidden",
	transition: theme.transitions.create("height"),
	variants: [
		{
			props: { orientation: "horizontal" },
			style: {
				height: "auto",
				width: 0,
				transition: theme.transitions.create("width")
			}
		},
		{
			props: { state: "entered" },
			style: {
				height: "auto",
				overflow: "visible"
			}
		},
		{
			props: {
				state: "entered",
				orientation: "horizontal"
			},
			style: { width: "auto" }
		},
		{
			props: ({ ownerState }) => ownerState.state === "exited" && !ownerState.in && ownerState.collapsedSize === "0px",
			style: { visibility: "hidden" }
		}
	]
})));
var CollapseWrapper = styled("div", {
	name: "MuiCollapse",
	slot: "Wrapper"
})({
	display: "flex",
	width: "100%",
	variants: [{
		props: { orientation: "horizontal" },
		style: {
			width: "auto",
			height: "100%"
		}
	}]
});
var CollapseWrapperInner = styled("div", {
	name: "MuiCollapse",
	slot: "WrapperInner"
})({
	width: "100%",
	variants: [{
		props: { orientation: "horizontal" },
		style: {
			width: "auto",
			height: "100%"
		}
	}]
});
/**
* The Collapse transition is used by the
* [Vertical Stepper](/material-ui/react-stepper/#vertical-stepper) StepContent component.
* It uses [react-transition-group](https://github.com/reactjs/react-transition-group) internally.
*/
var Collapse = /* @__PURE__ */ import_react.forwardRef(function Collapse(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiCollapse"
	});
	const { addEndListener, children, className, collapsedSize: collapsedSizeProp = "0px", component, easing, in: inProp, onEnter, onEntered, onEntering, onExit, onExited, onExiting, orientation = "vertical", slots = {}, slotProps = {}, style, timeout = duration.standard, TransitionComponent = Transition, ...other } = props;
	const ownerState = {
		...props,
		orientation,
		collapsedSize: collapsedSizeProp
	};
	const classes = useUtilityClasses$1(ownerState);
	const theme = useTheme();
	const timer = useTimeout();
	const wrapperRef = import_react.useRef(null);
	const autoTransitionDuration = import_react.useRef();
	const collapsedSize = typeof collapsedSizeProp === "number" ? `${collapsedSizeProp}px` : collapsedSizeProp;
	const isHorizontal = orientation === "horizontal";
	const size = isHorizontal ? "width" : "height";
	const nodeRef = import_react.useRef(null);
	const handleRef = useForkRef_default(ref, nodeRef);
	const normalizedTransitionCallback = (callback) => (maybeIsAppearing) => {
		if (callback) {
			const node = nodeRef.current;
			if (maybeIsAppearing === void 0) callback(node);
			else callback(node, maybeIsAppearing);
		}
	};
	const getWrapperSize = () => wrapperRef.current ? wrapperRef.current[isHorizontal ? "clientWidth" : "clientHeight"] : 0;
	const handleEnter = normalizedTransitionCallback((node, isAppearing) => {
		if (wrapperRef.current && isHorizontal) wrapperRef.current.style.position = "absolute";
		node.style[size] = collapsedSize;
		if (onEnter) onEnter(node, isAppearing);
	});
	const handleEntering = normalizedTransitionCallback((node, isAppearing) => {
		const wrapperSize = getWrapperSize();
		if (wrapperRef.current && isHorizontal) wrapperRef.current.style.position = "";
		const { duration: transitionDuration, easing: transitionTimingFunction } = getTransitionProps({
			style,
			timeout,
			easing
		}, { mode: "enter" });
		if (timeout === "auto") {
			const duration2 = theme.transitions.getAutoHeightDuration(wrapperSize);
			node.style.transitionDuration = `${duration2}ms`;
			autoTransitionDuration.current = duration2;
		} else node.style.transitionDuration = typeof transitionDuration === "string" ? transitionDuration : `${transitionDuration}ms`;
		node.style[size] = `${wrapperSize}px`;
		node.style.transitionTimingFunction = transitionTimingFunction;
		if (onEntering) onEntering(node, isAppearing);
	});
	const handleEntered = normalizedTransitionCallback((node, isAppearing) => {
		node.style[size] = "auto";
		if (onEntered) onEntered(node, isAppearing);
	});
	const handleExit = normalizedTransitionCallback((node) => {
		node.style[size] = `${getWrapperSize()}px`;
		if (onExit) onExit(node);
	});
	const handleExited = normalizedTransitionCallback(onExited);
	const handleExiting = normalizedTransitionCallback((node) => {
		const wrapperSize = getWrapperSize();
		const { duration: transitionDuration, easing: transitionTimingFunction } = getTransitionProps({
			style,
			timeout,
			easing
		}, { mode: "exit" });
		if (timeout === "auto") {
			const duration2 = theme.transitions.getAutoHeightDuration(wrapperSize);
			node.style.transitionDuration = `${duration2}ms`;
			autoTransitionDuration.current = duration2;
		} else node.style.transitionDuration = typeof transitionDuration === "string" ? transitionDuration : `${transitionDuration}ms`;
		node.style[size] = collapsedSize;
		node.style.transitionTimingFunction = transitionTimingFunction;
		if (onExiting) onExiting(node);
	});
	const handleAddEndListener = (next) => {
		if (timeout === "auto") timer.start(autoTransitionDuration.current || 0, next);
		if (addEndListener) addEndListener(nodeRef.current, next);
	};
	const externalForwardedProps = {
		slots,
		slotProps,
		component
	};
	const [RootSlot, rootSlotProps] = useSlot("root", {
		ref: handleRef,
		className: clsx(classes.root, className),
		elementType: CollapseRoot,
		externalForwardedProps,
		ownerState,
		additionalProps: { style: {
			[isHorizontal ? "minWidth" : "minHeight"]: collapsedSize,
			...style
		} }
	});
	const [WrapperSlot, wrapperSlotProps] = useSlot("wrapper", {
		ref: wrapperRef,
		className: classes.wrapper,
		elementType: CollapseWrapper,
		externalForwardedProps,
		ownerState
	});
	const [WrapperInnerSlot, wrapperInnerSlotProps] = useSlot("wrapperInner", {
		className: classes.wrapperInner,
		elementType: CollapseWrapperInner,
		externalForwardedProps,
		ownerState
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransitionComponent, {
		in: inProp,
		onEnter: handleEnter,
		onEntered: handleEntered,
		onEntering: handleEntering,
		onExit: handleExit,
		onExited: handleExited,
		onExiting: handleExiting,
		addEndListener: handleAddEndListener,
		nodeRef,
		timeout: timeout === "auto" ? null : timeout,
		...other,
		children: (state, { ownerState: incomingOwnerState, ...restChildProps }) => {
			const stateOwnerState = {
				...ownerState,
				state
			};
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RootSlot, {
				...rootSlotProps,
				className: clsx(rootSlotProps.className, {
					"entered": classes.entered,
					"exited": !inProp && collapsedSize === "0px" && classes.hidden
				}[state]),
				ownerState: stateOwnerState,
				...restChildProps,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WrapperSlot, {
					...wrapperSlotProps,
					ownerState: stateOwnerState,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WrapperInnerSlot, {
						...wrapperInnerSlotProps,
						ownerState: stateOwnerState,
						children
					})
				})
			});
		}
	});
});
Collapse.propTypes = {
	addEndListener: import_prop_types.default.func,
	children: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	collapsedSize: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
	component: elementTypeAcceptingRef_default,
	easing: import_prop_types.default.oneOfType([import_prop_types.default.shape({
		enter: import_prop_types.default.string,
		exit: import_prop_types.default.string
	}), import_prop_types.default.string]),
	in: import_prop_types.default.bool,
	onEnter: import_prop_types.default.func,
	onEntered: import_prop_types.default.func,
	onEntering: import_prop_types.default.func,
	onExit: import_prop_types.default.func,
	onExited: import_prop_types.default.func,
	onExiting: import_prop_types.default.func,
	orientation: import_prop_types.default.oneOf(["horizontal", "vertical"]),
	slotProps: import_prop_types.default.shape({
		root: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		wrapper: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		wrapperInner: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object])
	}),
	slots: import_prop_types.default.shape({
		root: import_prop_types.default.elementType,
		wrapper: import_prop_types.default.elementType,
		wrapperInner: import_prop_types.default.elementType
	}),
	style: import_prop_types.default.object,
	sx: import_prop_types.default.oneOfType([
		import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
			import_prop_types.default.func,
			import_prop_types.default.object,
			import_prop_types.default.bool
		])),
		import_prop_types.default.func,
		import_prop_types.default.object
	]),
	timeout: import_prop_types.default.oneOfType([
		import_prop_types.default.oneOf(["auto"]),
		import_prop_types.default.number,
		import_prop_types.default.shape({
			appear: import_prop_types.default.number,
			enter: import_prop_types.default.number,
			exit: import_prop_types.default.number
		})
	])
};
if (Collapse) Collapse.muiSupportAuto = true;
//#endregion
//#region node_modules/@mui/material/esm/Accordion/accordionClasses.js
var import_react_is = require_react_is();
function getAccordionUtilityClass(slot) {
	return generateUtilityClass("MuiAccordion", slot);
}
var accordionClasses = generateUtilityClasses("MuiAccordion", [
	"root",
	"heading",
	"rounded",
	"expanded",
	"disabled",
	"gutters",
	"region"
]);
//#endregion
//#region node_modules/@mui/material/esm/Accordion/Accordion.js
var useUtilityClasses = (ownerState) => {
	const { classes, square, expanded, disabled, disableGutters } = ownerState;
	return composeClasses({
		root: [
			"root",
			!square && "rounded",
			expanded && "expanded",
			disabled && "disabled",
			!disableGutters && "gutters"
		],
		heading: ["heading"],
		region: ["region"]
	}, getAccordionUtilityClass, classes);
};
var AccordionRoot = styled(Paper, {
	name: "MuiAccordion",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			{ [`& .${accordionClasses.region}`]: styles.region },
			styles.root,
			!ownerState.square && styles.rounded,
			!ownerState.disableGutters && styles.gutters
		];
	}
})(memoTheme(({ theme }) => {
	const transition = { duration: theme.transitions.duration.shortest };
	return {
		position: "relative",
		transition: theme.transitions.create(["margin"], transition),
		overflowAnchor: "none",
		"&::before": {
			position: "absolute",
			left: 0,
			top: -1,
			right: 0,
			height: 1,
			content: "\"\"",
			opacity: 1,
			backgroundColor: (theme.vars || theme).palette.divider,
			transition: theme.transitions.create(["opacity", "background-color"], transition)
		},
		"&:first-of-type": { "&::before": { display: "none" } },
		[`&.${accordionClasses.expanded}`]: {
			"&::before": { opacity: 0 },
			"&:first-of-type": { marginTop: 0 },
			"&:last-of-type": { marginBottom: 0 },
			"& + &": { "&::before": { display: "none" } }
		},
		[`&.${accordionClasses.disabled}`]: { backgroundColor: (theme.vars || theme).palette.action.disabledBackground }
	};
}), memoTheme(({ theme }) => ({ variants: [{
	props: (props) => !props.square,
	style: {
		borderRadius: 0,
		"&:first-of-type": {
			borderTopLeftRadius: (theme.vars || theme).shape.borderRadius,
			borderTopRightRadius: (theme.vars || theme).shape.borderRadius
		},
		"&:last-of-type": {
			borderBottomLeftRadius: (theme.vars || theme).shape.borderRadius,
			borderBottomRightRadius: (theme.vars || theme).shape.borderRadius,
			"@supports (-ms-ime-align: auto)": {
				borderBottomLeftRadius: 0,
				borderBottomRightRadius: 0
			}
		}
	}
}, {
	props: (props) => !props.disableGutters,
	style: { [`&.${accordionClasses.expanded}`]: { margin: "16px 0" } }
}] })));
var AccordionHeading = styled("h3", {
	name: "MuiAccordion",
	slot: "Heading"
})({ all: "unset" });
var AccordionRegion = styled("div", {
	name: "MuiAccordion",
	slot: "Region"
})({});
var Accordion = /* @__PURE__ */ import_react.forwardRef(function Accordion(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiAccordion"
	});
	const { children: childrenProp, className, defaultExpanded = false, disabled = false, disableGutters = false, expanded: expandedProp, onChange, slots = {}, slotProps = {}, TransitionComponent: TransitionComponentProp, TransitionProps: TransitionPropsProp, ...other } = props;
	const [expanded, setExpandedState] = useControlled_default({
		controlled: expandedProp,
		default: defaultExpanded,
		name: "Accordion",
		state: "expanded"
	});
	const handleChange = import_react.useCallback((event) => {
		setExpandedState(!expanded);
		if (onChange) onChange(event, !expanded);
	}, [
		expanded,
		onChange,
		setExpandedState
	]);
	const [summary, ...children] = import_react.Children.toArray(childrenProp);
	const contextValue = import_react.useMemo(() => ({
		expanded,
		disabled,
		disableGutters,
		toggle: handleChange
	}), [
		expanded,
		disabled,
		disableGutters,
		handleChange
	]);
	const ownerState = {
		...props,
		disabled,
		disableGutters,
		expanded
	};
	const classes = useUtilityClasses(ownerState);
	const externalForwardedProps = {
		slots: {
			transition: TransitionComponentProp,
			...slots
		},
		slotProps: {
			transition: TransitionPropsProp,
			...slotProps
		}
	};
	const [RootSlot, rootProps] = useSlot("root", {
		elementType: AccordionRoot,
		externalForwardedProps: {
			...externalForwardedProps,
			...other
		},
		className: clsx(classes.root, className),
		shouldForwardComponentProp: true,
		ownerState,
		ref
	});
	const [AccordionHeadingSlot, accordionProps] = useSlot("heading", {
		elementType: AccordionHeading,
		externalForwardedProps,
		className: classes.heading,
		ownerState
	});
	const [TransitionSlot, transitionProps] = useSlot("transition", {
		elementType: Collapse,
		externalForwardedProps,
		ownerState
	});
	const [AccordionRegionSlot, accordionRegionProps] = useSlot("region", {
		elementType: AccordionRegion,
		externalForwardedProps,
		ownerState,
		className: classes.region,
		additionalProps: {
			"aria-labelledby": summary.props.id,
			id: summary.props["aria-controls"],
			role: "region"
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RootSlot, {
		...rootProps,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionHeadingSlot, {
			...accordionProps,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionContext.Provider, {
				value: contextValue,
				children: summary
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransitionSlot, {
			in: expanded,
			timeout: "auto",
			...transitionProps,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionRegionSlot, {
				...accordionRegionProps,
				children
			})
		})]
	});
});
Accordion.propTypes = {
	children: chainPropTypes(import_prop_types.default.node.isRequired, (props) => {
		const summary = import_react.Children.toArray(props.children)[0];
		if ((0, import_react_is.isFragment)(summary)) return /* @__PURE__ */ new Error("MUI: The Accordion doesn't accept a Fragment as a child. Consider providing an array instead.");
		if (!/* @__PURE__ */ import_react.isValidElement(summary)) return /* @__PURE__ */ new Error("MUI: Expected the first child of Accordion to be a valid element.");
		return null;
	}),
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	defaultExpanded: import_prop_types.default.bool,
	disabled: import_prop_types.default.bool,
	disableGutters: import_prop_types.default.bool,
	expanded: import_prop_types.default.bool,
	onChange: import_prop_types.default.func,
	slotProps: import_prop_types.default.shape({
		heading: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		region: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		root: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		transition: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object])
	}),
	slots: import_prop_types.default.shape({
		heading: import_prop_types.default.elementType,
		region: import_prop_types.default.elementType,
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
	TransitionProps: import_prop_types.default.object
};
//#endregion
export { accordionClasses, Accordion as default, getAccordionUtilityClass };

//# sourceMappingURL=@mui_material_Accordion.js.map