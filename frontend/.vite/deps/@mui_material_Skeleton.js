import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { $ as css, Q as require_jsx_runtime, U as generateUtilityClass, dt as clsx, et as keyframes, ft as require_prop_types, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { m as toUnitless, p as getUnit } from "./styles-2xPq3NO2.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as memoTheme } from "./memoTheme-PLhiQ1dZ.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
//#region node_modules/@mui/material/esm/Skeleton/skeletonClasses.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
function getSkeletonUtilityClass(slot) {
	return generateUtilityClass("MuiSkeleton", slot);
}
var skeletonClasses = generateUtilityClasses("MuiSkeleton", [
	"root",
	"text",
	"rectangular",
	"rounded",
	"circular",
	"pulse",
	"wave",
	"withChildren",
	"fitContent",
	"heightAuto"
]);
//#endregion
//#region node_modules/@mui/material/esm/Skeleton/Skeleton.js
var import_jsx_runtime = require_jsx_runtime();
var useUtilityClasses = (ownerState) => {
	const { classes, variant, animation, hasChildren, width, height } = ownerState;
	return composeClasses({ root: [
		"root",
		variant,
		animation,
		hasChildren && "withChildren",
		hasChildren && !width && "fitContent",
		hasChildren && !height && "heightAuto"
	] }, getSkeletonUtilityClass, classes);
};
var pulseKeyframe = keyframes`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`;
var waveKeyframe = keyframes`
  0% {
    transform: translateX(-100%);
  }

  50% {
    /* +0.5s of delay between each loop */
    transform: translateX(100%);
  }

  100% {
    transform: translateX(100%);
  }
`;
var pulseAnimation = typeof pulseKeyframe !== "string" ? css`
        animation: ${pulseKeyframe} 2s ease-in-out 0.5s infinite;
      ` : null;
var waveAnimation = typeof waveKeyframe !== "string" ? css`
        &::after {
          animation: ${waveKeyframe} 2s linear 0.5s infinite;
        }
      ` : null;
var SkeletonRoot = styled("span", {
	name: "MuiSkeleton",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.root,
			styles[ownerState.variant],
			ownerState.animation !== false && styles[ownerState.animation],
			ownerState.hasChildren && styles.withChildren,
			ownerState.hasChildren && !ownerState.width && styles.fitContent,
			ownerState.hasChildren && !ownerState.height && styles.heightAuto
		];
	}
})(memoTheme(({ theme }) => {
	const radiusUnit = getUnit(theme.shape.borderRadius) || "px";
	const radiusValue = toUnitless(theme.shape.borderRadius);
	return {
		display: "block",
		backgroundColor: theme.vars ? theme.vars.palette.Skeleton.bg : theme.alpha(theme.palette.text.primary, theme.palette.mode === "light" ? .11 : .13),
		height: "1.2em",
		variants: [
			{
				props: { variant: "text" },
				style: {
					marginTop: 0,
					marginBottom: 0,
					height: "auto",
					transformOrigin: "0 55%",
					transform: "scale(1, 0.60)",
					borderRadius: `${radiusValue}${radiusUnit}/${Math.round(radiusValue / .6 * 10) / 10}${radiusUnit}`,
					"&:empty:before": { content: "\"\\00a0\"" }
				}
			},
			{
				props: { variant: "circular" },
				style: { borderRadius: "50%" }
			},
			{
				props: { variant: "rounded" },
				style: { borderRadius: (theme.vars || theme).shape.borderRadius }
			},
			{
				props: ({ ownerState }) => ownerState.hasChildren,
				style: { "& > *": { visibility: "hidden" } }
			},
			{
				props: ({ ownerState }) => ownerState.hasChildren && !ownerState.width,
				style: { maxWidth: "fit-content" }
			},
			{
				props: ({ ownerState }) => ownerState.hasChildren && !ownerState.height,
				style: { height: "auto" }
			},
			{
				props: { animation: "pulse" },
				style: pulseAnimation || { animation: `${pulseKeyframe} 2s ease-in-out 0.5s infinite` }
			},
			{
				props: { animation: "wave" },
				style: {
					position: "relative",
					overflow: "hidden",
					WebkitMaskImage: "-webkit-radial-gradient(white, black)",
					"&::after": {
						background: `linear-gradient(
                90deg,
                transparent,
                ${(theme.vars || theme).palette.action.hover},
                transparent
              )`,
						content: "\"\"",
						position: "absolute",
						transform: "translateX(-100%)",
						bottom: 0,
						left: 0,
						right: 0,
						top: 0
					}
				}
			},
			{
				props: { animation: "wave" },
				style: waveAnimation || { "&::after": { animation: `${waveKeyframe} 2s linear 0.5s infinite` } }
			}
		]
	};
}));
var Skeleton = /* @__PURE__ */ import_react.forwardRef(function Skeleton(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiSkeleton"
	});
	const { animation = "pulse", className, component = "span", height, style, variant = "text", width, ...other } = props;
	const ownerState = {
		...props,
		animation,
		component,
		variant,
		hasChildren: Boolean(other.children)
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonRoot, {
		as: component,
		ref,
		className: clsx(useUtilityClasses(ownerState).root, className),
		ownerState,
		...other,
		style: {
			width,
			height,
			...style
		}
	});
});
Skeleton.propTypes = {
	animation: import_prop_types.default.oneOf([
		"pulse",
		"wave",
		false
	]),
	children: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	component: import_prop_types.default.elementType,
	height: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
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
	variant: import_prop_types.default.oneOfType([import_prop_types.default.oneOf([
		"circular",
		"rectangular",
		"rounded",
		"text"
	]), import_prop_types.default.string]),
	width: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string])
};
//#endregion
export { Skeleton as default, getSkeletonUtilityClass, skeletonClasses };

//# sourceMappingURL=@mui_material_Skeleton.js.map