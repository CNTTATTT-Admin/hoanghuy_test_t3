import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, U as generateUtilityClass, dt as clsx, ft as require_prop_types, n as rootShouldForwardProp, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as memoTheme } from "./memoTheme-PLhiQ1dZ.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
import { t as ListContext } from "./ListContext-CDJw1JA6.js";
import { i as useForkRef_default } from "./TransitionGroupContext-CmouUOv0.js";
import { t as ButtonBase } from "./ButtonBase-CqNytXvy.js";
import { t as useEnhancedEffect_default } from "./useEnhancedEffect-0NPUm_ZL.js";
//#region node_modules/@mui/material/esm/ListItemButton/listItemButtonClasses.js
function getListItemButtonUtilityClass(slot) {
	return generateUtilityClass("MuiListItemButton", slot);
}
var listItemButtonClasses = generateUtilityClasses("MuiListItemButton", [
	"root",
	"focusVisible",
	"dense",
	"alignItemsFlexStart",
	"disabled",
	"divider",
	"gutters",
	"selected"
]);
//#endregion
//#region node_modules/@mui/material/esm/ListItemButton/ListItemButton.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
var import_jsx_runtime = require_jsx_runtime();
var overridesResolver = (props, styles) => {
	const { ownerState } = props;
	return [
		styles.root,
		ownerState.dense && styles.dense,
		ownerState.alignItems === "flex-start" && styles.alignItemsFlexStart,
		ownerState.divider && styles.divider,
		!ownerState.disableGutters && styles.gutters
	];
};
var useUtilityClasses = (ownerState) => {
	const { alignItems, classes, dense, disabled, disableGutters, divider, selected } = ownerState;
	const composedClasses = composeClasses({ root: [
		"root",
		dense && "dense",
		!disableGutters && "gutters",
		divider && "divider",
		disabled && "disabled",
		alignItems === "flex-start" && "alignItemsFlexStart",
		selected && "selected"
	] }, getListItemButtonUtilityClass, classes);
	return {
		...classes,
		...composedClasses
	};
};
var ListItemButtonRoot = styled(ButtonBase, {
	shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === "classes",
	name: "MuiListItemButton",
	slot: "Root",
	overridesResolver
})(memoTheme(({ theme }) => ({
	display: "flex",
	flexGrow: 1,
	justifyContent: "flex-start",
	alignItems: "center",
	position: "relative",
	textDecoration: "none",
	minWidth: 0,
	boxSizing: "border-box",
	textAlign: "left",
	paddingTop: 8,
	paddingBottom: 8,
	transition: theme.transitions.create("background-color", { duration: theme.transitions.duration.shortest }),
	"&:hover": {
		textDecoration: "none",
		backgroundColor: (theme.vars || theme).palette.action.hover,
		"@media (hover: none)": { backgroundColor: "transparent" }
	},
	[`&.${listItemButtonClasses.selected}`]: {
		backgroundColor: theme.alpha((theme.vars || theme).palette.primary.main, (theme.vars || theme).palette.action.selectedOpacity),
		[`&.${listItemButtonClasses.focusVisible}`]: { backgroundColor: theme.alpha((theme.vars || theme).palette.primary.main, `${(theme.vars || theme).palette.action.selectedOpacity} + ${(theme.vars || theme).palette.action.focusOpacity}`) }
	},
	[`&.${listItemButtonClasses.selected}:hover`]: {
		backgroundColor: theme.alpha((theme.vars || theme).palette.primary.main, `${(theme.vars || theme).palette.action.selectedOpacity} + ${(theme.vars || theme).palette.action.hoverOpacity}`),
		"@media (hover: none)": { backgroundColor: theme.alpha((theme.vars || theme).palette.primary.main, (theme.vars || theme).palette.action.selectedOpacity) }
	},
	[`&.${listItemButtonClasses.focusVisible}`]: { backgroundColor: (theme.vars || theme).palette.action.focus },
	[`&.${listItemButtonClasses.disabled}`]: { opacity: (theme.vars || theme).palette.action.disabledOpacity },
	variants: [
		{
			props: ({ ownerState }) => ownerState.divider,
			style: {
				borderBottom: `1px solid ${(theme.vars || theme).palette.divider}`,
				backgroundClip: "padding-box"
			}
		},
		{
			props: { alignItems: "flex-start" },
			style: { alignItems: "flex-start" }
		},
		{
			props: ({ ownerState }) => !ownerState.disableGutters,
			style: {
				paddingLeft: 16,
				paddingRight: 16
			}
		},
		{
			props: ({ ownerState }) => ownerState.dense,
			style: {
				paddingTop: 4,
				paddingBottom: 4
			}
		}
	]
})));
var ListItemButton = /* @__PURE__ */ import_react.forwardRef(function ListItemButton(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiListItemButton"
	});
	const { alignItems = "center", autoFocus = false, component = "div", children, dense = false, disableGutters = false, divider = false, focusVisibleClassName, selected = false, className, ...other } = props;
	const context = import_react.useContext(ListContext);
	const childContext = import_react.useMemo(() => ({
		dense: dense || context.dense || false,
		alignItems,
		disableGutters
	}), [
		alignItems,
		context.dense,
		dense,
		disableGutters
	]);
	const listItemRef = import_react.useRef(null);
	useEnhancedEffect_default(() => {
		if (autoFocus) if (listItemRef.current) listItemRef.current.focus();
		else console.error("MUI: Unable to set focus to a ListItemButton whose component has not been rendered.");
	}, [autoFocus]);
	const ownerState = {
		...props,
		alignItems,
		dense: childContext.dense,
		disableGutters,
		divider,
		selected
	};
	const classes = useUtilityClasses(ownerState);
	const handleRef = useForkRef_default(listItemRef, ref);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListContext.Provider, {
		value: childContext,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListItemButtonRoot, {
			ref: handleRef,
			href: other.href || other.to,
			component: (other.href || other.to) && component === "div" ? "button" : component,
			focusVisibleClassName: clsx(classes.focusVisible, focusVisibleClassName),
			ownerState,
			className: clsx(classes.root, className),
			...other,
			classes,
			children
		})
	});
});
ListItemButton.propTypes = {
	alignItems: import_prop_types.default.oneOf(["center", "flex-start"]),
	autoFocus: import_prop_types.default.bool,
	children: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	component: import_prop_types.default.elementType,
	dense: import_prop_types.default.bool,
	disabled: import_prop_types.default.bool,
	disableGutters: import_prop_types.default.bool,
	divider: import_prop_types.default.bool,
	focusVisibleClassName: import_prop_types.default.string,
	href: import_prop_types.default.string,
	selected: import_prop_types.default.bool,
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
export { getListItemButtonUtilityClass as n, listItemButtonClasses as r, ListItemButton as t };

//# sourceMappingURL=ListItemButton-Bm9-B-ys.js.map