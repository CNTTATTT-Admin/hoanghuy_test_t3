import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, U as generateUtilityClass, dt as clsx, ft as require_prop_types, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as memoTheme } from "./memoTheme-PLhiQ1dZ.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
import { i as useForkRef_default } from "./TransitionGroupContext-CmouUOv0.js";
import { t as useSlot } from "./useSlot-B3bIL9ix.js";
import { t as ButtonBase } from "./ButtonBase-CqNytXvy.js";
import { t as capitalize_default } from "./capitalize-C7D-9Jwf.js";
import { t as createSimplePaletteValueFilter } from "./createSimplePaletteValueFilter-eo-PaFXq.js";
import { t as createSvgIcon } from "./createSvgIcon-DyCjgR6Z.js";
import { t as unsupportedProp_default } from "./unsupportedProp-dilcjf8r.js";
//#region node_modules/@mui/material/esm/internal/svg-icons/Cancel.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
var import_jsx_runtime = require_jsx_runtime();
var Cancel_default = createSvgIcon(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" }), "Cancel");
//#endregion
//#region node_modules/@mui/material/esm/Chip/chipClasses.js
function getChipUtilityClass(slot) {
	return generateUtilityClass("MuiChip", slot);
}
var chipClasses = generateUtilityClasses("MuiChip", [
	"root",
	"sizeSmall",
	"sizeMedium",
	"colorDefault",
	"colorError",
	"colorInfo",
	"colorPrimary",
	"colorSecondary",
	"colorSuccess",
	"colorWarning",
	"disabled",
	"clickable",
	"clickableColorPrimary",
	"clickableColorSecondary",
	"deletable",
	"deletableColorPrimary",
	"deletableColorSecondary",
	"outlined",
	"filled",
	"outlinedPrimary",
	"outlinedSecondary",
	"filledPrimary",
	"filledSecondary",
	"avatar",
	"avatarSmall",
	"avatarMedium",
	"avatarColorPrimary",
	"avatarColorSecondary",
	"icon",
	"iconSmall",
	"iconMedium",
	"iconColorPrimary",
	"iconColorSecondary",
	"label",
	"labelSmall",
	"labelMedium",
	"deleteIcon",
	"deleteIconSmall",
	"deleteIconMedium",
	"deleteIconColorPrimary",
	"deleteIconColorSecondary",
	"deleteIconOutlinedColorPrimary",
	"deleteIconOutlinedColorSecondary",
	"deleteIconFilledColorPrimary",
	"deleteIconFilledColorSecondary",
	"focusVisible"
]);
//#endregion
//#region node_modules/@mui/material/esm/Chip/Chip.js
var useUtilityClasses = (ownerState) => {
	const { classes, disabled, size, color, iconColor, onDelete, clickable, variant } = ownerState;
	return composeClasses({
		root: [
			"root",
			variant,
			disabled && "disabled",
			`size${capitalize_default(size)}`,
			`color${capitalize_default(color)}`,
			clickable && "clickable",
			clickable && `clickableColor${capitalize_default(color)}`,
			onDelete && "deletable",
			onDelete && `deletableColor${capitalize_default(color)}`,
			`${variant}${capitalize_default(color)}`
		],
		label: ["label", `label${capitalize_default(size)}`],
		avatar: [
			"avatar",
			`avatar${capitalize_default(size)}`,
			`avatarColor${capitalize_default(color)}`
		],
		icon: [
			"icon",
			`icon${capitalize_default(size)}`,
			`iconColor${capitalize_default(iconColor)}`
		],
		deleteIcon: [
			"deleteIcon",
			`deleteIcon${capitalize_default(size)}`,
			`deleteIconColor${capitalize_default(color)}`,
			`deleteIcon${capitalize_default(variant)}Color${capitalize_default(color)}`
		]
	}, getChipUtilityClass, classes);
};
var ChipRoot = styled("div", {
	name: "MuiChip",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		const { color, iconColor, clickable, onDelete, size, variant } = ownerState;
		return [
			{ [`& .${chipClasses.avatar}`]: styles.avatar },
			{ [`& .${chipClasses.avatar}`]: styles[`avatar${capitalize_default(size)}`] },
			{ [`& .${chipClasses.avatar}`]: styles[`avatarColor${capitalize_default(color)}`] },
			{ [`& .${chipClasses.icon}`]: styles.icon },
			{ [`& .${chipClasses.icon}`]: styles[`icon${capitalize_default(size)}`] },
			{ [`& .${chipClasses.icon}`]: styles[`iconColor${capitalize_default(iconColor)}`] },
			{ [`& .${chipClasses.deleteIcon}`]: styles.deleteIcon },
			{ [`& .${chipClasses.deleteIcon}`]: styles[`deleteIcon${capitalize_default(size)}`] },
			{ [`& .${chipClasses.deleteIcon}`]: styles[`deleteIconColor${capitalize_default(color)}`] },
			{ [`& .${chipClasses.deleteIcon}`]: styles[`deleteIcon${capitalize_default(variant)}Color${capitalize_default(color)}`] },
			styles.root,
			styles[`size${capitalize_default(size)}`],
			styles[`color${capitalize_default(color)}`],
			clickable && styles.clickable,
			clickable && color !== "default" && styles[`clickableColor${capitalize_default(color)}`],
			onDelete && styles.deletable,
			onDelete && color !== "default" && styles[`deletableColor${capitalize_default(color)}`],
			styles[variant],
			styles[`${variant}${capitalize_default(color)}`]
		];
	}
})(memoTheme(({ theme }) => {
	const textColor = theme.palette.mode === "light" ? theme.palette.grey[700] : theme.palette.grey[300];
	return {
		maxWidth: "100%",
		fontFamily: theme.typography.fontFamily,
		fontSize: theme.typography.pxToRem(13),
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		height: 32,
		lineHeight: 1.5,
		color: (theme.vars || theme).palette.text.primary,
		backgroundColor: (theme.vars || theme).palette.action.selected,
		borderRadius: 32 / 2,
		whiteSpace: "nowrap",
		transition: theme.transitions.create(["background-color", "box-shadow"]),
		cursor: "unset",
		outline: 0,
		textDecoration: "none",
		border: 0,
		padding: 0,
		verticalAlign: "middle",
		boxSizing: "border-box",
		[`&.${chipClasses.disabled}`]: {
			opacity: (theme.vars || theme).palette.action.disabledOpacity,
			pointerEvents: "none"
		},
		[`& .${chipClasses.avatar}`]: {
			marginLeft: 5,
			marginRight: -6,
			width: 24,
			height: 24,
			color: theme.vars ? theme.vars.palette.Chip.defaultAvatarColor : textColor,
			fontSize: theme.typography.pxToRem(12)
		},
		[`& .${chipClasses.avatarColorPrimary}`]: {
			color: (theme.vars || theme).palette.primary.contrastText,
			backgroundColor: (theme.vars || theme).palette.primary.dark
		},
		[`& .${chipClasses.avatarColorSecondary}`]: {
			color: (theme.vars || theme).palette.secondary.contrastText,
			backgroundColor: (theme.vars || theme).palette.secondary.dark
		},
		[`& .${chipClasses.avatarSmall}`]: {
			marginLeft: 4,
			marginRight: -4,
			width: 18,
			height: 18,
			fontSize: theme.typography.pxToRem(10)
		},
		[`& .${chipClasses.icon}`]: {
			marginLeft: 5,
			marginRight: -6
		},
		[`& .${chipClasses.deleteIcon}`]: {
			WebkitTapHighlightColor: "transparent",
			color: theme.alpha((theme.vars || theme).palette.text.primary, .26),
			fontSize: 22,
			cursor: "pointer",
			margin: "0 5px 0 -6px",
			"&:hover": { color: theme.alpha((theme.vars || theme).palette.text.primary, .4) }
		},
		variants: [
			{
				props: { size: "small" },
				style: {
					height: 24,
					[`& .${chipClasses.icon}`]: {
						fontSize: 18,
						marginLeft: 4,
						marginRight: -4
					},
					[`& .${chipClasses.deleteIcon}`]: {
						fontSize: 16,
						marginRight: 4,
						marginLeft: -4
					}
				}
			},
			...Object.entries(theme.palette).filter(createSimplePaletteValueFilter(["contrastText"])).map(([color]) => {
				return {
					props: { color },
					style: {
						backgroundColor: (theme.vars || theme).palette[color].main,
						color: (theme.vars || theme).palette[color].contrastText,
						[`& .${chipClasses.deleteIcon}`]: {
							color: theme.alpha((theme.vars || theme).palette[color].contrastText, .7),
							"&:hover, &:active": { color: (theme.vars || theme).palette[color].contrastText }
						}
					}
				};
			}),
			{
				props: (props) => props.iconColor === props.color,
				style: { [`& .${chipClasses.icon}`]: { color: theme.vars ? theme.vars.palette.Chip.defaultIconColor : textColor } }
			},
			{
				props: (props) => props.iconColor === props.color && props.color !== "default",
				style: { [`& .${chipClasses.icon}`]: { color: "inherit" } }
			},
			{
				props: { onDelete: true },
				style: { [`&.${chipClasses.focusVisible}`]: { backgroundColor: theme.alpha((theme.vars || theme).palette.action.selected, `${(theme.vars || theme).palette.action.selectedOpacity} + ${(theme.vars || theme).palette.action.focusOpacity}`) } }
			},
			...Object.entries(theme.palette).filter(createSimplePaletteValueFilter(["dark"])).map(([color]) => {
				return {
					props: {
						color,
						onDelete: true
					},
					style: { [`&.${chipClasses.focusVisible}`]: { background: (theme.vars || theme).palette[color].dark } }
				};
			}),
			{
				props: { clickable: true },
				style: {
					userSelect: "none",
					WebkitTapHighlightColor: "transparent",
					cursor: "pointer",
					"&:hover": { backgroundColor: theme.alpha((theme.vars || theme).palette.action.selected, `${(theme.vars || theme).palette.action.selectedOpacity} + ${(theme.vars || theme).palette.action.hoverOpacity}`) },
					[`&.${chipClasses.focusVisible}`]: { backgroundColor: theme.alpha((theme.vars || theme).palette.action.selected, `${(theme.vars || theme).palette.action.selectedOpacity} + ${(theme.vars || theme).palette.action.focusOpacity}`) },
					"&:active": { boxShadow: (theme.vars || theme).shadows[1] }
				}
			},
			...Object.entries(theme.palette).filter(createSimplePaletteValueFilter(["dark"])).map(([color]) => ({
				props: {
					color,
					clickable: true
				},
				style: { [`&:hover, &.${chipClasses.focusVisible}`]: { backgroundColor: (theme.vars || theme).palette[color].dark } }
			})),
			{
				props: { variant: "outlined" },
				style: {
					backgroundColor: "transparent",
					border: theme.vars ? `1px solid ${theme.vars.palette.Chip.defaultBorder}` : `1px solid ${theme.palette.mode === "light" ? theme.palette.grey[400] : theme.palette.grey[700]}`,
					[`&.${chipClasses.clickable}:hover`]: { backgroundColor: (theme.vars || theme).palette.action.hover },
					[`&.${chipClasses.focusVisible}`]: { backgroundColor: (theme.vars || theme).palette.action.focus },
					[`& .${chipClasses.avatar}`]: { marginLeft: 4 },
					[`& .${chipClasses.avatarSmall}`]: { marginLeft: 2 },
					[`& .${chipClasses.icon}`]: { marginLeft: 4 },
					[`& .${chipClasses.iconSmall}`]: { marginLeft: 2 },
					[`& .${chipClasses.deleteIcon}`]: { marginRight: 5 },
					[`& .${chipClasses.deleteIconSmall}`]: { marginRight: 3 }
				}
			},
			...Object.entries(theme.palette).filter(createSimplePaletteValueFilter()).map(([color]) => ({
				props: {
					variant: "outlined",
					color
				},
				style: {
					color: (theme.vars || theme).palette[color].main,
					border: `1px solid ${theme.alpha((theme.vars || theme).palette[color].main, .7)}`,
					[`&.${chipClasses.clickable}:hover`]: { backgroundColor: theme.alpha((theme.vars || theme).palette[color].main, (theme.vars || theme).palette.action.hoverOpacity) },
					[`&.${chipClasses.focusVisible}`]: { backgroundColor: theme.alpha((theme.vars || theme).palette[color].main, (theme.vars || theme).palette.action.focusOpacity) },
					[`& .${chipClasses.deleteIcon}`]: {
						color: theme.alpha((theme.vars || theme).palette[color].main, .7),
						"&:hover, &:active": { color: (theme.vars || theme).palette[color].main }
					}
				}
			}))
		]
	};
}));
var ChipLabel = styled("span", {
	name: "MuiChip",
	slot: "Label",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		const { size } = ownerState;
		return [styles.label, styles[`label${capitalize_default(size)}`]];
	}
})({
	overflow: "hidden",
	textOverflow: "ellipsis",
	paddingLeft: 12,
	paddingRight: 12,
	whiteSpace: "nowrap",
	variants: [
		{
			props: { variant: "outlined" },
			style: {
				paddingLeft: 11,
				paddingRight: 11
			}
		},
		{
			props: { size: "small" },
			style: {
				paddingLeft: 8,
				paddingRight: 8
			}
		},
		{
			props: {
				size: "small",
				variant: "outlined"
			},
			style: {
				paddingLeft: 7,
				paddingRight: 7
			}
		}
	]
});
function isDeleteKeyboardEvent(keyboardEvent) {
	return keyboardEvent.key === "Backspace" || keyboardEvent.key === "Delete";
}
/**
* Chips represent complex entities in small blocks, such as a contact.
*/
var Chip = /* @__PURE__ */ import_react.forwardRef(function Chip(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiChip"
	});
	const { avatar: avatarProp, className, clickable: clickableProp, color = "default", component: ComponentProp, deleteIcon: deleteIconProp, disabled = false, icon: iconProp, label, onClick, onDelete, onKeyDown, onKeyUp, size = "medium", variant = "filled", tabIndex, skipFocusWhenDisabled = false, slots = {}, slotProps = {}, ...other } = props;
	const handleRef = useForkRef_default(import_react.useRef(null), ref);
	const handleDeleteIconClick = (event) => {
		event.stopPropagation();
		onDelete(event);
	};
	const handleKeyDown = (event) => {
		if (event.currentTarget === event.target && isDeleteKeyboardEvent(event)) event.preventDefault();
		if (onKeyDown) onKeyDown(event);
	};
	const handleKeyUp = (event) => {
		if (event.currentTarget === event.target) {
			if (onDelete && isDeleteKeyboardEvent(event)) onDelete(event);
		}
		if (onKeyUp) onKeyUp(event);
	};
	const clickable = clickableProp !== false && onClick ? true : clickableProp;
	const component = clickable || onDelete ? ButtonBase : ComponentProp || "div";
	const ownerState = {
		...props,
		component,
		disabled,
		size,
		color,
		iconColor: /* @__PURE__ */ import_react.isValidElement(iconProp) ? iconProp.props.color || color : color,
		onDelete: !!onDelete,
		clickable,
		variant
	};
	const classes = useUtilityClasses(ownerState);
	const moreProps = component === ButtonBase ? {
		component: ComponentProp || "div",
		focusVisibleClassName: classes.focusVisible,
		...onDelete && { disableRipple: true }
	} : {};
	let deleteIcon = null;
	if (onDelete) deleteIcon = deleteIconProp && /* @__PURE__ */ import_react.isValidElement(deleteIconProp) ? /* @__PURE__ */ import_react.cloneElement(deleteIconProp, {
		className: clsx(deleteIconProp.props.className, classes.deleteIcon),
		onClick: handleDeleteIconClick
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel_default, {
		className: classes.deleteIcon,
		onClick: handleDeleteIconClick
	});
	let avatar = null;
	if (avatarProp && /* @__PURE__ */ import_react.isValidElement(avatarProp)) avatar = /* @__PURE__ */ import_react.cloneElement(avatarProp, { className: clsx(classes.avatar, avatarProp.props.className) });
	let icon = null;
	if (iconProp && /* @__PURE__ */ import_react.isValidElement(iconProp)) icon = /* @__PURE__ */ import_react.cloneElement(iconProp, { className: clsx(classes.icon, iconProp.props.className) });
	if (avatar && icon) console.error("MUI: The Chip component can not handle the avatar and the icon prop at the same time. Pick one.");
	const externalForwardedProps = {
		slots,
		slotProps
	};
	const [RootSlot, rootProps] = useSlot("root", {
		elementType: ChipRoot,
		externalForwardedProps: {
			...externalForwardedProps,
			...other
		},
		ownerState,
		shouldForwardComponentProp: true,
		ref: handleRef,
		className: clsx(classes.root, className),
		additionalProps: {
			disabled: clickable && disabled ? true : void 0,
			tabIndex: skipFocusWhenDisabled && disabled ? -1 : tabIndex,
			...moreProps
		},
		getSlotProps: (handlers) => ({
			...handlers,
			onClick: (event) => {
				handlers.onClick?.(event);
				onClick?.(event);
			},
			onKeyDown: (event) => {
				handlers.onKeyDown?.(event);
				handleKeyDown(event);
			},
			onKeyUp: (event) => {
				handlers.onKeyUp?.(event);
				handleKeyUp(event);
			}
		})
	});
	const [LabelSlot, labelProps] = useSlot("label", {
		elementType: ChipLabel,
		externalForwardedProps,
		ownerState,
		className: classes.label
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RootSlot, {
		as: component,
		...rootProps,
		children: [
			avatar || icon,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LabelSlot, {
				...labelProps,
				children: label
			}),
			deleteIcon
		]
	});
});
Chip.propTypes = {
	avatar: import_prop_types.default.element,
	children: unsupportedProp_default,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	clickable: import_prop_types.default.bool,
	color: import_prop_types.default.oneOfType([import_prop_types.default.oneOf([
		"default",
		"primary",
		"secondary",
		"error",
		"info",
		"success",
		"warning"
	]), import_prop_types.default.string]),
	component: import_prop_types.default.elementType,
	deleteIcon: import_prop_types.default.element,
	disabled: import_prop_types.default.bool,
	icon: import_prop_types.default.element,
	label: import_prop_types.default.node,
	onClick: import_prop_types.default.func,
	onDelete: import_prop_types.default.func,
	onKeyDown: import_prop_types.default.func,
	onKeyUp: import_prop_types.default.func,
	size: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["medium", "small"]), import_prop_types.default.string]),
	skipFocusWhenDisabled: import_prop_types.default.bool,
	slotProps: import_prop_types.default.shape({
		label: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		root: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object])
	}),
	slots: import_prop_types.default.shape({
		label: import_prop_types.default.elementType,
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
	]),
	tabIndex: import_prop_types.default.number,
	variant: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["filled", "outlined"]), import_prop_types.default.string])
};
//#endregion
export { chipClasses, Chip as default, getChipUtilityClass };

//# sourceMappingURL=@mui_material_Chip.js.map