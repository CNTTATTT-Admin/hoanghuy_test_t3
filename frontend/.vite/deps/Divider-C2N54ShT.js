import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, U as generateUtilityClass, dt as clsx, ft as require_prop_types, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as memoTheme } from "./memoTheme-PLhiQ1dZ.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
//#region node_modules/@mui/material/esm/Divider/dividerClasses.js
function getDividerUtilityClass(slot) {
	return generateUtilityClass("MuiDivider", slot);
}
var dividerClasses = generateUtilityClasses("MuiDivider", [
	"root",
	"absolute",
	"fullWidth",
	"inset",
	"middle",
	"flexItem",
	"light",
	"vertical",
	"withChildren",
	"withChildrenVertical",
	"textAlignRight",
	"textAlignLeft",
	"wrapper",
	"wrapperVertical"
]);
//#endregion
//#region node_modules/@mui/material/esm/Divider/Divider.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
var import_jsx_runtime = require_jsx_runtime();
var useUtilityClasses = (ownerState) => {
	const { absolute, children, classes, flexItem, light, orientation, textAlign, variant } = ownerState;
	return composeClasses({
		root: [
			"root",
			absolute && "absolute",
			variant,
			light && "light",
			orientation === "vertical" && "vertical",
			flexItem && "flexItem",
			children && "withChildren",
			children && orientation === "vertical" && "withChildrenVertical",
			textAlign === "right" && orientation !== "vertical" && "textAlignRight",
			textAlign === "left" && orientation !== "vertical" && "textAlignLeft"
		],
		wrapper: ["wrapper", orientation === "vertical" && "wrapperVertical"]
	}, getDividerUtilityClass, classes);
};
var DividerRoot = styled("div", {
	name: "MuiDivider",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.root,
			ownerState.absolute && styles.absolute,
			styles[ownerState.variant],
			ownerState.light && styles.light,
			ownerState.orientation === "vertical" && styles.vertical,
			ownerState.flexItem && styles.flexItem,
			ownerState.children && styles.withChildren,
			ownerState.children && ownerState.orientation === "vertical" && styles.withChildrenVertical,
			ownerState.textAlign === "right" && ownerState.orientation !== "vertical" && styles.textAlignRight,
			ownerState.textAlign === "left" && ownerState.orientation !== "vertical" && styles.textAlignLeft
		];
	}
})(memoTheme(({ theme }) => ({
	margin: 0,
	flexShrink: 0,
	borderWidth: 0,
	borderStyle: "solid",
	borderColor: (theme.vars || theme).palette.divider,
	borderBottomWidth: "thin",
	variants: [
		{
			props: { absolute: true },
			style: {
				position: "absolute",
				bottom: 0,
				left: 0,
				width: "100%"
			}
		},
		{
			props: { light: true },
			style: { borderColor: theme.alpha((theme.vars || theme).palette.divider, .08) }
		},
		{
			props: { variant: "inset" },
			style: { marginLeft: 72 }
		},
		{
			props: {
				variant: "middle",
				orientation: "horizontal"
			},
			style: {
				marginLeft: theme.spacing(2),
				marginRight: theme.spacing(2)
			}
		},
		{
			props: {
				variant: "middle",
				orientation: "vertical"
			},
			style: {
				marginTop: theme.spacing(1),
				marginBottom: theme.spacing(1)
			}
		},
		{
			props: { orientation: "vertical" },
			style: {
				height: "100%",
				borderBottomWidth: 0,
				borderRightWidth: "thin"
			}
		},
		{
			props: { flexItem: true },
			style: {
				alignSelf: "stretch",
				height: "auto"
			}
		},
		{
			props: ({ ownerState }) => !!ownerState.children,
			style: {
				display: "flex",
				textAlign: "center",
				border: 0,
				borderTopStyle: "solid",
				borderLeftStyle: "solid",
				"&::before, &::after": {
					content: "\"\"",
					alignSelf: "center"
				}
			}
		},
		{
			props: ({ ownerState }) => ownerState.children && ownerState.orientation !== "vertical",
			style: { "&::before, &::after": {
				width: "100%",
				borderTop: `thin solid ${(theme.vars || theme).palette.divider}`,
				borderTopStyle: "inherit"
			} }
		},
		{
			props: ({ ownerState }) => ownerState.orientation === "vertical" && ownerState.children,
			style: {
				flexDirection: "column",
				"&::before, &::after": {
					height: "100%",
					borderLeft: `thin solid ${(theme.vars || theme).palette.divider}`,
					borderLeftStyle: "inherit"
				}
			}
		},
		{
			props: ({ ownerState }) => ownerState.textAlign === "right" && ownerState.orientation !== "vertical",
			style: {
				"&::before": { width: "90%" },
				"&::after": { width: "10%" }
			}
		},
		{
			props: ({ ownerState }) => ownerState.textAlign === "left" && ownerState.orientation !== "vertical",
			style: {
				"&::before": { width: "10%" },
				"&::after": { width: "90%" }
			}
		}
	]
})));
var DividerWrapper = styled("span", {
	name: "MuiDivider",
	slot: "Wrapper",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [styles.wrapper, ownerState.orientation === "vertical" && styles.wrapperVertical];
	}
})(memoTheme(({ theme }) => ({
	display: "inline-block",
	paddingLeft: `calc(${theme.spacing(1)} * 1.2)`,
	paddingRight: `calc(${theme.spacing(1)} * 1.2)`,
	whiteSpace: "nowrap",
	variants: [{
		props: { orientation: "vertical" },
		style: {
			paddingTop: `calc(${theme.spacing(1)} * 1.2)`,
			paddingBottom: `calc(${theme.spacing(1)} * 1.2)`
		}
	}]
})));
var Divider = /* @__PURE__ */ import_react.forwardRef(function Divider(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiDivider"
	});
	const { absolute = false, children, className, orientation = "horizontal", component = children || orientation === "vertical" ? "div" : "hr", flexItem = false, light = false, role = component !== "hr" ? "separator" : void 0, textAlign = "center", variant = "fullWidth", ...other } = props;
	const ownerState = {
		...props,
		absolute,
		component,
		flexItem,
		light,
		orientation,
		role,
		textAlign,
		variant
	};
	const classes = useUtilityClasses(ownerState);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DividerRoot, {
		as: component,
		className: clsx(classes.root, className),
		role,
		ref,
		ownerState,
		"aria-orientation": role === "separator" && (component !== "hr" || orientation === "vertical") ? orientation : void 0,
		...other,
		children: children ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DividerWrapper, {
			className: classes.wrapper,
			ownerState,
			children
		}) : null
	});
});
/**
* The following flag is used to ensure that this component isn't tabbable i.e.
* does not get highlight/focus inside of MUI List.
*/
if (Divider) Divider.muiSkipListHighlight = true;
Divider.propTypes = {
	absolute: import_prop_types.default.bool,
	children: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	component: import_prop_types.default.elementType,
	flexItem: import_prop_types.default.bool,
	light: import_prop_types.default.bool,
	orientation: import_prop_types.default.oneOf(["horizontal", "vertical"]),
	role: import_prop_types.default.string,
	sx: import_prop_types.default.oneOfType([
		import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
			import_prop_types.default.func,
			import_prop_types.default.object,
			import_prop_types.default.bool
		])),
		import_prop_types.default.func,
		import_prop_types.default.object
	]),
	textAlign: import_prop_types.default.oneOf([
		"center",
		"left",
		"right"
	]),
	variant: import_prop_types.default.oneOfType([import_prop_types.default.oneOf([
		"fullWidth",
		"inset",
		"middle"
	]), import_prop_types.default.string])
};
//#endregion
export { dividerClasses as n, getDividerUtilityClass as r, Divider as t };

//# sourceMappingURL=Divider-C2N54ShT.js.map