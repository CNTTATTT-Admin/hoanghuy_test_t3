import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { $ as css, Q as require_jsx_runtime, T as useRtl, U as generateUtilityClass, dt as clsx, et as keyframes, ft as require_prop_types, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as memoTheme } from "./memoTheme-PLhiQ1dZ.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
import { t as capitalize_default } from "./capitalize-C7D-9Jwf.js";
import { t as createSimplePaletteValueFilter } from "./createSimplePaletteValueFilter-eo-PaFXq.js";
//#region node_modules/@mui/material/esm/LinearProgress/linearProgressClasses.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
function getLinearProgressUtilityClass(slot) {
	return generateUtilityClass("MuiLinearProgress", slot);
}
var linearProgressClasses = generateUtilityClasses("MuiLinearProgress", [
	"root",
	"colorPrimary",
	"colorSecondary",
	"determinate",
	"indeterminate",
	"buffer",
	"query",
	"dashed",
	"dashedColorPrimary",
	"dashedColorSecondary",
	"bar",
	"bar1",
	"bar2",
	"barColorPrimary",
	"barColorSecondary",
	"bar1Indeterminate",
	"bar1Determinate",
	"bar1Buffer",
	"bar2Indeterminate",
	"bar2Buffer"
]);
//#endregion
//#region node_modules/@mui/material/esm/LinearProgress/LinearProgress.js
var import_jsx_runtime = require_jsx_runtime();
var TRANSITION_DURATION = 4;
var indeterminate1Keyframe = keyframes`
  0% {
    left: -35%;
    right: 100%;
  }

  60% {
    left: 100%;
    right: -90%;
  }

  100% {
    left: 100%;
    right: -90%;
  }
`;
var indeterminate1Animation = typeof indeterminate1Keyframe !== "string" ? css`
        animation: ${indeterminate1Keyframe} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
      ` : null;
var indeterminate2Keyframe = keyframes`
  0% {
    left: -200%;
    right: 100%;
  }

  60% {
    left: 107%;
    right: -8%;
  }

  100% {
    left: 107%;
    right: -8%;
  }
`;
var indeterminate2Animation = typeof indeterminate2Keyframe !== "string" ? css`
        animation: ${indeterminate2Keyframe} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite;
      ` : null;
var bufferKeyframe = keyframes`
  0% {
    opacity: 1;
    background-position: 0 -23px;
  }

  60% {
    opacity: 0;
    background-position: 0 -23px;
  }

  100% {
    opacity: 1;
    background-position: -200px -23px;
  }
`;
var bufferAnimation = typeof bufferKeyframe !== "string" ? css`
        animation: ${bufferKeyframe} 3s infinite linear;
      ` : null;
