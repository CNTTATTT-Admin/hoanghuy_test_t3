import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { J as createTheme, K as useTheme, Q as require_jsx_runtime, U as generateUtilityClass, V as createStyled, dt as clsx, ft as require_prop_types, i as useTheme$1, t as styled$1 } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as extendSxProp } from "./extendSxProp-Bza6fQcu.js";
import { v as useThemeProps } from "./styles-2xPq3NO2.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as isMuiElement } from "./isMuiElement-BRNofDVk.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
//#region node_modules/@mui/system/esm/styled/styled.js
var styled = createStyled();
//#endregion
//#region node_modules/@mui/system/esm/Grid/traverseBreakpoints.js
var filterBreakpointKeys = (breakpointsKeys, responsiveKeys) => breakpointsKeys.filter((key) => responsiveKeys.includes(key));
var traverseBreakpoints = (breakpoints, responsive, iterator) => {
	const smallestBreakpoint = breakpoints.keys[0];
	if (Array.isArray(responsive)) responsive.forEach((breakpointValue, index) => {
		iterator((responsiveStyles, style) => {
			if (index <= breakpoints.keys.length - 1) if (index === 0) Object.assign(responsiveStyles, style);
			else responsiveStyles[breakpoints.up(breakpoints.keys[index])] = style;
		}, breakpointValue);
	});
	else if (responsive && typeof responsive === "object") (Object.keys(responsive).length > breakpoints.keys.length ? breakpoints.keys : filterBreakpointKeys(breakpoints.keys, Object.keys(responsive))).forEach((key) => {
		if (breakpoints.keys.includes(key)) {
			const breakpointValue = responsive[key];
			if (breakpointValue !== void 0) iterator((responsiveStyles, style) => {
				if (smallestBreakpoint === key) Object.assign(responsiveStyles, style);
				else responsiveStyles[breakpoints.up(key)] = style;
			}, breakpointValue);
		}
	});
	else if (typeof responsive === "number" || typeof responsive === "string") iterator((responsiveStyles, style) => {
		Object.assign(responsiveStyles, style);
	}, responsive);
};
//#endregion
//#region node_modules/@mui/system/esm/Grid/gridGenerator.js
function getSelfSpacingVar(axis) {
	return `--Grid-${axis}Spacing`;
}
function getParentSpacingVar(axis) {
	return `--Grid-parent-${axis}Spacing`;
}
var selfColumnsVar = "--Grid-columns";
var parentColumnsVar = "--Grid-parent-columns";
var generateGridSizeStyles = ({ theme, ownerState }) => {
	const styles = {};
	traverseBreakpoints(theme.breakpoints, ownerState.size, (appendStyle, value) => {
		let style = {};
		if (value === "grow") style = {
			flexBasis: 0,
			flexGrow: 1,
			maxWidth: "100%"
		};
		if (value === "auto") style = {
			flexBasis: "auto",
			flexGrow: 0,
			flexShrink: 0,
			maxWidth: "none",
			width: "auto"
		};
		if (typeof value === "number") style = {
			flexGrow: 0,
			flexBasis: "auto",
			width: `calc(100% * ${value} / var(${parentColumnsVar}) - (var(${parentColumnsVar}) - ${value}) * (var(${getParentSpacingVar("column")}) / var(${parentColumnsVar})))`
		};
		appendStyle(styles, style);
	});
	return styles;
};
var generateGridOffsetStyles = ({ theme, ownerState }) => {
	const styles = {};
	traverseBreakpoints(theme.breakpoints, ownerState.offset, (appendStyle, value) => {
		let style = {};
		if (value === "auto") style = { marginLeft: "auto" };
		if (typeof value === "number") style = { marginLeft: value === 0 ? "0px" : `calc(100% * ${value} / var(${parentColumnsVar}) + var(${getParentSpacingVar("column")}) * ${value} / var(${parentColumnsVar}))` };
		appendStyle(styles, style);
	});
	return styles;
};
var generateGridColumnsStyles = ({ theme, ownerState }) => {
	if (!ownerState.container) return {};
	const styles = { [selfColumnsVar]: 12 };
	traverseBreakpoints(theme.breakpoints, ownerState.columns, (appendStyle, value) => {
		const columns = value ?? 12;
		appendStyle(styles, {
			[selfColumnsVar]: columns,
			"> *": { [parentColumnsVar]: columns }
		});
	});
	return styles;
};
var generateGridRowSpacingStyles = ({ theme, ownerState }) => {
	if (!ownerState.container) return {};
	const styles = {};
	traverseBreakpoints(theme.breakpoints, ownerState.rowSpacing, (appendStyle, value) => {
		const spacing = typeof value === "string" ? value : theme.spacing?.(value);
		appendStyle(styles, {
			[getSelfSpacingVar("row")]: spacing,
			"> *": { [getParentSpacingVar("row")]: spacing }
		});
	});
	return styles;
};
var generateGridColumnSpacingStyles = ({ theme, ownerState }) => {
	if (!ownerState.container) return {};
	const styles = {};
	traverseBreakpoints(theme.breakpoints, ownerState.columnSpacing, (appendStyle, value) => {
		const spacing = typeof value === "string" ? value : theme.spacing?.(value);
		appendStyle(styles, {
			[getSelfSpacingVar("column")]: spacing,
			"> *": { [getParentSpacingVar("column")]: spacing }
		});
	});
	return styles;
};
var generateGridDirectionStyles = ({ theme, ownerState }) => {
	if (!ownerState.container) return {};
	const styles = {};
	traverseBreakpoints(theme.breakpoints, ownerState.direction, (appendStyle, value) => {
		appendStyle(styles, { flexDirection: value });
	});
	return styles;
};
var generateGridStyles = ({ ownerState }) => {
	return {
		minWidth: 0,
		boxSizing: "border-box",
		...ownerState.container && {
			display: "flex",
			flexWrap: "wrap",
			...ownerState.wrap && ownerState.wrap !== "wrap" && { flexWrap: ownerState.wrap },
			gap: `var(${getSelfSpacingVar("row")}) var(${getSelfSpacingVar("column")})`
		}
	};
};
var generateSizeClassNames = (size) => {
	const classNames = [];
	Object.entries(size).forEach(([key, value]) => {
		if (value !== false && value !== void 0) classNames.push(`grid-${key}-${String(value)}`);
	});
	return classNames;
};
var generateSpacingClassNames = (spacing, smallestBreakpoint = "xs") => {
	function isValidSpacing(val) {
		if (val === void 0) return false;
		return typeof val === "string" && !Number.isNaN(Number(val)) || typeof val === "number" && val > 0;
	}
	if (isValidSpacing(spacing)) return [`spacing-${smallestBreakpoint}-${String(spacing)}`];
	if (typeof spacing === "object" && !Array.isArray(spacing)) {
		const classNames = [];
		Object.entries(spacing).forEach(([key, value]) => {
			if (isValidSpacing(value)) classNames.push(`spacing-${key}-${String(value)}`);
		});
		return classNames;
	}
	return [];
};
var generateDirectionClasses = (direction) => {
	if (direction === void 0) return [];
	if (typeof direction === "object") return Object.entries(direction).map(([key, value]) => `direction-${key}-${value}`);
	return [`direction-xs-${String(direction)}`];
};
//#endregion
//#region node_modules/@mui/system/esm/Grid/deleteLegacyGridProps.js
var getLegacyGridWarning = (propName) => {
	if (["item", "zeroMinWidth"].includes(propName)) return `The \`${propName}\` prop has been removed and is no longer necessary. You can safely remove it.`;
	return `The \`${propName}\` prop has been removed. See https://mui.com/material-ui/migration/upgrade-to-grid-v2/ for migration instructions.`;
};
var warnedAboutProps = [];
/**
* Deletes the legacy Grid component props from the `props` object and warns once about them if found.
*
* @param {object} props The props object to remove the legacy Grid props from.
* @param {Breakpoints} breakpoints The breakpoints object.
*/
function deleteLegacyGridProps(props, breakpoints) {
	const propsToWarn = [];
	if (props.item !== void 0) {
		delete props.item;
		propsToWarn.push("item");
	}
	if (props.zeroMinWidth !== void 0) {
		delete props.zeroMinWidth;
		propsToWarn.push("zeroMinWidth");
	}
	breakpoints.keys.forEach((breakpoint) => {
		if (props[breakpoint] !== void 0) {
			propsToWarn.push(breakpoint);
			delete props[breakpoint];
		}
	});
	propsToWarn.forEach((prop) => {
		if (!warnedAboutProps.includes(prop)) {
			warnedAboutProps.push(prop);
			console.warn(`MUI Grid: ${getLegacyGridWarning(prop)}\n`);
		}
	});
}
//#endregion
//#region node_modules/@mui/system/esm/Grid/createGrid.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
var import_jsx_runtime = require_jsx_runtime();
var defaultTheme = createTheme();
var defaultCreateStyledComponent = styled("div", {
	name: "MuiGrid",
	slot: "Root"
});
function useThemePropsDefault(props) {
	return useThemeProps({
		props,
		name: "MuiGrid",
		defaultTheme
	});
}
function createGrid(options = {}) {
	const { createStyledComponent = defaultCreateStyledComponent, useThemeProps = useThemePropsDefault, useTheme: useTheme$2 = useTheme, componentName = "MuiGrid" } = options;
	const useUtilityClasses = (ownerState, theme) => {
		const { container, direction, spacing, wrap, size } = ownerState;
		return composeClasses({ root: [
			"root",
			container && "container",
			wrap !== "wrap" && `wrap-xs-${String(wrap)}`,
			...generateDirectionClasses(direction),
			...generateSizeClassNames(size),
			...container ? generateSpacingClassNames(spacing, theme.breakpoints.keys[0]) : []
		] }, (slot) => generateUtilityClass(componentName, slot), {});
	};
	function parseResponsiveProp(propValue, breakpoints, shouldUseValue = () => true) {
		const parsedProp = {};
		if (propValue === null) return parsedProp;
		if (Array.isArray(propValue)) propValue.forEach((value, index) => {
			if (value !== null && shouldUseValue(value) && breakpoints.keys[index]) parsedProp[breakpoints.keys[index]] = value;
		});
		else if (typeof propValue === "object") Object.keys(propValue).forEach((key) => {
			const value = propValue[key];
			if (value !== null && value !== void 0 && shouldUseValue(value)) parsedProp[key] = value;
		});
		else parsedProp[breakpoints.keys[0]] = propValue;
		return parsedProp;
	}
	const GridRoot = createStyledComponent(generateGridColumnsStyles, generateGridColumnSpacingStyles, generateGridRowSpacingStyles, generateGridSizeStyles, generateGridDirectionStyles, generateGridStyles, generateGridOffsetStyles);
	const Grid = /* @__PURE__ */ import_react.forwardRef(function Grid(inProps, ref) {
		const theme = useTheme$2();
		const props = extendSxProp(useThemeProps(inProps));
		deleteLegacyGridProps(props, theme.breakpoints);
		const { className, children, columns: columnsProp = 12, container = false, component = "div", direction = "row", wrap = "wrap", size: sizeProp = {}, offset: offsetProp = {}, spacing: spacingProp = 0, rowSpacing: rowSpacingProp = spacingProp, columnSpacing: columnSpacingProp = spacingProp, unstable_level: level = 0, ...other } = props;
		const size = parseResponsiveProp(sizeProp, theme.breakpoints, (val) => val !== false);
		const offset = parseResponsiveProp(offsetProp, theme.breakpoints);
		const columns = inProps.columns ?? (level ? void 0 : columnsProp);
		const spacing = inProps.spacing ?? (level ? void 0 : spacingProp);
		const rowSpacing = inProps.rowSpacing ?? inProps.spacing ?? (level ? void 0 : rowSpacingProp);
		const columnSpacing = inProps.columnSpacing ?? inProps.spacing ?? (level ? void 0 : columnSpacingProp);
		const ownerState = {
			...props,
			level,
			columns,
			container,
			direction,
			wrap,
			spacing,
			rowSpacing,
			columnSpacing,
			size,
			offset
		};
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GridRoot, {
			ref,
			as: component,
			ownerState,
			className: clsx(useUtilityClasses(ownerState, theme).root, className),
			...other,
			children: import_react.Children.map(children, (child) => {
				if (/* @__PURE__ */ import_react.isValidElement(child) && isMuiElement(child, ["Grid"]) && container && child.props.container) return /* @__PURE__ */ import_react.cloneElement(child, { unstable_level: child.props?.unstable_level ?? level + 1 });
				return child;
			})
		});
	});
	Grid.propTypes = {
		children: import_prop_types.default.node,
		className: import_prop_types.default.string,
		columns: import_prop_types.default.oneOfType([
			import_prop_types.default.arrayOf(import_prop_types.default.number),
			import_prop_types.default.number,
			import_prop_types.default.object
		]),
		columnSpacing: import_prop_types.default.oneOfType([
			import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string])),
			import_prop_types.default.number,
			import_prop_types.default.object,
			import_prop_types.default.string
		]),
		component: import_prop_types.default.elementType,
		container: import_prop_types.default.bool,
		direction: import_prop_types.default.oneOfType([
			import_prop_types.default.oneOf([
				"column-reverse",
				"column",
				"row-reverse",
				"row"
			]),
			import_prop_types.default.arrayOf(import_prop_types.default.oneOf([
				"column-reverse",
				"column",
				"row-reverse",
				"row"
			])),
			import_prop_types.default.object
		]),
		offset: import_prop_types.default.oneOfType([
			import_prop_types.default.string,
			import_prop_types.default.number,
			import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.string, import_prop_types.default.number])),
			import_prop_types.default.object
		]),
		rowSpacing: import_prop_types.default.oneOfType([
			import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string])),
			import_prop_types.default.number,
			import_prop_types.default.object,
			import_prop_types.default.string
		]),
		size: import_prop_types.default.oneOfType([
			import_prop_types.default.string,
			import_prop_types.default.bool,
			import_prop_types.default.number,
			import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
				import_prop_types.default.string,
				import_prop_types.default.bool,
				import_prop_types.default.number
			])),
			import_prop_types.default.object
		]),
		spacing: import_prop_types.default.oneOfType([
			import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string])),
			import_prop_types.default.number,
			import_prop_types.default.object,
			import_prop_types.default.string
		]),
		sx: import_prop_types.default.oneOfType([
			import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
				import_prop_types.default.func,
				import_prop_types.default.object,
				import_prop_types.default.bool
			])),
			import_prop_types.default.func,
			import_prop_types.default.object
		]),
		wrap: import_prop_types.default.oneOf([
			"nowrap",
			"wrap-reverse",
			"wrap"
		])
	};
	Grid.muiName = "Grid";
	return Grid;
}
//#endregion
//#region node_modules/@mui/utils/esm/requirePropFactory/requirePropFactory.js
function requirePropFactory(componentNameInError, Component) {
	const prevPropTypes = Component ? { ...Component.propTypes } : null;
	const requireProp = (requiredProp) => (props, propName, componentName, location, propFullName, ...args) => {
		const propFullNameSafe = propFullName || propName;
		const defaultTypeChecker = prevPropTypes?.[propFullNameSafe];
		if (defaultTypeChecker) {
			const typeCheckerResult = defaultTypeChecker(props, propName, componentName, location, propFullName, ...args);
			if (typeCheckerResult) return typeCheckerResult;
		}
		if (typeof props[propName] !== "undefined" && !props[requiredProp]) return /* @__PURE__ */ new Error(`The prop \`${propFullNameSafe}\` of \`${componentNameInError}\` can only be used together with the \`${requiredProp}\` prop.`);
		return null;
	};
	return requireProp;
}
//#endregion
//#region node_modules/@mui/material/esm/utils/requirePropFactory.js
var requirePropFactory_default = requirePropFactory;
//#endregion
//#region node_modules/@mui/material/esm/Grid/Grid.js
/**
*
* Demos:
*
* - [Grid](https://mui.com/material-ui/react-grid/)
*
* API:
*
* - [Grid API](https://mui.com/material-ui/api/grid/)
*/
var Grid = createGrid({
	createStyledComponent: styled$1("div", {
		name: "MuiGrid",
		slot: "Root",
		overridesResolver: (props, styles) => {
			const { ownerState } = props;
			return [styles.root, ownerState.container && styles.container];
		}
	}),
	componentName: "MuiGrid",
	useThemeProps: (inProps) => useDefaultProps({
		props: inProps,
		name: "MuiGrid"
	}),
	useTheme: useTheme$1
});
Grid.propTypes = {
	children: import_prop_types.default.node,
	columns: import_prop_types.default.oneOfType([
		import_prop_types.default.arrayOf(import_prop_types.default.number),
		import_prop_types.default.number,
		import_prop_types.default.object
	]),
	columnSpacing: import_prop_types.default.oneOfType([
		import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string])),
		import_prop_types.default.number,
		import_prop_types.default.object,
		import_prop_types.default.string
	]),
	container: import_prop_types.default.bool,
	direction: import_prop_types.default.oneOfType([
		import_prop_types.default.oneOf([
			"column-reverse",
			"column",
			"row-reverse",
			"row"
		]),
		import_prop_types.default.arrayOf(import_prop_types.default.oneOf([
			"column-reverse",
			"column",
			"row-reverse",
			"row"
		])),
		import_prop_types.default.object
	]),
	offset: import_prop_types.default.oneOfType([
		import_prop_types.default.string,
		import_prop_types.default.number,
		import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.string, import_prop_types.default.number])),
		import_prop_types.default.object
	]),
	rowSpacing: import_prop_types.default.oneOfType([
		import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string])),
		import_prop_types.default.number,
		import_prop_types.default.object,
		import_prop_types.default.string
	]),
	size: import_prop_types.default.oneOfType([
		import_prop_types.default.string,
		import_prop_types.default.bool,
		import_prop_types.default.number,
		import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
			import_prop_types.default.string,
			import_prop_types.default.bool,
			import_prop_types.default.number
		])),
		import_prop_types.default.object
	]),
	spacing: import_prop_types.default.oneOfType([
		import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string])),
		import_prop_types.default.number,
		import_prop_types.default.object,
		import_prop_types.default.string
	]),
	sx: import_prop_types.default.oneOfType([
		import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
			import_prop_types.default.func,
			import_prop_types.default.object,
			import_prop_types.default.bool
		])),
		import_prop_types.default.func,
		import_prop_types.default.object
	]),
	unstable_level: import_prop_types.default.number,
	wrap: import_prop_types.default.oneOf([
		"nowrap",
		"wrap-reverse",
		"wrap"
	])
};
{
	const Component = Grid;
	const requireProp = requirePropFactory_default("Grid", Component);
	Component["propTypes"] = {
		...Component.propTypes,
		direction: requireProp("container"),
		spacing: requireProp("container"),
		wrap: requireProp("container")
	};
}
//#endregion
//#region node_modules/@mui/material/esm/Grid/gridClasses.js
function getGridUtilityClass(slot) {
	return generateUtilityClass("MuiGrid", slot);
}
var SPACINGS = [
	0,
	1,
	2,
	3,
	4,
	5,
	6,
	7,
	8,
	9,
	10
];
var DIRECTIONS = [
	"column-reverse",
	"column",
	"row-reverse",
	"row"
];
var WRAPS = [
	"nowrap",
	"wrap-reverse",
	"wrap"
];
var GRID_SIZES = [
	"auto",
	true,
	1,
	2,
	3,
	4,
	5,
	6,
	7,
	8,
	9,
	10,
	11,
	12
];
var gridClasses = generateUtilityClasses("MuiGrid", [
	"root",
	"container",
	...SPACINGS.map((spacing) => `spacing-xs-${spacing}`),
	...DIRECTIONS.map((direction) => `direction-xs-${direction}`),
	...WRAPS.map((wrap) => `wrap-xs-${wrap}`),
	...GRID_SIZES.map((size) => `grid-xs-${size}`),
	...GRID_SIZES.map((size) => `grid-sm-${size}`),
	...GRID_SIZES.map((size) => `grid-md-${size}`),
	...GRID_SIZES.map((size) => `grid-lg-${size}`),
	...GRID_SIZES.map((size) => `grid-xl-${size}`)
]);
//#endregion
export { Grid as default, getGridUtilityClass, gridClasses };

//# sourceMappingURL=@mui_material_Grid.js.map