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
import { r as listItemTextClasses } from "./ListItemText-BHsFHv7n.js";
import { r as listItemIconClasses } from "./ListItemIcon-B_RadQBI.js";
import { n as dividerClasses } from "./Divider-C2N54ShT.js";
//#region node_modules/@mui/material/esm/MenuItem/menuItemClasses.js
function getMenuItemUtilityClass(slot) {
	return generateUtilityClass("MuiMenuItem", slot);
}
var menuItemClasses = generateUtilityClasses("MuiMenuItem", [
	"root",
	"focusVisible",
	"dense",
	"disabled",
	"divider",
	"gutters",
	"selected"
]);
//#endregion
//#region node_modules/@mui/material/esm/MenuItem/MenuItem.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
var import_jsx_runtime = require_jsx_runtime();
var overridesResolver = (props, styles) => {
	const { ownerState } = props;
	return [
		styles.root,
		ownerState.dense && styles.dense,
		ownerState.divider && styles.divider,
		!ownerState.disableGutters && styles.gutters
	];
};
var useUtilityClasses = (ownerState) => {
	const { disabled, dense, divider, disableGutters, selected, classes } = ownerState;
	const composedClasses = composeClasses({ root: [
		"root",
		dense && "dense",
		disabled && "disabled",
		!disableGutters && "gutters",
		divider && "divider",
		selected && "selected"
	] }, getMenuItemUtilityClass, classes);
	return {
		...classes,
		...composedClasses
	};
};
var MenuItemRoot = styled(ButtonBase, {
	shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === "classes",
	name: "MuiMenuItem",
	slot: "Root",
	overridesResolver
})(memoTheme(({ theme }) => ({
	...theme.typography.body1,
	display: "flex",
	justifyContent: "flex-start",
	alignItems: "center",
	position: "relative",
	textDecoration: "none",
	minHeight: 48,
	paddingTop: 6,
	paddingBottom: 6,
	boxSizing: "border-box",
	whiteSpace: "nowrap",
	"&:hover": {
		textDecoration: "none",
		backgroundColor: (theme.vars || theme).palette.action.hover,
		"@media (hover: none)": { backgroundColor: "transparent" }
	},
	[`&.${menuItemClasses.selected}`]: {
		backgroundColor: theme.alpha((theme.vars || theme).palette.primary.main, (theme.vars || theme).palette.action.selectedOpacity),
		[`&.${menuItemClasses.focusVisible}`]: { backgroundColor: theme.alpha((theme.vars || theme).palette.primary.main, `${(theme.vars || theme).palette.action.selectedOpacity} + ${(theme.vars || theme).palette.action.focusOpacity}`) }
	},
	[`&.${menuItemClasses.selected}:hover`]: {
		backgroundColor: theme.alpha((theme.vars || theme).palette.primary.main, `${(theme.vars || theme).palette.action.selectedOpacity} + ${(theme.vars || theme).palette.action.hoverOpacity}`),
		"@media (hover: none)": { backgroundColor: theme.alpha((theme.vars || theme).palette.primary.main, (theme.vars || theme).palette.action.selectedOpacity) }
	},
	[`&.${menuItemClasses.focusVisible}`]: { backgroundColor: (theme.vars || theme).palette.action.focus },
	[`&.${menuItemClasses.disabled}`]: { opacity: (theme.vars || theme).palette.action.disabledOpacity },
	[`& + .${dividerClasses.root}`]: {
		marginTop: theme.spacing(1),
		marginBottom: theme.spacing(1)
	},
	[`& + .${dividerClasses.inset}`]: { marginLeft: 52 },
	[`& .${listItemTextClasses.root}`]: {
		marginTop: 0,
		marginBottom: 0
	},
	[`& .${listItemTextClasses.inset}`]: { paddingLeft: 36 },
	[`& .${listItemIconClasses.root}`]: { minWidth: 36 },
	variants: [
		{
			props: ({ ownerState }) => !ownerState.disableGutters,
			style: {
				paddingLeft: 16,
				paddingRight: 16
			}
		},
		{
			props: ({ ownerState }) => ownerState.divider,
			style: {
				borderBottom: `1px solid ${(theme.vars || theme).palette.divider}`,
				backgroundClip: "padding-box"
			}
		},
		{
			props: ({ ownerState }) => !ownerState.dense,
			style: { [theme.breakpoints.up("sm")]: { minHeight: "auto" } }
		},
		{
			props: ({ ownerState }) => ownerState.dense,
			style: {
				minHeight: 32,
				paddingTop: 4,
				paddingBottom: 4,
				...theme.typography.body2,
				[`& .${listItemIconClasses.root} svg`]: { fontSize: "1.25rem" }
			}
		}
	]
})));
var MenuItem = /* @__PURE__ */ import_react.forwardRef(function MenuItem(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiMenuItem"
	});
	const { autoFocus = false, component = "li", dense = false, divider = false, disableGutters = false, focusVisibleClassName, role = "menuitem", tabIndex: tabIndexProp, className, ...other } = props;
	const context = import_react.useContext(ListContext);
	const childContext = import_react.useMemo(() => ({
		dense: dense || context.dense || false,
		disableGutters
	}), [
		context.dense,
		dense,
		disableGutters
	]);
	const menuItemRef = import_react.useRef(null);
	useEnhancedEffect_default(() => {
		if (autoFocus) if (menuItemRef.current) menuItemRef.current.focus();
		else console.error("MUI: Unable to set focus to a MenuItem whose component has not been rendered.");
	}, [autoFocus]);
	const ownerState = {
		...props,
		dense: childContext.dense,
		divider,
		disableGutters
	};
	const classes = useUtilityClasses(props);
	const handleRef = useForkRef_default(menuItemRef, ref);
	let tabIndex;
	if (!props.disabled) tabIndex = tabIndexProp !== void 0 ? tabIndexProp : -1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListContext.Provider, {
		value: childContext,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItemRoot, {
			ref: handleRef,
			role,
			tabIndex,
			component,
			focusVisibleClassName: clsx(classes.focusVisible, focusVisibleClassName),
			className: clsx(classes.root, className),
			...other,
			ownerState,
			classes
		})
	});
});
MenuItem.propTypes = {
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
	role: import_prop_types.default.string,
	selected: import_prop_types.default.bool,
	sx: import_prop_types.default.oneOfType([
		import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
			import_prop_types.default.func,
			import_prop_types.default.object,
			import_prop_types.default.bool
		])),
		import_prop_types.default.func,
		import_prop_types.default.object
	]),
	tabIndex: import_prop_types.default.number
};
//#endregion
export { getMenuItemUtilityClass as n, menuItemClasses as r, MenuItem as t };

//# sourceMappingURL=MenuItem-ChgRx3BV.js.map