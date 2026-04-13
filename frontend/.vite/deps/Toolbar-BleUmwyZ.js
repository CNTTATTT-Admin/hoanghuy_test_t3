import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, U as generateUtilityClass, dt as clsx, ft as require_prop_types, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as memoTheme } from "./memoTheme-PLhiQ1dZ.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
//#region node_modules/@mui/material/esm/Toolbar/toolbarClasses.js
function getToolbarUtilityClass(slot) {
	return generateUtilityClass("MuiToolbar", slot);
}
var toolbarClasses = generateUtilityClasses("MuiToolbar", [
	"root",
	"gutters",
	"regular",
	"dense"
]);
//#endregion
//#region node_modules/@mui/material/esm/Toolbar/Toolbar.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
var import_jsx_runtime = require_jsx_runtime();
var useUtilityClasses = (ownerState) => {
	const { classes, disableGutters, variant } = ownerState;
	return composeClasses({ root: [
		"root",
		!disableGutters && "gutters",
		variant
	] }, getToolbarUtilityClass, classes);
};
var ToolbarRoot = styled("div", {
	name: "MuiToolbar",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.root,
			!ownerState.disableGutters && styles.gutters,
			styles[ownerState.variant]
		];
	}
})(memoTheme(({ theme }) => ({
	position: "relative",
	display: "flex",
	alignItems: "center",
	variants: [
		{
			props: ({ ownerState }) => !ownerState.disableGutters,
			style: {
				paddingLeft: theme.spacing(2),
				paddingRight: theme.spacing(2),
				[theme.breakpoints.up("sm")]: {
					paddingLeft: theme.spacing(3),
					paddingRight: theme.spacing(3)
				}
			}
		},
		{
			props: { variant: "dense" },
			style: { minHeight: 48 }
		},
		{
			props: { variant: "regular" },
			style: theme.mixins.toolbar
		}
	]
})));
var Toolbar = /* @__PURE__ */ import_react.forwardRef(function Toolbar(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiToolbar"
	});
	const { className, component = "div", disableGutters = false, variant = "regular", ...other } = props;
	const ownerState = {
		...props,
		component,
		disableGutters,
		variant
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarRoot, {
		as: component,
		className: clsx(useUtilityClasses(ownerState).root, className),
		ref,
		ownerState,
		...other
	});
});
Toolbar.propTypes = {
	children: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	component: import_prop_types.default.elementType,
	disableGutters: import_prop_types.default.bool,
	sx: import_prop_types.default.oneOfType([
		import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
			import_prop_types.default.func,
			import_prop_types.default.object,
			import_prop_types.default.bool
		])),
		import_prop_types.default.func,
		import_prop_types.default.object
	]),
	variant: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["dense", "regular"]), import_prop_types.default.string])
};
//#endregion
export { getToolbarUtilityClass as n, toolbarClasses as r, Toolbar as t };

//# sourceMappingURL=Toolbar-BleUmwyZ.js.map