import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, U as generateUtilityClass, dt as clsx, ft as require_prop_types, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as memoTheme } from "./memoTheme-PLhiQ1dZ.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
import { t as capitalize_default } from "./capitalize-C7D-9Jwf.js";
import { t as Typography } from "./Typography-CrsVQyni.js";
import { n as FormControlContext, t as useFormControl } from "./useFormControl-Dudtiqlw.js";
//#region node_modules/@mui/material/esm/InputAdornment/inputAdornmentClasses.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
function getInputAdornmentUtilityClass(slot) {
	return generateUtilityClass("MuiInputAdornment", slot);
}
var inputAdornmentClasses = generateUtilityClasses("MuiInputAdornment", [
	"root",
	"filled",
	"standard",
	"outlined",
	"positionStart",
	"positionEnd",
	"disablePointerEvents",
	"hiddenLabel",
	"sizeSmall"
]);
//#endregion
//#region node_modules/@mui/material/esm/InputAdornment/InputAdornment.js
var import_jsx_runtime = require_jsx_runtime();
var _span;
var overridesResolver = (props, styles) => {
	const { ownerState } = props;
	return [
		styles.root,
		styles[`position${capitalize_default(ownerState.position)}`],
		ownerState.disablePointerEvents === true && styles.disablePointerEvents,
		styles[ownerState.variant]
	];
};
var useUtilityClasses = (ownerState) => {
	const { classes, disablePointerEvents, hiddenLabel, position, size, variant } = ownerState;
	return composeClasses({ root: [
		"root",
		disablePointerEvents && "disablePointerEvents",
		position && `position${capitalize_default(position)}`,
		variant,
		hiddenLabel && "hiddenLabel",
		size && `size${capitalize_default(size)}`
	] }, getInputAdornmentUtilityClass, classes);
};
var InputAdornmentRoot = styled("div", {
	name: "MuiInputAdornment",
	slot: "Root",
	overridesResolver
})(memoTheme(({ theme }) => ({
	display: "flex",
	maxHeight: "2em",
	alignItems: "center",
	whiteSpace: "nowrap",
	color: (theme.vars || theme).palette.action.active,
	variants: [
		{
			props: { variant: "filled" },
			style: { [`&.${inputAdornmentClasses.positionStart}&:not(.${inputAdornmentClasses.hiddenLabel})`]: { marginTop: 16 } }
		},
		{
			props: { position: "start" },
			style: { marginRight: 8 }
		},
		{
			props: { position: "end" },
			style: { marginLeft: 8 }
		},
		{
			props: { disablePointerEvents: true },
			style: { pointerEvents: "none" }
		}
	]
})));
var InputAdornment = /* @__PURE__ */ import_react.forwardRef(function InputAdornment(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiInputAdornment"
	});
	const { children, className, component = "div", disablePointerEvents = false, disableTypography = false, position, variant: variantProp, ...other } = props;
	const muiFormControl = useFormControl() || {};
	let variant = variantProp;
	if (variantProp && muiFormControl.variant) {
		if (variantProp === muiFormControl.variant) console.error("MUI: The `InputAdornment` variant infers the variant prop you do not have to provide one.");
	}
	if (muiFormControl && !variant) variant = muiFormControl.variant;
	const ownerState = {
		...props,
		hiddenLabel: muiFormControl.hiddenLabel,
		size: muiFormControl.size,
		disablePointerEvents,
		position,
		variant
	};
	const classes = useUtilityClasses(ownerState);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormControlContext.Provider, {
		value: null,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputAdornmentRoot, {
			as: component,
			ownerState,
			className: clsx(classes.root, className),
			ref,
			...other,
			children: typeof children === "string" && !disableTypography ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
				color: "textSecondary",
				children
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [position === "start" ? _span || (_span = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "notranslate",
				"aria-hidden": true,
				children: "​"
			})) : null, children] })
		})
	});
});
InputAdornment.propTypes = {
	children: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	component: import_prop_types.default.elementType,
	disablePointerEvents: import_prop_types.default.bool,
	disableTypography: import_prop_types.default.bool,
	position: import_prop_types.default.oneOf(["end", "start"]).isRequired,
	sx: import_prop_types.default.oneOfType([
		import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
			import_prop_types.default.func,
			import_prop_types.default.object,
			import_prop_types.default.bool
		])),
		import_prop_types.default.func,
		import_prop_types.default.object
	]),
	variant: import_prop_types.default.oneOf([
		"filled",
		"outlined",
		"standard"
	])
};
//#endregion
export { InputAdornment as default, getInputAdornmentUtilityClass, inputAdornmentClasses };

//# sourceMappingURL=@mui_material_InputAdornment.js.map