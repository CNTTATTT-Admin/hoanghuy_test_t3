import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, U as generateUtilityClass, dt as clsx, ft as require_prop_types, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as memoTheme } from "./memoTheme-PLhiQ1dZ.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
import { t as useSlot } from "./useSlot-B3bIL9ix.js";
import { t as refType } from "./refType-BhGfNeog.js";
import { t as capitalize_default } from "./capitalize-C7D-9Jwf.js";
import { t as Typography } from "./Typography-CrsVQyni.js";
import { t as useFormControl } from "./useFormControl-Dudtiqlw.js";
import { t as formControlState } from "./formControlState-DPpAHEJH.js";
//#region node_modules/@mui/material/esm/FormControlLabel/formControlLabelClasses.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
function getFormControlLabelUtilityClasses(slot) {
	return generateUtilityClass("MuiFormControlLabel", slot);
}
var formControlLabelClasses = generateUtilityClasses("MuiFormControlLabel", [
	"root",
	"labelPlacementStart",
	"labelPlacementTop",
	"labelPlacementBottom",
	"disabled",
	"label",
	"error",
	"required",
	"asterisk"
]);
//#endregion
//#region node_modules/@mui/material/esm/FormControlLabel/FormControlLabel.js
var import_jsx_runtime = require_jsx_runtime();
var useUtilityClasses = (ownerState) => {
	const { classes, disabled, labelPlacement, error, required } = ownerState;
	return composeClasses({
		root: [
			"root",
			disabled && "disabled",
			`labelPlacement${capitalize_default(labelPlacement)}`,
			error && "error",
			required && "required"
		],
		label: ["label", disabled && "disabled"],
		asterisk: ["asterisk", error && "error"]
	}, getFormControlLabelUtilityClasses, classes);
};
var FormControlLabelRoot = styled("label", {
	name: "MuiFormControlLabel",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			{ [`& .${formControlLabelClasses.label}`]: styles.label },
			styles.root,
			styles[`labelPlacement${capitalize_default(ownerState.labelPlacement)}`]
		];
	}
})(memoTheme(({ theme }) => ({
	display: "inline-flex",
	alignItems: "center",
	cursor: "pointer",
	verticalAlign: "middle",
	WebkitTapHighlightColor: "transparent",
	marginLeft: -11,
	marginRight: 16,
	[`&.${formControlLabelClasses.disabled}`]: { cursor: "default" },
	[`& .${formControlLabelClasses.label}`]: { [`&.${formControlLabelClasses.disabled}`]: { color: (theme.vars || theme).palette.text.disabled } },
	variants: [
		{
			props: { labelPlacement: "start" },
			style: {
				flexDirection: "row-reverse",
				marginRight: -11
			}
		},
		{
			props: { labelPlacement: "top" },
			style: { flexDirection: "column-reverse" }
		},
		{
			props: { labelPlacement: "bottom" },
			style: { flexDirection: "column" }
		},
		{
			props: ({ labelPlacement }) => labelPlacement === "start" || labelPlacement === "top" || labelPlacement === "bottom",
			style: { marginLeft: 16 }
		}
	]
})));
var AsteriskComponent = styled("span", {
	name: "MuiFormControlLabel",
	slot: "Asterisk"
})(memoTheme(({ theme }) => ({ [`&.${formControlLabelClasses.error}`]: { color: (theme.vars || theme).palette.error.main } })));
/**
* Drop-in replacement of the `Radio`, `Switch` and `Checkbox` component.
* Use this component if you want to display an extra label.
*/
var FormControlLabel = /* @__PURE__ */ import_react.forwardRef(function FormControlLabel(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiFormControlLabel"
	});
	const { checked, className, componentsProps = {}, control, disabled: disabledProp, disableTypography, inputRef, label: labelProp, labelPlacement = "end", name, onChange, required: requiredProp, slots = {}, slotProps = {}, value, ...other } = props;
	const muiFormControl = useFormControl();
	const disabled = disabledProp ?? control.props.disabled ?? muiFormControl?.disabled;
	const required = requiredProp ?? control.props.required;
	const controlProps = {
		disabled,
		required
	};
	[
		"checked",
		"name",
		"onChange",
		"value",
		"inputRef"
	].forEach((key) => {
		if (typeof control.props[key] === "undefined" && typeof props[key] !== "undefined") controlProps[key] = props[key];
	});
	const fcs = formControlState({
		props,
		muiFormControl,
		states: ["error"]
	});
	const ownerState = {
		...props,
		disabled,
		labelPlacement,
		required,
		error: fcs.error
	};
	const classes = useUtilityClasses(ownerState);
	const [TypographySlot, typographySlotProps] = useSlot("typography", {
		elementType: Typography,
		externalForwardedProps: {
			slots,
			slotProps: {
				...componentsProps,
				...slotProps
			}
		},
		ownerState
	});
	let label = labelProp;
	if (label != null && label.type !== Typography && !disableTypography) label = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypographySlot, {
		component: "span",
		...typographySlotProps,
		className: clsx(classes.label, typographySlotProps?.className),
		children: label
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FormControlLabelRoot, {
		className: clsx(classes.root, className),
		ownerState,
		ref,
		...other,
		children: [/* @__PURE__ */ import_react.cloneElement(control, controlProps), required ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AsteriskComponent, {
			ownerState,
			"aria-hidden": true,
			className: classes.asterisk,
			children: [" ", "*"]
		})] }) : label]
	});
});
FormControlLabel.propTypes = {
	checked: import_prop_types.default.bool,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	componentsProps: import_prop_types.default.shape({ typography: import_prop_types.default.object }),
	control: import_prop_types.default.element.isRequired,
	disabled: import_prop_types.default.bool,
	disableTypography: import_prop_types.default.bool,
	inputRef: refType,
	label: import_prop_types.default.node,
	labelPlacement: import_prop_types.default.oneOf([
		"bottom",
		"end",
		"start",
		"top"
	]),
	name: import_prop_types.default.string,
	onChange: import_prop_types.default.func,
	required: import_prop_types.default.bool,
	slotProps: import_prop_types.default.shape({ typography: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]) }),
	slots: import_prop_types.default.shape({ typography: import_prop_types.default.elementType }),
	sx: import_prop_types.default.oneOfType([
		import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
			import_prop_types.default.func,
			import_prop_types.default.object,
			import_prop_types.default.bool
		])),
		import_prop_types.default.func,
		import_prop_types.default.object
	]),
	value: import_prop_types.default.any
};
//#endregion
export { FormControlLabel as default, formControlLabelClasses, getFormControlLabelUtilityClasses };

//# sourceMappingURL=@mui_material_FormControlLabel.js.map