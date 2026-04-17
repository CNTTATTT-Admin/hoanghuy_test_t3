import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, U as generateUtilityClass, dt as clsx, ft as require_prop_types, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as memoTheme } from "./memoTheme-PLhiQ1dZ.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
import { t as useSlot } from "./useSlot-B3bIL9ix.js";
import { t as ButtonBase } from "./ButtonBase-CqNytXvy.js";
import { t as AccordionContext } from "./AccordionContext-DL8T_dAa.js";
//#region node_modules/@mui/material/esm/AccordionSummary/accordionSummaryClasses.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
function getAccordionSummaryUtilityClass(slot) {
	return generateUtilityClass("MuiAccordionSummary", slot);
}
var accordionSummaryClasses = generateUtilityClasses("MuiAccordionSummary", [
	"root",
	"expanded",
	"focusVisible",
	"disabled",
	"gutters",
	"contentGutters",
	"content",
	"expandIconWrapper"
]);
//#endregion
//#region node_modules/@mui/material/esm/AccordionSummary/AccordionSummary.js
var import_jsx_runtime = require_jsx_runtime();
var useUtilityClasses = (ownerState) => {
	const { classes, expanded, disabled, disableGutters } = ownerState;
	return composeClasses({
		root: [
			"root",
			expanded && "expanded",
			disabled && "disabled",
			!disableGutters && "gutters"
		],
		focusVisible: ["focusVisible"],
		content: [
			"content",
			expanded && "expanded",
			!disableGutters && "contentGutters"
		],
		expandIconWrapper: ["expandIconWrapper", expanded && "expanded"]
	}, getAccordionSummaryUtilityClass, classes);
};
var AccordionSummaryRoot = styled(ButtonBase, {
	name: "MuiAccordionSummary",
	slot: "Root"
})(memoTheme(({ theme }) => {
	const transition = { duration: theme.transitions.duration.shortest };
	return {
		display: "flex",
		width: "100%",
		minHeight: 48,
		padding: theme.spacing(0, 2),
		transition: theme.transitions.create(["min-height", "background-color"], transition),
		[`&.${accordionSummaryClasses.focusVisible}`]: { backgroundColor: (theme.vars || theme).palette.action.focus },
		[`&.${accordionSummaryClasses.disabled}`]: { opacity: (theme.vars || theme).palette.action.disabledOpacity },
		[`&:hover:not(.${accordionSummaryClasses.disabled})`]: { cursor: "pointer" },
		variants: [{
			props: (props) => !props.disableGutters,
			style: { [`&.${accordionSummaryClasses.expanded}`]: { minHeight: 64 } }
		}]
	};
}));
var AccordionSummaryContent = styled("span", {
	name: "MuiAccordionSummary",
	slot: "Content"
})(memoTheme(({ theme }) => ({
	display: "flex",
	textAlign: "start",
	flexGrow: 1,
	margin: "12px 0",
	variants: [{
		props: (props) => !props.disableGutters,
		style: {
			transition: theme.transitions.create(["margin"], { duration: theme.transitions.duration.shortest }),
			[`&.${accordionSummaryClasses.expanded}`]: { margin: "20px 0" }
		}
	}]
})));
var AccordionSummaryExpandIconWrapper = styled("span", {
	name: "MuiAccordionSummary",
	slot: "ExpandIconWrapper"
})(memoTheme(({ theme }) => ({
	display: "flex",
	color: (theme.vars || theme).palette.action.active,
	transform: "rotate(0deg)",
	transition: theme.transitions.create("transform", { duration: theme.transitions.duration.shortest }),
	[`&.${accordionSummaryClasses.expanded}`]: { transform: "rotate(180deg)" }
})));
var AccordionSummary = /* @__PURE__ */ import_react.forwardRef(function AccordionSummary(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiAccordionSummary"
	});
	const { children, className, expandIcon, focusVisibleClassName, onClick, slots, slotProps, ...other } = props;
	const { disabled = false, disableGutters, expanded, toggle } = import_react.useContext(AccordionContext);
	const handleChange = (event) => {
		if (toggle) toggle(event);
		if (onClick) onClick(event);
	};
	const ownerState = {
		...props,
		expanded,
		disabled,
		disableGutters
	};
	const classes = useUtilityClasses(ownerState);
	const externalForwardedProps = {
		slots,
		slotProps
	};
	const [RootSlot, rootSlotProps] = useSlot("root", {
		ref,
		shouldForwardComponentProp: true,
		className: clsx(classes.root, className),
		elementType: AccordionSummaryRoot,
		externalForwardedProps: {
			...externalForwardedProps,
			...other
		},
		ownerState,
		additionalProps: {
			focusRipple: false,
			disableRipple: true,
			disabled,
			"aria-expanded": expanded,
			focusVisibleClassName: clsx(classes.focusVisible, focusVisibleClassName)
		},
		getSlotProps: (handlers) => ({
			...handlers,
			onClick: (event) => {
				handlers.onClick?.(event);
				handleChange(event);
			}
		})
	});
	const [ContentSlot, contentSlotProps] = useSlot("content", {
		className: classes.content,
		elementType: AccordionSummaryContent,
		externalForwardedProps,
		ownerState
	});
	const [ExpandIconWrapperSlot, expandIconWrapperSlotProps] = useSlot("expandIconWrapper", {
		className: classes.expandIconWrapper,
		elementType: AccordionSummaryExpandIconWrapper,
		externalForwardedProps,
		ownerState
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RootSlot, {
		...rootSlotProps,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContentSlot, {
			...contentSlotProps,
			children
		}), expandIcon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExpandIconWrapperSlot, {
			...expandIconWrapperSlotProps,
			children: expandIcon
		})]
	});
});
AccordionSummary.propTypes = {
	children: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	expandIcon: import_prop_types.default.node,
	focusVisibleClassName: import_prop_types.default.string,
	onClick: import_prop_types.default.func,
	slotProps: import_prop_types.default.shape({
		content: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		expandIconWrapper: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		root: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object])
	}),
	slots: import_prop_types.default.shape({
		content: import_prop_types.default.elementType,
		expandIconWrapper: import_prop_types.default.elementType,
		root: import_prop_types.default.elementType
	}),
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
export { accordionSummaryClasses, AccordionSummary as default, getAccordionSummaryUtilityClass };

//# sourceMappingURL=@mui_material_AccordionSummary.js.map