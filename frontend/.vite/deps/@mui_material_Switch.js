import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, U as generateUtilityClass, dt as clsx, ft as require_prop_types, n as rootShouldForwardProp, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as memoTheme } from "./memoTheme-PLhiQ1dZ.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
import { t as useSlot } from "./useSlot-B3bIL9ix.js";
import { t as refType } from "./refType-BhGfNeog.js";
import { t as ButtonBase } from "./ButtonBase-CqNytXvy.js";
import { t as capitalize_default } from "./capitalize-C7D-9Jwf.js";
import { t as createSimplePaletteValueFilter } from "./createSimplePaletteValueFilter-eo-PaFXq.js";
import { t as useControlled_default } from "./useControlled-Da8YOFEU.js";
import { t as useFormControl } from "./useFormControl-Dudtiqlw.js";
//#region node_modules/@mui/material/esm/internal/switchBaseClasses.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
function getSwitchBaseUtilityClass(slot) {
	return generateUtilityClass("PrivateSwitchBase", slot);
}
generateUtilityClasses("PrivateSwitchBase", [
	"root",
	"checked",
	"disabled",
	"input",
	"edgeStart",
	"edgeEnd"
]);
//#endregion
//#region node_modules/@mui/material/esm/internal/SwitchBase.js
var import_jsx_runtime = require_jsx_runtime();
var useUtilityClasses$1 = (ownerState) => {
	const { classes, checked, disabled, edge } = ownerState;
	return composeClasses({
		root: [
			"root",
			checked && "checked",
			disabled && "disabled",
			edge && `edge${capitalize_default(edge)}`
		],
		input: ["input"]
	}, getSwitchBaseUtilityClass, classes);
};
var SwitchBaseRoot = styled(ButtonBase, { name: "MuiSwitchBase" })({
	padding: 9,
	borderRadius: "50%",
	variants: [
		{
			props: {
				edge: "start",
				size: "small"
			},
			style: { marginLeft: -3 }
		},
		{
			props: ({ edge, ownerState }) => edge === "start" && ownerState.size !== "small",
			style: { marginLeft: -12 }
		},
		{
			props: {
				edge: "end",
				size: "small"
			},
			style: { marginRight: -3 }
		},
		{
			props: ({ edge, ownerState }) => edge === "end" && ownerState.size !== "small",
			style: { marginRight: -12 }
		}
	]
});
var SwitchBaseInput = styled("input", {
	name: "MuiSwitchBase",
	shouldForwardProp: rootShouldForwardProp
})({
	cursor: "inherit",
	position: "absolute",
	opacity: 0,
	width: "100%",
	height: "100%",
	top: 0,
	left: 0,
	margin: 0,
	padding: 0,
	zIndex: 1
});
/**
* @ignore - internal component.
*/
var SwitchBase = /* @__PURE__ */ import_react.forwardRef(function SwitchBase(props, ref) {
	const { autoFocus, checked: checkedProp, checkedIcon, defaultChecked, disabled: disabledProp, disableFocusRipple = false, edge = false, icon, id, inputProps, inputRef, name, onBlur, onChange, onFocus, readOnly, required = false, tabIndex, type, value, slots = {}, slotProps = {}, ...other } = props;
	const [checked, setCheckedState] = useControlled_default({
		controlled: checkedProp,
		default: Boolean(defaultChecked),
		name: "SwitchBase",
		state: "checked"
	});
	const muiFormControl = useFormControl();
	const handleFocus = (event) => {
		if (onFocus) onFocus(event);
		if (muiFormControl && muiFormControl.onFocus) muiFormControl.onFocus(event);
	};
	const handleBlur = (event) => {
		if (onBlur) onBlur(event);
		if (muiFormControl && muiFormControl.onBlur) muiFormControl.onBlur(event);
	};
	const handleInputChange = (event) => {
		if (event.nativeEvent.defaultPrevented || readOnly) return;
		const newChecked = event.target.checked;
		setCheckedState(newChecked);
		if (onChange) onChange(event, newChecked);
	};
	let disabled = disabledProp;
	if (muiFormControl) {
		if (typeof disabled === "undefined") disabled = muiFormControl.disabled;
	}
	const hasLabelFor = type === "checkbox" || type === "radio";
	const ownerState = {
		...props,
		checked,
		disabled,
		disableFocusRipple,
		edge
	};
	const classes = useUtilityClasses$1(ownerState);
	const externalForwardedProps = {
		slots,
		slotProps: {
			input: inputProps,
			...slotProps
		}
	};
	const [RootSlot, rootSlotProps] = useSlot("root", {
		ref,
		elementType: SwitchBaseRoot,
		className: classes.root,
		shouldForwardComponentProp: true,
		externalForwardedProps: {
			...externalForwardedProps,
			component: "span",
			...other
		},
		getSlotProps: (handlers) => ({
			...handlers,
			onFocus: (event) => {
				handlers.onFocus?.(event);
				handleFocus(event);
			},
			onBlur: (event) => {
				handlers.onBlur?.(event);
				handleBlur(event);
			}
		}),
		ownerState,
		additionalProps: {
			centerRipple: true,
			focusRipple: !disableFocusRipple,
			role: void 0,
			tabIndex: null
		}
	});
	const [InputSlot, inputSlotProps] = useSlot("input", {
		ref: inputRef,
		elementType: SwitchBaseInput,
		className: classes.input,
		externalForwardedProps,
		getSlotProps: (handlers) => ({
			...handlers,
			onChange: (event) => {
				handlers.onChange?.(event);
				handleInputChange(event);
			}
		}),
		ownerState,
		additionalProps: {
			autoFocus,
			checked: checkedProp,
			defaultChecked,
			disabled,
			id: hasLabelFor ? id : void 0,
			name,
			readOnly,
			required,
			tabIndex,
			type,
			...type === "checkbox" && value === void 0 ? {} : { value }
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RootSlot, {
		...rootSlotProps,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputSlot, { ...inputSlotProps }), checked ? checkedIcon : icon]
	});
});
SwitchBase.propTypes = {
	autoFocus: import_prop_types.default.bool,
	checked: import_prop_types.default.bool,
	checkedIcon: import_prop_types.default.node.isRequired,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	defaultChecked: import_prop_types.default.bool,
	disabled: import_prop_types.default.bool,
	disableFocusRipple: import_prop_types.default.bool,
	edge: import_prop_types.default.oneOf([
		"end",
		"start",
		false
	]),
	icon: import_prop_types.default.node.isRequired,
	id: import_prop_types.default.string,
	inputProps: import_prop_types.default.object,
	inputRef: refType,
	name: import_prop_types.default.string,
	onBlur: import_prop_types.default.func,
	onChange: import_prop_types.default.func,
	onFocus: import_prop_types.default.func,
	readOnly: import_prop_types.default.bool,
	required: import_prop_types.default.bool,
	slotProps: import_prop_types.default.shape({
		input: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		root: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object])
	}),
	slots: import_prop_types.default.shape({
		input: import_prop_types.default.elementType,
		root: import_prop_types.default.elementType
	}),
	sx: import_prop_types.default.object,
	tabIndex: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
	type: import_prop_types.default.string.isRequired,
	value: import_prop_types.default.any
};
//#endregion
//#region node_modules/@mui/material/esm/Switch/switchClasses.js
function getSwitchUtilityClass(slot) {
	return generateUtilityClass("MuiSwitch", slot);
}
var switchClasses = generateUtilityClasses("MuiSwitch", [
	"root",
	"edgeStart",
	"edgeEnd",
	"switchBase",
	"colorPrimary",
	"colorSecondary",
	"sizeSmall",
	"sizeMedium",
	"checked",
	"disabled",
	"input",
	"thumb",
	"track"
]);
//#endregion
//#region node_modules/@mui/material/esm/Switch/Switch.js
var useUtilityClasses = (ownerState) => {
	const { classes, edge, size, color, checked, disabled } = ownerState;
	const composedClasses = composeClasses({
		root: [
			"root",
			edge && `edge${capitalize_default(edge)}`,
			`size${capitalize_default(size)}`
		],
		switchBase: [
			"switchBase",
			`color${capitalize_default(color)}`,
			checked && "checked",
			disabled && "disabled"
		],
		thumb: ["thumb"],
		track: ["track"],
		input: ["input"]
	}, getSwitchUtilityClass, classes);
	return {
		...classes,
		...composedClasses
	};
};
var SwitchRoot = styled("span", {
	name: "MuiSwitch",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.root,
			ownerState.edge && styles[`edge${capitalize_default(ownerState.edge)}`],
			styles[`size${capitalize_default(ownerState.size)}`]
		];
	}
})({
	display: "inline-flex",
	width: 58,
	height: 38,
	overflow: "hidden",
	padding: 12,
	boxSizing: "border-box",
	position: "relative",
	flexShrink: 0,
	zIndex: 0,
	verticalAlign: "middle",
	"@media print": { colorAdjust: "exact" },
	variants: [
		{
			props: { edge: "start" },
			style: { marginLeft: -8 }
		},
		{
			props: { edge: "end" },
			style: { marginRight: -8 }
		},
		{
			props: { size: "small" },
			style: {
				width: 40,
				height: 24,
				padding: 7,
				[`& .${switchClasses.thumb}`]: {
					width: 16,
					height: 16
				},
				[`& .${switchClasses.switchBase}`]: {
					padding: 4,
					[`&.${switchClasses.checked}`]: { transform: "translateX(16px)" }
				}
			}
		}
	]
});
var SwitchSwitchBase = styled(SwitchBase, {
	name: "MuiSwitch",
	slot: "SwitchBase",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.switchBase,
			{ [`& .${switchClasses.input}`]: styles.input },
			ownerState.color !== "default" && styles[`color${capitalize_default(ownerState.color)}`]
		];
	}
})(memoTheme(({ theme }) => ({
	position: "absolute",
	top: 0,
	left: 0,
	zIndex: 1,
	color: theme.vars ? theme.vars.palette.Switch.defaultColor : `${theme.palette.mode === "light" ? theme.palette.common.white : theme.palette.grey[300]}`,
	transition: theme.transitions.create(["left", "transform"], { duration: theme.transitions.duration.shortest }),
	[`&.${switchClasses.checked}`]: { transform: "translateX(20px)" },
	[`&.${switchClasses.disabled}`]: { color: theme.vars ? theme.vars.palette.Switch.defaultDisabledColor : `${theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[600]}` },
	[`&.${switchClasses.checked} + .${switchClasses.track}`]: { opacity: .5 },
	[`&.${switchClasses.disabled} + .${switchClasses.track}`]: { opacity: theme.vars ? theme.vars.opacity.switchTrackDisabled : `${theme.palette.mode === "light" ? .12 : .2}` },
	[`& .${switchClasses.input}`]: {
		left: "-100%",
		width: "300%"
	}
})), memoTheme(({ theme }) => ({
	"&:hover": {
		backgroundColor: theme.alpha((theme.vars || theme).palette.action.active, (theme.vars || theme).palette.action.hoverOpacity),
		"@media (hover: none)": { backgroundColor: "transparent" }
	},
	variants: [...Object.entries(theme.palette).filter(createSimplePaletteValueFilter(["light"])).map(([color]) => ({
		props: { color },
		style: {
			[`&.${switchClasses.checked}`]: {
				color: (theme.vars || theme).palette[color].main,
				"&:hover": {
					backgroundColor: theme.alpha((theme.vars || theme).palette[color].main, (theme.vars || theme).palette.action.hoverOpacity),
					"@media (hover: none)": { backgroundColor: "transparent" }
				},
				[`&.${switchClasses.disabled}`]: { color: theme.vars ? theme.vars.palette.Switch[`${color}DisabledColor`] : `${theme.palette.mode === "light" ? theme.lighten(theme.palette[color].main, .62) : theme.darken(theme.palette[color].main, .55)}` }
			},
			[`&.${switchClasses.checked} + .${switchClasses.track}`]: { backgroundColor: (theme.vars || theme).palette[color].main }
		}
	}))]
})));
var SwitchTrack = styled("span", {
	name: "MuiSwitch",
	slot: "Track"
})(memoTheme(({ theme }) => ({
	height: "100%",
	width: "100%",
	borderRadius: 14 / 2,
	zIndex: -1,
	transition: theme.transitions.create(["opacity", "background-color"], { duration: theme.transitions.duration.shortest }),
	backgroundColor: theme.vars ? theme.vars.palette.common.onBackground : `${theme.palette.mode === "light" ? theme.palette.common.black : theme.palette.common.white}`,
	opacity: theme.vars ? theme.vars.opacity.switchTrack : `${theme.palette.mode === "light" ? .38 : .3}`
})));
var SwitchThumb = styled("span", {
	name: "MuiSwitch",
	slot: "Thumb"
})(memoTheme(({ theme }) => ({
	boxShadow: (theme.vars || theme).shadows[1],
	backgroundColor: "currentColor",
	width: 20,
	height: 20,
	borderRadius: "50%"
})));
var Switch = /* @__PURE__ */ import_react.forwardRef(function Switch(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiSwitch"
	});
	const { className, color = "primary", edge = false, size = "medium", sx, slots = {}, slotProps = {}, ...other } = props;
	const ownerState = {
		...props,
		color,
		edge,
		size
	};
	const classes = useUtilityClasses(ownerState);
	const externalForwardedProps = {
		slots,
		slotProps
	};
	const [RootSlot, rootSlotProps] = useSlot("root", {
		className: clsx(classes.root, className),
		elementType: SwitchRoot,
		externalForwardedProps,
		ownerState,
		additionalProps: { sx }
	});
	const [ThumbSlot, thumbSlotProps] = useSlot("thumb", {
		className: classes.thumb,
		elementType: SwitchThumb,
		externalForwardedProps,
		ownerState
	});
	const icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbSlot, { ...thumbSlotProps });
	const [TrackSlot, trackSlotProps] = useSlot("track", {
		className: classes.track,
		elementType: SwitchTrack,
		externalForwardedProps,
		ownerState
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RootSlot, {
		...rootSlotProps,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchSwitchBase, {
			type: "checkbox",
			icon,
			checkedIcon: icon,
			ref,
			ownerState,
			...other,
			classes: {
				...classes,
				root: classes.switchBase
			},
			slots: {
				...slots.switchBase && { root: slots.switchBase },
				...slots.input && { input: slots.input }
			},
			slotProps: {
				...slotProps.switchBase && { root: typeof slotProps.switchBase === "function" ? slotProps.switchBase(ownerState) : slotProps.switchBase },
				input: { role: "switch" },
				...slotProps.input && { input: typeof slotProps.input === "function" ? slotProps.input(ownerState) : slotProps.input }
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackSlot, { ...trackSlotProps })]
	});
});
Switch.propTypes = {
	checked: import_prop_types.default.bool,
	checkedIcon: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	color: import_prop_types.default.oneOfType([import_prop_types.default.oneOf([
		"default",
		"primary",
		"secondary",
		"error",
		"info",
		"success",
		"warning"
	]), import_prop_types.default.string]),
	defaultChecked: import_prop_types.default.bool,
	disabled: import_prop_types.default.bool,
	disableRipple: import_prop_types.default.bool,
	edge: import_prop_types.default.oneOf([
		"end",
		"start",
		false
	]),
	icon: import_prop_types.default.node,
	id: import_prop_types.default.string,
	inputProps: import_prop_types.default.object,
	inputRef: refType,
	onChange: import_prop_types.default.func,
	required: import_prop_types.default.bool,
	size: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["medium", "small"]), import_prop_types.default.string]),
	slotProps: import_prop_types.default.shape({
		input: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		root: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		switchBase: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		thumb: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		track: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object])
	}),
	slots: import_prop_types.default.shape({
		input: import_prop_types.default.elementType,
		root: import_prop_types.default.elementType,
		switchBase: import_prop_types.default.elementType,
		thumb: import_prop_types.default.elementType,
		track: import_prop_types.default.elementType
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
	value: import_prop_types.default.any
};
//#endregion
export { Switch as default, getSwitchUtilityClass, switchClasses };

//# sourceMappingURL=@mui_material_Switch.js.map