var useUtilityClasses = (ownerState) => {
	const { classes, variant, color } = ownerState;
	return composeClasses({
		root: [
			"root",
			`color${capitalize_default(color)}`,
			variant
		],
		dashed: ["dashed", `dashedColor${capitalize_default(color)}`],
		bar1: [
			"bar",
			"bar1",
			`barColor${capitalize_default(color)}`,
			(variant === "indeterminate" || variant === "query") && "bar1Indeterminate",
			variant === "determinate" && "bar1Determinate",
			variant === "buffer" && "bar1Buffer"
		],
		bar2: [
			"bar",
			"bar2",
			variant !== "buffer" && `barColor${capitalize_default(color)}`,
			variant === "buffer" && `color${capitalize_default(color)}`,
			(variant === "indeterminate" || variant === "query") && "bar2Indeterminate",
			variant === "buffer" && "bar2Buffer"
		]
	}, getLinearProgressUtilityClass, classes);
};
var getColorShade = (theme, color) => {
	if (theme.vars) return theme.vars.palette.LinearProgress[`${color}Bg`];
	return theme.palette.mode === "light" ? theme.lighten(theme.palette[color].main, .62) : theme.darken(theme.palette[color].main, .5);
};
var LinearProgressRoot = styled("span", {
	name: "MuiLinearProgress",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.root,
			styles[`color${capitalize_default(ownerState.color)}`],
			styles[ownerState.variant]
		];
	}
})(memoTheme(({ theme }) => ({
	position: "relative",
	overflow: "hidden",
	display: "block",
	height: 4,
	zIndex: 0,
	"@media print": { colorAdjust: "exact" },
	variants: [
		...Object.entries(theme.palette).filter(createSimplePaletteValueFilter()).map(([color]) => ({
			props: { color },
			style: { backgroundColor: getColorShade(theme, color) }
		})),
		{
			props: ({ ownerState }) => ownerState.color === "inherit" && ownerState.variant !== "buffer",
			style: { "&::before": {
				content: "\"\"",
				position: "absolute",
				left: 0,
				top: 0,
				right: 0,
				bottom: 0,
				backgroundColor: "currentColor",
				opacity: .3
			} }
		},
		{
			props: { variant: "buffer" },
			style: { backgroundColor: "transparent" }
		},
		{
			props: { variant: "query" },
			style: { transform: "rotate(180deg)" }
		}
	]
})));
var LinearProgressDashed = styled("span", {
	name: "MuiLinearProgress",
	slot: "Dashed",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [styles.dashed, styles[`dashedColor${capitalize_default(ownerState.color)}`]];
	}
})(memoTheme(({ theme }) => ({
	position: "absolute",
	marginTop: 0,
	height: "100%",
	width: "100%",
	backgroundSize: "10px 10px",
	backgroundPosition: "0 -23px",
	variants: [{
		props: { color: "inherit" },
		style: {
			opacity: .3,
			backgroundImage: `radial-gradient(currentColor 0%, currentColor 16%, transparent 42%)`
		}
	}, ...Object.entries(theme.palette).filter(createSimplePaletteValueFilter()).map(([color]) => {
		const backgroundColor = getColorShade(theme, color);
		return {
			props: { color },
			style: { backgroundImage: `radial-gradient(${backgroundColor} 0%, ${backgroundColor} 16%, transparent 42%)` }
		};
	})]
})), bufferAnimation || { animation: `${bufferKeyframe} 3s infinite linear` });
var LinearProgressBar1 = styled("span", {
	name: "MuiLinearProgress",
	slot: "Bar1",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.bar,
			styles.bar1,
			styles[`barColor${capitalize_default(ownerState.color)}`],
			(ownerState.variant === "indeterminate" || ownerState.variant === "query") && styles.bar1Indeterminate,
			ownerState.variant === "determinate" && styles.bar1Determinate,
			ownerState.variant === "buffer" && styles.bar1Buffer
		];
	}
})(memoTheme(({ theme }) => ({
	width: "100%",
	position: "absolute",
	left: 0,
	bottom: 0,
	top: 0,
	transition: "transform 0.2s linear",
	transformOrigin: "left",
	variants: [
		{
			props: { color: "inherit" },
			style: { backgroundColor: "currentColor" }
		},
		...Object.entries(theme.palette).filter(createSimplePaletteValueFilter()).map(([color]) => ({
			props: { color },
			style: { backgroundColor: (theme.vars || theme).palette[color].main }
		})),
		{
			props: { variant: "determinate" },
			style: { transition: `transform .${TRANSITION_DURATION}s linear` }
		},
		{
			props: { variant: "buffer" },
			style: {
				zIndex: 1,
				transition: `transform .${TRANSITION_DURATION}s linear`
			}
		},
		{
			props: ({ ownerState }) => ownerState.variant === "indeterminate" || ownerState.variant === "query",
			style: { width: "auto" }
		},
		{
			props: ({ ownerState }) => ownerState.variant === "indeterminate" || ownerState.variant === "query",
			style: indeterminate1Animation || { animation: `${indeterminate1Keyframe} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite` }
		}
	]
})));
var LinearProgressBar2 = styled("span", {
	name: "MuiLinearProgress",
	slot: "Bar2",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.bar,
			styles.bar2,
			styles[`barColor${capitalize_default(ownerState.color)}`],
			(ownerState.variant === "indeterminate" || ownerState.variant === "query") && styles.bar2Indeterminate,
			ownerState.variant === "buffer" && styles.bar2Buffer
		];
	}
})(memoTheme(({ theme }) => ({
	width: "100%",
	position: "absolute",
	left: 0,
	bottom: 0,
	top: 0,
	transition: "transform 0.2s linear",
	transformOrigin: "left",
	variants: [
		...Object.entries(theme.palette).filter(createSimplePaletteValueFilter()).map(([color]) => ({
			props: { color },
			style: { "--LinearProgressBar2-barColor": (theme.vars || theme).palette[color].main }
		})),
		{
			props: ({ ownerState }) => ownerState.variant !== "buffer" && ownerState.color !== "inherit",
			style: { backgroundColor: "var(--LinearProgressBar2-barColor, currentColor)" }
		},
		{
			props: ({ ownerState }) => ownerState.variant !== "buffer" && ownerState.color === "inherit",
			style: { backgroundColor: "currentColor" }
		},
		{
			props: { color: "inherit" },
			style: { opacity: .3 }
		},
		...Object.entries(theme.palette).filter(createSimplePaletteValueFilter()).map(([color]) => ({
			props: {
				color,
				variant: "buffer"
			},
			style: {
				backgroundColor: getColorShade(theme, color),
				transition: `transform .${TRANSITION_DURATION}s linear`
			}
		})),
		{
			props: ({ ownerState }) => ownerState.variant === "indeterminate" || ownerState.variant === "query",
			style: { width: "auto" }
		},
		{
			props: ({ ownerState }) => ownerState.variant === "indeterminate" || ownerState.variant === "query",
			style: indeterminate2Animation || { animation: `${indeterminate2Keyframe} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite` }
		}
	]
})));
/**
* ## ARIA
*
* If the progress bar is describing the loading progress of a particular region of a page,
* you should use `aria-describedby` to point to the progress bar, and set the `aria-busy`
* attribute to `true` on that region until it has finished loading.
*/
var LinearProgress = /* @__PURE__ */ import_react.forwardRef(function LinearProgress(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiLinearProgress"
	});
	const { className, color = "primary", value, valueBuffer, variant = "indeterminate", ...other } = props;
	const ownerState = {
		...props,
		color,
		variant
	};
	const classes = useUtilityClasses(ownerState);
	const isRtl = useRtl();
	const rootProps = {};
	const inlineStyles = {
		bar1: {},
		bar2: {}
	};
	if (variant === "determinate" || variant === "buffer") if (value !== void 0) {
		rootProps["aria-valuenow"] = Math.round(value);
		rootProps["aria-valuemin"] = 0;
		rootProps["aria-valuemax"] = 100;
		let transform = value - 100;
		if (isRtl) transform = -transform;
		inlineStyles.bar1.transform = `translateX(${transform}%)`;
	} else console.error("MUI: You need to provide a value prop when using the determinate or buffer variant of LinearProgress .");
	if (variant === "buffer") if (valueBuffer !== void 0) {
		let transform = (valueBuffer || 0) - 100;
		if (isRtl) transform = -transform;
		inlineStyles.bar2.transform = `translateX(${transform}%)`;
	} else console.error("MUI: You need to provide a valueBuffer prop when using the buffer variant of LinearProgress.");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LinearProgressRoot, {
		className: clsx(classes.root, className),
		ownerState,
		role: "progressbar",
		...rootProps,
		ref,
		...other,
		children: [
			variant === "buffer" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinearProgressDashed, {
				className: classes.dashed,
				ownerState
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinearProgressBar1, {
				className: classes.bar1,
				ownerState,
				style: inlineStyles.bar1
			}),
			variant === "determinate" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinearProgressBar2, {
				className: classes.bar2,
				ownerState,
				style: inlineStyles.bar2
			})
		]
	});
});
LinearProgress.propTypes = {
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	color: import_prop_types.default.oneOfType([import_prop_types.default.oneOf([
		"inherit",
		"primary",
		"secondary"
	]), import_prop_types.default.string]),
	sx: import_prop_types.default.oneOfType([
		import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
			import_prop_types.default.func,
			import_prop_types.default.object,
			import_prop_types.default.bool
		])),
		import_prop_types.default.func,
		import_prop_types.default.object
	]),
	value: import_prop_types.default.number,
	valueBuffer: import_prop_types.default.number,
	variant: import_prop_types.default.oneOf([
		"buffer",
		"determinate",
		"indeterminate",
		"query"
	])
};
//#endregion
export { LinearProgress as default, getLinearProgressUtilityClass, linearProgressClasses };

//# sourceMappingURL=@mui_material_LinearProgress.js.map